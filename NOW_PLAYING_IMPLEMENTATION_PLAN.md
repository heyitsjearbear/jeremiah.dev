# Now Playing Widget Implementation Plan

## Overview
Transform the hardcoded now-playing widget into a dynamic component that pulls song data from Sanity CMS. On each page hard refresh, 10 random songs are fetched from the database and rotated through the widget. Users can manually add/update songs in Sanity Studio, and all songs have an equal chance of being selected in the rotation.

---

## Architecture

### Data Flow
```
Sanity Studio (Manual Entry of Songs)
    ↓
Sanity Database (10 random songs selected on each hard refresh)
    ↓
Query Function in @app/lib/sanity.ts (returns array of 10 songs)
    ↓
NowPlaying Component in @app/components/now-playing.tsx (server component)
    ↓
Client-side Rotation Logic (cycles through songs, resets progress bar per song)
    ↓
User Interface
```

---

## Implementation Steps

### Phase 1: Sanity Schema Setup

#### Step 1.1: Create `songs.ts` Schema
**File:** `studio-jeremiah.dev/schemaTypes/songs.ts`

Create a new document schema for songs with the following fields:
- `title` (string, required): Song title
- `artist` (string, required): Artist name
- `album` (string, required): Album name
- `duration` (number, required): Duration in seconds (e.g., 245 for 4:05)
- `albumCover` (image, required): Album artwork with hotspot
- `spotifyUrl` (url, optional): Link to song on Spotify

**Field Details:**
- Duration is stored as number (seconds) for easier calculations in component
- Album cover should support hotspot for visual preview
- Add preview configuration to display title, artist, and duration in Sanity studio list view
- Add ordering (most recent first)
- No "isCurrentlyPlaying" flag needed - all songs have equal chance in rotation

#### Step 1.2: Register Schema in Index
**File:** `studio-jeremiah.dev/schemaTypes/index.ts`

Import and add the new `songs` schema to the `schemaTypes` array.

---

### Phase 2: Sanity Query Functions

#### Step 2.1: Add Type Definitions
**File:** `app/lib/sanity.ts`

Add the following TypeScript types:
```typescript
export type Song = {
  _id: string
  title: string
  artist: string
  album: string
  duration: number  // seconds (e.g., 245)
  albumCover: SanityImage
  spotifyUrl?: string
}
```

#### Step 2.2: Create Query Function
**File:** `app/lib/sanity.ts`

Add a new query function to fetch 10 random songs:
- Function name: `getRandomSongs(count: number = 10)`
- Query logic: Fetch `count` random songs using GROQ randomization
- Return type: `Song[]`
- Fields to fetch: _id, title, artist, album, duration, albumCover, spotifyUrl
- Note: Sanity doesn't have built-in random sorting, so use a workaround approach (see Note below)

**Query Structure:**
```groq
songFields = {
  _id,
  title,
  artist,
  album,
  duration,
  albumCover,
  spotifyUrl
}
Query: *[_type == "songs"] | order(_id) [0..9]  // or use random approach
```

**Note on Randomization:**
Since Sanity GROQ doesn't have native random sorting, implement one of these approaches:
- Option 1 (Recommended): Fetch all songs, randomize on client-side in the query function
- Option 2: Fetch songs in fixed order and rotate which set is used (deterministic but appears random)

#### Step 2.3: Image URL with Size Optimization
**File:** `app/lib/sanity.ts`

Update the `urlForImage()` function call to include width/height parameters:
```typescript
builder.image(source).width(256).height(256).auto('format').fit('max')
```
The album cover should be fetched at 256x256px for the widget display.

---

### Phase 3: Component Integration

#### Step 3.1: Update NowPlaying Component
**File:** `app/components/now-playing.tsx`

**Convert to async server component:**
1. Remove `'use client'` directive
2. Make the component `async`
3. Fetch 10 random songs using `getRandomSongs()` at the top level
4. Extract the first song as initial state
5. Pass songs array to a new client component wrapper
6. Keep mock fallback data as default initial display

