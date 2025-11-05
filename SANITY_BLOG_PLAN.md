## Sanity -> jeremiah.dev Blog Integration Plan

### Current Sanity Snapshot
- Studio lives at `studio-jeremiah.dev` (moved to repo root) and targets project `REDACTED` (id in env) / dataset `production`.
- `sanity.config.ts` registers only the default desk + Vision tools; no preview panes or custom structure yet.
- `schemaTypes/index.ts` exports an empty array, so the Studio cannot author blog content until schemas are added.
- No documents, webhooks, or frontend GROQ helpers exist yet; the Next.js app still renders static copy.

### Sanity Schema Work
1. Create schema files under `studio-jeremiah.dev/schemaTypes/`:
   - `blockContent.ts` -> portable text array with blocks, images, code, and custom marks for dark theme accents.
   - `post.ts` -> document with title, slug, hero, excerpt, publishedAt, tags, SEO meta, and the portable text body.
   - Optional future types: `author.ts`, `category.ts`, or `settings.ts` if we want richer metadata.
2. Register schemas in `schemaTypes/index.ts`:
   ```ts
   import blockContent from './blockContent'
   import post from './post'

   export const schemaTypes = [post, blockContent]
   ```
3. Configure helpful defaults:
   - Generate unique slugs from `title`.
   - Default `publishedAt` to `new Date().toISOString()`.
   - Add validation so `excerpt`, `coverImage`, and `body` are required for published posts.
4. Consider a custom structure in `structureTool` once schemas exist (e.g., pin "Posts" at the top) for smoother authoring.

### Frontend Wiring (Next.js App Router)
**Data Client - `app/lib/sanity.ts`**
- Install dependencies in the Next.js workspace root: `@sanity/client`, `@portabletext/react`, and `@sanity/image-url`.
- Export a typed Sanity client:
  ```ts
  import {createClient} from '@sanity/client'

  export const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: process.env.NODE_ENV === 'production',
  })
  ```
- Add helpers with typed responses:
  - `getPublishedPosts()` -> card data for `/blog`.
  - `getPostSlugs()` -> slugs for `generateStaticParams()` in `app/blog/[slug]/page.tsx`.
  - `getPostBySlug(slug)` -> full post payload (body blocks, SEO, related posts).
  - (Optional) `getLatestPosts(limit)` for home/landing surfaces.

**Rendering Portable Text**
- Create `app/blog/_components/portable-text.tsx` that wraps `PortableText` and maps blocks to the dark-first style system (white headlines, gray-300 secondary text, blue highlights).
- Use `@sanity/image-url` to build responsive image URLs and feed them to `next/image`.
- Ensure code blocks and callouts adopt the cinematic dark UI (e.g., subtle glow borders, blue accent focus states).

**Routes**
- `app/blog/page.tsx`: server component that fetches posts, applies subtle entrance motion, and composes cards with existing UI primitives under `app/components`.
- `app/blog/[slug]/page.tsx`: server component that fetches the post, sets `generateStaticParams`, exports `revalidate = 60` (override with webhooks later), and renders hero + Portable Text body.
- Move any current hard-coded blog content to seed posts in Sanity to keep SSR paths clean.

### Incremental Static Regeneration & Webhooks
1. Create `app/api/sanity-webhook/route.ts`:
   - Verify the `SANITY_WEBHOOK_SECRET` signature using `crypto.createHmac`.
   - Parse payload, extract `slug.current`, call `revalidatePath('/blog')` and `revalidatePath(`/blog/${slug}`, 'page')`.
   - Return `JSON.stringify({ok: true})` so Sanity reports success.
2. In Sanity Manage -> API -> Webhooks, create a webhook named "Next.js ISR Revalidation" targeting `https://jeremiah-dot-dev.com/api/sanity-webhook`:
   - Dataset: `production`.
   - Trigger on: Create + Update + Delete.
   - Filter: `_type == "post"` (or the schema name you adopt).
   - Secret: paste the `SANITY_WEBHOOK_SECRET` you generated locally (e.g., `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Keep the same value in your env vars so the route can verify requests.
   - Drafts / Versions: leave off unless you specifically need draft-triggered revalidation.
3. For local testing, either rely on `export const revalidate = 60` or run a tunnel such as `ngrok http 3000` and temporarily set the webhook URL to the generated HTTPS endpoint.
4. Until the production webhook is active, keep `export const revalidate = 60` on blog routes so updates surface within a minute.

### Draft Preview (Optional but Recommended)
- Generate a secret (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and add it as `SANITY_PREVIEW_SECRET` in `.env.local`, `.env`, and Vercel env vars.
- Add `/app/api/preview/route.ts` that verifies a `secret` query param against `SANITY_PREVIEW_SECRET`, toggles Next.js `draftMode()`, and redirects to `/blog/${slug}` (fallback to `/blog` if no slug).
- Update `/app/blog/[slug]/page.tsx` (and the index if needed) to read `draftMode().isEnabled`, switch to a non-CDN client with the read token, and render draft content when preview is active.
- Create an `/app/api/exit-preview/route.ts` to disable draft mode and redirect back to the same slug.
- In Studio, register a Preview pane or action that hits `https://jeremiah-dot-dev.com/api/preview?secret=...&slug=...` for production checks. For local testing, swap the base URL to `http://localhost:3000`. Include an "Exit preview" action that targets `https://jeremiah-dot-dev.com/api/exit-preview?slug=...`.

### QA Flow
1. Run both dev servers: `npm run dev` from the repository root (Next.js on http://localhost:3000) and `npm run dev` from `studio-jeremiah.dev` (Studio auto-serves on http://localhost:3333).
2. Seed a sample post in Studio, set `publishedAt`, add hero image, and publish.
3. Hit `localhost:3000/blog` and verify cards render with the new content and remote images load.
4. Click through to `localhost:3000/blog/<slug>` to confirm Portable Text rendering, SEO metadata, and motion cues.
5. Trigger the webhook (publish again) to ensure ISR paths revalidate on Vercel Preview.
6. Test preview flow: open Studio preview pane (or manually visit `/api/preview?secret=...&slug=...`), confirm draft content renders, then exit via `/api/exit-preview`.

### Integration Checklist
- [ ] Add `blockContent` and `post` schemas; export via `schemaTypes/index.ts`.
- [ ] Seed at least one published and one draft post for testing.
- [ ] Install `@sanity/client`, `@portabletext/react`, `@sanity/image-url` in the Next.js workspace.
- [ ] Implement `app/lib/sanity.ts` with strictly typed GROQ helpers.
- [ ] Build `/app/blog/page.tsx` list view with ISR + motion polish.
- [ ] Build `/app/blog/[slug]/page.tsx` detail view with Portable Text renderer.
- [ ] Configure `next.config.ts` `images.remotePatterns` for `cdn.sanity.io`.
- [ ] Implement `/api/sanity-webhook` and register the webhook in Sanity.
- [ ] Populate `.env.local` / `.env.example` and set Vercel env vars.
- [ ] Wire up draft preview flow (`/api/preview`, `/api/exit-preview`, draft-aware fetchers).

Reference docs: [Sanity schema fundamentals](https://www.sanity.io/docs/schema-types), [GROQ fetching](https://www.sanity.io/docs/groq), [Portable Text -> React](https://www.sanity.io/docs/block-content), [Next.js ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating).
