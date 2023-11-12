import { BasePlanner } from "./planner";
import { BaseStepExecutor } from "./executor";
import { BaseStructuredTool } from "./tool";
import { PromptTemplate } from "../prompt";
/**
 * Interface for the input to the PlanAndExecuteAgentExecutor class. It
 * includes the planner, step executor, step container.
 */
export interface PlanAndExecuteAgentInput {
  planner: BasePlanner;
  executor: BaseStepExecutor;
  tools: BaseStructuredTool[];
}

export abstract class BaseAgent {
  abstract run(prompt: PromptTemplate | string);
}
