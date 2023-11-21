import { PromptTemplate } from "../prompt/template";
import { StructuredTool } from "../tools";
import { LLM } from "../llm/base";
import { BaseOutputParser } from "../base/outputParser";

/**
 * Each of the planner, executor and overseer must implement this
 * interface.
 */
export interface ChainInputs<MessageType, MessageResponse> {
  // The language model used by the chain. T = message type sent to model, R = response type returned
  llm: LLM<MessageType, MessageResponse>;
  message: PromptTemplate;
  outputParser: BaseOutputParser;
  tools: StructuredTool[];
  callbacks?: Function[];
}

export abstract class BaseChain<
  MessageType,
  MessageResponse,
  Parser = BaseOutputParser,
> {
  llm: LLM<MessageType, MessageResponse>;
  message: PromptTemplate;
  outputParser: Parser;
  tools: StructuredTool[];
  callbacks?: Function[];
  constructor(inputs: ChainInputs<MessageType, MessageResponse>) {
    this.llm = inputs.llm;
    this.message = inputs.message;
    this.outputParser = inputs.outputParser as Parser;
    this.tools = inputs.tools;
    this.callbacks = inputs.callbacks ?? [];
  }
}
