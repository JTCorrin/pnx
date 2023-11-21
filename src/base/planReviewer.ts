import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt/template";
import { BaseChain } from "../chain/chain";
import { Step, StepContainer } from "../executor/base";
import { PlanReviewerOutputParser } from "../reviewer/outputParser";

export abstract class BasePlanReviewer<T, R> extends BaseChain<
  T,
  R,
  PlanReviewerOutputParser
> {
  constructor(inputs: ChainInputs<T, R>) {
    super(inputs);
  }
  abstract integrateResponse(
    response: string,
    stepContainer: StepContainer,
  ): StepContainer;
  abstract reviewPlan(reviewPrompt: PromptTemplate): Promise<Step[]>;
}
