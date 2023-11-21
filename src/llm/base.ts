export abstract class LLM<T, R> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract call(messages: T[]): Promise<R>;
}
