import { BasePlanner, Plan } from "../base";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";

export class Planner extends BasePlanner {
  constructor(inputs: ChainInputs) {
    super(inputs);
  }

  async plan(prompt: PromptTemplate): Promise<Plan> {
    // Plan system message is the tools string included
    // Plan user message is the prompt
    const response = await this.llm.call([prompt.toString()]);
    return await this.outputParser.parse(response);
  }
}
