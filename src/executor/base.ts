import { ChainInputs, BaseChain } from "../chain";
import { PromptTemplate, EXECUTOR_SUMMARY_PROMPT } from "../prompt";
import { BasePlanReviewer } from "../reviewer";
import { Plan } from "../planner";
import { Memory } from "../memory/base";

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
  action: string;
  // The tools function params as given to it by the model
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionInput: Record<string, any>;
  // The string output of the tools execution
  actionOutput: string;
};

/**
 * Represents a step, which includes an action and its result.
 */
export type Step = {
  action: StepAction;
  result?: StepResult;
};

/**
 * Base class that defines the structure for a step container. Step
 * containers are responsible for managing steps.
 */
export class StepContainer {
  protected _steps: Step[];
  protected _previousSteps: Step[];
  protected _finalStep: Step | null;

  constructor(steps: Step[], previousSteps: Step[], finalStep?: Step) {
    this._steps = steps;
    this._previousSteps = previousSteps;
    this._finalStep = finalStep ?? null;
  }

  addNewStep(step: Step) {
    this.steps.push(step);
  }

  completeStep(step: Step) {
    this._previousSteps.push(step);
    this._steps.shift();
  }

  formatPreviousSteps() {
    return JSON.stringify(this._previousSteps);
  }

  getFinalResponse() {
    // TODO put some check in here
    return this._previousSteps[this._previousSteps.length - 1].result!
      .actionOutput;
  }

  set steps(steps: Step[]) {
    this._steps = steps;
  }

  get steps(): Step[] {
    return this._steps;
  }

  get previousSteps(): Step[] {
    return this._previousSteps;
  }

  get finalStep() {
    return this._finalStep as Step;
  }

  set finalStep(step: Step) {
    this._finalStep = step;
  }
}

export abstract class BaseExecutor<T, R, Parser> extends BaseChain<
  T,
  R,
  Parser
> {
  protected stepContainer!: StepContainer;

  protected abstract takeStep(step: Step): Promise<StepResult>;
  protected abstract takeFinalStep(): Promise<string>;
  abstract planReviewer: BasePlanReviewer<T, R>;

  constructor(inputs: ChainInputs<T, R>) {
    super(inputs);
  }

  protected prepareNewStepContainer(
    plan: Plan,
    prompt: PromptTemplate,
  ): StepContainer {
    const stepContainer = new StepContainer([], []);
    plan.steps.forEach((step) =>
      stepContainer.addNewStep({
        action: step,
        result: {
          actionDecision: "",
          action: "",
          actionInput: {},
          actionOutput: "",
        },
      }),
    );

    // Set the final step up front
    const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
      originalPrompt: prompt.format(),
      originalPlan: JSON.stringify(plan),
    }).format();

    stepContainer.finalStep = {
      action: {
        text: summaryPrompt,
      },
      result: {
        action: "",
        actionDecision: "",
        actionInput: {},
        actionOutput: "",
      },
    };

    return stepContainer;
  }

  async execute(prompt: PromptTemplate, memory: Memory) {
    memory.latestPrompt = prompt;
    const { plan, previousSteps, steps, finalStep } = memory;

    if (plan.steps.length < 1) {
      throw Error("The plan doesn't have any steps to execute");
    }

    if (steps.length == 0 && previousSteps.length == 0) {
      this.stepContainer = this.prepareNewStepContainer(plan, prompt);
    } else {
      this.stepContainer = new StepContainer(steps, previousSteps, finalStep);
    }

    // Execute the steps in order
    while (this.stepContainer.steps.length > 0) {
      const step = this.stepContainer.steps[0]; // Always takes the first element
      const result = await this.takeStep(step);
      step.result = result;

      // the model has given us a step to use
      const selectedTool = this.tools?.find(
        (tool) => tool.name == step.result?.action,
      );

      if (selectedTool) {
        const toolOutput = await selectedTool.call(step.result.actionInput);
        step.result.actionOutput = toolOutput;
        for await (const callback of this.callbacks ?? []) {
          await callback(step.result);
        }
      } else {
        // TODO Inject a `request for reattempt step`
        throw Error("Did not provide a recognised tool for action");
      }

      this.stepContainer.completeStep(step);

      // Does selected tool require response?
      if (selectedTool.requiresResponse) {
        // Does the plan have any steps left?
        if (this.stepContainer.steps.length === 0) {
          // TODO this would be something we want the end user to adjust?
          const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
            originalPrompt: prompt.format(),
            originalPlan: JSON.stringify(plan),
          }).format();

          this.stepContainer.finalStep = {
            action: {
              text: summaryPrompt,
            },
            result: {
              action: "",
              actionDecision: "",
              actionInput: {},
              actionOutput: "",
            },
          };
        }

        // At this point the request will go back to the user.
        return {
          message: this.stepContainer.getFinalResponse(),
          memory: {
            ...memory,
            plan,
            previousSteps: this.stepContainer.previousSteps,
            steps: this.stepContainer.steps,
            finalStep: this.stepContainer.finalStep,
          },
        };
      }
    }
    return {
      message: await this.takeFinalStep(),
      memory: {
        ...memory,
        plan,
        previousSteps: this.stepContainer.previousSteps,
        steps: this.stepContainer.steps,
        finalStep: this.stepContainer.finalStep,
      },
    };
  }
}
