import OpenAI from "openai";
import { LLM } from "../base";

export class OpenAILLM extends LLM {
  private openai: OpenAI;
  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: "api-key", //process.env.OPENAI_API,
      organization: "",
    });
  }

  async call(messages: string[]): Promise<any> {
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0]);
  }
}

export const DefaultLLM = OpenAILLM;
