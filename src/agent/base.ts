import { PromptTemplate } from "../prompt/template";

export abstract class BaseAgent {
  abstract run(prompt: PromptTemplate | string): Promise<any>;
}
