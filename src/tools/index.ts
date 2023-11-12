import { z } from "zod";
import { BaseStructuredTool } from "../base";
/**
 * Interface for the input parameters of the DynamicStructuredTool class.
 */
export interface StructuredToolInput<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends z.ZodObject<any, any, any, any> = z.ZodObject<any, any, any, any>,
> {
  func: (input: z.infer<T>) => Promise<string>;
  schema: T;
  name: string;
  description: string;
  returnDirect?: boolean;
}

export class StructuredTool<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends z.ZodObject<any, any, any, any> = z.ZodObject<any, any, any, any>,
> extends BaseStructuredTool {
  name: string;
  description: string;
  func: StructuredToolInput["func"];
  schema: T;
  constructor(fields: StructuredToolInput<T>) {
    super();
    this.name = fields.name;
    this.description = fields.description;
    this.func = fields.func;
    this.returnDirect = fields.returnDirect ?? this.returnDirect;
    this.schema = fields.schema;
  }

  protected _call(arg: z.output<T>): Promise<string> {
    return this.func(arg);
  }
}

export const defaultTools = [];
