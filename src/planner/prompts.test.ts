// PromptTemplate.test.ts
import { PromptTemplate } from '../base'; // Adjust the import path to where your PromptTemplate is located

describe('PromptTemplate', () => {
  describe('fromString', () => {
    it('replaces placeholders with corresponding values', () => {
      const template = 'Hello, {name}! Welcome to {place}.';
      const variables = { name: 'Alice', place: 'Wonderland' };
      const expected = 'Hello, Alice! Welcome to Wonderland.';

      const result = PromptTemplate.fromString(template, variables);

      expect(result).toBe(expected);
    });

    it('replaces multiple occurrences of the same placeholder', () => {
      const template = '{repeat} {repeat} {repeat}';
      const variables = { repeat: 'echo' };
      const expected = 'echo echo echo';

      const result = PromptTemplate.fromString(template, variables);

      expect(result).toBe(expected);
    });

    it('does not replace anything if there are no placeholders', () => {
      const template = 'No placeholders here.';
      const variables = { unused: 'variable' };
      const expected = 'No placeholders here.';

      const result = PromptTemplate.fromString(template, variables);

      expect(result).toBe(expected);
    });

    it('leaves placeholders intact if no corresponding variable is found', () => {
      const template = 'Hello, {name}!';
      const variables = {};
      const expected = 'Hello, {name}!';

      const result = PromptTemplate.fromString(template, variables);

      expect(result).toBe(expected);
    });

    it('properly replaces placeholders when variable values contain special regex characters', () => {
      const template = 'Special characters: {special}';
      const variables = { special: '$^*+?.()|{}[]\\' };
      const expected = 'Special characters: $^*+?.()|{}[]\\';

      const result = PromptTemplate.fromString(template, variables);

      expect(result).toBe(expected);
    });

    it('works from a joined string array', () => {
        const template = ["Hello,", "{name}.", "How are you?"].join(" ");
        const variables = { name: 'Bob' };
        const expected = 'Hello, Bob. How are you?';
  
        const result = PromptTemplate.fromString(template, variables);
  
        expect(result).toBe(expected);
      });
  });
});
