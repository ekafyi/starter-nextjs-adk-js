import { InMemoryRunner } from "@google/adk";
import { createUserContent } from "@google/genai";
import { NextResponse } from "next/server";
import { rootAgent } from "@/agents/agent";
import { getUsernameFromCookie } from "@/lib/auth";

const APP_NAME = "sample_app";

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

		const userId = await getUsernameFromCookie();
		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		// ⚠️ [FOR DB IMPLEMENTATION] Read DB to get user's active session ID.
		// Example: `let sessionId = await db.getSessionId(userId);`
		let sessionId: string | undefined;

		// If no session ID found in DB, generate a new one and save it.
		if (!sessionId) {
			// Session ID does not have to be unique across users.
			// You can generate random id (e.g.) `randomUUID` from `node:crypto` 
			// or use any other way.
			sessionId = "session_1";

			// ⚠️ [FOR DB IMPLEMENTATION] Write to DB to store session ID.
			// Example: `await db.saveSessionId(userId, sessionId);`
		}

		const existingSession = await runner.sessionService.getSession({
			appName: APP_NAME,
			userId,
			sessionId,
		});

		if (!existingSession) {
			await runner.sessionService.createSession({
				appName: APP_NAME,
				userId,
				sessionId,
			});
		}

		// runAsync returns an AsyncGenerator<Event>
		const iterator = runner.runAsync({
			userId,
			sessionId,
			newMessage: createUserContent(message) as Parameters<
				typeof runner.runAsync
			>[0]["newMessage"],
		});

		const events = [];
		for await (const event of iterator) {
			events.push(event);
		}

		return NextResponse.json({ events, userId, sessionId });
	} catch (error) {
		console.error("Agent execution error:", error);
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
