import { BaseOutputParser, LLM } from "../base";
import { PromptTemplate } from "../prompt";
import { StructuredTool } from "../tools";

/**
 * Each of the planner, executor and overseer must implement this
 * interface.
 */
export interface ChainInputs {
  llm: LLM<any, any>;
  message: PromptTemplate; // e.g. initial system message
  outputParser: BaseOutputParser;
  tools?: StructuredTool[];
  callbacks?: Function[];
}
