import { BaseOutputParser, StepResult } from "../base";

/**
 * Specific implementation of the `BaseOutputParser` class designed to
 * parse the output text into a `StepResult` object. It should always
 * give a tool name and tool input
 */
export class ExecutorOutputParser extends BaseOutputParser<StepResult> {
  /**
   * Parses the output text into a StepResult object. This represents the
   * models response to a given StepAction.
   * @param text The output text to be parsed.
   * @returns A `StepResult` object consisting the models reponse.
   */
  async parse(text: string): Promise<StepResult> {
    const regex = /```(?:json)?(.*)(```)/gs;
    const actionMatch = regex.exec(text);
    if (actionMatch === null) {
        throw new Error(
            `Could not parse an action. The agent action must be within a markdown code block, and "action" must be a provided tool or "Final Answer"`
        );
    }
    const response = JSON.parse(actionMatch[1].trim());
    console.debug(response)
    const { action, action_input: actionInput } = response;
    return {
      actionDecision: text,
      action,
      actionInput,
      actionOutput: ""
    };
  }
}
