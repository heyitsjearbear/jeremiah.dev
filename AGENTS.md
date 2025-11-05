# Repository Guidelines

## Core Principles & Voice
Ship calm, modern React that feels product-ready, not student-demo. Favor clarity over cleverness, keep flows minimal, and draw from Vercel, Linear, and Raycast aesthetics. Prioritize static rendering with incremental fetches, avoid heavyweight dependencies, and keep the tone confident and execution-focused.

## UI Style System
Design dark-first (`bg-gray-800`) with white headlines, gray-300 secondary text, and blue accents (`rgb(96, 165, 250)`). Maintain crisp hierarchy and subtle motion: smooth hover transitions, fade/scale/slide entrances, pointer-ready states. Use monospace accents to echo the terminal intro and keep the vibe minimal yet cinematic.

## Project Structure & Modules
Routes, pages, and layouts live under `app/`, with shared pieces in `app/components` and shadcn-style primitives in `app/components/ui`. Blog index and detail live in `app/blog`. Keep Sanity helpers in `app/lib/sanity.ts`, site config in `app/config/site.ts`, utilities in `app/lib`, hooks in `app/hooks`, and assets in `public/`. Tailwind tokens sit in `app/globals.css`; use the `@/*` alias for cross-folder imports.

Sanity Studio lives entirely inside `studio-jeremiah.dev/`. Studio-only dependencies, scripts, and configuration should stay scoped to that folder so the frontend workspace remains clean; shared Sanity fetch/render helpers belong in the Next.js app.

## Build, Test, and Quality Commands
Use `npm run dev` for local development, `npm run build` for production bundles, and `npm run start` to verify the built output. `npm run lint` enforces `eslint-config-next` Core Web Vitals rules and should run before every PR.

## Coding Conventions
Default to functional server components, marking client components only when interactivity or browser APIs demand it (`"use client"`). Keep TypeScript strict; no `any` without justification. Compose styles with Tailwind utilities, extracting repeated patterns into dedicated components. Prefer PascalCase filenames, camelCase variables, and the `cn` helper for conditional classes. Inline RGB values when tailoring hover borders or motion cues.

## Sanity Content Workflow
Sanity Studio owns blog authoring. Schemas (`post`, `blockContent`) live in the Studio project, while `lib/sanity.ts` handles GROQ helpers (`getPublishedPosts`, `getPostSlugs`, `getPostBySlug`). Render with `@portabletext/react` and revalidate via `/api/sanity-webhook` so publishes refresh `/blog` and the matching post immediately.

## Data, Config, and Motion
Core data flows: Sanity for blog content, GitHub for activity, YouTube for videos, plus static Resume/About/Projects copy. No database—lean on caching and lightweight fetches. Keep `.env.example` updated with Sanity project ID, dataset, read token, and webhook secret. Surface new motion or content integrations in PRs.

## Collaboration Practices
Follow the repository’s Conventional Commit style (`docs: …`, `refactor: …`, `feat: …`). Keep PRs scoped, describe intent, list commands executed, and attach UI screenshots or Loom clips when visuals shift. Never auto-commit on behalf of the maintainer—surface changes for review and let the owner merge when ready.
Codex agents must not stage or commit changes; the maintainer will review and handle all git operations manually.
