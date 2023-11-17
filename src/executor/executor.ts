import { BaseExecutor, Plan, Step, StepResult } from "../base";

import { ChainInputs } from "../chain";
import { OpenAIMessage } from "../llm";
import OpenAI from "openai";
import { ExecutorOutputParser } from "./outputParser";
import {
  EXECUTOR_SUMMARY_PROMPT,
  EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE,
  PromptTemplate,
} from "../prompt";
import { DefaultPlanReviewer } from "../reviewer";

// Are the planner and executor the same accept the executor has stepcontainers and the planner doesnt?
// Take step is just like plan - input and outputparser
export class DefaultExecutor extends BaseExecutor<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion,
  ExecutorOutputParser
> {
  planReviewer: DefaultPlanReviewer;
  constructor(
    inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>,
  ) {
    super(inputs);
    this.planReviewer = new DefaultPlanReviewer(inputs);
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

  async takeFinalStep(): Promise<string> {
    const response = await this.llm.call([
        {
          role: "user",
          content: this.stepContainer.finalStep.action.text,
        },
    ]);

    return response.choices[0].message.content as string
  }

  // TODO This is not abstract and should be handled at base
  async execute(plan: Plan, prompt: PromptTemplate) {
    if (plan.steps.length < 1) {
      throw Error("The plan doesn't have any steps to execute");
    }

    // TODO - refactor - if no final step - execute new plan - else continue previous plan

    // Check if there is not already a plan on-going (final step will be empty if this is a fresh request)
    if (this.stepContainer.finalStep == null) {
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

        // Set the final step up front
        const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
            originalPrompt: prompt.format(),
            originalPlan: JSON.stringify(plan),
        }).format();
        
        this.stepContainer.finalStep = {
            action: {
              text: summaryPrompt,
            },
            result: {
              action: "",
              actionDecision: "",
              actionInput: {},
              actionOutput: "",
            },
          }
    } else {
        // There was already a plan ongoing
        this.stepContainer = this.planReviewer.integrateResponse(prompt.format(), this.stepContainer)
    }

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

        // Does the plan have any steps left?
        if (this.stepContainer.steps.length === 0) {
            const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
                originalPrompt: prompt.format(),
                originalPlan: JSON.stringify(plan),
            }).format();
            
            this.stepContainer.finalStep = {
                action: {
                  text: summaryPrompt,
                },
                result: {
                  action: "",
                  actionDecision: "",
                  actionInput: {},
                  actionOutput: "",
                },
              }
        }

        // At this point the request will go back to the user. 
        return this.stepContainer.getFinalResponse();
    }

      // Does selected tool require review?
    //   if (selectedTool.triggersReview) {
    //     this.stepContainer.steps = await this.planReviewer.reviewPlan(
    //       new PromptTemplate(PLAN_REVIEW_PROMPT, {
    //         originalPrompt: prompt.format(),
    //         previousSteps: JSON.stringify(this.stepContainer.previousSteps),
    //         remainingSteps: JSON.stringify(this.stepContainer.steps),
    //         toolString: getToolNamesDescriptions(this.tools ?? []),
    //       }),
    //     );
    //   }
    }



    return this.takeFinalStep()
  }
}
