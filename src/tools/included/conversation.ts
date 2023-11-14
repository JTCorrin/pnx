import { z } from "zod";
import { StructuredTool } from "..";

const ConversationSchema = z.object({
  response: z.string().describe("Your response to the user"),
});

interface ConversationInput {
  func: (input: z.infer<typeof ConversationSchema>) => Promise<string>;
  schema: typeof ConversationSchema;
  name: string;
  description: string;
  returnDirect?: boolean;
}

class Conversation extends StructuredTool<typeof ConversationSchema> {
  constructor(fields: ConversationInput) {
    super(fields);
  }
}

// Instantiate the askUSer tool with predefined parameters
const conversation = new Conversation({
  name: "Conversation",
  description:
    "use this when you the user strikes up a conversation e.g. they ask 'How are you?'. Useful if none of the other tools are appropriate. You can respond however you deem appropriate.",
  schema: ConversationSchema,
  returnDirect: true,
  func: async (input) => {
    return input.response;
  },
});

// Export the Conversation
export default conversation;
