import { z } from "zod";

/**
 * Base class for Tools that accept input of any shape defined by a Zod schema.
 */
export abstract class BaseStructuredTool<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends z.ZodObject<any, any, any, any> = z.ZodObject<any, any, any, any>,
> {
  abstract schema: T | z.ZodEffects<T>;
  abstract name: string;
  abstract description: string;
//   triggersReview = false
//   requiresResponse = false
//   returnDirect = false;

  protected abstract _call(arg: z.output<T>): Promise<string>;

  /**
   * Calls the tool with the provided argument, configuration, and tags. It
   * parses the input according to the schema, handles any errors, and
   * manages callbacks.
   * @param arg The input argument for the tool.
   * @returns A Promise that resolves with a string.
   */
  async call(
    arg: (z.output<T> extends string ? string : never) | z.input<T>,
  ): Promise<string> {
    let parsed;
    try {
      parsed = await this.schema.parseAsync(arg);
    } catch (e) {
      throw new Error(
        `Received tool input did not match expected schema ${JSON.stringify(
          arg,
        )}`,
      );
    }
    return await this._call(parsed);
  }
}
