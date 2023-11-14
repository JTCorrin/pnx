import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";
import { LLM } from "./llm";
import { BaseOutputParser } from "./outputParser";


export abstract class BaseChain<T, R, Parser = BaseOutputParser> {
  llm: LLM<T, R>;
  message: PromptTemplate;
  outputParser: Parser;
  callbacks?: Function[];
  constructor(inputs: ChainInputs<T, R>) {
    this.llm = inputs.llm;
    this.message = inputs.message;
    this.outputParser = inputs.outputParser as Parser
    this.callbacks = inputs.callbacks ?? [];
  }
}