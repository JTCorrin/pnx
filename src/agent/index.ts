import { PromptTemplate } from "../base";
import { BaseAgent, PlanAndExecuteAgentInput } from "../base/agent";
import { Executor } from "../executor/executor";
import { Planner } from "../planner/planner";
import { DefaultLLM } from "../llm";
import { PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE } from "../prompt/prompts";
import { defaultTools } from "../tools";
import { PlanOutputParser } from "../planner/outputParser";

export class Agent extends BaseAgent {
  private planner: Planner;
  private executor: Executor;
  private tools: Tool[];

  constructor(inputs: PlanAndExecuteAgentInput) {
    super();
    this.executor = inputs.executor;
    this.planner = inputs.planner;
    this.tools = inputs.tools;
  }

  static getDefaultPlanner() {
    return new Planner({
      llm: new DefaultLLM(), //OpenAI GPT-4
      prompt: PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE,
      outputParser: new PlanOutputParser(),
    });
  }

  static getDefault() {
    return new Agent({
      planner: this.getDefaultPlanner(),
      executor: new Executor(),
      tools: defaultTools,
    });
  }

  async run(prompt: string | PromptTemplate) {
    const plan = await this.planner.plan(prompt);
    await this.executor.execute();
  }
}
