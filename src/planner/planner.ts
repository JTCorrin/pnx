import { BaseChain, BaseChainInputs } from "../base/chain";


export class Planner extends BaseChain {
    constructor(inputs: BaseChainInputs) {
        super(inputs)
    }

    async call () {
        const response = this.llm.invoke(this.prompt)
        return this.outputParser.parse(response.text)
    }
}