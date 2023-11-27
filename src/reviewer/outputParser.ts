import { BaseOutputParser } from "../base";
import { Step } from "../executor";

/**
 * Specific implementation of the `BaseOutputParser` class designed to
 * parse the models output text into an updated plan.
 */
export class PlanReviewerOutputParser extends BaseOutputParser<Step[]> {
  /**
   * Parses the output text into a `Plan` object. The steps are extracted by
   * splitting the text on newline followed by a number and a period,
   * indicating the start of a new step. The `<END_OF_PLAN>` tag is then
   * removed from each step.
   * @param text The output text to be parsed.
   * @returns A `Plan` object consisting of a series of steps.
   */
  async parse(text: string, originalRemainingSteps: Step[]): Promise<Step[]> {
    if (text == "YES" || text == "yes") {
      return originalRemainingSteps;
    } else {
      const newPlan = {
        steps: text
          .split(/\n\d+\.\s?/)
          .slice(1)
          .map((step) => ({ text: step.replace(`<END_OF_PLAN>`, "") })),
      };

      const updatedSteps: Step[] = newPlan.steps.map((step) => {
        return {
          action: step,
          result: {
            actionDecision: "",
            action: "",
            actionInput: {},
            actionOutput: "",
            responseRequired: false,
            reviewRequired: false
          },
        };
      });

      return updatedSteps;
    }
  }
}
