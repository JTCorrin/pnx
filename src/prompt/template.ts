import { StructuredTool } from "../tools";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonSchema7ObjectType } from "zod-to-json-schema/src/parsers/object.js";

/**
 * Get a list of tool name separated by a new line
 * @param tools the list of structured tools
 * @returns string
 */
export const getToolNames = (tools: StructuredTool[]): string => {
  return tools.map((tool) => `${tool.name}`).join("\n");
};

/**
 * Get a list of tool names and descriptions separated by a new line
 * @param tools the list of structured tools
 * @returns string
 */
export const getToolNamesDescriptions = (tools: StructuredTool[]): string => {
  return tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n");
};

/**
 * Get a list of tool names, descriptions and schema separated by a new line
 * @param tools the list of structured tools
 * @returns string
 */
export const getToolSchemas = (tools: StructuredTool[]): string => {
  return (
    tools
      // eslint-disable-next-line
      .map(
        (tool) =>
          `${tool.name}: ${tool.description}, args: ${JSON.stringify(
            (zodToJsonSchema(tool.schema) as JsonSchema7ObjectType).properties,
          )}`,
      )
      .join("\n")
  );
};

type InputVariables = { [key: string]: string };

/**
 * Prompt template is a convenience class for dealing with messages
 * sent to the model. It can be a just simple string, or a string
 * with templates and associated variables. Once you've instantiated
 * the prompt, all attributes are available as members
 */
export class PromptTemplate {
  private inputVariables: InputVariables;
  public template: string;
  public outPutString: string;

  constructor(template: string, inputVariables?: InputVariables) {
    this.template = template;
    this.inputVariables = inputVariables ?? {};
    this.outPutString = this.format();
  }

  setInputs(inputs: InputVariables) {
    this.inputVariables = inputs;
  }

  getInputs() {
    return this.inputVariables;
  }

  format(): string {
    return Object.keys(this.inputVariables).reduce((acc, key) => {
      // Create a new RegExp that escapes the key to be used in a regex pattern
      const regex = new RegExp(`{${key}}`, "g");
      return acc.replace(regex, this.inputVariables[key]);
    }, this.template);
  }
}
