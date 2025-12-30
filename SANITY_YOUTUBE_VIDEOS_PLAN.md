# Sanity YouTube Videos Extraction & Rendering Plan

## Executive Summary

This plan outlines the implementation strategy for extracting YouTube videos from Sanity "post" entries and rendering them into a dedicated Videos section/page. The codebase already has partial infrastructure in place (navigation link, placeholder page, YouTube URL field in posts), requiring focused work on data queries, extraction logic, and UI components.

---

## Current State Architecture

### Sanity Schema Structure

**Post Schema Location**: `studio-jeremiah.dev/schemaTypes/post.ts`

The `post` document type includes a dedicated `youtubeUrl` field:

```typescript
// Lines 102-125 in studio-jeremiah.dev/schemaTypes/post.ts
defineField({
  name: 'youtubeUrl',
  title: 'YouTube video URL',
  type: 'url',
  group: 'content',
  description: 'Optional video to feature alongside the post.',
  validation: (rule) =>
    rule
      .uri({scheme: ['https', 'http'], allowRelative: false})
      .custom((value) => {
        if (!value) return true
        try {
          const {hostname} = new URL(value)
          const allowedHosts = ['youtube.com', 'www.youtube.com', 'youtu.be']
          return allowedHosts.includes(hostname) || 'Use a valid YouTube URL.'
        } catch {
          return 'Enter a valid URL.'
        }
      }),
})
```

**Key Points**:
- Single URL field per post (no arrays or multiple videos)
- Validation enforces YouTube domains: `youtube.com`, `www.youtube.com`, `youtu.be`
- Optional field (posts can exist without videos)
- No structured video metadata (title, description, thumbnail) stored separately

**BlockContent Schema**: `studio-jeremiah.dev/schemaTypes/blockContent.ts`

The portable text body supports:
- Block text (headings, paragraphs, lists, quotes)
- Images with alt/caption/attribution
- Code blocks with syntax highlighting
- Links (annotations)

**No YouTube embed block exists in portable text** — videos are only referenced via the top-level `youtubeUrl` field.

### Data Fetching Layer

**File**: `app/lib/sanity.ts`

**Post Type Definitions** (lines 98-123):
```typescript
type BasePostFields = {
  _id: string
  title: string
  slug: {current: string}
  publishedAt: string
  excerpt: string
  coverImage?: SanityImage | null
  tags: string[]
  youtubeUrl?: string | null  // ← YouTube URL included in base fields
}

export type PostCard = BasePostFields & {
  _createdAt: string
  _updatedAt: string
}

export type Post = BasePostFields & {
  body: BlogPortableTextValue
  seo?: {...}
}
```

**GROQ Queries**:

Published posts query (line 214):
```groq
*[_type == "post" && defined(slug.current) && publishedAt <= now() && !(_id in path("drafts.**"))] | order(publishedAt desc) {...}
```

Post fields projection (lines 146-157):
```groq
{
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug,
  publishedAt,
  excerpt,
  coverImage,
  youtubeUrl,  // ← Already fetched
  "tags": coalesce(tags, []),
}
```

**Existing Functions**:
- `getPublishedPosts()` — fetches all published posts (includes `youtubeUrl`)
- `getPostBySlug()` — fetches single post detail
- `sanityFetch()` — wrapper with caching/preview support

### Frontend Rendering Pipeline

**Blog List Page**: `app/blog/page.tsx`
- Displays grid of `PostCard` components
- No filtering by video presence

**Post Detail Page**: `app/blog/[slug]/page.tsx`

**YouTube Handling** (lines 103-136):
```typescript
const getYouTubeId = (youtubeUrl?: string | null) => {
  // Extracts video ID from:
  // - youtu.be/{id}
  // - youtube.com/shorts/{id}
  // - youtube.com/embed/{id}
  // - youtube.com/watch?v={id}
}

// Renders clickable thumbnail that links to YouTube (lines 206-227)
```

Key behaviors:
- Video displayed as thumbnail with play icon overlay
- Links to external YouTube watch page (new tab)
- No embedded player on blog detail page
- Uses `https://i.ytimg.com/vi/{videoId}/maxresdefault.jpg` for thumbnails

**Post Card Component**: `app/blog/_components/post-card.tsx`
- Duplicates `getYouTubeId()` extraction logic (lines 12-45)
- Falls back to YouTube thumbnail if no `coverImage` exists (line 58)
- Does not indicate video presence with badges/icons

