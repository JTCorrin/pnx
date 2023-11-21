import { BaseOutputParser, StepResult } from "../base";

/**
 * Executor implementation of the `BaseOutputParser`. Designed to
 * parse the output of a models `tool choice` into a `StepResult` object.
 */
export class ExecutorOutputParser extends BaseOutputParser<StepResult> {
  /**
   * Parses the output text received from the model into a StepResult object.
   * This represents the models response to a given StepAction.
   * @param text The output text to be parsed.
   * @returns A `StepResult` object consisting the models reponse.
   */
  async parse(text: string): Promise<StepResult> {
    const regex = /```(?:json)?(.*)(```)/gs;
    const actionMatch = regex.exec(text);

    // TODO deal with this more gracefully. i.e. ask the model to try again "concentrate"
    if (actionMatch === null) {
      throw new Error(
        `Could not parse an action. The agent action must be within a markdown code block, and "action" must be a provided tool or "Final Answer"`,
      );
    }

    const response = JSON.parse(actionMatch[1].trim());
    const { action, action_input: actionInput } = response;

    if (action == undefined) {
      throw new Error("No action was received from model");
    }

    return {
      actionDecision: text,
      action,
      actionInput,
      actionOutput: "",
    };
  }
}
