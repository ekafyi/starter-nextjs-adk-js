import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getUsernameFromCookie } from "@/lib/auth";
import AgentClient from "./AgentClient";

export default async function AgentPage() {
	const username = await getUsernameFromCookie();
	if (!username) {
		redirect("/?error=not_logged_in");
	}

	// Get the user's existing session to enable session resumption
	const [userSession] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.userId, username))
		.limit(1);

	const initialSessionId = userSession?.id || null;

	// Return separate component to run client-side.
	return (
		<AgentClient username={username} initialSessionId={initialSessionId} />
	);
}
