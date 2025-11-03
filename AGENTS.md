# Repository Guidelines

## Core Principles & Voice
Ship calm, modern React that feels product-ready, not student-demo. Favor clarity over cleverness, keep flows minimal, and draw from Vercel, Linear, and Raycast aesthetics. Prioritize static rendering with incremental fetches, avoid heavyweight dependencies, and keep the tone confident and execution-focused.

## UI Style System
Design dark-first (`bg-gray-800`) with white headlines, gray-300 secondary text, and blue accents (`rgb(96, 165, 250)`). Maintain breathing room, clear hierarchy, and subtle motion: smooth hover transitions, fade/scale/slide entrances, and pointer-ready interactive states. Use monospace accents to support the terminal intro and keep the overall vibe minimal yet cinematic.

## Project Structure & Modules
The Next.js App Router powers everything under `app/`. Pages and layouts live alongside route segments, shared components reside in `app/components`, and primitives follow shadcn patterns within `app/components/ui`. Configuration objects live in `app/config/site.ts`; update those sources instead of hardcoding values. Helpers belong in `app/lib`, hooks in `app/hooks`, and public assets in `public/`. Tailwind globals and design tokens are centralized in `app/globals.css`, with the `@/*` alias available for cross-directory imports.

## Build, Test, and Quality Commands
Use `npm run dev` for local development, `npm run build` for production bundles, and `npm run start` to verify the built output. `npm run lint` enforces `eslint-config-next` Core Web Vitals rules and should run before every PR. Manual smoke tests should confirm header navigation, the terminal intro, experience carousel, and theme controls.

## Coding Conventions
Default to functional server components, marking client components only when interactivity or browser APIs demand it (`"use client"`). Keep TypeScript strict; no `any` without justification. Compose styles with Tailwind utilities, extracting repeated patterns into dedicated components. Prefer PascalCase filenames, camelCase variables, and the `cn` helper for conditional classes. Inline RGB values when tailoring hover borders or motion cues.

## Data, Config, and Motion
Data currently flows from the GitHub, Notion, and YouTube APIs, plus static Resume/About/Projects content. There is no database; rely on caching and lightweight fetch strategies. Keep `.env.example` updated when credentials change, and document any new pipeline touchpoints or motion libraries.

## Collaboration Practices
Follow the repository’s Conventional Commit style (`docs: …`, `refactor: …`, `feat: …`). Keep PRs scoped, describe intent, list commands executed, and attach UI screenshots or Loom clips when visuals shift. Never auto-commit on behalf of the maintainer—surface changes for review and let the owner merge when ready.
