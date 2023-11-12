import { Planner } from "./planner";
import { DefaultLLM } from "../llm";
import { PromptTemplate } from "../prompt";
import { PlanOutputParser } from "./outputParser";

jest.mock("../llm");
jest.mock("../prompt");
jest.mock("./outputParser");

// Define a simple mock for the LLM 'call' method
const mockLLMCall = jest.fn();
DefaultLLM.prototype.call = mockLLMCall;

// Define a simple mock for the PlanOutputParser 'parse' method
const mockParse = jest.fn();
PlanOutputParser.prototype.parse = mockParse;

describe("Planner", () => {
  const mockLLM = new DefaultLLM();
  const mockPromptTemplate = new PromptTemplate();
  const mockOutputParser = new PlanOutputParser();

  // Setup the Planner with mocked inputs
  const planner = new Planner({
    llm: mockLLM,
    prompt: mockPromptTemplate,
    outputParser: mockOutputParser,
  });

  beforeEach(() => {
    // Clear all mocks before each test
    mockLLMCall.mockClear();
    mockParse.mockClear();
  });

  it("calls the LLM service with the prompt and parses the response", async () => {
    // Arrange
    const promptString = "Test prompt";
    const llmResponse = "1. Step one\n2. Step two<END_OF_PLAN>";
    const expectedPlan = {
      steps: [{ text: "Step one" }, { text: "Step two" }],
    };

    mockLLMCall.mockResolvedValue(llmResponse);
    mockParse.mockResolvedValue(expectedPlan);
    mockPromptTemplate.toString = jest.fn().mockReturnValue(promptString);

    // Act
    const plan = await planner.plan(mockPromptTemplate);

    // Assert
    expect(mockPromptTemplate.toString).toHaveBeenCalled();
    expect(mockLLMCall).toHaveBeenCalledWith([promptString]);
    expect(mockParse).toHaveBeenCalledWith(llmResponse);
    expect(plan).toEqual(expectedPlan);
  });
});
