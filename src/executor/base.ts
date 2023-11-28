import { ChainInputs, BaseChain } from "../chain";
import { PromptTemplate, EXECUTOR_SUMMARY_PROMPT, PLAN_REVIEW_PROMPT } from "../prompt";
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
 * a tool (action) name, a tool input (schema), and whether
 * this action requires a response or a plan review.
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
  // Does the plan require a review because of this action?
  reviewRequired: boolean;
  // Does the plan require a response from the user at this stage?
  responseRequired: boolean
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

  // Trying to consolidate / reduce the amount of additional superfluous info given to the model
  formatPreviousSteps() {
    return JSON.stringify(this._previousSteps.map(prevStep => `{ "Action": "${prevStep.action.text}" }, { "Result": "${prevStep.result?.actionOutput}"}`));
  }

  getFinalResponse() {
    // TODO put some check in here
    return this._previousSteps[this._previousSteps.length - 1].result!
      .actionOutput;
  }

  isResponseRequired() {
    return this._previousSteps[this._previousSteps.length - 1].result?.responseRequired ?? false
  }

  isReviewRequired() {
    return this._previousSteps[this._previousSteps.length - 1].result?.reviewRequired ?? false
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

  private async setupSteps(
    plan: Plan,
    memory: Memory
  ): Promise<StepContainer> {

    const { previousSteps, steps, finalStep, latestPrompt: prompt } = memory;

    if (steps.length == 0 && previousSteps.length == 0) {
       
        const stepContainer = new StepContainer([], []);

        plan.steps.forEach((step) =>
            stepContainer.addNewStep({
                action: step,
                result: {
                actionDecision: "",
                action: "",
                actionInput: {},
                actionOutput: "",
                responseRequired: false,
                reviewRequired: false
                },
            }),
        );

        return stepContainer

    } else {

      let stepContainer = new StepContainer(steps, previousSteps, finalStep);

      if (stepContainer.isResponseRequired()) {
        stepContainer = this.planReviewer.integrateResponse(prompt.format(), this.stepContainer)
      }

      if (stepContainer.isReviewRequired()) {
        stepContainer.steps = await this.planReviewer.reviewPlan(new PromptTemplate(PLAN_REVIEW_PROMPT, {
            originalPrompt: memory.originalPrompt.format(),
            previousSteps: JSON.stringify(previousSteps),
            remainingSteps: JSON.stringify(steps)
        }))
      }
      return stepContainer

    }

  }

  private async executeSteps(): Promise<{complete: boolean, responseRequired: boolean}> {

    while (this.stepContainer.steps.length > 0) {
        
        const step = this.stepContainer.steps[0];
        step.result = await this.takeStep(step);
                  
        const updatedStep = await this.useTool(step)  
        this.stepContainer.completeStep(updatedStep);

        // Does selected tool require response?
        if (updatedStep.result?.responseRequired) {
            return {
                complete: false,
                responseRequired: updatedStep.result?.responseRequired
            }
        }
    }

    return {
        complete: true,
        responseRequired: false
    }

  }

  private async useTool(step: Step): Promise<Step> {
    
    if (!step.result) {
        throw new Error("No step result - can't use tool");   
    }

    const result = step.result
    const selectedTool = this.tools?.find(
        (tool) => tool.name == result.action,
      );

      if (selectedTool) {
        const toolOutput = await selectedTool.call(result.actionInput);
        step.result.actionOutput = toolOutput;
        step.result.responseRequired = selectedTool.requiresResponse
        step.result.reviewRequired = selectedTool.triggersReview
        for await (const callback of this.callbacks ?? []) {
          await callback(step.result);
        }

        return step

      } else {
        // TODO Inject a `request for reattempt step`
        throw Error("Did not provide a recognised tool for action");
      }
  }

  private async getUserResponse(plan: Plan, memory: Memory) {
    
    if (this.stepContainer.steps.length === 0) {
        // TODO this would be something we want the end user to adjust?
        const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
          latestPrompt: memory.latestPrompt.format(),
          originalPrompt: memory.originalPrompt.format(),
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
            responseRequired: false,
            reviewRequired: false
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
      }
  }

  private setFinalStep(summaryPrompt: string) {
    this.stepContainer.finalStep = {
        action: {
          text: summaryPrompt,
        },
        result: {
          action: "",
          actionDecision: "",
          actionInput: {},
          actionOutput: "",
          responseRequired: false,
          reviewRequired: false
        },
    };
  }

  async execute(prompt: PromptTemplate, memory: Memory) {
    
    memory.latestPrompt = prompt;
    const plan = memory.plan

    if (!plan) {
        throw new Error("No plan passed through to execute");
        
    }
    
    if (plan.steps.length < 1) {
      throw new Error("The plan doesn't have any steps to execute");
    }

    this.stepContainer = await this.setupSteps(plan, memory)

    
    const executionOutcome = await this.executeSteps()
    if (!executionOutcome.complete) { // At the moment this is redundant but it might be useful when more flags are added?
        return await this.getUserResponse(plan, memory)
    }

    const summaryPrompt = new PromptTemplate(EXECUTOR_SUMMARY_PROMPT, {
        originalPrompt: prompt.format(),
        latestPrompt: memory.latestPrompt.format(),
        originalPlan: this.stepContainer.previousSteps.map(step => `\nRequirements: ${step.result?.action}. Step Result: ${step.result?.actionOutput}`).join(","),
      }).format();

    this.setFinalStep(summaryPrompt)
    
    return {
      message: await this.takeFinalStep(),
      memory: {
        ...memory,
        plan,
        previousSteps: this.stepContainer.previousSteps,
        steps: this.stepContainer.steps,
        finalStep: this.stepContainer.finalStep,
        planComplete: true
      },
    };
  }
}
