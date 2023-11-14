import { StructuredTool } from "..";
import askUser from "./askUser";
import calculator from "./calculator";
import conversation from "./conversation";

export default [calculator, askUser, conversation] as StructuredTool[];
