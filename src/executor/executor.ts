import { BaseExecutor, Plan, Step, StepResult } from "../base";

import { ChainInputs } from "../chain";
import { OpenAIMessage } from "../llm";
import OpenAI from "openai";
import { ExecutorOutputParser } from "./outputParser";
import {
  EXECUTOR_SUMMARY_PROMPT,
  EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE,
  PLAN_REVIEW_PROMPT,
  PromptTemplate,
  getToolNamesDescriptions,
} from "../prompt";
import { DefaultPlanReviewer } from "../reviewer";

// Are the planner and executor the same accept the executor has stepcontainers and the planner doesnt?
// Take step is just like plan - input and outputparser
export class DefaultExecutor extends BaseExecutor<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion,
  ExecutorOutputParser
> {
    planReviewer: DefaultPlanReviewer | null
  constructor(
    inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>,
  ) {
    super(inputs);
    this.planReviewer = null
  }

  async takeStep(step: Step): Promise<StepResult> {
    // Taking a step consists of asking the LLM to choose a tool and provide the input json for that tool, based on the step it is given
    const response = await this.llm.call([
      { role: "system", content: this.message.format() },
      {
        role: "user",
        content: new PromptTemplate(EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE, {
          previousSteps: this.stepContainer.formatPreviousSteps(),
          currentStep: step.action.text,
          agentScratchpad: "",
        }).format(),
      },
    ]);

    return await this.outputParser.parse(
      response.choices[0].message.content as string,
    ); // Need to extract scratchpad?
  }

  // TODO This is not abstract and should be handled at base
  async execute(plan: Plan, prompt: PromptTemplate) {
    
    if (plan.steps.length < 1) {
        throw Error("The plan doesn't have any steps to execute");
    }
        
    this.planReviewer = new DefaultPlanReviewer(plan)
    
    // Populate step container with the plan items
    plan.steps.forEach((step) =>
      this.stepContainer.addNewStep({
        action: step,
        result: {
          actionDecision: "",
          action: "",
          actionInput: {},
          actionOutput: "",
        },
      }),
    );


    // Execute the steps in order
    while (this.stepContainer.steps.length > 0) {
        
        const step = this.stepContainer.steps[0]; // Always takes the first element
        const result = await this.takeStep(step);
        step.result = result;
        
        // the model has given us a step to use
        const selectedTool = this.tools?.find(
            (tool) => tool.name == step.result?.action,
        );

        if (selectedTool) {

            const toolOutput = await selectedTool.call(step.result.actionInput);
            step.result.actionOutput = toolOutput;
            for await (const callback of this.callbacks ?? []) {
                await callback(step.result);
            }

        } else {
            // TODO Inject a `request for reattempt step`
            throw Error("Did not provide a recognised tool for action");
        }

        this.stepContainer.completeStep(step);
        
        // Remove the first step from the array, shifting all other elements forward
        this.stepContainer.steps.shift();

        // Does selected tool require response?
        if (selectedTool.requiresResponse) {
            // Get a response from the model
            const response = await this.llm.call([
                { role: "system", content: this.message.format() },
                {
                  role: "user",
                  content: new PromptTemplate(EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE, {
                    previousSteps: this.stepContainer.formatPreviousSteps(),
                    currentStep: step.action.text,
                    agentScratchpad: "",
                  }).format(),
                },
            ]);

            // This will update the next step with the response to the previous tools "requested response"
            this.stepContainer.steps = await this.planReviewer.integrateResponse(response.choices[0].message.content as string, this.stepContainer.steps)
        }

        // Does selected tool require review?
        if (selectedTool.triggersReview) {
            this.stepContainer.steps = await this.planReviewer.reviewPlan(
                this.stepContainer.previousSteps, 
                this.stepContainer.steps,
                new PromptTemplate(PLAN_REVIEW_PROMPT, {
                    originalPrompt: prompt.format(),
                    previousSteps: JSON.stringify(this.stepContainer.previousSteps),
                    remainingSteps: JSON.stringify(this.stepContainer.steps),
                    toolString: getToolNamesDescriptions(this.tools ?? [])
                })
            )
        }
    }

    if (this.stepContainer.steps.length > 1) {
      const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
        originalPrompt: prompt.format(),
        originalPlan: JSON.stringify(plan),
      }).format();

      const finalResponse = await this.getSummaryResponse([
        { role: "user", content: summaryPrompt },
      ]);

      this.stepContainer.completeStep({
        action: {
          text: summaryPrompt,
        },
        result: {
          action: "",
          actionDecision: "",
          actionInput: {},
          actionOutput: finalResponse.choices[0].message.content as string,
        },
      });
    }

    return this.stepContainer.getFinalResponse();
  }
}
