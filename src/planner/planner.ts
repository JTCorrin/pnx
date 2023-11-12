import { BasePlanner, Plan } from "../base";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";

export class Planner extends BasePlanner {
  constructor(inputs: ChainInputs) {
    super(inputs);
  }

  async plan(prompt: PromptTemplate): Promise<Plan> {
    const response = await this.llm.call([prompt.toString()]);
    return await this.outputParser.parse(response);
  }
}
