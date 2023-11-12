import { PlanOutputParser } from "../planner/outputParser";
import { ChainInputs } from "../chain";
import { PromptTemplate } from "../prompt";
import { LLM } from "./llm";
import { StepAction } from "./executor";

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
export abstract class BasePlanner implements ChainInputs {
  llm: LLM;
  prompt: PromptTemplate;
  outputParser: PlanOutputParser;
  constructor(inputs: ChainInputs) {
    this.llm = inputs.llm;
    this.prompt = inputs.prompt;
    this.outputParser = inputs.outputParser as PlanOutputParser;
  }
  abstract plan(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: Record<string, any>,
  ): Promise<Plan>;
}
