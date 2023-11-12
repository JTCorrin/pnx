import { BaseOutputParser } from "../base";
import { PromptTemplate } from "../prompt";
import { LLM } from "../base";
import { StructuredTool } from "../tools/structuredTool";

/**
 * Each of the planner, executor and overseer must implement this
 * interface.
 */
export interface ChainInputs {
  llm: LLM;
  prompt: PromptTemplate;
  outputParser: BaseOutputParser;
  tools?: StructuredTool[];
}
