import { redirect } from "next/navigation";
import { getUsernameFromCookie } from "@/lib/auth";

export default async function AgentPage() {
	const username = await getUsernameFromCookie();

	if (!username) {
		redirect("/?error=not_logged_in");
	}

	return <>logged in as {username}</>;
}
