import {
  BaseExecutor,
  BaseStepContainer,
  Plan,
  Step,
  StepAction,
  StepResult,
} from "../base";

class StepContainer extends BaseStepContainer {
  addStep(action: StepAction, result: StepResult): void {
    console.log(action, result);
    return;
  }

  getFinalResponse(): string {
    return "Final response";
  }
}

export class Executor extends BaseExecutor {
  private stepContainer: StepContainer;

  constructor() {
    super();
    this.stepContainer = new StepContainer();
  }

  async takeStep(step: Step): Promise<Step> {
    return step;
  }

  async execute(plan: Plan) {
    if (plan.steps.length < 1) {
      throw Error("The plan doesn't have any steps to execute");
    }

    this.stepContainer.steps = plan.steps.map((action) => {});
    for await (const step of this.stepContainer.steps) {
      await this.takeStep(step);
    }
    s;
  }
}
