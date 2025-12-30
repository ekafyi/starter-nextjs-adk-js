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
- Drizzle

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

4. Setup local database (default to `local.db`)

   ```sh
   npm run db:push
   npm run db:seed
   ```

5. Run Next.js dev server (default on `localhost:3000`)

   ```sh
   npm run dev
   ```

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
├── db/              # DB schema and client
├── lib/
│   ├── data/        # Mock external data
│   ├── auth.ts      # Mock user auth
│   └── countries.ts # Mock external services call

# Everything else is standard app router Next.js.
```

## Usage

<details>
  <summary><h3>Defining Agents</h3></summary>
  <div>

📄 [src/agents/agent.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/agents/agent.ts)

```typescript
export const rootAgent = new LlmAgent({
  name: "countries_agent",
  model: "gemini-2.5-flash",
  description: "Agent to answer questions about ...",
  // ... etc
});
```

  </div>
</details>

<details>
  <summary><h3>Defining Tools</h3></summary>
  <div>

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

  </div>
</details>

<details>
  <summary><h3>Passing Agent to Runner</h3></summary>
  <div>

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

  </div>
</details>

<details>
  <summary><h3>User Auth</h3></summary>
  <div>

Bring your own auth.

1. Replace the placeholder (store and check for `"username"` cookie) with your own.
   - [src/lib/auth.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/lib/auth.ts)
2. Replace imports from lib/auth.
   - [src/app/actions.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/actions.ts)
   - [src/app/page.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/page.ts)
   - [src/app/agent/page.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/agent/page.ts)
   - [src/app/api/agent/route.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/api/agent/route.ts)

  </div>
</details>

<details>
  <summary><h3>Persistence</h3></summary>
  <div>

Currently ADK TypeScript has [no built-in support for persistence](https://github.com/google/adk-js/discussions/27#discussioncomment-15332818); everything runs in-memory.

Here I use Drizzle and local SQLite file to persist user sessions and events manually.

- DB client and schema
   - [src/db](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/db)
- Implementation
   - [src/lib/auth.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/lib/auth.ts)
   - [src/app/api/agent/route.ts](https://github.com/ekafyi/starter-nextjs-adk-js/blob/main/src/app/api/agent/route.ts)

Local vs Remote DB:

- Local file works out of the box for running locally.
  - (optional) Define DB file name through the `DB_FILE_NAME` env variable (default to `local.db`).
  - `npm run db:push` creates the DB file and apply the schema.
  - (optional) `npm run db:seed` inserts sample user to the DB.
- If deploying this to a serverless hosting service, use a compatible remote database like [Turso](https://turso.tech). Local file will not persist across serverless function invocations.
  - Change the `DB_FILE_NAME` env variable to a `libsql://` URL for production.
  - Make sure to seed the remote DB by running `db:seed`.

  </div>
</details>

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [ADK Docs](https://github.com/googleapis/google-cloud-node)

## License

MIT
