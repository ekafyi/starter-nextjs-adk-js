import { redirect } from "next/navigation";
import { getUsernameFromCookie } from "@/lib/auth";
import AgentClient from "./AgentClient";

export default async function AgentPage() {
	const username = await getUsernameFromCookie();
	if (!username) {
		redirect("/?error=not_logged_in");
	}
	// Return separate component to run client-side.
	return <AgentClient username={username} />;
}
