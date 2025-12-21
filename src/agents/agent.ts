import { FunctionTool, LlmAgent } from "@google/adk";
import { z } from "zod";
import { getMockCapital, getMockFlag } from "@/lib/countries";

const ROOT_AGENT_NAME = "countries_agent";
const ROOT_AGENT_MODEL = "gemini-2.5-flash";
const ROOT_AGENT_DESCRIPTION =
	"Agent to answer questions about the capital or flag of a country.";
const ROOT_AGENT_INSTRUCTION = `You are a helpful agent that helps users get information about countries.
Follow this protocol:

1. **IDENTIFY THE COUNTRY**:
   - Determine which country the user is asking about.
	 - If user is not asking about countries or asking out-of-bond topics, refuse to answer.

2. **OUTPUT FORMAT**:
   - You MUST ALWAYS respond with ONLY a valid JSON object, no additional text before or after.
   - The JSON must have these fields:
     * "message" (string, required): The main response message to the user (can be the result from tools)
     * "status" (string, required): One of "success", "error", or "denied"
     * "data" (object, optional): Structured data like {"country": "...", "capital": "...", "flag": "..."}
   - Example success response: {"message": "The capital of France is Paris.", "status": "success", "data": {"country": "France", "capital": "Paris"}}
   - Example denied response: {"message": "I can only discuss countries.", "status": "denied"}
   - DO NOT include markdown code blocks, explanations, or any text outside the JSON object.
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
	execute: async ({ country }) => {
		try {
			const capital = await getMockCapital(country);
			if (capital) {
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
	execute: async ({ country }) => {
		try {
			const flag = await getMockFlag(country);
			if (flag) {
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

export const rootAgent = new LlmAgent({
	name: ROOT_AGENT_NAME,
	model: ROOT_AGENT_MODEL,
	description: ROOT_AGENT_DESCRIPTION,
	instruction: ROOT_AGENT_INSTRUCTION,
	tools: [getCapital, getFlag]
});
