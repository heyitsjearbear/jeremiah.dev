## Notion → Vercel Blog Implementation Plan

### Goals
- Create and edit blog posts in Notion
- Auto-publish to the site’s `/blog` with clean layout, SEO, and fast loads
- Use Incremental Static Regeneration (ISR) + Vercel Cron to keep content fresh without slow builds

### High-level Architecture
- Authoring: Notion database as CMS (internal integration, limited scope)
- Data Fetch: Next.js server (App Router) using `@notionhq/client`
- Rendering: Convert Notion blocks → Markdown → React via `react-markdown` (lean) or render blocks directly
- Delivery: Static generation with ISR for list and post pages; on-demand revalidation via an API route triggered by Vercel Cron

### Notion Setup
1. Create a database for posts with properties:
   - Title (title)
   - Slug (Text or Formula)
   - Published (checkbox)
   - PublishedAt (date)
   - Tags (multi-select)
   - Excerpt (Text)
   - Cover (files or page cover)
   - Author (people or text)
   - **Content (Relation)**: Link to the page containing the full post content (optional; alternatively, use the page body itself)
2. Create an Internal Integration in Notion and copy its Secret.
3. Share the blog database (and any post pages) with the integration (grants read access).

**Content Strategy:**
- Each row in the database is a post entry with metadata (title, slug, date, etc.)
- The post's **actual content** (body, code blocks, images, embeds) lives on the linked page itself
- When fetching a post, we query its page ID, retrieve all blocks (paragraphs, code, images, etc.), convert them to Markdown, and render
- Alternatively, if you prefer inline content, store a "Content" Text property; this approach is simpler but less flexible for rich formatting

Reference: Notion API overview and integration model [developers.notion.com/docs/getting-started](https://developers.notion.com/docs/getting-started)

### Environment & Config
- Env vars (local `.env.local` and Vercel Project Settings → Environment Variables):
  - `NOTION_SECRET=...`
  - `NOTION_BLOG_DB_ID=...`
- Next Image remotePatterns (if using covers hosted by Notion/AWS): update `next.config.js` to include Notion file hosts.

Example `next.config.js` addition:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com' },
    { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' },
    { protocol: 'https', hostname: 'www.notion.so' },
    { protocol: 'https', hostname: 'images.notion.so' }
  ]
}
```

### Dependencies
- Core: `@notionhq/client`
- Markdown path (simpler): `notion-to-md` + `react-markdown` + `remark-gfm` + `rehype-slug` (+ optional `rehype-autolink-headings`)
- Alternative (heavier, direct blocks): `react-notion-x` ecosystem

Install (lean path):
```bash
npm install @notionhq/client notion-to-md react-markdown remark-gfm rehype-slug
```

### Data Fetching Layer (`lib/notion.ts`)
- Functions:
  - `getPublishedPosts()` → list of posts with minimal fields (title, slug, excerpt, date, tags, cover)
  - `getPostBySlug(slug)` → full page data + blocks converted to Markdown
- Implementation notes:
  - Query database: filter `Published` is true; sort by `PublishedAt` desc
  - Resolve `Slug` (prefer explicit property; else generate from title)
  - For cover: prefer page cover; fallback to `Cover` property
  - Convert blocks to Markdown via `notion-to-md` and cache per-page using ISR
  - **Block retrieval**: Use `notion.blocks.children.list()` to fetch all child blocks from the page, then iterate and format each block type (heading, paragraph, code, image, quote, list, etc.)
  - **Recursive handling**: If blocks contain nested content (e.g., toggle lists, callouts), recursively fetch and flatten them

Skeleton:
```ts
// lib/notion.ts
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({ auth: process.env.NOTION_SECRET });
const n2m = new NotionToMarkdown({ notionClient: notion });

export async function getPublishedPosts() { /* query + map */ }

export async function getPostBySlug(slug: string) {
  // Find page by slug in database
  // Fetch all blocks using notion.blocks.children.list(pageId)
  // Convert to Markdown via n2m.pageToMarkdown(pageId)
  // Return { title, date, author, content (as markdown), ...metadata }
}

