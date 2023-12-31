import { Step, StepContainer } from "../executor";
import { BasePlanReviewer } from "./base";
import { ChainInputs } from "../chain";
import { OpenAIMessage } from "../llm/llm";
import { PromptTemplate } from "../prompt/template";
import OpenAI from "openai";

export class DefaultPlanReviewer extends BasePlanReviewer<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion
> {
  constructor(
    inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>,
  ) {
    super(inputs);
  }

  /**
   * This function will take in a plan and, if it deems necessary, return a series
   * of new steps to replace the remaining steps of the original plan. If it deems
   * no change is necessary, it will simply return the original remaining steps
   * @param previousSteps plan steps already complete
   * @param remainingSteps plan steps yet to be completed
   * @param reviewPrompt prompt template for the plan reviewer
   */
  async reviewPlan(reviewPrompt: PromptTemplate): Promise<Step[]> {

    const response = await this.llm.call([
      {
        role: "user",
        content: reviewPrompt.format(),
      },
    ]);

    const reviewedRemainingSteps = await this.outputParser.parse(
        response.choices[0].message.content as string,
        JSON.parse(reviewPrompt.getInputs()["remainingSteps"]),
      );

    return reviewedRemainingSteps
  }

  integrateResponse(
    response: string,
    stepContainer: StepContainer,
  ): StepContainer {
    // place the response into the next step
    if (stepContainer.steps.length > 0) {
      stepContainer.steps[0].action.text = `The user has responded to your previous question. This is the response they gave:
      ${response}.
      Here is the current step in the plan: ${stepContainer.steps[0].action.text}`;

      return stepContainer;
    } else {
      // The plan has been completed and the response was the last part of the plan
      stepContainer.finalStep.action.text = `${stepContainer.finalStep.action.text}\n
      The user has responded to your previous question. This is the response they gave: ${response}`;

      return stepContainer;
    }
  }
}
