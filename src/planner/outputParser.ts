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
    const regex = /(?<!\d)(?=\d+\.)/;

    const steps = text.split(regex)
    .map(step => step.replace(/<END_OF_PLAN>/, '').trim()) // Clean up the step text
    .filter(step => step.match(/^\d+\./)); // Filter to ensure only valid steps are kept

    return {
      steps: steps.map(s => ({ text: s.split(/\s+/).slice(1).join(' ') }))
    };
  }
}
