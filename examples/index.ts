import { PromptTemplate } from '../src/prompt'
import { Agent } from '../src'


const exampleAgent = async () => {

    const agent = Agent.getDefault();
    const prompt = PromptTemplate.fromString(
      "I need you to {firstTask} and then move on to {secondTask}",
      {
        firstTask: "draft an email welcoming a new colleague to the team",
        secondTask: "tell me what 4 * 4 is",
      },
    );

    console.log(prompt);
    agent.run(prompt);
}

exampleAgent()