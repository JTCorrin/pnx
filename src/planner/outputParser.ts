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
    const regex = /(?<=^|\n| )\d+\.\s+(?=[A-Z`])/;

    const steps = text
      .split(regex)
      .slice(1)
      .map((step) => step.replace(/<END_OF_PLAN>/, "").trim());

    return {
      steps: steps.map((s) => ({ text: s })),
    };
  }
}
