import { Memory } from "../memory/base";
import { PromptTemplate } from "../prompt/template";

export type AgentResponse = {
  message: string;
  memory: Memory;
};

export abstract class BaseAgent {
  abstract run(prompt: PromptTemplate | string): Promise<AgentResponse>;
}
