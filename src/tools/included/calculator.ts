// Calculator.ts
import { z } from "zod";
import { StructuredTool } from "../index";
import { Parser } from "expr-eval";

// Define a Zod schema for the calculator input
const CalculatorSchema = z.object({
  expression: z.string(),
});

// Define the input type for the Calculator
interface CalculatorInput {
  func: (input: z.infer<typeof CalculatorSchema>) => Promise<string>;
  schema: typeof CalculatorSchema;
  name: string;
  description: string;
  returnDirect?: boolean;
}

class Calculator extends StructuredTool<typeof CalculatorSchema> {
  constructor(fields: CalculatorInput) {
    super(fields);
  }

  protected _call(arg: z.infer<typeof CalculatorSchema>): Promise<string> {
    try {
      const result = Parser.evaluate(arg.expression);
      return Promise.resolve(result.toString());
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

// Instantiate the calculator with predefined parameters
const calculator = new Calculator({
  name: "Simple Calculator",
  description: "A simple calculator that evaluates expressions.",
  schema: CalculatorSchema,
  func: async (input) => {
    try {
      const result = Parser.evaluate(input.expression);
      return result.toString();
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${input.expression}`);
    }
  },
  // If you have a specific logic for returnDirect, set it here
  // returnDirect: true or false,
});

// Export the calculator
export default calculator;
