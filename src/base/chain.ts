import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";
import { StructuredTool } from "../tools";
import { LLM } from "./llm";
import { BaseOutputParser } from "./outputParser";


export abstract class BaseChain<T, R, Parser = BaseOutputParser> {
  llm: LLM<T, R>;
  message: PromptTemplate;
  outputParser: Parser;
  callbacks?: Function[];
  tools?: StructuredTool[]
  constructor(inputs: ChainInputs<T, R>) {
    this.llm = inputs.llm;
    this.message = inputs.message;
    this.outputParser = inputs.outputParser as Parser
    this.callbacks = inputs.callbacks ?? [];
    this.tools = inputs.tools ?? []
  }
}