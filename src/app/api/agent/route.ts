/** biome-ignore-all lint/suspicious/noExplicitAny: temporary workaround DB */
import "@/lib/logger";
import { randomUUID } from "node:crypto";
import { InMemoryRunner } from "@google/adk";
import { createUserContent } from "@google/genai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { rootAgent } from "@/agents/agent";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getUsernameFromCookie } from "@/lib/auth";

const APP_NAME = "sample_app";

// Define runner outside the handler to persist state across requests.
const runner = new InMemoryRunner({ agent: rootAgent, appName: APP_NAME });

function cleanEvents(events: any[]) {
	return events
		.filter((event) => {
			// Filter out empty marker events (where content.parts is empty)
			if (
				event.content &&
				Array.isArray(event.content.parts) &&
				event.content.parts.length === 0
			) {
				return false;
			}
			return true;
		})
		.map((event) => {
			// biome-ignore lint/correctness/noUnusedVariables: unused to remove
			const { actions, usageMetadata, ...rest } = event;
			return rest;
		});
}

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

		const [userSession] = await db
			.select()
			.from(sessions)
			.where(eq(sessions.userId, userId))
			.limit(1);

		let sessionId = userSession?.id;
		let previousEvents = [];

		if (userSession) {
			try {
				previousEvents = JSON.parse(userSession.events);
			} catch (e) {
				console.error("Failed to parse session events", e);
			}
		} else {
			sessionId = randomUUID();
		}

		let session = await runner.sessionService.getSession({
			appName: APP_NAME,
			userId,
			sessionId,
		});

		if (!session) {
			session = await runner.sessionService.createSession({
				appName: APP_NAME,
				userId,
				sessionId,
			});
			if (previousEvents && previousEvents.length > 0) {
				const service = runner.sessionService as any;
				if (service.sessions?.[APP_NAME]?.[userId]?.[sessionId]) {
					service.sessions[APP_NAME][userId][sessionId].events = previousEvents;
				}
			}
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

		const updatedSession = await runner.sessionService.getSession({
			appName: APP_NAME,
			userId,
			sessionId,
		});

		if (updatedSession) {
			const cleanedEvents = cleanEvents(updatedSession.events);
			await db
				.insert(sessions)
				.values({
					id: sessionId,
					userId,
					events: JSON.stringify(cleanedEvents),
				})
				.onConflictDoUpdate({
					target: sessions.id,
					set: {
						events: JSON.stringify(cleanedEvents),
					},
				});
		}

		return NextResponse.json({ events, userId, sessionId });
	} catch (error) {
		console.error("Agent execution error:", error);
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
