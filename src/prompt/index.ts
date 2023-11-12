
export * from './prompts'

type InputVariables = { [key: string]: string };

export class PromptTemplate {
  public inputVariables: InputVariables
  public template: string
  public outPutString: string

  constructor(template: string, inputVariables: InputVariables) {
    this.template = template
    this.inputVariables = inputVariables
    this.outPutString = this.format()
  }

  format(): string {
    return Object.keys(this.inputVariables).reduce((acc, key) => {
      // Create a new RegExp that escapes the key to be used in a regex pattern
      const regex = new RegExp(`{${key}}`, "g");
      return acc.replace(regex, this.inputVariables[key]);
    }, this.template);
  }

  /**
   * Takes a string with placeholders in the form of {placeholderName}
   * and an object with keys matching the placeholder names. It replaces
   * the placeholders with the corresponding values from the object.
   *
   * @param template The string template containing placeholders.
   * @param variables An object containing the keys and values to replace in the template.
   * @returns The template string with placeholders replaced by provided variables.
   */
  static toString(template: string, variables: InputVariables): string {
    return new PromptTemplate(template, variables).format()
  }
}