**Portable Text Renderer**: `app/blog/_components/portable-text.tsx`
- No custom YouTube embed component
- Only handles: blocks, images, code blocks, links

### Routing Structure

**Videos Route**: `app/videos/page.tsx`

Current implementation (placeholder):
```typescript
export default function VideosPage() {
  return (
    <ComingSoonPage
      title="Videos"
      description="Deep dives, build logs, and product walkthroughs will stream here soon. Stay tuned."
    />
  )
}
```

**Navigation**: `app/config/site.ts` (line 28)
```typescript
{ label: "Videos", href: "/videos" }
```

Already present in header navigation — users can access the route but see placeholder content.

---

## Where YouTube Data Exists

### Schema Fields

**Primary Source**: `post.youtubeUrl` (string, optional)
- Direct URL to YouTube video
- Formats supported: `https://youtube.com/watch?v={id}`, `https://youtu.be/{id}`, `/shorts/{id}`, `/embed/{id}`

**No Metadata Fields**:
- Video title (falls back to post title)
- Video description (no field exists)
- Custom thumbnail (uses YouTube default)
- Duration, view count, upload date (not stored)

### Query Strategy Example

To fetch only posts with videos:

```groq
*[
  _type == "post"
  && defined(slug.current)
  && defined(youtubeUrl)  // ← Filter condition
  && publishedAt <= now()
  && !(_id in path("drafts.**"))
] | order(publishedAt desc) {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  coverImage,
  youtubeUrl,
  "tags": coalesce(tags, [])
}
```

**Filtering Logic**:
- `defined(youtubeUrl)` — ensures field exists and is non-null
- No additional parsing needed in query (handle extraction in client)

---

## Proposed Solution Design

### Data Model

**Video Extraction Logic**:

1. **Input**: `post.youtubeUrl` (string)
2. **Parsing**: Extract `videoId` using existing `getYouTubeId()` function
3. **Output Structure**:

```typescript
type VideoCard = {
  _id: string              // Post ID (for deduplication)
  videoId: string          // Extracted YouTube video ID
  title: string            // Post title (proxy for video title)
  publishedAt: string      // Post publish date
  excerpt?: string         // Post excerpt (video description proxy)
  tags: string[]           // Post tags (for filtering)
  slug: string             // Post slug (for detail page link)
  thumbnailUrl: string     // Constructed: `https://i.ytimg.com/vi/{videoId}/maxresdefault.jpg`
  watchUrl: string         // Original youtubeUrl or constructed watch URL
}
```

**Deduplication Strategy**:
- Use `_id` as unique key (posts can't duplicate)
- If same video appears in multiple posts (unlikely with current schema), show all instances (preserves post context)
- Future enhancement: group by `videoId` if deduplication needed

### Query Approach

**New Function**: `getPostsWithVideos()` in `app/lib/sanity.ts`

```typescript
const postsWithVideosQuery = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && defined(youtubeUrl)
    && publishedAt <= now()
    && !(_id in path("drafts.**"))
  ] | order(publishedAt desc) {
    _id,
    _createdAt,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage,
    youtubeUrl,
    "tags": coalesce(tags, [])
  }
`

export const getPostsWithVideos = async ({preview = false}: {preview?: boolean} = {}) => {
  return sanityFetch<PostCard[]>(postsWithVideosQuery, {}, {preview})
}
```

**Filtering Options** (future enhancements):
- Tag-based filtering: `&& $tag in tags` (pass tag param)
- Date range: `&& publishedAt >= $startDate && publishedAt <= $endDate`

### UI Output

**Videos Page** (`app/videos/page.tsx`):

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│ Header (sticky navigation)              │
├─────────────────────────────────────────┤
│ Hero Section                            │
│  - Page title: "Videos"                 │
│  - Subtitle/description                 │
│  - Optional stats (X videos)            │
├─────────────────────────────────────────┤
│ Video Grid (2-col on mobile, 3-col+)   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Video 1 │ │ Video 2 │ │ Video 3 │  │
│  │ Card    │ │ Card    │ │ Card    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ...                                    │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

**Video Card Component** (`app/videos/_components/video-card.tsx`):

