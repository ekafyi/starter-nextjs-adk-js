import { InMemoryRunner } from "@google/adk";
import { createUserContent } from "@google/genai";
import { NextResponse } from "next/server";
import { rootAgent } from "@/agents/agent";

const APP_NAME = "sample_app";
const USER_ID = "johndoe";
const SESSION_ID = "sample_session";

// Define runner outside the handler to persist state across requests.
const runner = new InMemoryRunner({ agent: rootAgent, appName: APP_NAME });

/**
 * Ping on local dev server:
 * 
 * ```sh
curl -X POST http://localhost:3000/api/agent \
	-H "Content-Type: application/json" \
	-d '{"message": "Hello agent"}'
 * ```
 */
export async function POST(req: Request) {
	try {
		const { message } = await req.json();
		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 },
			);
		}

		const existingSession = await runner.sessionService.getSession({
			appName: APP_NAME,
			userId: USER_ID,
			sessionId: SESSION_ID,
		});

		if (!existingSession) {
			await runner.sessionService.createSession({
				appName: APP_NAME,
				userId: USER_ID,
				sessionId: SESSION_ID,
			});
		}

		// runAsync returns an AsyncGenerator<Event>
		const iterator = runner.runAsync({
			userId: USER_ID,
			sessionId: SESSION_ID,
			newMessage: createUserContent(message) as Parameters<
				typeof runner.runAsync
			>[0]["newMessage"],
		});

		const events = [];
		for await (const event of iterator) {
			events.push(event);
		}

		return NextResponse.json({
			events,
			userId: USER_ID,
			sessionId: SESSION_ID,
		});
	} catch (error) {
		console.error("Agent execution error:", error);
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
