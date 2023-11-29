import { BasePlanner, Plan } from "./base";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt/template";
import { OpenAIMessage } from "../llm";
import OpenAI from "openai";
import { PLANNER_SYSTEM_RETRY_MESSAGE_TEMPLATE } from "../prompt";

/**
 * The default planner is the OOTB planner created to work with OpenAIs GPT4 model. It will
 * take the users prompt and create a plan of execution from it, using the tools available
 * to it.
 */
export class DefaultPlanner extends BasePlanner<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion
> {
  constructor(
    inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>,
  ) {
    super(inputs);
  }

  async plan(prompt: PromptTemplate): Promise<Plan> {
    // Plan user message is the prompt
    const response = await this.llm.call([
      { role: "system", content: this.message.format() },
      { role: "user", content: prompt.format() },
    ]);

    const parsedResponse = await this.outputParser.parse(
      response.choices[0].message.content as string,
    );

    if (parsedResponse.steps && parsedResponse.steps.length > 0) {
      for await (const callback of this.callbacks ?? []) {
        await callback(JSON.stringify(parsedResponse));
      }
      return parsedResponse;
    }

    // Error
    // TODO set a retry config
    for (let index = 0; index < 3; index++) {
      const response = await this.llm.call([
        {
          role: "system",
          content: new PromptTemplate(PLANNER_SYSTEM_RETRY_MESSAGE_TEMPLATE, {
            originalInstruction: this.message.format(),
          }).format(),
        },
        { role: "user", content: prompt.format() },
      ]);

      const parsedResponse = await this.outputParser.parse(
        response.choices[0].message.content as string,
      );

      if (parsedResponse.steps && parsedResponse.steps.length > 0) {
        for await (const callback of this.callbacks ?? []) {
          await callback(JSON.stringify(parsedResponse));
        }
        return parsedResponse;
      }
    }

    throw new Error("The plan is not formatted correctly");
  }
}