Visual design:
- Clickable thumbnail (YouTube default `maxresdefault.jpg`)
- Play icon overlay (reuse `PlayCircle` from Lucide)
- Post title overlaid/below thumbnail
- Publish date badge
- Tag pills (first 2-3 tags)
- Hover effects (border glow, scale thumbnail)

Click behavior:
- **Option A**: Link to external YouTube watch URL (new tab) — matches blog detail page behavior
- **Option B**: Link to internal blog post (`/blog/{slug}`) — drives traffic to blog content
- **Recommendation**: Option B to leverage existing blog infrastructure and keep users on site

**Empty State**:
- Display when no posts have `youtubeUrl` defined
- Message: "No videos yet. Check back soon for technical deep dives and build logs."

**Embed Behavior**:
- No in-page player on Videos page (performance/bandwidth)
- Thumbnail + metadata preview only
- Full video accessible via click-through to blog post (which already shows thumbnail + external link)

**Pagination/Infinite Scroll**:
- Start with simple "Load all" (likely <50 videos initially)
- Add pagination if video count exceeds ~30 items
- Use Sanity slice notation: `[0..29]` for first page

**Tag Filtering** (future enhancement):
- Tag pills clickable to filter by tag
- Client-side filtering (all videos loaded) or server-side (GROQ param)

### Edge Cases

#### 1. Short Links (`youtu.be/{id}`)
**Handling**: `getYouTubeId()` already supports (line 111-112 in `app/blog/[slug]/page.tsx`)
```typescript
if (host === 'youtu.be') {
  return parsed.pathname.slice(1)
}
```
**Action**: No changes needed, reuse existing logic.

#### 2. Playlists (`youtube.com/playlist?list=...`)
**Current State**: Validation rejects non-video URLs (schema only allows video domains)
**Issue**: Playlist URLs pass domain validation but fail ID extraction
**Solution**:
- Update schema validation to reject playlist URLs:
  ```typescript
  .custom((value) => {
    if (!value) return true
    if (value.includes('/playlist')) return 'Playlists not supported. Use individual video URLs.'
    // ... existing validation
  })
  ```
- Add check in `getYouTubeId()`:
  ```typescript
  if (parsed.pathname.includes('/playlist') || parsed.searchParams.has('list')) {
    return null
  }
  ```

#### 3. Missing/Invalid Video IDs
**Scenario**: Post has `youtubeUrl` but ID extraction fails
**Handling**:
- `getYouTubeId()` returns `null` for invalid URLs
- Videos page: filter out posts where `getYouTubeId(post.youtubeUrl) === null`
- Log warning for debugging: `console.warn('Invalid YouTube URL in post:', post._id, post.youtubeUrl)`

#### 4. Deleted YouTube Videos
**Issue**: Thumbnail URL returns 404 if video deleted
**Solution**:
- Fallback to post `coverImage` if exists
- Final fallback: gradient placeholder (matches blog card behavior)
- Add `onError` handler to Image component:
  ```typescript
  <Image
    src={thumbnailUrl}
    onError={(e) => {
      e.currentTarget.src = fallbackCoverImageUrl || '/placeholder.png'
    }}
    // ...
  />
  ```

#### 5. Duplicate Videos Across Posts
**Scenario**: Same YouTube video linked in multiple posts
**Current Behavior**: Each post treated independently (separate cards)
**Recommendation**: Keep as-is — posts provide different context/commentary
**Future Enhancement**: Add "Related Posts" section on blog detail page for same videoId

#### 6. Posts with Videos in Body (Not Top-Level Field)
**Current State**: No YouTube embed block in `blockContent` schema
**Impact**: Videos in body text (as plain URLs/links) won't appear in Videos page
**Solution**: Educate content creators to use `youtubeUrl` field for featured videos
**Future Enhancement**: Add YouTube embed block to portable text schema if needed

#### 7. Draft Posts with Videos
**Query Filter**: `!(_id in path("drafts.**"))` already excludes drafts
**Preview Mode**: If `preview=true`, draft videos appear (expected behavior)

---

## Implementation Steps (In Order)

### Phase 1: Utility Function Consolidation
**Goal**: Eliminate duplicate `getYouTubeId()` logic

**Tasks**:
1. Extract `getYouTubeId()` to shared utility file: `app/lib/youtube.ts`
2. Update function to handle edge cases (playlists, invalid URLs)
3. Add TypeScript types:
   ```typescript
   export const getYouTubeId = (url?: string | null): string | null => {...}
   ```
