import OpenAI from "openai";
import { LLM } from "../base";
import * as dotenv from "dotenv";
dotenv.config();

export interface OpenAIMessage {
  role: "system" | "assistant" | "user";
  content: string;
  name?: string;
}

export class OpenAILLM extends LLM<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion
> {
  private openai: OpenAI;
  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API, //process.env.OPENAI_API,
      organization: process.env.ORG_ID ?? "",
    });
  }

  async call(
    messages: OpenAIMessage[],
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    console.debug(`Calling model with: ${JSON.stringify(messages)}`)
    const completion = await this.openai.chat.completions.create({
      messages,
      model: "gpt-4",
    });

    return completion;
  }
}

export const DefaultLLM = OpenAILLM;
