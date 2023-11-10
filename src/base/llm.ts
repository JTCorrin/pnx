abstract class llm {

    abstract call(messages: string[]): Promise<any>
}