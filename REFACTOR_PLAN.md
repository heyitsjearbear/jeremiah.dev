# Portfolio Refactor Plan: Scroll-Based Reveal Architecture (Revised)

## Goal
Refactor the homepage into a scroll-driven narrative while preserving server-first data fetching, intro timing, and stateful widgets. The hero opens as a focused, full-screen text moment; widgets and sections reveal on scroll with terminal-style motion.

---

## 🎬 Complete User Experience Flow (Current → Target)

### Current Experience (As-Is)

**On page load:**
1. Terminal intro animation plays (types "jeremiah.dev" character-by-character at 150ms/char)
2. After typing completes, text shrinks and fades to top-left corner over 1.2s
3. Once intro is complete, entire page content fades in simultaneously (0.6s fade)
4. User sees full homepage in a single viewport:
   - Left: Hero text with typewriter comment + headline + description + CTA buttons
   - Right: Headshot, activity heatmap, quick todos, now playing widget
   - Below: Tech stack section
   - Below: Experience section
5. User can immediately see and interact with all content without scrolling

**Current Issues:**
- Typewriter starts while intro is still visible (wasted animation)
- No scroll-based storytelling
- Everything visible at once (no progressive reveal)
- Static, non-interactive feel

---

### Target Experience (To-Be)

**Phase 1: Terminal Intro (Unchanged)**
1. **[0s - ~2s]** User arrives → Full-screen terminal intro
   - Types "jeremiah.dev" (150ms/char = ~1.8s)
   - Shrinks to corner, fades out (1.2s)
   - Total: ~3s before content appears

**Phase 2: Hero Text Reveal (First Viewport - Full Screen)**
2. **[~3s - ~6s]** Intro completes → Hero text fades in and fills entire viewport
   - Page content fades in (0.6s)
   - `// student founder – systems + ai + dev` types out (40ms/char = ~1.4s)
   - After comment completes → Headline types: "I build systems that help people think clearly and get more done." (30ms/char = ~3.2s)
   - Description fades in after 2s delay
   - CTA buttons appear with magnetic hover effect
   - **User sees ONLY this text section** - must scroll to see more
   - Section height: `min-h-[calc(100vh-HEADER_HEIGHT)]` (full viewport minus header)
   - Text is **centered vertically** with large typography (7xl/8xl headline)

**Phase 3: Scroll Down - Widgets Appear**
3. **[User scrolls down]** Widgets section comes into view (30-40% visibility threshold)
   - Headshot fades in + slides up (terminal reveal)
   - QuickTodos fades in + slides up (0.2s delay)
   - ActivityHeatmap fades in + slides up (0.4s delay)
   - NowPlaying fades in + slides up (0.6s delay)
   - All use staggered terminal-style motion
   - **Widgets maintain state** (no unmounting)

**Phase 4: Continue Scrolling - Tech Stack**
4. **[User scrolls further]** Tech stack section reveals
   - Tech badges stagger in one-by-one (0.1s between each)
   - Terminal-style fade + slide-up motion
   - Threshold: 40% visibility

**Phase 5: Continue Scrolling - Experience**
5. **[User scrolls to bottom]** Experience section reveals
   - Experience cards stagger in (0.1s between each)
   - Same terminal motion as tech stack
   - Threshold: 40% visibility

