import { PlanOutputParser } from "../planner/outputParser";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";
import { LLM } from "./llm";
import { StepAction } from "./executor";
import { StructuredTool } from "../tools";
import { BaseChain } from "./chain";

/**
 * Represents a plan, which is a sequence of step actions.
 */
export type Plan = {
  steps: StepAction[];
};

/**
 * Abstract class that defines the structure for a planner. Planners are
 * responsible for generating a plan based on inputs.
 */
export abstract class BasePlanner<T, R> extends BaseChain<T, R, PlanOutputParser> {
  constructor(inputs: ChainInputs<T, R>) {
    super(inputs)
  }
  abstract plan(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: Record<string, any>,
  ): Promise<Plan>;
}
