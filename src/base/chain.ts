import { BaseOutputParser } from "./outputParser"

export type BaseChainInputs = {
    llm: LLM
    prompt: string
    outputParser: BaseOutputParser
}


/**
 * Every chain is made up of a prompt, a large language model
 * and an outputParser. Classes extending this class must
 * implement the call method
 */
export abstract class BaseChain {
    prompt: string
    llm: LLM
    outputParser: BaseOutputParser

    constructor(inputs: BaseChainInputs) {
        this.prompt = inputs.prompt
        this.llm = inputs.llm
        this.outputParser = inputs.outputParser
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract call(prompt: string): Promise<Record<string, any>>
}