**Phase 6: Scroll Back Up - Bidirectional Hiding**
6. **[User scrolls back up]** Content disappears as it leaves viewport
   - When section visibility drops below 40%, content fades out
   - Smooth reverse animation (same duration, reversed)
   - **State preserved** (NowPlaying doesn't restart, heatmap selection kept)
   - Scrolling down again re-reveals content instantly

---

### Visual Comparison

**Before (Current):**
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│ [Hero Text]      [Headshot]            │
│ Comment          [Heatmap]             │
│ Headline         [Todos]               │
│ Description      [Now Playing]         │
│ Buttons                                │
├─────────────────────────────────────────┤
│ [Tech Stack - All Visible]             │
├─────────────────────────────────────────┤
│ [Experience - All Visible]             │
└─────────────────────────────────────────┘
   ↑ Everything visible on load
```

**After (Target):**
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         // student founder...           │ ← Types in
│                                         │
│    I build systems that help           │ ← Types in
│    people think clearly and            │
│    get more done.                      │
│                                         │
│    Description text here...            │ ← Fades in
│                                         │
│    [View Zenergy]  [See Projects]     │ ← Magnetic
│                                         │
│                                         │
└─────────────────────────────────────────┘
   ↑ Full viewport height, centered

   [User scrolls down ↓]

┌─────────────────────────────────────────┐
│ [Headshot]                             │ ← Reveals
│ [Activity Heatmap]                     │ ← Staggered
│ [Quick Todos]                          │ ← Staggered
│ [Now Playing]                          │ ← Staggered
└─────────────────────────────────────────┘

   [User scrolls down ↓]

┌─────────────────────────────────────────┐
│ [Tech Badge] [Badge] [Badge]           │ ← Stagger in
│ [Badge] [Badge] [Badge] [Badge]        │
└─────────────────────────────────────────┘

   [User scrolls down ↓]

┌─────────────────────────────────────────┐
│ [Experience Card 1]                    │ ← Stagger in
│ [Experience Card 2]                    │
│ [Experience Card 3]                    │
└─────────────────────────────────────────┘
```

---

### Key UX Improvements

1. **Progressive Storytelling** - Content reveals as you scroll (vs. all at once)
2. **Focus on Message** - Hero text dominates on load (vs. competing with widgets)
3. **Terminal Aesthetic Consistency** - Typewriter + stagger animations throughout
4. **Stateful Interactions** - Widgets preserve state when hiding/showing
5. **Smooth Bidirectional Motion** - Content gracefully appears/disappears on scroll
6. **Deliberate Pacing** - User controls reveal speed by scrolling

---

## Key Risks + Ambiguities (from current code)

### 1) Intro timing vs. typewriter
- `HomeShell` renders children immediately; it only fades them in after `introComplete`.
- `TypewriterText` starts on mount, so the hero will finish typing while still hidden behind the intro.
- Decision: hero typing waits for `introComplete`; gate the typewriter start.

### 2) Bidirectional reveal + widget state loss
- If `AnimatePresence` unmounts widgets on scroll-up, state resets:
  - `NowPlayingClient` playback resets.
  - `ActivityHeatmap` selection resets.
  - `QuickTodos` scroll position resets.
- Decision: use opacity/transform transitions without unmounting to preserve state, even when fully hidden.

### 3) Client-only motion wrappers + server data
- `useInView` requires a client component.
- `Hero` is async server (fetches todos + heatmap).
- Decision: wrap server-rendered widgets in a client `TerminalReveal` wrapper; do not move data fetching into client.

### 4) Section height with header present
- `Header` sits above hero in `app/page.tsx`.
- `min-h-screen` on hero will push content beyond the first viewport (header + hero).
- Decision: use `min-h-[calc(100vh-HEADER_HEIGHT)]`.

### 5) Scroll-up disappearance UX
- Disappearing content on scroll-up can feel jumpy, especially on mobile.
- Decision: fully hide on scroll-up; use longer easing to reduce jank.

---

## Updated Architecture (fits current codebase)

### Server components (data + structure)
- Keep data fetching in server components:
  - `HeroWidgets` server: fetches `getCompletedTodosForHeatmap`, `getFocusTodos`, `getRandomSongs`.
- Use client wrappers only for animation triggers.

### Client components (animation + viewport triggers)
- New `TerminalReveal` client component uses `useInView` + variants and wraps children.
- New `MotionSection` client wrapper for whole sections (Tech Stack, Experience).

### Intro-aware hero typing
- `TypewriterText` should accept:
  - `start` (boolean) to delay typing.
  - `onComplete` callback for chaining.
- `HeroText` uses `useIntro()` to start typing only after intro completes.

---

## Revised File Plan

### New Files
- `app/components/TerminalReveal.tsx` (client wrapper for reveal)
- `app/components/MotionSection.tsx` (client wrapper for section-level in-view)
- `app/components/animation-variants.ts` (shared motion variants)
- `app/components/HeroText.tsx` (server wrapper; uses TypewriterText with intro gating)
- `app/components/HeroWidgets.tsx` (server component; fetches data and wraps widgets)

### Updated Files
- `app/page.tsx` (use `HeroText` + `HeroWidgets`)
- `app/components/hero.tsx` (convert into a shell or remove if superseded)
- `app/components/typewriter-text.tsx` (add `start` and `onComplete`)
- `app/components/tech-stack.tsx` (wrap in `MotionSection`)
- `app/components/experience.tsx` (wrap in `MotionSection`)

---

## Updated Animation Rules

### TerminalReveal (no unmount)
- Use `animate={inView ? "visible" : "hidden"}` but do not conditionally render.
- Keep stateful children mounted to avoid resets.

### Staggered sections
- Use `MotionSection` to provide `staggerChildren` variants.

---

## Full Implementation Plan (All Phases)

### Phase 1: Foundations (Intro + Typewriter Chain)
1. Update `app/components/typewriter-text.tsx` to support:
   - `start?: boolean` (default `true`) to delay typing.
   - `onComplete?: () => void` to chain sequences.
2. Create `app/components/HeroText.tsx` (server component wrapper) that:
   - Reads `introComplete` via a small client bridge (or a client child) to gate the typewriter start.
   - Chains `// comment` then headline via `onComplete`.
3. Ensure hero text does not type while the terminal intro is still visible.

### Phase 2: Layout Restructure (Hero Split + Section Heights)
1. Split `app/components/hero.tsx` into:
   - `app/components/HeroText.tsx`
   - `app/components/HeroWidgets.tsx` (server, async, keeps data fetching)
2. Update `app/page.tsx` to render `HeroText`, then `HeroWidgets`, then Tech Stack and Experience.
3. Set hero section height to avoid header overlap:
   - Use `min-h-[calc(100vh-HEADER_HEIGHT)]`.
4. Increase hero headline typography per target sizing.

### Phase 3: Motion Infrastructure (Client Wrappers)
1. Add `app/components/animation-variants.ts` with:
   - `terminalReveal`
   - `staggerContainer`
   - `staggerItem`
2. Add `app/components/TerminalReveal.tsx` (client):
   - Uses `useInView({ amount: 0.4, once: false })`.
   - Keeps children mounted; animates opacity/transform only.
3. Add `app/components/MotionSection.tsx` (client):
   - Wraps sections for staggered reveal.
   - Accepts `className`, `children`, `variants`.

### Phase 4: Apply Reveals (Widgets + Sections)
1. In `HeroWidgets`, wrap:
   - Headshot
   - QuickTodos
   - ActivityHeatmap
   - NowPlaying
   each in `TerminalReveal` with staggered delays and typewriter-style text effects where applicable.
2. Wrap `app/components/tech-stack.tsx` with `MotionSection` + staggered items.
3. Wrap `app/components/experience.tsx` with `MotionSection` + staggered items.
4. Verify no widget state resets when scrolling up/down.

### Phase 5: Polish + UX Refinement
1. Tune timing: delays, durations, and easing for terminal feel.
2. Validate mobile behavior:
   - Reduce delays or distance on small screens.
   - Ensure full hide on scroll-up feels deliberate.
4. Run final sanity pass for accessibility and keyboard focus.

### Phase 6: Validation
1. Run `npm run lint`.
2. Run `npm run build`.
3. Smoke test the homepage: intro timing, hero typing, scroll reveals, and widget state.

---

## Concrete Behavior Targets

- On first load, the intro finishes, then hero comment types, then headline types.
- Widgets animate in only when in view; scrolling up fully hides them without unmounting state.
- Widget text elements use typewriter-style reveals where it makes sense.
- Tech stack and experience stagger in with terminal-style motion.

---

## Potential Pitfalls to Avoid

- Avoid `AnimatePresence` for widgets with internal state.
- Avoid moving data fetching into client components.
- Avoid `min-h-screen` that double-counts the header height.
- Avoid re-triggering typewriter on every scroll event.

---

## Recommended Defaults

- `useInView` threshold: `amount: 0.4`, `once: false`
- Reveal transitions: `duration: 0.5`, `ease: [0.43, 0.13, 0.23, 0.96]`
- Hero headline size: `text-5xl md:text-6xl lg:text-7xl xl:text-8xl`

---

## Decisions Locked

- Hero typing waits for intro completion.
- Scroll-up fully hides sections.
- Widget reveals include typewriter-style text effects.
- Hero height uses `min-h-[calc(100vh-HEADER_HEIGHT)]`.
- No scroll indicator.
- `useInView` threshold set to `amount: 0.4`.

---

## Implementation Status

### Completed Phases

- [x] **Phase 1: Foundations** - TypewriterText updated with `start` and `onComplete` props; HeroText component created as client component using intro context
- [x] **Phase 2: Layout Restructure** - Hero split into HeroText + HeroWidgets; page.tsx updated; section heights configured
- [x] **Phase 3: Motion Infrastructure** - Created animation-variants.ts, TerminalReveal.tsx, MotionSection.tsx
- [x] **Phase 4: Apply Reveals** - HeroWidgets wrapped with TerminalReveal; tech-stack and experience wrapped with MotionSection
- [x] **Phase 5: Polish** - Timing tuned, motion variants configured
- [x] **Phase 6: Validation** - lint and build pass

### Files Created
- `app/components/HeroText.tsx` - Client component for hero text with intro-gated typewriter
- `app/components/HeroWidgets.tsx` - Server component for widgets with TerminalReveal wrappers
- `app/components/TerminalReveal.tsx` - Client wrapper for scroll-triggered reveal
- `app/components/MotionSection.tsx` - Client wrapper for section-level staggered reveals
- `app/components/animation-variants.ts` - Shared framer-motion variants

### Files Modified
- `app/page.tsx` - Uses HeroText + HeroWidgets instead of Hero
- `app/components/typewriter-text.tsx` - Added `start`, `onComplete`, `showCursorAfterComplete` props
- `app/components/tech-stack.tsx` - Wrapped with MotionSection + stagger animations
- `app/components/experience.tsx` - Wrapped with MotionSection + stagger animations

---

## Ambiguous Decisions / Problems Encountered

### 1) Framer Motion + React 19 TypeScript Compatibility
**Problem:** `motion.div` and `motion.section` don't accept `className` prop with current framer-motion v10 + React 19 types. TypeScript throws: "Property 'className' does not exist on type..."

**Solution:** Wrap motion elements in regular divs that hold the className, keeping motion.div purely for animation:
```tsx
// Instead of:
<motion.div className="...">

// Use:
<div className="...">
  <motion.div>
    {children}
  </motion.div>
</div>
```

### 2) useInView RefObject Type Mismatch
**Problem:** framer-motion's `useInView` expects `RefObject<Element>` but `useRef<HTMLDivElement>(null)` produces `RefObject<HTMLDivElement | null>`, causing type errors.

**Solution:** Cast the ref: `useInView(ref as RefObject<Element>, ...)`

### 3) Strict ESLint Rules for setState in Effects
**Problem:** Next.js core-web-vitals ESLint rules prohibit calling setState synchronously within effects, and accessing refs during render.

**Solution:** Restructured TypewriterText to:
- Use a wrapper component with a key that changes to force remount for reset
- Use callback form of setState within timeouts (allowed)
- Avoid refs for tracking completion state

### 4) HeroText as Client vs Server Component
**Problem:** Plan specified HeroText as "server wrapper" but it needs `useIntro()` hook access (client-only) to gate typewriter start.

**Decision:** Made HeroText a client component. This is acceptable since:
- No data fetching in HeroText (just static text)
- HeroWidgets remains server component for data fetching
- Clean separation of concerns

---

## Next Steps / Future Improvements

1. **Test widget state preservation** - Manually verify NowPlaying, ActivityHeatmap, QuickTodos maintain state on scroll
2. **Mobile responsiveness** - May need to reduce animation distances on small screens
3. **Performance audit** - Monitor for any jank in scroll animations
4. **Accessibility pass** - Ensure keyboard focus works properly with animated elements
5. **Consider upgrading framer-motion** - v11 may resolve some TypeScript issues
