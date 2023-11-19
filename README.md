# ⚡ pnx 

pnx is short for Plan and Execute - its a lightweight, narrow focussed and simple to use AI agent framework 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Twitter](https://img.shields.io/twitter/url/https/twitter.com/jtcorrindata.svg?style=social&label=Follow%20%40JTCorrinData)](https://twitter.com/jtcorrindata)

This library is still in active development and while the framework is small and has decent test coverage, we would recommend you test thoroughly before using this in production

## ⚡️ Quick Install

You can use npm, or pnpm to install pnx

`npm install pnx` or `pnpm add langchain`


## 🌐 Where can I use it?

pnx is written in TypeScript and can be used on both the server and the browser. At time of writing I've only tested on the server though. 

Running on serverless or edge functions is not recommended at this time.

## 🤔 What is this?

pnx is heavily inspired and influenced by the amazing Langchain library. While I was making a few contributions to that codebase it was clear to me that while Langchain seemed to have everything, I only needed one specific part of it; the Plan and Execute agents. Unfortunately, that part was not fully fleshed out (and indeed still under an experimental flag).

So, pnx is my attempt at Plan and Execute agents. It is therefore a lightweight and narrow focussed module that provides a simple and intuitive api for a 'plan and execute' AI agent/s.



## 🚀 Get started

Update the .env.example file and rename it to .env

You can then quickly and easily spin up an agent like this:

```typescript
import { Agent, PromptTemplate } from "pnx";

const agent = Agent.getDefault() // Should be suitable for most scenario - uses GPT4 OOTB

const response = await agent.run(
    new PromptTemplate(`Hello, how are you today? What's 4 * 4? Oh yeah, can you give me some info on the company Sony?`)
)

console.log(response)

// What specific information would you like to know about the company Sony?

const message2 = await agent.run(
    new PromptTemplate("Just give me a general idea of what their main business is.")
)

console.log(message2);

// Hello! I'm doing well, thank you for asking. Now onto your questions: 4 * 4 equals 16. As for Sony, it's a multinational conglomerate corporation. Their main businesses are in electronics, gaming (such as the PlayStation consoles), entertainment (like movies and music), and financial services. They are headquartered in Tokyo, Japan. Let me know if there's anything else you'd like to know!

```


**📃 Agents:**

Agents are essentially made up of 2 parts. 

 - A planner whose task it is to create a step-by-step plan based on fulfilling whatever mission or task is outlined in the prompt (even if the prompt is a simply conversation starter like 'Hi, how are you?').

 - An executor whose job it is to loop over each step in the plan and request that the LLM determine what tool it should use, with what input, to fulfill the step. 

 Both the planner and the executor are subclasses of the Chain class, which is inspired by the Langchain chain class - although here it is a much simpler, watered down version.

**🔗 Chains:**

Chains are dead simple and are made up of:

- An LLM
- A initial / system prompt
- An output parser (converts the response from the LLM to something useable)
- A set of "structured" tools (a la Langchain)
- (optional) A callbacks array
  

\
**🔧 Tools**

Tools are really where the neat stuff happens here. They are practically the same as Langchain tools except this library only accepts structured tools (I couldn't get my head around why non-structured tools exist), and structured tools here have a couple of extra config flags on them, namely:

- requiresResponse
- triggersReview (this is still in development)

Here is the "Ask User" tool to show and example (and show how you can easily dream up your own tools):

```typescript
import { z } from "zod";
import { StructuredTool } from "..";

const AskUserSchema = z.object({
  question: z.string().describe("The question you would like to ask the user"),
});

class AskUser extends StructuredTool<typeof AskUserSchema> {
  constructor() {
    super({
      name: "Ask User",
      description: "use this when you need to ask the user a question",
      schema: AskUserSchema,
      triggersReview: false,
      requiresResponse: true,
      returnDirect: true,
      func: async (input) => {
        return input.question;
      },
    });
  }
}
```

**⚗️ Create your own:**

The best way to create your own functionality on top of this framework is to create your own planner and your own executor and pass these to an instantiation of the Agent class.



## 💁 Contributing

As a small time developer with big ambitions I welcome all suggestions and PR contributions and I will be doing my best to answer any questions that come through.

Just remember that the main reason for this library was to keep it narrow focussed and lightweight. I'll probably be rejecting PRs that start adding things like specific tools (if there is enought traction I'll create a separate "Tool Shop" repo for that sort of thing).
