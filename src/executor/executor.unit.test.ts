// import { DefaultExecutor } from './executor';
// import { ExecutorOutputParser } from './outputParser';
// import { PromptTemplate } from '../prompt';
// import { DefaultLLM, OpenAIMessage } from '../llm';
// import {  Step, Plan, StepResult } from '../base'; // Replace 'someModule' with the actual module path
// import { DefaultPlanReviewer } from '../reviewer';
// //import OpenAI from 'openai';


// jest.mock("../llm", () => {
//     return {
//       DefaultLLM: jest.fn().mockImplementation(() => {
//         return {
//           call: jest
//             .fn()
//             .mockResolvedValue("1. Step one\n2. Step two<END_OF_PLAN>"),
//         };
//       }),
//     };
//   });

// // Provide a mock implementation for the PlanOutputParser class
// jest.mock("./outputParser", () => {
//     return {
//       ExecutorOutputParser: jest.fn().mockImplementation(() => {
//         return {
//           parse: jest.fn().mockResolvedValue({
//             steps: [{ action: "Some action", actionInput: "Some action input" }],
//           }),
//         };
//       }),
//     };
//   });

// jest.mock("../reviewer", () => {
//     return {
//       DefaultPlanReviewer: jest.fn().mockImplementation(() => {
//         return {
//             reviewPlan: jest
//             .fn()
//             .mockResolvedValue("1. Step one\n2. Step two<END_OF_PLAN>"),
//             integrateResponse: jest
//             .fn()
//             .mockResolvedValue("1. Step one\n2. Step two<END_OF_PLAN>"),
//         };
//       }),
//     };
//   });

// // Setup common properties for tests
// const mockLLM = new DefaultLLM();
// const mockOutputParser = new ExecutorOutputParser();


// describe('DefaultExecutor', () => {
//   let executor: DefaultExecutor;

//   beforeEach(() => {
//     // Reset mocks before each test
//     jest.clearAllMocks();

//     // Create a new instance of DefaultExecutor before each test
//     executor = new DefaultExecutor({
//       llm: mockLLM,
//       message: new PromptTemplate('Template string'),
//       outputParser: mockOutputParser as unknown as ExecutorOutputParser, // Cast as unknown first to satisfy the mock type
//       //planReviewer: mockPlanReviewer as unknown as BasePlanReviewer<OpenAIMessage, OpenAI.Chat.Completions.ChatCompletion>,
//       tools: [], // Add tools as necessary
//       callbacks: [], // Add callbacks as necessary
//     });
//   });

//   describe('takeStep', () => {
//     it('should call LLM and parse the response', async () => {
//       const step: Step = { action: { text: "Do something" } };
//       const mockResponse = { choices: [{ message: { content: "Done something" } }] };

//       // Setup LLM call mock
//       mockLLM.call(mockResponse);

//       // Setup outputParser parse mock
//       const expectedStepResult: StepResult = { /* ... */ }; // Replace with actual expected result
//       mockOutputParser.parse.mockResolvedValue(expectedStepResult);

//       // Perform the step
//       const result = await executor.takeStep(step);

//       // Verify LLM was called correctly
//       expect(mockLLM.call).toHaveBeenCalledWith(expect.anything()); // Add specific expectations

//       // Verify the output parser was called with the LLM response
//       expect(mockOutputParser.parse).toHaveBeenCalledWith("Done something");

//       // Verify the result matches the expected step result
//       expect(result).toBe(expectedStepResult);
//     });
//   });

//   // Add more tests for other methods such as execute, takeFinalStep, etc.
// });
