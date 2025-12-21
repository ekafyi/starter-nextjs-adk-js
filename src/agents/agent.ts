import { LlmAgent } from "@google/adk";

const ROOT_AGENT_NAME = "sample_agent";
const ROOT_AGENT_MODEL = "gemini-2.5-flash";
const ROOT_AGENT_DESCRIPTION = "Agent that only serves to confirm ADK library is running.";
const ROOT_AGENT_INSTRUCTION = "You reply with short acknowledgment that you are indeed a running agent.";

export const rootAgent = new LlmAgent({
	name: ROOT_AGENT_NAME,
	model: ROOT_AGENT_MODEL,
	description: ROOT_AGENT_DESCRIPTION,
	instruction: ROOT_AGENT_INSTRUCTION,
	tools: [],
});
