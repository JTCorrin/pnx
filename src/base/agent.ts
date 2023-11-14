import { PromptTemplate } from "../prompt";

export abstract class BaseAgent {
  abstract run(prompt: PromptTemplate | string): Promise<any>;
}
