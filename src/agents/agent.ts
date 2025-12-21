import { FunctionTool, LlmAgent } from "@google/adk";
import { z } from "zod";

const ROOT_AGENT_NAME = "countries_agent";
const ROOT_AGENT_MODEL = "gemini-2.5-flash";
const ROOT_AGENT_DESCRIPTION =
	"Agent to answer questions about the capital or flag of a country.";
const ROOT_AGENT_INSTRUCTION = "You are a simple geography-themed assistant. You reply to user's query about the capital or flag of a country. If user asks about anything else, refuse to answer and say why.";

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
		return {
			status: "success",
			result: `TODO return capital of ${country}`,
		};
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
		return {
			status: "success",
			result: `TODO return flag of ${country}`,
		};
	},
});

export const rootAgent = new LlmAgent({
	name: ROOT_AGENT_NAME,
	model: ROOT_AGENT_MODEL,
	description: ROOT_AGENT_DESCRIPTION,
	instruction: ROOT_AGENT_INSTRUCTION,
	tools: [getCapital, getFlag]
});
