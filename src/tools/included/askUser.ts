import { z } from "zod";
import { StructuredTool } from "../structuredTool";

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
      func: async (input) => {
        return input.question;
      },
    });
  }
}

const askUser = new AskUser();

// Export the askUser
export default askUser;
