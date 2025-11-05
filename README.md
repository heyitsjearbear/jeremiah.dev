# jeremiah.dev

Product-ready portfolio built with the Next.js App Router and Sanity Studio for content. The repo hosts both the public site (`app/`) and the embedded studio (`studio-jeremiah.dev/`).

## Prerequisites

- Node.js 20+
- Sanity project ID, dataset, and read token with access to the content.

## Environment Variables

Copy `.env.example` to `.env` (and `.env.local` if you prefer) and set the following:

```bash
cp .env.example .env
```

- `NEXT_PUBLIC_SANITY_PROJECT_ID` – Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` – dataset name (default `production`)
- `NEXT_PUBLIC_SANITY_API_VERSION` – API date, e.g. `2024-01-01`
- `SANITY_API_READ_TOKEN` – read token for preview/draft fetching
- `SANITY_WEBHOOK_SECRET` – shared secret for ISR revalidation route (future)
- `SANITY_PREVIEW_SECRET` – token used by `/api/preview`

## Local Development

Install dependencies at the repo root:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run Sanity Studio in a second terminal:

```bash
cd studio-jeremiah.dev
npm install
npm run dev
```

The site runs on [http://localhost:3000](http://localhost:3000) and the studio on [http://localhost:3333](http://localhost:3333).

## Draft Preview Workflow

- During local development (`npm run dev`), draft content is shown automatically—just edit in Studio and refresh `/blog` or the post slug to see updates. A banner indicates that drafts are visible.
- For hosted environments (Vercel preview/production), trigger preview mode with `/api/preview?secret=YOUR_SECRET&slug=your-post-slug` and exit via `/api/exit-preview?slug=...`.

## Project Structure

- `app/` – Next.js App Router pages and components
- `app/lib/sanity.ts` – Sanity fetch helpers and image utilities
- `app/blog/` – blog list and post detail routes
- `studio-jeremiah.dev/` – Sanity Studio configuration and schemas

Use `npm run lint` before committing to keep the codebase aligned with `eslint-config-next`.
