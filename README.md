# Next.js + ADK TypeScript starter site

A minimal starter for building agentic AI web applications with Google’s [ADK framework for TypeScript](https://github.com/google/adk-js) and [Next.js](https://github.com/vercel/next.js).

- Define and run your agents **all in TypeScript**!
- **Unopinionated boilerplate.** Based off standard `create-next-app`, customise according to your preferences.
- **Collocation.** No separate backend service needed if you're building a Next.js app.
- **Flexible model choice**. Use Gemini models or other models with an extensible wrapper class API.

**Agent Development Kit (ADK) for TypeScript:**
> an open-source, code-first TypeScript toolkit for building, evaluating, and deploying sophisticated AI agents with flexibility and control

Try now:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ekafyi/starter-nextjs-adk-js/tree/main)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/ekafyi/starter-nextjs-adk-js/tree/main)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/ekafyi/starter-nextjs-adk-js?devcontainer_path=.devcontainer/blog/devcontainer.json)

## Tech Stack

- ADK TypeScript
- Google GenAI SDK
- Next.js
- Tailwind CSS
- Biome

## Getting Started

### Prerequisites

- Node.js 20.9+
- Package manager (npm, yarn, pnpm, bun)
  - Examples here use npm, replace with your own.
- Gemini or Vertex AI API key
  - Get a free API key: https://aistudio.google.com/app/apikey.

### Installation

1. Clone repo (or "Use this template" from GH web)

   ```sh
   git clone https://github.com/ekafyi/starter-nextjs-adk-js.git my-app
   cd my-app
   ```

2. Install packages

   ```sh
   npm install
   ```

3. Copy env file and fill `GEMINI_API_KEY` with your credentials

   ```sh
   cp .env.example .env
   nano .env
   ```

4. Run Next.js dev server (default on `localhost:3000`)

   ```sh
   npm run dev
   ```

### Deploying

Deploy to Vercel or [other platforms](https://nextjs.org/docs/app/building-your-application/deploying) of your choice.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fekafyi%2Fstarter-nextjs-adk-js&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20key%20(free%20tier%20available)&envLink=https%3A%2F%2Faistudio.google.com%2Fapikey)

## ADK Web UI

[ADK Web](https://github.com/google/adk-web): _"the built-in developer UI that is integrated with Agent Development Kit for easier agent development and debugging."_

Run ADK dev server (default on `localhost:8000`):

```sh
npx adk web src/agents
# or:
npm run adk-web-ui
```
⚠️ Not meant for production, for [dev and debug only](https://google.github.io/adk-docs/get-started/typescript/#run-with-web-interface).

<img width="1125" alt="adk web ui showing user and assistant conversation and tool usage" src="https://github.com/user-attachments/assets/d197dcfa-a722-4b78-88b4-456c6eca45a3" />

## Project Structure

```sh
src
├── agents/          # Agent definitions
├── app/
│   ├── agent/       # Frontend route `/agent`
│   └── api/
│       └── agent/   # API route `/api/agent`
├── lib/
│   ├── data/        # Mock external data
│   ├── auth.ts      # Mock user auth
│   └── countries.ts # Mock external services call

# Everything else is standard app router Next.js.
```

## Usage

### Defining Agents

📄 [src/agents/agent.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/agents/agent.ts)

```typescript
export const rootAgent = new LlmAgent({
  name: "countries_agent",
  model: "gemini-2.5-flash",
  description: "Agent to answer questions about ...",
  // ... etc
});
```

### Defining Tools

📄 [src/agents/agent.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/agents/agent.ts)

```typescript
const getCapital = new FunctionTool({
  name: "get_country_capital",
  description: "Retrieves the capital city for a country.",
  parameters: z.object({ /* ... zod schema ... */ }),
  execute: async ({ country }) => {
    return await getMockCapital(country);
  },
});

const getFlag = new FunctionTool({
  name: "get_country_flag",
  // ... etc
});

export const rootAgent = new LlmAgent({
  // ... 
  tools: [getCapital, getFlag],
});
```

Use optional `ToolContext` to read/write session-scoped state.

```diff
- execute: async ({ country }) => {
+ execute: async ({ country }, toolContext?: ToolContext) => {
+  toolContext?.state.set("last_mentioned_country", country);
   // ...
},
```


### Passing Agent to Runner

📄 [src/app/api/agent/route.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/api/agent/route.ts)

```typescript
// Initialize runner with the agent
const runner = new InMemoryRunner({
  agent: rootAgent,
  appName: "sample_app"
});

// ... inside POST route handler ...
const iterator = runner.runAsync({
  userId,
  sessionId,
  newMessage: createUserContent(message),
});
```

### User Auth

Bring your own auth.

1. Replace the placeholder (store and check for `"username"` cookie) with your own.
   - [src/lib/auth.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/lib/auth.ts)
2. Replace imports from lib/auth.
   - [src/app/actions.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/actions.ts)
   - [src/app/page.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/page.ts)
   - [src/app/agent/page.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/agent/page.ts)
   - [src/app/api/agent/route.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/api/agent/route.ts)

### Session Data Persistence

Persistent storage built-in support is [planned for early 2026](https://github.com/google/adk-js/discussions/27#discussioncomment-15332818).

This project uses placeholder to replace with your own DB functionalities.

📄 [src/app/api/agent/route.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/api/agent/route.ts)

```ts
// Replace with your own code:
// - `getUsernameFromCookie`
// - `generateNewId`,
// - `db.getSessionId`, `db.saveSessionId`

const userId = await getUsernameFromCookie();

let sessionId = await db.getSessionId(userId); 
if (!sessionId) {
  sessionId = generateNewId();
  await db.saveSessionId(userId, sessionId);
}

const existingSession = await runner.sessionService.getSession({ ... });
if (!existingSession) {
  await runner.sessionService.createSession({ ... });
}
```

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [ADK Docs](https://github.com/googleapis/google-cloud-node)

## License

MIT