**New Component Structure:**
```
NowPlaying (async server component)
  ├── Fetches songs from Sanity
  ├── Passes songs array to NowPlayingClient

NowPlayingClient (new client component with 'use client')
  ├── Manages song rotation state
  ├── Handles progress animation per song
  ├── Resets progress when song changes
  └── Falls back to mock data if no songs provided
```

**Implementation Details:**
- Initial song: songs[0] from the fetched array
- Song rotation: When progress reaches 100%, advance to next song in array (cycle back to start after last song)
- Duration: Already in seconds, use directly for progress calculation
- Album cover: Use `urlForImage()` with 256x256px optimization
- Error handling: If fetch fails, gracefully fall back to mock data
- Progress reset: Reset progress to 0 and `currentSongIndex` when advancing to next song

#### Step 3.2: Duration Formatting Utility
**File:** `app/lib/utils.ts` (optional)

Add a helper function to convert seconds to M:SS display format:
```typescript
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

This will replace the inline `formatTime()` function in the component.

---

### Phase 4: Testing & Refinement

#### Step 4.1: Create Test Songs in Sanity
- Log into Sanity Studio
- Create at least 10 song entries with all required fields
- Verify duration is stored as seconds (e.g., 245 for 4:05)
- Verify album cover images upload correctly
- Test with various duration lengths

#### Step 4.2: Component Testing
- Hard refresh the page and verify 10 random songs are fetched
- Verify first song displays with correct data
- Test progress animation increments correctly based on duration in seconds
- Test song rotation: when progress reaches 100%, next song displays
- Test looping: after 10th song, cycle back to song 1
- Verify progress bar resets when changing songs
- Test album cover displays at correct size (256x256px)
- Test responsive behavior with various song title/artist lengths
- Test fallback to mock data when Sanity fetch fails

#### Step 4.3: Performance & Edge Cases
- Verify album cover images load quickly (256x256px optimization)
- Test with very long/short song titles
- Test with missing optional fields (spotifyUrl)
- Verify no console errors during rotation

---

## File Modifications Summary

| File | Action | Scope |
|------|--------|-------|
| `studio-jeremiah.dev/schemaTypes/songs.ts` | Create | New file |
| `studio-jeremiah.dev/schemaTypes/index.ts` | Edit | Import and register songs schema |
| `app/lib/sanity.ts` | Edit | Add Song type, songFields fragment, getRandomSongs() function, image URL optimization |
| `app/lib/utils.ts` | Edit | Add formatSecondsToTime() helper |
| `app/components/now-playing.tsx` | Edit | Convert to async server component, split into NowPlaying (server) + NowPlayingClient (client) |
| `app/components/now-playing-client.tsx` | Create | New client component for rotation logic and UI rendering |

---

## Dependencies & Compatibility

- Uses existing Sanity client setup (no new dependencies)
- Uses existing image URL builder
- Compatible with current `SanityImage` type structure
- No changes needed to environment variables (uses existing config)

---

## Success Criteria

- Song data is fetched from Sanity on component render
- Album cover displays correctly with proper aspect ratio
- Progress bar animates based on actual song duration
- Duration displays in M:SS format correctly
- Component handles edge cases gracefully (missing data, invalid format)
- Sanity Studio UI is intuitive for adding/updating songs

---

## Key Implementation Notes

### Song Randomization Strategy
Since Sanity GROQ doesn't support native random sorting, the approach will be:
1. Fetch all songs from Sanity
2. Shuffle the array using Fisher-Yates algorithm in the query function
3. Return first 10 from shuffled array
4. Each page hard refresh generates a new random selection

### Component Communication
- **NowPlaying** (Server): Async component that fetches songs, handles data loading
- **NowPlayingClient** (Client): Manages UI state, progress animation, song rotation
- Props passed: `initialSongs?: Song[]` (with fallback to mock data)

### Progress Animation Logic
```
On each interval (1000ms):
  progress += (1000 / (duration * 1000)) * 100

When progress >= 100:
  - Reset progress to 0
  - Increment currentSongIndex
  - If currentSongIndex >= songs.length: reset to 0 (loop)
  - Update displayed song data
