export abstract class LLM {
  abstract call(messages: string[]): Promise<any>;
}
