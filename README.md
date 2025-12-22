# Next.js + ADK for TypeScript starter site

A minimal starter for building AI agentic web application with [Google's ADK for TypeScript](https://github.com/google/adk-js) and [Next.js](https://github.com/vercel/next.js).

- **Unopinionated boilerplate.** Based off standard `create-next-app` install (App Router + TypeScript + Tailwind + Biome). Customise according to your preferences.
- **All in TypeScript**. Create complex agents fully in TS; collocate with your Next.js app. No need for separate backend services.

**Agent Development Kit (ADK) for TypeScript:**
> an open-source, code-first TypeScript toolkit for building, evaluating, and deploying sophisticated AI agents with flexibility and control

Try now:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ekafyi/starter-nextjs-adk-js/tree/main)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/ekafyi/starter-nextjs-adk-js/tree/main)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/ekafyi/starter-nextjs-adk-js?devcontainer_path=.devcontainer/blog/devcontainer.json)

## Getting Started

```sh
# Clone or "Use this template" from Github web
git clone https://github.com/ekafyi/starter-nextjs-adk-js.git my-app

# Copy env file and fill `GEMINI_API_KEY`
mv .env.example .env

# Run Next.js dev server (default port 3000)
npm run dev

# Run ADK dev server (default port 8000)
npm run adk-web-ui
```

Get API key on AI Studio: https://aistudio.google.com/app/apikey (free tier available).

Consult the docs to [use other models](https://google.github.io/adk-docs/agents/models/) on Vertex AI and, in the future, non-Gemini models  (currently unsupported in TypeScript).

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fekafyi%2Fstarter-nextjs-adk-js&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20key%20(free%20tier%20available)&envLink=https%3A%2F%2Faistudio.google.com%2Fapikey)

Deploy to Vercel or [other platforms](https://nextjs.org/docs/app/building-your-application/deploying).

## Project Structure

```sh
src
├── agents/          # ADK Agent definitions
├── app/
│   ├── agent/       # Frontend interface
│   └── api/
│       └── agent/   # API route
├── lib/
│   ├── data/        # Mock external data
│   ├── auth.ts      # Mock user auth
│   └── countries.ts # Mock external services call
# Everything else is regular app router Next.js.
```

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [ADK Docs](https://github.com/googleapis/google-cloud-node)
