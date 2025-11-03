## Sanity → Vercel Blog Implementation Plan

### Goals
- Create and edit blog posts in Sanity Studio with live preview
- See exactly how content will look on your website *before* publishing
- Auto-publish to the site's `/blog` with clean layout, SEO, and fast loads
- Use Incremental Static Regeneration (ISR) + Sanity webhooks for instant publishing

### High-level Architecture
- Authoring: Sanity Studio (headless CMS with live preview pane)
- Data Fetch: Next.js server (App Router) using `@sanity/client`
- Rendering: Portable Text (Sanity's rich text format) → React via `@portabletext/react`
- Delivery: Static generation with ISR for list and post pages; Sanity webhooks trigger instant revalidation on publish
- Images: Optimized via Sanity's CDN (automatic resizing, optimization)

### Sanity Setup

1. Create a Sanity project:
   ```bash
   npm create sanity@latest -- --create-project "Portfolio Blog"
   ```

2. Define the blog post schema in `schemas/post.ts`:
   ```ts
   export default {
     name: 'post',
     title: 'Blog Post',
     type: 'document',
     fields: [
       { name: 'title', type: 'string', title: 'Title' },
       { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' } },
       { name: 'publishedAt', type: 'datetime', title: 'Published At' },
       { name: 'excerpt', type: 'string', title: 'Excerpt' },
       { name: 'coverImage', type: 'image', title: 'Cover Image' },
       { name: 'author', type: 'string', title: 'Author' },
       { name: 'tags', type: 'array', of: [{ type: 'string' }], title: 'Tags' },
       { name: 'body', type: 'blockContent', title: 'Content' },
     ],
   }
   ```

3. Define `blockContent` schema for rich text (headings, paragraphs, code blocks, images, etc.):
   ```ts
   export default {
     name: 'blockContent',
     type: 'array',
     of: [
       { type: 'block' },
       { type: 'image' },
       { type: 'code' }, // custom type for code blocks
     ],
   }
   ```

4. Deploy Sanity project (or use Sanity CLI for local Studio).

### Environment & Config
- Env vars (local `.env.local` and Vercel Project Settings → Environment Variables):
  - `NEXT_PUBLIC_SANITY_PROJECT_ID=...`
  - `NEXT_PUBLIC_SANITY_DATASET=production` (or preview)
  - `SANITY_API_READ_TOKEN=...` (for server-side queries if needed)
  - `SANITY_API_WRITE_TOKEN=...` (optional, for webhooks to write metadata)
  - `SANITY_WEBHOOK_SECRET=...` (for webhook signature verification)

- Next Image remotePatterns (for Sanity's CDN):
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io' },
  ]
}
```

### Dependencies
- Core: `@sanity/client`
- Studio: `sanity` (if running Studio locally)
- Rendering: `@portabletext/react`
- Markdown fallback: `react-markdown` (optional, for backwards compatibility)

Install:
```bash
npm install @sanity/client @portabletext/react
# Optional: npm install sanity (for local Studio development)
```

### Data Fetching Layer (`lib/sanity.ts`)
- Functions:
  - `getPublishedPosts()` → list of posts (title, slug, excerpt, date, tags, cover)
  - `getPostBySlug(slug)` → full post data with portable text content
  - `getPostSlugs()` → array of slugs for `generateStaticParams()`

- Implementation notes:
  - Use GROQ (Sanity Query Language) to filter by `publishedAt <= now()`
  - Sort by `publishedAt desc` for newest first
  - Fetch images with Sanity image URLs (optimized via CDN)
  - Portable Text is structured data; render via `@portabletext/react`

Skeleton:
```ts
// lib/sanity.ts
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
});

export async function getPublishedPosts() {
  const groq = `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, tags, coverImage
  }`;
  return await client.fetch(groq);
}

export async function getPostBySlug(slug) {
  const groq = `*[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, publishedAt, author, excerpt, coverImage, body, tags
  }`;
  return await client.fetch(groq, { slug });
}

