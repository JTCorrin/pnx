This is a lightweight and narrow focus module that provides a simple and intuitive api for a 'plan and execute' AI agent.

It is made it of 4 things:

1. Planner
2. Executor
3. Structured Tools
4. Swarm Overseer / Orchestrator (Create a plan that utilises the Agents - pass a Overseer gen prompt to the agent - agent makes plan and executes)

1 to 3 combined form the AgentExecutor.
4 alone forms an agent that has the ability to sign off on and adjust the AgentExecutors plan at any point in the plans execution

The planner, executor and overseer are essentially made up from components:

- LLMs
- Prompts
- Output parsers
- Memory

Collectively they are chains.

The easiest way to start is to instantiate the default Executor:

```typescript
import { Agent, PromptTemplate } from "pnx";

const agent = Agent.getDefault(process.env.OPENAI_KEY);
const prompt = PromptTemplate.fromString(
  "I need you to do {firstTask} and then move on to {secondTask}",
  {
    firstTask: "draft an email",
    secondTask: "send it to alice",
  },
);

agent.run(prompt);
```
