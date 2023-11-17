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

// Are the planner and executor the same accept the executor has stepcontainers and the planner doesnt?
// Take step is just like plan - input and outputparser
export class DefaultExecutor extends BaseExecutor<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion,
  ExecutorOutputParser
> {
  constructor(
    inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>,
  ) {
    super(inputs);
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

    while (this.stepContainer.steps.length > 0) {
        const step = this.stepContainer.steps[0]; // Always takes the first element
        const result = await this.takeStep(step);
        step.result = result;
        // Zod parse the action inputParse
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
