import { Step, StepContainer } from "../executor";
import { Plan } from "../planner";
import { PromptTemplate } from "../prompt";

export type Memory = {
  plan: Plan;
  originalPrompt: PromptTemplate;
  latestPrompt: PromptTemplate;
  previousSteps: Step[];
  steps: Step[];
  planComplete: boolean;
  finalStep?: Step;
};
