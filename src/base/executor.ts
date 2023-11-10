import { Step, StepAction, StepResult } from "./planner";

/**
 * Abstract class that defines the structure for a step executor. Step
 * executors are responsible for executing a step based on inputs.
 */
export abstract class BaseStepExecutor {
  abstract step(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: Record<string, any>,
  ): Promise<StepResult>;
}

/**
 * Abstract class that defines the structure for a step container. Step
 * containers are responsible for managing steps.
 */
export abstract class BaseStepContainer {
  abstract addStep(action: StepAction, result: StepResult): void;

  abstract getSteps(): Step[];

  abstract getFinalResponse(): string;
}
