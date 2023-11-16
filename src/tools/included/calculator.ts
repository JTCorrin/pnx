// Calculator.ts
import { z } from "zod";
import { StructuredTool } from "../";
import { Parser } from "expr-eval";

// Define a Zod schema for the calculator input
const CalculatorSchema = z.object({
  expression: z.string().describe("The calculation you wish to perform"),
});

class Calculator extends StructuredTool<typeof CalculatorSchema> {
  constructor() {
    super({
      name: "Simple Calculator",
      description:
        "use this when you need to evaluate relatively simple mathematical expressions",
      schema: CalculatorSchema,
      returnDirect: true,
      func: async (input) => {
        try {
          const result = Parser.evaluate(input.expression);
          return result.toString();
        } catch (error) {
          throw new Error(`Failed to evaluate expression: ${input.expression}`);
        }
      },
    });
  }
}

// Instantiate the calculator with predefined parameters
const calculator = new Calculator();

// Export the calculator
export default calculator;
