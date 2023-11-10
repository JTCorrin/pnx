/**
 * Represents an action to be performed in a step.
 */
export type StepAction = {
  text: string;
};

/**
 * Represents the result of a step.
 */
export type StepResult = {
  response: string;
};

/**
 * Represents a step, which includes an action and its result.
 */
export type Step = {
  action: StepAction;
  result: StepResult;
};

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
export abstract class BasePlanner {
  abstract plan(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: Record<string, any>
  ): Promise<Plan>;
}
