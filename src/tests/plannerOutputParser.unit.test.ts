// PlanOutputParser.test.ts
import { PlanOutputParser } from "../planner/outputParser"; // Adjust the import path to where your PlanOutputParser is located

describe("PlanOutputParser", () => {
  let parser: PlanOutputParser;

  beforeEach(() => {
    parser = new PlanOutputParser();
  });

  it("should parse a given string into a Plan object with steps", async () => {
    const outputText = `Plan:\n1. First step\n2. Second step\n3. Third step<END_OF_PLAN>`;
    const expectedPlan = {
      steps: [
        { text: "First step" },
        { text: "Second step" },
        { text: "Third step" },
      ],
    };
    await expect(parser.parse(outputText)).resolves.toEqual(expectedPlan);
  });

  it("should correctly handle empty input", async () => {
    const outputText = "";
    const expectedPlan = { steps: [] };
    await expect(parser.parse(outputText)).resolves.toEqual(expectedPlan);
  });

  it("should ignore lines not starting with a number and period", async () => {
    const outputText = `Plan:\n1. This is a valid step\nAnd this should not be included<END_OF_PLAN>`;
    const expectedPlan = {
      steps: [
        { text: "This is a valid step\nAnd this should not be included" },
      ],
    };
    await expect(parser.parse(outputText)).resolves.toEqual(expectedPlan);
  });

  it("should handle multiple occurrences of <END_OF_PLAN>", async () => {
    const outputText = `Plan:\n1. Step with <END_OF_PLAN> in the middle\n2. Another step<END_OF_PLAN>`;
    const expectedPlan = {
      steps: [{ text: "Step with  in the middle" }, { text: "Another step" }],
    };
    await expect(parser.parse(outputText)).resolves.toEqual(expectedPlan);
  });
});