```

---

## Song Skip Feature (IN SCOPE)

### Overview
Users can manually skip to the next song in the rotation using a skip button. When on the last song, skipping loops back to the first song.

### Implementation Details

#### Step 5.1: Add Skip Button to NowPlayingClient Component
**File:** `app/components/now-playing-client.tsx`

**Changes:**
1. Add a skip button in the UI (placed near the playing indicator or progress bar)
2. Button styling: Subtle design matching existing widget aesthetic
3. Button functionality: `onClick` handler that advances `currentSongIndex`
4. Skip logic:
   ```
   const handleSkip = () => {
     const nextIndex = (currentSongIndex + 1) % songs.length
     setCurrentSongIndex(nextIndex)
     setProgress(0)  // Reset progress bar
   }
   ```

#### Step 5.2: Visual Indicators
- Show skip button only when songs data is available (not on fallback/mock data)
- Optional: Add hover effect or tooltip "Skip to next song"
- Button can be a small arrow icon (→) or skip icon

#### Step 5.3: Edge Cases
- When only 1 song exists: Skip button still works, but loops to same song
- Progress state: Resets to 0 when skip is clicked
- Current song state: Updates immediately to next song
- Animation: Progress bar and song info update in real-time

---

## Future Enhancements (Out of Scope)

- Integration with actual Spotify API for real-time playback
- Admin dashboard for managing song queue
- Last.fm or other music service integration
- Song history/recently played list
- Pause/play controls
- Track duration seek bar (scrubbing to different positions)

---

## Implementation Log (Completed)

- Added `songs` schema with required fields, hotspot album art, preview subtitle, and newest-first ordering in `studio-jeremiah.dev/schemaTypes/songs.ts`.
- Registered `songs` in `studio-jeremiah.dev/schemaTypes/index.ts`.
- Added `Song` type, `songFields`, `getRandomSongs()` with Fisher-Yates shuffle, and a 256x256 default image builder in `app/lib/sanity.ts`.
- Added `formatSecondsToTime()` helper in `app/lib/utils.ts`.
- Split now-playing into server + client: `app/components/now-playing.tsx` fetches Sanity data and `app/components/now-playing-client.tsx` handles rotation, progress, and skip UI with a fallback set.

## Git Diff Summary

- `app/components/now-playing.tsx`: converted to async server component that fetches songs and delegates UI to `NowPlayingClient`.
- `app/components/now-playing-client.tsx`: new client component with song rotation, progress timer, skip button, and album art rendering.
- `app/lib/sanity.ts`: added song types, shuffle helper, `getRandomSongs()`, and updated `urlForImage()` defaults.
- `app/lib/utils.ts`: added `formatSecondsToTime()`.
- `studio-jeremiah.dev/schemaTypes/songs.ts`: new Sanity schema.
- `studio-jeremiah.dev/schemaTypes/index.ts`: registered `songs`.

## Senior Code Review

### Findings

- High: Randomization is cached due to `sanityFetch()` default revalidate (60s), so a hard refresh within the cache window will return the same shuffled set. If you want true per-refresh randomness, pass `{revalidate: 0}` or use a no-store fetch specifically for `getRandomSongs()`.
- Medium: `urlForImage()` now hard-caps to 256x256 for every use, which could unintentionally downsize future image call sites that forget to override width/height. Consider introducing a dedicated `urlForNowPlayingImage()` helper or leaving the global builder untouched.
- Low: The schema type name is `songs` (plural) while other document types are singular (`post`, `todo`). This is fine, but if consistency is preferred, consider renaming to `song` and updating the query accordingly.

### Ambiguous Decisions

- Randomization strategy vs caching: `getRandomSongs()` shuffles in-app, but caching means the “random” set is stable for up to 60s. If “hard refresh” randomness is a requirement, revalidate needs adjusting.
- Image sizing: applying the 256x256 default globally simplifies now-playing, but it centralizes a UI-specific concern in a shared helper.
- Skip visibility: skip button only shows for Sanity-backed songs; this is aligned with the plan but could be debated if you want feature parity in fallback mode for demos.

### Testing Notes

- `npm run lint`: warning in `app/components/todo-item.tsx` about unused `id` (pre-existing).
- `npm run build`: success.
- `npm run start`: failed because port 3000 was already in use.
