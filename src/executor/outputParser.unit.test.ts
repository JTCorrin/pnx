import { ExecutorOutputParser } from './outputParser';
import { StepResult } from '../base';

// Mocks for the dependencies, if any

describe('ExecutorOutputParser', () => {
  let outputParser: ExecutorOutputParser;

  beforeEach(() => {
    // Instantiate a new ExecutorOutputParser before each test
    outputParser = new ExecutorOutputParser();
  });

  it('should parse valid JSON wrapped in markdown code blocks into a StepResult object', async () => {
    const validText = '```json\n{"action": "SomeTool", "action_input": {"key": "value"}}\n```';
    const expectedOutput: StepResult = {
      actionDecision: validText,
      action: 'SomeTool',
      actionInput: { key: 'value' },
      actionOutput: '',
    };

    await expect(outputParser.parse(validText)).resolves.toEqual(expectedOutput);
  });

  it('should throw an error if the text does not contain JSON within markdown code blocks', async () => {
    const invalidText = 'This is some invalid response without JSON code blocks.';
    await expect(outputParser.parse(invalidText)).rejects.toThrow(
      'Could not parse an action. The agent action must be within a markdown code block, and "action" must be a provided tool or "Final Answer"'
    );
  });

  it('should throw an error if the JSON does not contain required fields', async () => {
    const invalidJsonText = '```json\n{"missing_action": "value"}\n```';
    await expect(outputParser.parse(invalidJsonText)).rejects.toThrow(SyntaxError);
  });

});
