import { BaseAgent } from "../base/agent";
import { DefaultExecutor } from "../executor/executor";
import { DefaultPlanner } from "../planner/planner";
import { DefaultLLM } from "../llm";
import {
  PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE,
  EXECUTOR_SYSTEM_PROMPT_MESSAGE_TEMPLATE,
  PromptTemplate,
  getToolNamesDescriptions,
  getToolSchemas,
  getToolNames,
} from "../prompt";
import { StructuredTool } from "../tools";
import defaultTools from "../tools/included/default";
import { PlanOutputParser } from "../planner/outputParser";
import { ExecutorOutputParser } from "../executor/outputParser";

export const defaultCallback = (log: string) => { console.log(log) }

/**
 * Interface for the input to the PlanAndExecuteAgentExecutor class. It
 * includes the planner, step executor, step container.
 */
export interface PlanAndExecuteAgentInput {
  planner: DefaultPlanner;
  executor: DefaultExecutor;
  tools?: StructuredTool[];
  callbacks?: Function[];
}

// TODO This should have an updating array of responses that can be listened to.
export class Agent extends BaseAgent {
  private planner: DefaultPlanner;
  private executor: DefaultExecutor;
  private tools: StructuredTool[];
  private callbacks: Function[];

  constructor(inputs: PlanAndExecuteAgentInput) {
    super();
    this.executor = inputs.executor;
    this.planner = inputs.planner;
    this.tools = inputs.tools ?? defaultTools;
    this.callbacks = inputs.callbacks ?? [];
  }

  /**
   * The default planner uses a pre-configured prompt and OpenAI gpt-4 as its
   * llm, which ultimately creates the plan
   * @param tools the tools passed through to the planner. Only the name and description will be
   * used by the planner. It doesn't use the tools to create a plan
   * @returns Plan
   */
  static getDefaultPlanner(tools: StructuredTool[]) {
    return new DefaultPlanner({
      llm: new DefaultLLM(), //OpenAI GPT-4
      message: new PromptTemplate(PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE, {
        toolString: getToolNamesDescriptions(tools),
      }),
      outputParser: new PlanOutputParser(),
      callbacks: [defaultCallback],
      tools
    });
  }
  
  /**
   * The default planner uses a pre-configured prompt and OpenAI gpt-4 as its
   * llm, which ultimately creates the plan
   * @param tools the tools passed through to the planner. Only the name and description will be
   * used by the planner. It doesn't use the tools to create a plan
   * @returns Plan
   */
  static getDefaultExecutor(tools: StructuredTool[]) {
    return new DefaultExecutor({
      llm: new DefaultLLM(), //OpenAI GPT-4
      message: new PromptTemplate(EXECUTOR_SYSTEM_PROMPT_MESSAGE_TEMPLATE, {
        toolSchemas: getToolSchemas(tools),
        toolNames: getToolNames(tools),
      }),
      outputParser: new ExecutorOutputParser(),
      callbacks: [defaultCallback],
      tools
    });
  }

  /**
   * Use this to instantiate the default Agent setup. It comes with OpenAI gpt-4
   * as the default LLM. Simply pass it tools if you have custom tools or
   * pass nothing and get a few basic/defaul tools including a calculator.
   *  Good for basic setups and a wide range of use cases.
   * @param tools the tools available to this agent. Defaults to defaultTools
   * @returns a new Agent
   */
  static getDefault(tools: StructuredTool[] = defaultTools) {
    return new Agent({
      planner: this.getDefaultPlanner(tools),
      executor: this.getDefaultExecutor(tools),
      tools,
      callbacks: [defaultCallback]
    });
  }

  async run(prompt: PromptTemplate) {
    const plan = await this.planner.plan(prompt); // input here should be prompt and tools
    await this.executor.execute(plan);
  }
}
