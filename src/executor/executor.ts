import {
  BaseExecutor,
  Plan,
  Step,
  StepAction,
  StepResult,
} from "../base";

import { ChainInputs } from "../chain";
import { OpenAIMessage } from "../llm";
import OpenAI from "openai";
import { ExecutorOutputParser } from "./outputParser";
import { EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE, PromptTemplate } from "../prompt";



// Are the planner and executor the same accept the executor has stepcontainers and the planner doesnt?
// Take step is just like plan - input and outputparser
export class DefaultExecutor extends BaseExecutor<
    OpenAIMessage, 
    OpenAI.Chat.Completions.ChatCompletion, 
    ExecutorOutputParser
> {
  
  constructor(inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>) {
    super(inputs);
  }

  async takeStep(step: Step): Promise<StepResult> {
    // Taking a step consists of asking the LLM to choose a tool and provide the input json for that tool, based on the step it is given
    const response = await this.llm.call([
        { role: "system", content: this.message.format() },
        { role: "user", content: new PromptTemplate(EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE, {
            previousSteps: "[]",
            currentStep: step.action.text,
            agentScratchPage: ""
          }).format() 
        },
      ]);

      return await this.outputParser.parse(response.choices[0].message.content as string);
  }

  async execute(plan: Plan) {
    if (plan.steps.length < 1) {
      throw Error("The plan doesn't have any steps to execute");
    }

    plan.steps.forEach(step => this.stepContainer.addNewStep({ action: step, result: { response: "" } }))
    for await (const step of this.stepContainer.steps) {
        console.debug(`Taking step: ${JSON.stringify(step.action.text)}`)
      const result = await this.takeStep(step);
      step.result = result

      // TODO this result.response has the json blob within it - the parser needs to parse that out and it should then be passed to the tool.

      // Put the step into the complete steps
      for await (const callback of this.callbacks ?? []) {
        await callback(JSON.stringify(step))
      }
    }
  }
}
