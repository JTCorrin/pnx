import { BaseOutputParser, LLM } from "../base";
import { PromptTemplate } from "../prompt";
import { StructuredTool } from "../tools";

/**
 * Each of the planner, executor and overseer must implement this
 * interface.
 */
export interface ChainInputs<T, R> {
  // The language model used by the chain. T = message type sent to model, R = response type returned
  llm: LLM<T, R>;
  message: PromptTemplate;
  outputParser: BaseOutputParser;
  tools?: StructuredTool[];
  callbacks?: Function[];
}