// Helper: recursively fetch and convert nested blocks
export async function fetchPageContent(pageId: string): Promise<string> {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  return n2m.toMarkdownString(mdblocks);
}
```

### Pages & Routing (Next.js App Router)
- `app/blog/page.tsx` (Server Component)
  - Fetch `getPublishedPosts()`; render list with title, date, excerpt, tags, and cover
  - `export const revalidate = 3600` (1 hour) or faster if desired
- `app/blog/[slug]/page.tsx` (Server Component)
  - Use `generateStaticParams()` to pre-build slugs from `getPublishedPosts()`
  - Fetch `getPostBySlug(slug)`; render title, date, author, tags
  - Render content via `react-markdown` with `remark-gfm`
  - Add `export const revalidate = 3600`
- SEO: implement `generateMetadata` using post fields (title, description, og image from cover)

### Revalidation Strategy
- Primary: ISR with `revalidate` per route
- Fast refresh path: Vercel Cron (e.g., every 5–10 minutes) hits `/api/revalidate-blog`
  - API route calls `revalidatePath('/blog')` and `revalidatePath('/blog/[slug]')` for updated slugs
  - Optionally, revalidate individual slugs by comparing updated timestamps

Example route handler:
```ts
// app/api/revalidate-blog/route.ts
import { revalidatePath } from 'next/cache';
export async function GET() {
  revalidatePath('/blog');
  // Optionally loop known slugs and revalidate each detail page
  return Response.json({ revalidated: true });
}
```

### Publishing Workflow: Notion `Published` Toggle
**Scenario**: You set `Published = true` in Notion → post appears on your site.

**Options**:

**Option 1: Cron-based (Simple, Default)**
- No webhooks needed
- Vercel Cron checks every 5–10 minutes
- When it runs, it fetches the database, finds newly published posts, and revalidates
- **Pros**: Simple to set up, no infrastructure
- **Cons**: Up to 10-minute delay before posts go live
- **Best for**: Casual updates, non-urgent content

**Option 2: Notion Webhooks (Instant, More Complex)**
- Notion sends a real-time webhook to `/api/notion-webhook` when you toggle `Published`
- Your endpoint immediately triggers `revalidatePath()` for that specific post
- Post goes live within seconds
- **Setup**:
  1. Create a Notion webhook integration pointing to `https://yoursite.com/api/notion-webhook`
  2. Subscribe to database changes (database.updated event)
  3. Verify Notion's webhook signature in your endpoint
  4. Trigger targeted revalidation: `revalidatePath('/blog/[slug]')` for that post
- **Pros**: Instant publishing, real-time feel
- **Cons**: Requires webhook endpoint, signature verification, Notion webhook reliability
- **Best for**: Active blogging, real-time publishing expectations

**Option 3: Hybrid (Recommended)**
- Webhooks for immediate publish on `Published = true`
- Cron as fallback for edge cases (webhook missed, Notion API hiccup, etc.)
- Best of both worlds: instant + reliable

Example webhook endpoint:
```ts
// app/api/notion-webhook/route.ts
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function POST(req: Request) {
  // Verify Notion webhook signature
  const signature = req.headers.get('x-notion-signature');
  const body = await req.text();
  const hash = crypto
    .createHmac('sha256', process.env.NOTION_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  
  if (hash !== signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  
  // If a page's Published property changed, revalidate
  if (payload.type === 'page_update') {
    const pageId = payload.page.id;
    // Fetch the page to get its slug, then revalidate
    // or revalidate all blog routes as fallback
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');
  }

  return Response.json({ ok: true });
}
```

**Recommendation**: Start with **Option 1 (Cron, 5–10 min)** for simplicity. Upgrade to **Option 3 (Hybrid)** if users want instant publishing.

### Vercel Setup
1. Add env vars (`NOTION_SECRET`, `NOTION_BLOG_DB_ID`) for Production and Preview
2. Create Vercel Cron (e.g., every 10 minutes) → GET `/api/revalidate-blog`
3. Deploy; ensure images from Notion hosts render (update `next.config.js` as above)

### Content & Layout Guidelines
- Post list: big title, readable date, short excerpt, subtle tags, responsive cover
- Post page: large readable typography; table of contents optional (headings from Markdown)
- Code blocks (future): add `rehype-prism` or Shiki for syntax highlighting

### Security & Limits
- Keep integration Internal; least-privilege access (only database shared)
- Store secrets only in env; never commit
- Respect Notion API rate limits; batch queries where possible

### Local Development
1. Create `.env.local` with `NOTION_SECRET` and `NOTION_BLOG_DB_ID`
2. Run `npm run dev`
3. Create a sample post in Notion and set `Published` true; verify it appears

### Rollout Steps
1. Create feature branch `feature/blog-from-notion`
2. Add env var scaffolding and dependencies
3. Implement `lib/notion.ts`
4. Build `app/blog` list and `[slug]` page with ISR & SEO
5. Add revalidate API route and set Vercel Cron
6. Smoke test locally; then deploy to Preview; QA
7. Push branch and open PR; address feedback; merge to main

### Risks / Considerations
- Notion file URLs are time-limited; rely on Next Image remote patterns or proxy if needed
- Heavy content (many images/embeds) can slow conversion; consider block-level rendering later
- If immediate publishing is required, tighten Cron cadence or add manual revalidate button

### Checklist
- [ ] Notion database created and shared with integration
- [ ] Env vars set locally and on Vercel
- [ ] Dependencies installed
- [ ] `lib/notion.ts` implemented
- [ ] `/blog` index implemented with ISR
- [ ] `/blog/[slug]` implemented with ISR and SEO
- [ ] Revalidation API + Vercel Cron configured
- [ ] Preview QA and PR open

Reference: Notion API Overview — [developers.notion.com/docs/getting-started](https://developers.notion.com/docs/getting-started)


