import { BasePlanner, Plan } from "../base";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";
import { OpenAIMessage } from "../llm";
import OpenAI from "openai";

export class DefaultPlanner extends BasePlanner<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion> {
  constructor(inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>) {
    super(inputs);
  }

  async plan(prompt: PromptTemplate): Promise<Plan> {
    // Plan user message is the prompt
    const response = await this.llm.call([
      { role: "system", content: this.message.format() },
      { role: "user", content: prompt.format() },
    ]);
    console.debug(JSON.stringify(response))
    const parsedResponse = await this.outputParser.parse(response.choices[0].message.content as string);
    for await (const callback of this.callbacks ?? []) {
      callback(JSON.stringify(parsedResponse));
    }
    return parsedResponse;
  }
}
