# Know Your Docs

Chat with your documents using AI. Upload PDFs, text files, or notes and ask questions about them in plain English.

## What is this?

Ever wanted to quickly search through large documents or ask questions about your notes without reading everything? This app lets you upload documents and chat with them like you're talking to someone who's already read everything.

It works by breaking down your documents into smaller chunks, storing them in a vector database (Pinecone), and using Google's Gemini model to answer your questions based on what's relevant in your docs.

The key difference: if the answer isn't in your documents, it won't make something up. It'll just tell you there's no context about that in your docs. No hallucinations.

## Features

- Upload PDFs, DOCX, and TXT files
- Ask questions about your documents in natural language
- Get AI responses based only on your actual document content
- Won't hallucinate answers - if it's not in the doc, it'll say so
- Keep track of multiple chat sessions
- GitHub authentication

## Tech Stack

**Frontend**

- Next.js 15 with React
- TailwindCSS and shadcn/ui for styling
- TypeScript

**Backend**

- Express.js
- PostgreSQL with Drizzle ORM
- Pinecone for vector storage
- Google Gemini API

**Other**

- Better-Auth for GitHub OAuth
- Bun runtime
- Turborepo monorepo setup
- Deployed on AWS EC2

## Installation

You'll need:

- Bun installed
- A PostgreSQL database
- Pinecone API key
- Google Gemini API key
- GitHub OAuth app credentials

### Setup

Clone and install:

```bash
git clone https://github.com/ayush-0012/know-your-docs.git
cd know-your-docs
bun install
```

Set up environment variables in `apps/server/.env`:

```env
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL_DEV=http://localhost:3001
FRONTEND_URL_PROD=your_production_url
PINECONE_KEY=your_pinecone_api_key
GEMINI_API_KEY=your_gemini_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

And in `apps/web/.env`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Push the database schema:

```bash
bun db:push
```

Start the dev server:

```bash
bun dev
```

The app runs at `localhost:3001` and the API at `localhost:3000`.

## Project Structure

```
apps/
├── web/          # Next.js frontend
└── server/       # Express API
    ├── controllers/
    ├── routes/
    ├── services/
    └── db/
```

## Available Commands

- `bun dev` - Start everything
- `bun build` - Build for production
- `bun dev:web` - Just the frontend
- `bun dev:server` - Just the backend
- `bun db:push` - Update database schema
- `bun db:studio` - Open database GUI
- `bun db:studio` - Open database GUI

## Deployment

Currently deployed on AWS EC2. If you're deploying:

- Update the `BETTER_AUTH_URL` to your server URL
- Set `FRONTEND_URL_PROD` to your frontend URL
- Configure GitHub OAuth callbacks for production
- Use HTTPS for cookie security

## License

MIT

---

Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
