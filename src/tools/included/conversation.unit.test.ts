import conversation from "./conversation";

describe("Conversation Tool", () => {
  it("returns the input response when called", async () => {
    const response = "I'm fine thanks. How are you?";
    const outcome = await conversation.call({ response });
    expect(outcome).toBe(response);
  });

  it("throws an error when called with invalid input", async () => {
    const invalidInput = { response: 42 }; // Invalid input: response should be a string
    await expect(conversation.call(invalidInput)).rejects.toThrow();
  });
});