4. Update imports in:
   - `app/blog/[slug]/page.tsx`
   - `app/blog/_components/post-card.tsx`
5. Add helper function: `getYouTubeThumbnailUrl(videoId: string): string`
6. Add helper function: `getYouTubeWatchUrl(videoId: string): string`

**Files Modified**:
- Create: `app/lib/youtube.ts`
- Edit: `app/blog/[slug]/page.tsx`
- Edit: `app/blog/_components/post-card.tsx`

### Phase 2: Schema Validation Enhancement
**Goal**: Prevent playlists and improve error messages

**Tasks**:
1. Update `studio-jeremiah.dev/schemaTypes/post.ts` validation:
   - Add playlist rejection logic
   - Improve error messages
2. Test in Sanity Studio:
   - Valid video URLs (watch, embed, shorts, youtu.be)
   - Invalid URLs (playlist, invalid domain)

**Files Modified**:
- Edit: `studio-jeremiah.dev/schemaTypes/post.ts`

### Phase 3: Data Fetching Layer
**Goal**: Query posts with videos

**Tasks**:
1. Add `postsWithVideosQuery` constant to `app/lib/sanity.ts`
2. Implement `getPostsWithVideos()` function (follow pattern of `getPublishedPosts`)
3. Add revalidation: `{revalidate: 60}` (match blog page)
4. Test query in Sanity Vision tool to verify results

**Files Modified**:
- Edit: `app/lib/sanity.ts`

### Phase 4: Video Card Component
**Goal**: Reusable component for video grid

**Tasks**:
1. Create `app/videos/_components/video-card.tsx`
2. Implement component structure:
   - Thumbnail with Next.js Image
   - Play icon overlay (Lucide `PlayCircle`)
   - Title, date, tags
   - Link wrapper (to blog post detail page)
   - Hover effects (Tailwind transitions)
3. Handle missing thumbnails (fallback to coverImage → gradient)
4. Add accessibility: alt text, ARIA labels, keyboard navigation

**Files Created**:
- Create: `app/videos/_components/video-card.tsx`

### Phase 5: Videos Page Implementation
**Goal**: Replace placeholder with functional page

**Tasks**:
1. Update `app/videos/page.tsx`:
   - Import `getPostsWithVideos`, `VideoCard` component
   - Fetch data in async component
   - Filter out posts with invalid video IDs
   - Render grid layout (responsive: 1-col mobile, 2-col tablet, 3-col desktop)
   - Add hero section (title, description, video count)
   - Handle empty state (no videos)
2. Add metadata:
   ```typescript
   export const metadata: Metadata = {
     title: 'Videos | jeremiah.dev',
     description: 'Technical deep dives, build logs, and product demos.'
   }
   ```
3. Add revalidation: `export const revalidate = 60`
4. Match design system (bg-gray-800, text-white, sky accent colors)

**Files Modified**:
- Edit: `app/videos/page.tsx`

### Phase 6: Styling & Polish
**Goal**: Visual consistency with blog page

**Tasks**:
1. Ensure color palette matches:
   - Background: `bg-gray-800`, `bg-gray-900`
   - Text: `text-white`, `text-gray-300`
   - Accents: `border-sky-400`, `text-sky-300`
2. Add hover states (border glow, thumbnail scale)
3. Responsive spacing (px-4 mobile, px-6 tablet, px-8 desktop)
4. Test dark mode rendering
5. Optimize image loading (lazy load, blur placeholder)

**Files Modified**:
- Edit: `app/videos/page.tsx`
- Edit: `app/videos/_components/video-card.tsx`

### Phase 7: Testing & Edge Case Handling
**Goal**: Verify all scenarios work

**Test Cases**:
1. **No videos**: All posts lack `youtubeUrl` → empty state displays
2. **Valid videos**: Posts with valid URLs → cards render correctly
3. **Invalid URLs**: Post with invalid `youtubeUrl` → filtered out (not displayed)
4. **Missing thumbnails**: Deleted video → fallback to coverImage or gradient
5. **Long titles**: Post title >80 chars → truncates gracefully
6. **Many tags**: Post with 10 tags → only first 2-3 shown
7. **Draft mode**: Preview mode shows draft posts with videos
8. **Mobile responsive**: Grid adapts to small screens (1-col)
9. **Accessibility**: Keyboard navigation works, screen reader labels present
10. **Performance**: Page loads <2s, images lazy load

