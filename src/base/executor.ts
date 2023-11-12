import { Plan } from "./planner";

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
 * Abstract class that defines the structure for a step container. Step
 * containers are responsible for managing steps.
 */
export abstract class BaseStepContainer {
  abstract addStep(action: StepAction, result: StepResult): void;

  abstract getFinalResponse(): string;

  set steps(steps: Step[]) {
    this.steps = steps;
  }

  get steps() {
    return this.steps;
  }
}

export abstract class BaseExecutor {
  abstract takeStep(step: Step): Promise<Step>;
  abstract execute(plan: Plan): Promise<void>;
}
