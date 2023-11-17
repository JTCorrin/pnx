import { StructuredTool } from "../tools";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonSchema7ObjectType } from "zod-to-json-schema/src/parsers/object.js";

/**
 * Get a list of tool name separated by a new line
 * @param tools the list of structured tools
 * @returns string
 */
export const getToolNames = (tools: StructuredTool[]): string => {
  return tools.map((tool) => `${tool.name}`).join("\n");
};

/**
 * Get a list of tool names and descriptions separated by a new line
 * @param tools the list of structured tools
 * @returns string
 */
export const getToolNamesDescriptions = (tools: StructuredTool[]): string => {
  return tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n");
};

/**
 * Get a list of tool names, descriptions and schema separated by a new line
 * @param tools the list of structured tools
 * @returns string
 */
export const getToolSchemas = (tools: StructuredTool[]): string => {
  return (
    tools
      // eslint-disable-next-line
      .map(
        (tool) =>
          `${tool.name}: ${tool.description}, args: ${JSON.stringify(
            (zodToJsonSchema(tool.schema) as JsonSchema7ObjectType).properties,
          )}`,
      )
      .join("\n")
  );
};

export const PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE = [
  `Let's first understand the problem and devise a plan to solve the problem.`,
  `Please output the plan starting with the header "Plan:"`,
  `followed by a numbered list of steps.`,
  `Please make the plan the minimum number of steps required`,
  `to answer the query or complete the task accurately and precisely.`,
  `You have a set of tools at your disposal to help you with this task:`,
  "",
  "{toolString}",
  "",
  `You must consider these tools when coming up with your plan.`,
  `At the end of your plan, say "<END_OF_PLAN>"`,
].join(" ");

export const EXECUTOR_SYSTEM_PROMPT_MESSAGE_TEMPLATE = [
  `Please concentrate as the following is important; it details some precise instructions you must follow.`,
  `You have access to the following tools and you must format`,
  `your inputs to these tools to match their "JSON schema" definitions below.`,
  `"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.`,
  "",
  `For example, the example "JSON Schema" instance {"foo": {"description": "a list of test words", "type": "array", "items": {"type": "string"}, "required": ["foo"]}}`,
  `would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array",`,
  `and the "description" property semantically describes it as "a list of test words".`,
  `The items within "foo" must be strings. Thus, the object {"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema".`,
  `The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.`,
  `Here are the JSON Schema instances for the tools you have access to:`,
  "",
  `{toolSchemas}`,
  "",
  "",
  `The way you use the tools is as follows:`,
  "",
  `------------------------`,
  "",
  `Output a JSON markdown code snippet containing a valid JSON blob (denoted below by $JSON_BLOB).`,
  `This $JSON_BLOB must have a "action" key (with the name of the tool to use) and an "action_input" key (tool input).`,
  `Valid "action" values are therefore strictly limited to one of [{toolNames}]. "action_input" values will always have an object of key:value pairs. DO NOT simply pass a string.`,
  `The $JSON_BLOB must be valid, parseable JSON and only contain a SINGLE action. Here is an example of an acceptable output:`,
  "",
  `\`\`\`json
    {{
      "action": $TOOL_NAME,
      "action_input": $INPUT
    }}
    \`\`\``,
  "",
  `Remember to include the surrounding markdown code snippet delimiters (begin with "\`\`\`" json and close with "\`\`\`")!`,
  "",
  `------------------------`,
  "",
  `ALWAYS use the following format:`,
  `Input: the input which you must respond to`,
  `Thought: you should always think about what to do`,
  `Action:
    \`\`\`json
    $JSON_BLOB
    \`\`\``,
  `Observation: the result of the action`,
  `Begin! Reminder to ALWAYS use the above format, and to use tools if appropriate.`,
].join(" ");

export const EXECUTOR_USER_PROMPT_MESSAGE_TEMPLATE = [
  `Previous steps: {previousSteps}`,
  ``,
  `Current objective: {currentStep}`,
  ``,
  `{agentScratchpad}`,
  ``,
  `You may extract and combine relevant data from your previous steps when responding to me.`,
].join(" ");

export const EXECUTOR_SUMMARY_PROMPT = [
  `Respond to this initial message as you normally would, in a polite, conversational manner: `,
  "",
  `"{originalPrompt}"`,
  "",
  `Here is some context that might be useful to you when responding. Feel free to draw on it (or not) in your final response:`,
  "",
  `{originalPlan}`,
].join(" ");

export const PLAN_REVIEW_PROMPT = [
  `I'd like you to review an ongoing "task-plan" and decide whether it is still fit for purpose or requires change.`,
  `The plan has been formulated to address the original request which was:`,
  "",
  "{originalPrompt}",
  "",
  `So far the following steps have been executed:`,
  "",
  `{previousSteps}`,
  "",
  `These are the remaining steps still to execute (and it is these which you need to review for suitability):`,
  "",
  `{remainingSteps}`,
  "",
  `So, are these remaining steps suitable and sufficient to answer the original request?`,
  `If your answer is yes, simply reply YES and nothing more.`,
  `If your answer is no, then please take careful note of the following instructions and respond accordingly:`,
  "",
  `${PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE}`,
].join(" ");
