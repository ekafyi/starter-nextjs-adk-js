import { AgentTool, FunctionTool, LlmAgent, type ToolContext } from "@google/adk";
import { z } from "zod";
import { getMockCapital, getMockFlag } from "@/lib/countries";

const ROOT_AGENT_NAME = "countries_agent";
const ROOT_AGENT_MODEL = "gemini-2.5-flash";
const ROOT_AGENT_DESCRIPTION =
	"Agent to answer questions about the capital or flag of a country.";
const ROOT_AGENT_INSTRUCTION = `You are a helpful agent that helps users get information about countries.
Follow this protocol:

1. Identify the country:
   - Determine which country the user is asking about. Look into 'last_mentioned_country' state if necessary.
	 - If user is greeting or not asking a clear question (e.g. "hi", "hello"), introduce yourself and what you can do.
   - If user is not asking about countries or asking out-of-bond topics, refuse to answer and suggest a question you CAN answer.

2. Decide how to answer the question based on criteria below:
   - If user specifically asks for capital and/or flag, call the right tool to answer.
   - If general question, check user's queried country against the 'last_mentioned_country':
      - (A) IF the country IS NOT in the 'last_mentioned_country' state:
         - If the question is very general (e.g. "tell me about France"), call 'get_country_capital' and answer with its capital.
         - If the question is something else (e.g. "what continent is France in?"), refuse to answer.
      - (B) IF the country IS in the 'last_mentioned_country' state:
         - Call 'country_general_knowledge_agent' to answer.
         - IMPORTANT: Make sure this country matches 'last_mentioned_country' state.

3. Output format:
   - ALWAYS respond with ONLY a valid JSON object. No additional content (text, image, code block) before or after.
   - The JSON must have these fields:
      * "message" (string, required): The main response message to the user (can be the result from tools)
      * "status" (string, required): One of "success", "error", or "denied"
      * "data" (object, optional): Structured data like {"country": "...", "capital": "...", "flag": "..."}
   - Example responses:
      - Success: {"message": "The capital of France is Paris.", "status": "success", "data": {"country": "France", "capital": "Paris"}}
      - Denied: {"message": "I cannot answer that. What about '...' (give example of a eligible question)", "status": "denied"}
`;

/**
 * Tool (1) to retrieve the capital city for a given country.
 */
const getCapital = new FunctionTool({
	name: "get_country_capital",
	description: "Retrieves the capital city for a given country.",
	parameters: z.object({
		country: z
			.string()
			.describe(
				"The name of the country for which to retrieve the capital city.",
			),
	}),
	execute: async ({ country }, toolContext?: ToolContext) => {
		try {
			const capital = await getMockCapital(country);
			if (capital) {
				// [OPTIONAL SESSION STATE] Update the last mentioned country in session state.
				toolContext?.state.set("last_mentioned_country", country.toLowerCase());

				return {
					status: "success",
					result: capital,
				};
			} else {
				return {
					status: "error",
					error_message: `Sorry, I couldn't find the capital for ${country}.`,
				};
			}
		} catch (error) {
			return {
				status: "error",
				error_message: `Failed to retrieve data: ${(error as Error).message}`,
			};
		}
	},
});

/**
 * Tool (2) to retrieve the flag emoji for a given country.
 */
const getFlag = new FunctionTool({
	name: "get_country_flag",
	description: "Retrieves the flag emoji for a given country.",
	parameters: z.object({
		country: z
			.string()
			.describe(
				"The name of the country for which to retrieve the flag emoji.",
			),
	}),
	execute: async ({ country }, toolContext?: ToolContext) => {
		try {
			const flag = await getMockFlag(country);
			if (flag) {
				// [OPTIONAL SESSION STATE] Update the last mentioned country in session state.
				toolContext?.state.set("last_mentioned_country", country.toLowerCase());

				return {
					status: "success",
					result: flag,
				};
			} else {
				return {
					status: "error",
					error_message: `Sorry, I couldn't find the flag for ${country}.`,
				};
			}
		} catch (error) {
			return {
				status: "error",
				error_message: `Failed to retrieve data: ${(error as Error).message}`,
			};
		}
	},
});

/**
 * Tool (3) / Agent-as-a-Tool to provide general info about the last-mentioned country.
 * @see https://google.github.io/adk-docs/tools-custom/function-tools/#agent-tool
 */
const countryGeneralKnowledgeTool = new AgentTool({
	agent: new LlmAgent({
		name: "country_general_knowledge_agent",
		model: "gemini-2.5-flash",
		instruction: `You are a Geography educator on primary to secondary education level.
You answer questions about FUNDAMENTAL PHYSICAL AND GEOGRAPHIC FACTS (location, terrain, climate, natural features).
Refuse questions about temporal, political, social, cultural, or changeable aspects (current events, contemporary figures, governance).
Keep answers brief (1-2 sentences).`,
	}),
});

export const rootAgent = new LlmAgent({
	name: ROOT_AGENT_NAME,
	model: ROOT_AGENT_MODEL,
	description: ROOT_AGENT_DESCRIPTION,
	instruction: ROOT_AGENT_INSTRUCTION,
	tools: [getCapital, getFlag, countryGeneralKnowledgeTool]
});
