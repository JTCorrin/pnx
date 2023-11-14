import { BaseAgent } from "../base/agent";
import { Executor } from "../executor/executor";
import { Planner } from "../planner/planner";
import { DefaultLLM } from "../llm";
import {
  PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE,
  PromptTemplate,
} from "../prompt";
import { StructuredTool } from "../tools";
import defaultTools from "../tools/included/default";
import { PlanOutputParser } from "../planner/outputParser";

/**
 * Interface for the input to the PlanAndExecuteAgentExecutor class. It
 * includes the planner, step executor, step container.
 */
export interface PlanAndExecuteAgentInput {
  planner: Planner;
  executor: Executor;
  tools?: StructuredTool[];
  callbacks?: Function[];
}

// TODO This should have an updating array of responses that can be listened to.
export class Agent extends BaseAgent {
  private planner: Planner;
  private executor: Executor;
  private tools: StructuredTool[];
  private callbacks: Function[];

  constructor(inputs: PlanAndExecuteAgentInput) {
    super();
    this.executor = inputs.executor;
    this.planner = inputs.planner;
    this.tools = inputs.tools ?? defaultTools;
    this.callbacks = inputs.callbacks ?? [];
  }

  static getDefaultPlanner(tools: StructuredTool[]) {
    return new Planner({
      llm: new DefaultLLM(), //OpenAI GPT-4
      message: new PromptTemplate(PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE, {
        toolString: Planner.getToolString(tools),
      }),
      outputParser: new PlanOutputParser(),
    });
  }

  static getDefault(tools: StructuredTool[] = defaultTools) {
    return new Agent({
      planner: this.getDefaultPlanner(tools),
      executor: new Executor(),
      tools,
    });
  }

  async run(prompt: PromptTemplate) {
    const plan = await this.planner.plan(prompt); // input here should be prompt and tools
    await this.executor.execute(plan);
  }
}
