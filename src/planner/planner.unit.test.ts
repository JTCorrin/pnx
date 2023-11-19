import { DefaultLLM } from "../llm";
import { PromptTemplate, getToolNamesDescriptions } from "../prompt";
import { PlanOutputParser } from "./outputParser";
import { DefaultPlanner } from "./planner";
import { PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE } from "../prompt";
import defaultTools from "../tools/included/default";

// Provide a mock implementation for the DefaultLLM class
jest.mock("../llm", () => {
  return {
    DefaultLLM: jest.fn().mockImplementation(() => {
      return {
        call: jest
          .fn()
          .mockResolvedValue("1. Step one\n2. Step two<END_OF_PLAN>"),
      };
    }),
  };
});

// Provide a mock implementation for the PlanOutputParser class
jest.mock("./outputParser", () => {
  return {
    PlanOutputParser: jest.fn().mockImplementation(() => {
      return {
        parse: jest.fn().mockResolvedValue({
          steps: [{ text: "Step one" }, { text: "Step two" }],
        }),
      };
    }),
  };
});

describe("Planner", () => {
  // Use the mocked constructors directly, as they will return the mock instances
  const mockLLM = new DefaultLLM();
  const mockMessageTemplate = new PromptTemplate(
    PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE,
    { toolString: getToolNamesDescriptions(defaultTools) },
  );
  const mockOutputParser = new PlanOutputParser();

  // Create a DefaultPlanner instance with mocks
  const planner = new DefaultPlanner({
    llm: mockLLM,
    message: mockMessageTemplate,
    outputParser: mockOutputParser,
  });

  it("calls the LLM with formatted messages and returns a parsed plan", async () => {
    const plan = await planner.plan(mockMessageTemplate);
    expect(mockLLM.call).toHaveBeenCalledWith([
      "Formatted message",
      "Formatted message", // Assuming prompt.format() also returns 'Formatted message'
    ]);
    expect(mockOutputParser.parse).toHaveBeenCalledWith(
      "1. Step one\n2. Step two<END_OF_PLAN>",
    );
    expect(plan).toEqual({
      steps: [{ text: "Step one" }, { text: "Step two" }],
    });
  });

  // More tests can be added to cover additional scenarios and edge cases.
});
