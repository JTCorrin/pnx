/**
 * Class to parse the output of an LLM call.
 */
export abstract class BaseOutputParser<T = unknown> {
  /**
   * Parse the output of an LLM call.
   *
   * @param text - LLM output to parse.
   * @returns Parsed output.
   */
  abstract parse(text: string, opts: any): Promise<T>;
}
