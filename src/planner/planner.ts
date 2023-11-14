import { BasePlanner, Plan } from "../base";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";

export class Planner extends BasePlanner {
  constructor(inputs: ChainInputs) {
    super(inputs);
  }

  async plan(prompt: PromptTemplate): Promise<Plan> {
    // Plan user message is the prompt
    const response = await this.llm.call([
      this.message.format(),
      prompt.format(),
    ]);

    const parsedResponse = await this.outputParser.parse(response);
    for await (const callback of this.callbacks as Function[]) {
      callback(parsedResponse);
    }
    return await this.outputParser.parse(response);
  }
}
