import askUser from './askUser'; // Use the correct path where askUser is defined

describe('AskUser Tool', () => {
  it('returns the input question when called', async () => {
    const question = 'What is the meaning of life?';
    const response = await askUser.call({ question });
    expect(response).toBe(question);
  });

  it('throws an error when called with invalid input', async () => {
    const invalidInput = { question: 42 }; // Invalid input: question should be a string
    await expect(askUser.call(invalidInput)).rejects.toThrow();
  });

});
