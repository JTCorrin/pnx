import { BaseAgent } from "../base/agent";
import { Executor } from "../executor/executor";
import { Planner } from "../planner/planner";
import { DefaultLLM } from "../llm";
import { PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE } from "../prompt";
import { StructuredTool, defaultTools } from "../tools";
import { PlanOutputParser } from "../planner/outputParser";


/**
 * Interface for the input to the PlanAndExecuteAgentExecutor class. It
 * includes the planner, step executor, step container.
 */
export interface PlanAndExecuteAgentInput {
  planner: Planner;
  executor: Executor;
  tools: StructuredTool[];
}

// TODO This should have an updating array of responses that can be listened to.
export class Agent extends BaseAgent {
  private planner: Planner;
  private executor: Executor;
  private tools: StructuredTool[];

  constructor(inputs: PlanAndExecuteAgentInput) {
    super();
    this.executor = inputs.executor;
    this.planner = inputs.planner;
    this.tools = inputs.tools;
  }

  static getDefaultPlanner() {
    return new Planner({
      llm: new DefaultLLM(), //OpenAI GPT-4
      message: PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE,
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
    const plan = await this.planner.plan(prompt); // input here should be prompt and tools
    await this.executor.execute();
  }
}
