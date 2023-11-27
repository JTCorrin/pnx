import { BaseExecutor, Step, StepResult } from "./base";

import { ChainInputs } from "../chain";
import { OpenAIMessage } from "../llm";
import OpenAI from "openai";
import { ExecutorOutputParser } from "./outputParser";
import {
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

    const messages: OpenAIMessage[] = [
        { role: "system", content: this.message.format() },
        {
          role: "user",
          content: new PromptTemplate(EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE, {
            previousSteps: this.stepContainer.formatPreviousSteps(),
            currentStep: step.action.text,
            agentScratchpad: "",
          }).format(),
        },
      ]
    
    const response = await this.llm.call(messages);

    return await this.outputParser.parse(
      response.choices[0].message.content as string,
    );
  }

  async takeFinalStep(): Promise<string> {
    const response = await this.llm.call([
      {
        role: "user",
        content: this.stepContainer.finalStep.action.text,
      },
    ]);

    return response.choices[0].message.content as string;
  }
}