export async function getPostSlugs() {
  const groq = `*[_type == "post" && publishedAt <= now()].slug.current`;
  return await client.fetch(groq);
}
```

### Pages & Routing (Next.js App Router)
- `app/blog/page.tsx` (Server Component)
  - Fetch `getPublishedPosts()`; render list with title, date, excerpt, tags, cover
  - `export const revalidate = 3600` (1 hour)

- `app/blog/[slug]/page.tsx` (Server Component)
  - Use `generateStaticParams()` to pre-build from `getPostSlugs()`
  - Fetch `getPostBySlug(slug)`
  - Render portable text content via `<PortableText value={post.body} />`
  - Add `export const revalidate = 3600`
  - Implement `generateMetadata` for SEO (title, description, og image from cover)

Example portable text rendering:
```tsx
import { PortableText } from '@portabletext/react';

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <PortableText value={post.body} />
    </article>
  );
}
```

### Publishing Workflow: Sanity Webhooks (Instant)
**Scenario**: You publish a post in Sanity Studio → post appears on your site within seconds.

**Workflow**:
1. Edit post in Sanity Studio with **live preview pane** showing exact website styling
2. Click "Publish" → Sanity sends webhook to `/api/sanity-webhook`
3. Webhook triggers `revalidatePath('/blog/[slug]')` for that specific post
4. Next.js re-generates that page instantly
5. User sees live post on website

**Setup**:
1. In Sanity project settings, create a webhook:
   - URL: `https://yoursite.com/api/sanity-webhook`
   - Events: `Publish` and `Unpublish`
   - Secret: Generate and store as `SANITY_WEBHOOK_SECRET`

2. Implement webhook endpoint:
```ts
// app/api/sanity-webhook/route.ts
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function POST(req: Request) {
  const signature = req.headers.get('sanity-hook-signature');
  const body = await req.text();
  
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha256', process.env.SANITY_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64');
  
  if (hash !== signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const { slug } = payload.document;

  // Revalidate the specific post and blog index
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug.current}`, 'page');

  return Response.json({ ok: true });
}
```

**Pros**:
- ✅ Instant publishing (seconds, not minutes)
- ✅ Live preview in Studio before publishing
- ✅ No guessing how content will look
- ✅ Reliable webhooks (Sanity's infrastructure)

### Vercel Setup
1. Add env vars for Production and Preview:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_READ_TOKEN` (if needed for ISR)
   - `SANITY_WEBHOOK_SECRET`

2. Deploy your Next.js app

3. Test webhook by publishing a post in Studio

### Content & Layout Guidelines
- Post list: big title, readable date, short excerpt, subtle tags, responsive cover
- Post page: large readable typography, syntax-highlighted code blocks, responsive images
- Code blocks: add `rehype-prism` or Shiki for syntax highlighting in portable text
- Table of contents: optional; generate from block headings

### Security & Limits
- Keep API tokens in env; never commit
- Restrict webhook endpoint to Sanity's IP ranges (check Sanity docs)
- Use read-only tokens for front-end queries (via `useCdn: true`)
- Sanity free tier: unlimited documents, generous API calls

### Local Development
1. Create `.env.local` with Sanity credentials
2. Run `npm run dev`
3. Run Sanity Studio locally:
   ```bash
   npm run dev -- --console  # or open Studio in browser at localhost:3333
   ```
4. Create a test post in Studio, set `publishedAt` to now, and click Publish
5. Verify it appears on `localhost:3000/blog`

### Rollout Steps
1. ✅ Feature branch created (`feature/blog-from-notion` → rename to `feature/blog-from-sanity`)
2. Set up Sanity project and schema
3. Install dependencies
4. Implement `lib/sanity.ts`
5. Build `app/blog` list and `[slug]` page with ISR & SEO
6. Add webhook endpoint `/api/sanity-webhook`
7. Configure Sanity webhook in project settings
8. Smoke test locally and in Vercel Preview
9. Push branch and open PR

### Risks / Considerations
- Sanity pricing: free tier may have limits; check for production use
- Webhook delivery: rare failures; consider ISR fallback (revalidate every 1-2 hours as safety net)
- Studio customization: learning curve if you want custom editing UX
- Portable Text: more structured than Markdown; need custom serializers for complex blocks

### Advantages over Notion
- ✅ **Live preview**: See content styled exactly as it appears on your site
- ✅ **Purpose-built**: Designed for content delivery, not workspaces
- ✅ **GROQ queries**: Powerful filtering and sorting
- ✅ **Faster API**: No rate limit stress
- ✅ **Portable Text**: Rich, structured content format
- ✅ **Webhooks**: Production-ready, reliable
- ✅ **CDN images**: Automatic optimization

### Checklist
- [ ] Sanity project created and schema defined
- [ ] Env vars set locally and on Vercel
- [ ] Dependencies installed
- [ ] `lib/sanity.ts` implemented
- [ ] `/blog` index implemented with ISR
- [ ] `/blog/[slug]` implemented with ISR and SEO
- [ ] Webhook endpoint implemented and configured in Sanity
- [ ] Live preview tested in Studio
- [ ] Local and Vercel Preview QA complete
- [ ] PR open and merged

Reference: [Sanity Documentation](https://www.sanity.io/docs) | [Portable Text](https://www.portabletext.org/)