**Files Reviewed**:
- All files from Phases 1-6

### Phase 8: Optional Enhancements (Future)
**Deferred Features** (not in initial scope):

1. **Tag Filtering**:
   - Add tag filter UI (clickable pills)
   - Client-side filtering or URL query params
2. **Search**:
   - Search by video title/description
3. **Sorting**:
   - Sort by date (asc/desc), title (A-Z)
4. **Pagination**:
   - Load more button or infinite scroll
5. **YouTube Embed Block**:
   - Add custom block type to portable text schema
   - Render embedded player in blog body
6. **Video Metadata Sync**:
   - Fetch YouTube API for title, description, duration
   - Store in Sanity (requires API key, webhook)
7. **Analytics**:
   - Track video clicks, popular videos

---

## Verification Plan

### Local Development Checks

1. **Query Validation**:
   - Test GROQ query in Sanity Vision tool
   - Verify correct post filtering (only posts with `youtubeUrl`)
   - Check result structure matches `PostCard` type

2. **Component Rendering**:
   - Run dev server: `npm run dev`
   - Navigate to `/videos`
   - Verify hero section displays
   - Verify video grid renders (if posts exist)
   - Verify empty state displays (if no posts)

3. **Video Card Inspection**:
   - Inspect thumbnail URLs (should be `i.ytimg.com`)
   - Verify play icon overlay visible
   - Verify title, date, tags render correctly
   - Test hover effects (border glow, thumbnail scale)

4. **Edge Case Testing**:
   - Create test post with `youtu.be` short link → verify ID extraction
   - Create test post with `/shorts/` URL → verify ID extraction
   - Create test post with invalid URL → verify card doesn't render
   - Delete YouTube video → verify fallback image displays

5. **Responsive Design**:
   - Test mobile (375px width) → 1-column grid
   - Test tablet (768px width) → 2-column grid
   - Test desktop (1280px width) → 3+ column grid

6. **Accessibility Audit**:
   - Run Lighthouse accessibility scan (score >90)
   - Tab navigation works through all cards
   - Screen reader announces video titles, dates

### Sample Grep/File Checks

**Verify YouTube utility extraction**:
```bash
grep -r "getYouTubeId" app/
# Should find:
# - app/lib/youtube.ts (definition)
# - app/blog/[slug]/page.tsx (import)
# - app/blog/_components/post-card.tsx (import)
# - app/videos/_components/video-card.tsx (import)
```

**Verify query implementation**:
```bash
grep "postsWithVideosQuery" app/lib/sanity.ts
# Should find query definition and usage in getPostsWithVideos()
```

**Verify videos page updated**:
```bash
grep "ComingSoonPage" app/videos/page.tsx
# Should return NO matches (placeholder removed)
```

**Verify imports**:
```bash
grep "from '@/app/lib/youtube'" app/
# Should find imports in blog and videos components
```

### Pages to Check (Manual QA)

| Page | URL | Expected Behavior |
|------|-----|-------------------|
| Videos page | `/videos` | Grid of video cards OR empty state |
| Blog list | `/blog` | Unchanged (still shows all posts) |
| Blog detail (with video) | `/blog/{slug}` | YouTube thumbnail displays (existing feature) |
| Blog detail (no video) | `/blog/{slug}` | No video section (existing behavior) |
| Navigation | Any page | "Videos" link in header works |

### Production Deployment Checks

1. **Build Validation**:
   ```bash
   npm run build
   # Should complete without TypeScript errors
   # Should generate static pages for /videos route
   ```

2. **ISR Revalidation**:
   - Publish new post with `youtubeUrl` in Sanity
   - Wait 60 seconds (revalidation period)
   - Refresh `/videos` → new video appears

3. **Performance Metrics** (Vercel Analytics / Lighthouse):
   - First Contentful Paint (FCP): <1.5s
   - Largest Contentful Paint (LCP): <2.5s
   - Cumulative Layout Shift (CLS): <0.1
   - Time to Interactive (TTI): <3.5s

4. **SEO Verification**:
   - View page source → meta tags present
   - Open Graph tags include title, description
   - Canonical URL set to `/videos`

---

## Definition of Done Checklist

