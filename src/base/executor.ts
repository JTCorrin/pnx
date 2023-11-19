import { ChainInputs } from "../chain";
import { EXECUTOR_SUMMARY_PROMPT, PromptTemplate } from "../prompt";
import { BaseChain } from "./chain";
import { BasePlanReviewer } from "./planReviewer";
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
  protected _steps: Step[] = [];
  protected _previousSteps: Step[] = [];
  protected _finalStep: Step | null = null
  
  addNewStep(step: Step) {
    this.steps.push(step);
  }

  completeStep(step: Step) {
    this._previousSteps.push(step);
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
    return this._finalStep as Step
  }
  
  set finalStep(step: Step) {
    this._finalStep = step
  }
}

export abstract class BaseExecutor<T, R, Parser> extends BaseChain<
  T,
  R,
  Parser
> {
  protected stepContainer: StepContainer;
  protected abstract takeStep(step: Step): Promise<StepResult>;
  protected abstract takeFinalStep(): Promise<string>
  abstract planReviewer: BasePlanReviewer<T, R>;

  constructor(inputs: ChainInputs<T, R>) {
    super(inputs);
    this.stepContainer = new StepContainer();
  }

  protected prepareStepContainer(plan: Plan, prompt: PromptTemplate) {
    // Check if there is not already a plan on-going (final step will be empty if this is a fresh request)
    if (this.stepContainer.finalStep == null) {
      // Populate step container with the plan items
      plan.steps.forEach((step) =>
        this.stepContainer.addNewStep({
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
        }
    } else {
        // There was already a plan ongoing
        this.stepContainer = this.planReviewer.integrateResponse(prompt.format(), this.stepContainer)
    }
  }

  // TODO This is not abstract and should be handled at base. Perhaps more setup should be done from the constructor
  async execute(plan: Plan, prompt: PromptTemplate) {
    if (plan.steps.length < 1) {
      throw Error("The plan doesn't have any steps to execute");
    }

    this.prepareStepContainer(plan, prompt)
    

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

      // Remove the first step from the array, shifting all other elements forward
      this.stepContainer.steps.shift();

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
              }
        }

        // At this point the request will go back to the user. 
        return this.stepContainer.getFinalResponse();
      }
    }
    return this.takeFinalStep()
  }


  async getSummaryResponse(message: T[]): Promise<R> {
    const response = await this.llm.call(message);
    return response;
  }
}
