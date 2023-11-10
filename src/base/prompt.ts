type InputVariables = { [key: string]: string };

export class PromptTemplate {
  /**
   * Takes a string with placeholders in the form of {placeholderName}
   * and an object with keys matching the placeholder names. It replaces
   * the placeholders with the corresponding values from the object.
   *
   * @param template The string template containing placeholders.
   * @param variables An object containing the keys and values to replace in the template.
   * @returns The template string with placeholders replaced by provided variables.
   */
  static fromString(template: string, variables: InputVariables): string {
    return Object.keys(variables).reduce((acc, key) => {
      // Create a new RegExp that escapes the key to be used in a regex pattern
      const regex = new RegExp(`{${key}}`, 'g');
      return acc.replace(regex, variables[key]);
    }, template);
  }
}