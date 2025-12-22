"use client";

import { useState } from "react";
import { logoutAction } from "@/app/actions";

interface AgentClientProps { username: string }

interface AgentEvent {
	content: {
		role?: string;
		parts: Array<{
			text?: string;
			functionResponse?: { name: string };
		}>;
	};
}

interface AgentResponse {
	events?: AgentEvent[];
	sessionId?: string;
	userId?: string;
	error?: string;
}

const AGENT_API_ROUTE = "/api/agent";

export default function AgentClient({ username }: AgentClientProps) {
	const [input, setInput] = useState("");
	const [response, setResponse] = useState<AgentResponse | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setResponse(null);

		try {
			const res = await fetch(AGENT_API_ROUTE, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: input }),
			});
			const data = await res.json();
			setResponse(data);
		} catch (err) {
			console.error(err);
			setResponse({ error: "Failed to fetch" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="p-8 space-y-4">
			<form action={logoutAction} className="flex justify-end">
				<button
					type="submit"
					className="text-sm opacity-80 hover:text-destructive underline"
				>
					Logout
				</button>
			</form>

			<h1 className="text-2xl font-semibold">Countries Agent</h1>
			<AgentSessionMeta response={response} username={username} />

			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask a question (example: Capital of France?)"
					className="border p-2 rounded grow text-background bg-foreground accent-primary"
				/>
				<button
					type="submit"
					disabled={loading}
					className="bg-primary text-primary-foreground py-2 px-6 rounded disabled:bg-muted"
				>
					{loading ? "Asking..." : "Ask"}
				</button>
			</form>

			{response && <AgentResponseUI response={response} />}
		</main>
	);
}

function AgentSessionMeta({ response, username }: {
	response: AgentResponse | null;
	username: string;
}) {
	return (
		<dl className="flex gap-6 text-sm font-mono">
			<div className="flex gap-2">
				<dt className="opacity-80">Username:</dt>
				<dd className="font-semibold">{username}</dd>
			</div>
			<div className="flex gap-2">
				<dt className="opacity-80">Session ID:</dt>
				<dd className="font-semibold">
					{response?.sessionId || "Not set"}
				</dd>
			</div>
		</dl>
	);
}

function AgentResponseUI({ response }: { response: AgentResponse | null }) {
	if (!response?.events) return null;

	let message = "";
	let tools: string[] = [];

	const toolResults = response.events
		.flatMap((event: AgentEvent) => event.content.parts)
		.filter((part) => part.functionResponse);

	const lastModelPart = response.events
		.filter((event: AgentEvent) => event.content.role === "model")
		.flatMap((event: AgentEvent) => event.content.parts)
		.reverse()
		.find((part) => part.text)?.text;

	if (!toolResults.length || !lastModelPart) return null;

	try {
		message = JSON.parse(lastModelPart).message;
		tools = toolResults.map((result) => (result.functionResponse?.name || ""));
	} catch (e) {
		console.error(e);
	}

	return (
		<>
			<div className="p-4 rounded-lg border border-current/20 space-y-2">
				<p className="text-lg">{message}</p>
				<p className="text-xs opacity-80">🛠️ {tools}</p>
			</div>

			<div className="border p-4 rounded bg-foreground text-background shadow-sm">
				<h2 className="font-semibold mb-2">Response Debug:</h2>
				<pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96">
					{JSON.stringify(response, null, 2)}
				</pre>
			</div>
		</>
	);
}
