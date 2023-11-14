import { BaseOutputParser, StepResult } from "../base";

/**
 * Specific implementation of the `BaseOutputParser` class designed to
 * parse the output text into a `StepResult` object.
 */
export class ExecutorOutputParser extends BaseOutputParser<StepResult> {
  /**
   * Parses the output text into a StepResult object. This represents the
   * models response to a given StepAction.
   * @param text The output text to be parsed.
   * @returns A `StepResult` object consisting the models reponse.
   */
  async parse(text: string): Promise<StepResult> {
    return {
      response: text
    };
  }
}
