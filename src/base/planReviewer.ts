import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";
import { BaseChain } from "./chain";
import { Step } from "./executor";
import { PlanReviewerOutputParser } from "../reviewer/outputParser";

export abstract class BasePlanReviewer<T, R> extends BaseChain<
    T,
    R,
    PlanReviewerOutputParser
> {
    constructor(inputs: ChainInputs<T, R>) {
        super(inputs)
    }
    abstract integrateResponse(response: string, remainingSteps: Step[]): Promise<Step[]>
    abstract reviewPlan(reviewPrompt: PromptTemplate): Promise<Step[]>
}