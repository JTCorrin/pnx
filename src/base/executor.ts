import { ChainInputs } from "../chain";
import { BaseChain } from "./chain";
import { Plan } from "./planner";

/**
 * Represents an action to be performed in a step.
 */
export type StepAction = {
  text: string;
};

/**
 * Represents the result of a step. Will always have
 * a tool (action) name, and tool (action) input
 */
export type StepResult = {
  // The full text response from the model when taking a decision on tool usage 
  actionDecision: string;
  // The chosen tool as chosen by the model
  action: any,
  // The tools function params as given to it by the model
  actionInput: any,
  // The string output of the tools execution
  actionOutput: string
};

/**
 * Represents a step, which includes an action and its result.
 */
export type Step = {
  action: StepAction;
  result: StepResult;
};

/**
 * Base class that defines the structure for a step container. Step
 * containers are responsible for managing steps.
 */
export class StepContainer {
    protected _steps: Step[] = [];
    protected _previousSteps: Step[] = []
    
    addNewStep(step: Step) {
        this.steps.push(step)
    }

    completeStep(step: Step) {
        // Remove from _steps

        //Add to _previousSteps
        this._previousSteps.push(step)
    }

    formatPreviousSteps() {
        return JSON.stringify(this._previousSteps)
    }
    
    getFinalResponse(): string {
        return "Final response";
    }
  
    set steps(steps: Step[]) {
      this._steps = steps;
    }
  
    get steps(): Step[] {
      return this._steps;
    }

    get previousSteps(): Step[] {
        return this._previousSteps
    }
}

export abstract class BaseExecutor<
    T, 
    R, 
    Parser, 
> extends BaseChain<T, R, Parser> {

  protected stepContainer: StepContainer;

  abstract takeStep(step: Step): Promise<StepResult>;
  abstract execute(plan: Plan): Promise<void>;

  constructor(inputs: ChainInputs<T, R>) {
    super(inputs);
    this.stepContainer = new StepContainer()
  }
}