### Core Features
- [ ] `getYouTubeId()` extracted to `app/lib/youtube.ts` with edge case handling
- [ ] Duplicate logic removed from blog components
- [ ] Schema validation updated to reject playlists
- [ ] `getPostsWithVideos()` query implemented in `app/lib/sanity.ts`
- [ ] `VideoCard` component created in `app/videos/_components/`
- [ ] Videos page (`app/videos/page.tsx`) fully implemented with grid layout
- [ ] Empty state handling implemented (no videos message)
- [ ] Hero section added with title, description, video count

### Visual & UX
- [ ] Design matches blog page aesthetic (gray/sky color scheme)
- [ ] Hover effects work (border glow, thumbnail scale)
- [ ] Responsive grid adapts to mobile/tablet/desktop
- [ ] Play icon overlay visible on thumbnails
- [ ] Tags display (first 2-3 per card)
- [ ] Publish date formatted correctly

### Edge Cases
- [ ] Invalid YouTube URLs filtered out (don't render cards)
- [ ] Missing thumbnails fall back to coverImage or gradient
- [ ] Short links (`youtu.be`) parse correctly
- [ ] Shorts URLs (`/shorts/`) parse correctly
- [ ] Embed URLs (`/embed/`) parse correctly
- [ ] Playlist URLs rejected by schema validation
- [ ] Draft posts excluded from production (visible in preview mode)

### Technical
- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Page revalidates every 60 seconds (ISR)
- [ ] Images lazy load with blur placeholder
- [ ] No console errors/warnings in browser

### Accessibility
- [ ] All images have alt text
- [ ] Keyboard navigation works (tab through cards)
- [ ] ARIA labels present for play icons
- [ ] Screen reader announces card content correctly
- [ ] Focus indicators visible
- [ ] Lighthouse accessibility score >90

### Testing
- [ ] Manual test: Navigate to `/videos` → page loads
- [ ] Manual test: Click video card → navigates to blog post
- [ ] Manual test: Empty state displays when no videos exist
- [ ] Manual test: Mobile responsive grid (1-col)
- [ ] Manual test: Desktop grid (3-col)
- [ ] Manual test: Draft mode shows draft videos
- [ ] Grep check: No `ComingSoonPage` in `app/videos/page.tsx`
- [ ] Grep check: `getYouTubeId` imported from `app/lib/youtube.ts`

### Documentation
- [ ] Code comments explain complex logic (URL parsing edge cases)
- [ ] Types exported from appropriate files (`VideoCard` type if needed)
- [ ] README updated (if project has setup instructions)

### Deployment
- [ ] Changes merged to base branch
- [ ] Production build verified on Vercel/hosting platform
- [ ] `/videos` route accessible in production
- [ ] New video appears after Sanity publish + 60s revalidation

---

## Files Summary

### Files to Create
1. `app/lib/youtube.ts` — YouTube utility functions
2. `app/videos/_components/video-card.tsx` — Video card component

### Files to Modify
1. `app/lib/sanity.ts` — Add `getPostsWithVideos()` query
2. `app/videos/page.tsx` — Replace placeholder with video grid
3. `app/blog/[slug]/page.tsx` — Import YouTube utils from `app/lib/youtube.ts`
4. `app/blog/_components/post-card.tsx` — Import YouTube utils from `app/lib/youtube.ts`
5. `studio-jeremiah.dev/schemaTypes/post.ts` — Update validation (reject playlists)

### Files to Review (No Changes Expected)
- `app/config/site.ts` — Navigation already includes Videos link
- `app/components/header.tsx` — Already renders navigation
- `app/blog/page.tsx` — Blog list unchanged
- `app/blog/_components/portable-text.tsx` — No YouTube embed block needed initially

---

## Additional Notes

### Design Decisions

1. **Click Behavior**: Video cards link to blog post detail page (not external YouTube) to:
   - Keep users on site
   - Leverage existing blog infrastructure
   - Show full post context (excerpt, tags, body content)

2. **No Embedded Player**: Videos page shows thumbnails only to:
   - Optimize performance (avoid loading YouTube iframes)
   - Reduce bandwidth for users
   - Faster page load times

3. **Single Video per Post**: Current schema supports one `youtubeUrl` per post:
   - Simpler data model
   - Matches existing content structure
   - Future enhancement: add array field if multiple videos needed

4. **Deduplication Strategy**: Keep duplicate videos (same videoId in multiple posts):
   - Preserves individual post context
   - Different posts may discuss video differently
   - Simpler implementation (no grouping logic)

### Future Considerations

1. **YouTube API Integration**:
   - Fetch video metadata (title, description, duration, view count)
   - Requires API key, rate limits, webhook for updates
   - Store in separate Sanity document type: `youtube.video`

2. **Video Analytics**:
   - Track which videos get most clicks
   - Use Vercel Analytics or custom event tracking
   - Inform content strategy

3. **Video Categories**:
   - Add `category` field to posts (tutorial, demo, vlog)
   - Filter videos page by category
   - Separate pages: `/videos/tutorials`, `/videos/demos`

4. **Playlist Support**:
   - Add `youtubePlaylist` field (separate from `youtubeUrl`)
   - Create playlist detail page: `/videos/playlists/{playlistId}`
   - Fetch playlist items via YouTube API

5. **Related Videos**:
   - On blog detail page, show "Related Videos" section
   - Query posts with same tags + `defined(youtubeUrl)`
   - Exclude current post

### Performance Optimization

1. **Image Loading**:
   - Use Next.js Image component (already implemented)
   - Add `placeholder="blur"` with base64 data URL
   - Lazy load images below fold

2. **Query Optimization**:
   - Current query efficient (filters in Sanity, not client)
   - If video count grows >100, add pagination:
     ```groq
     [...] | order(publishedAt desc)[0..29]
     ```
   - Use `_createdAt` for cursor-based pagination

3. **Caching Strategy**:
   - ISR with 60s revalidation (matches blog page)
   - Consider shorter revalidation if videos publish frequently
   - CDN caching at edge (Vercel automatic)

### Accessibility Best Practices

1. **Semantic HTML**:
   - Use `<article>` for video cards
   - Use `<h2>` for card titles
   - Use `<time>` for publish dates

2. **ARIA Labels**:
   - Add `aria-label` to play icon: "Play video: {title}"
   - Add `role="button"` to clickable thumbnails (if not using `<Link>`)

3. **Keyboard Navigation**:
   - Ensure tab order logical (left-to-right, top-to-bottom)
   - Visible focus indicators (blue outline)
   - Enter key activates links

4. **Color Contrast**:
   - Verify text on backgrounds meets WCAG AA (4.5:1)
   - Test with contrast checker tool

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| No posts have videos | Medium | High (empty page) | Implement prominent empty state with call-to-action |
| YouTube API rate limits | Low (no API used) | N/A | Current design doesn't rely on API |
| Deleted videos break UI | Medium | Low | Fallback images + graceful error handling |
| Schema change breaks queries | Low | High | TypeScript types catch mismatches at build time |
| Performance issues (many videos) | Low | Medium | Lazy load images, add pagination if needed |
| Invalid URLs in existing posts | Low | Low | Filter out invalid IDs, log warnings for debugging |

---

## Timeline Estimate

**Not providing specific time estimates** (per instructions), but phases ordered by dependency:

**Critical Path**:
1. Phase 1 (Utils) → Phase 3 (Data) → Phase 4 (Component) → Phase 5 (Page)
2. Phase 2 (Schema) can run parallel to Phase 1-3
3. Phase 6 (Styling) depends on Phase 5
4. Phase 7 (Testing) final step

**Suggested Sequencing**:
- Start: Phase 1 + Phase 2 (independent)
- Then: Phase 3 (requires Phase 1 complete)
- Then: Phase 4 + Phase 5 (Phase 4 can start once Phase 3 in progress)
- Finally: Phase 6 + Phase 7

---

## Success Metrics

**Quantitative**:
- Videos page loads successfully (200 status)
- All posts with `youtubeUrl` display as cards (0% filter loss)
- Page load time <2s (Lighthouse)
- Zero console errors on production

**Qualitative**:
- Design visually consistent with blog page
- User can easily browse and click videos
- Empty state clearly communicates next steps
- Code maintainable (no duplication, clear types)

---

## Conclusion

This plan provides a complete roadmap for implementing a Videos section that extracts YouTube videos from existing Sanity post entries. The design leverages existing infrastructure (schema field, navigation, blog components) while adding focused functionality (new query, video card component, dedicated page). Edge cases are documented and handled, with a clear testing strategy and definition of done.

**Next Steps**:
1. User reviews and approves plan
2. Begin Phase 1 implementation (utility extraction)
3. Iterate through phases sequentially
4. Test thoroughly before production deployment
