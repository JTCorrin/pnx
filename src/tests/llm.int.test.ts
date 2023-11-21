// OpenAILLM.int.test.ts
import { OpenAILLM, OpenAIMessage } from "../llm/llm";

describe("OpenAILLM Integration", () => {
  let openAILLM: OpenAILLM;

  beforeAll(() => {
    openAILLM = new OpenAILLM();
  });

  it("should receive a response from the OpenAI API", async () => {
    const messages: OpenAIMessage[] = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: "What is the capital of France?" },
    ];

    const response = await openAILLM.call(messages);

    // Check if response is valid
    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0].message.content).toBeDefined();
    expect(response.choices[0].message.content).toContain("Paris");
  }, 30000); // Extended timeout for async operations
});
