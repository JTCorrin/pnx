import { Plan } from "./base";
import { BaseOutputParser } from "../base";

/**
 * Specific implementation of the `BaseOutputParser` class designed to
 * parse the models output text into a `Plan` object.
 */
export class PlanOutputParser extends BaseOutputParser<Plan> {
  /**
   * Parses the output text into a `Plan` object. The steps are extracted by
   * splitting the text on newline followed by a number and a period,
   * indicating the start of a new step. The `<END_OF_PLAN>` tag is then
   * removed from each step.
   * @param text The output text to be parsed.
   * @returns A `Plan` object consisting of a series of steps.
   */
  async parse(text: string): Promise<Plan> {
    return {
      steps: text
        .split(/\n\d+\.\s?/)
        .slice(1)
        .map((step) => ({ text: step.replace(`<END_OF_PLAN>`, "") })),
    };
  }
}
