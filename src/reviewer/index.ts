import { LLM, Step } from "../base";
import { BasePlanReviewer } from "../base/planReviewer";
import { ChainInputs } from "../chain";
import { OpenAIMessage } from "../llm";
import { PromptTemplate } from "../prompt";
import OpenAI from "openai";

// Perhaps the response to the user question should just be concatenated into the next plan item?
export class DefaultPlanReviewer extends BasePlanReviewer<
  OpenAIMessage,
  OpenAI.Chat.Completions.ChatCompletion
> {
    
    constructor(inputs: ChainInputs<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>) {
        super(inputs)
    }

    /**
     * This function will take in a plan and, if it deems necessary, return a series
     * of new steps to replace the remaining steps of the original plan. If it deems
     * no change is necessary, it will simply return the original remaining steps
     * @param previousSteps plan steps already complete
     * @param remainingSteps plan steps yet to be completed
     * @param reviewPrompt prompt template for the plan reviewer
     */
    async reviewPlan(reviewPrompt: PromptTemplate): Promise<Step[]> {
        const response = await this.llm.call([
            {
                role: "user",
                content: reviewPrompt.format(),
            }
        ])

        return await this.outputParser.parse(response.choices[0].message.content as string, JSON.parse(reviewPrompt.getInputs()["remainingSteps"]))
    }


    async integrateResponse(response: string, remainingSteps: Step[]): Promise<Step[]> {
        // place the response into the next step
        remainingSteps[0].action.text = `
        This is the response to your previous question to the user ${ response }. 
        Here is the current step in the plan: ${ remainingSteps[0].action.text}
        `

        return remainingSteps
    }
}