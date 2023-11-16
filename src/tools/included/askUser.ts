import { z } from "zod";
import { StructuredTool } from "..";

const AskUserSchema = z.object({
  question: z.string().describe("The question you would like to ask the user"),
});

interface AskUserInput {
  func: (input: z.infer<typeof AskUserSchema>) => Promise<string>;
  schema: typeof AskUserSchema;
  name: string;
  description: string;
  returnDirect?: boolean;
}

class AskUser extends StructuredTool<typeof AskUserSchema> {
  constructor(fields: AskUserInput) {
    super(fields);
  }
}

// Instantiate the askUSer tool with predefined parameters
const askUser = new AskUser({
  name: "Ask User",
  description: "use this when you need to ask the user a question",
  schema: AskUserSchema,
  returnDirect: true,
  func: async (input) => {
    return input.question;
  },
});

// Export the askUser
export default askUser;
