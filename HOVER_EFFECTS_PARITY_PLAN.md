# Hover Effects Parity Plan

## Current State

### Hero Buttons Implementation
The two hero buttons ("View Zenergy" and "See Projects") use a sophisticated hover effect system:

**Location:** `app/components/HeroText.tsx` (lines 63-76) and `app/components/hero.tsx` (lines 35-48)

**Components Used:**
1. **MagneticButton Component** (`app/components/magnetic-button.tsx`)
   - **Hover mechanism:** JavaScript-driven magnetic attraction effect
   - **Implementation:** Uses `onMouseMove` to calculate relative cursor position and applies `transform: translate()`
   - **Transition:** `transition-transform duration-300 ease-out` (defined in component line 45)
   - **Effect:** Button text/element moves ~30% of cursor offset distance when hovered, snaps back on mouse leave
   - **Client-side:** Uses `useRef` and React event handlers

2. **Tailwind Classes Applied to Buttons:**
   - **"View Zenergy" (Blue CTA):**
     - Base: `bg-blue-400 text-white px-5 py-2.5 rounded-lg font-medium text-sm inline-block`
     - Hover: `hover:bg-blue-500`
     - Transition: `transition-colors cursor-pointer`
   - **"See Projects" (Outlined Button):**
     - Base: `border border-gray-600 text-gray-200 px-5 py-2.5 rounded-lg font-medium text-sm inline-block`
     - Hover: `hover:border-blue-400 hover:text-blue-400`
     - Transition: `transition-colors cursor-pointer`

**Combined Effect:**
- Magnetic pull toward cursor (JavaScript-based transformation)
- Color transition on hover (Tailwind CSS)
- Smooth timing: 300ms ease-out

---

## Targets

### UI Elements That Should Replicate These Hover Effects

#### 1. **Navigation Links**
- **File:** `app/components/header.tsx` (lines 10-15 and 27-31)
- **File:** `app/components/ui/nav-link.tsx` (lines 14-16)
- **Current hover:** Simple color transition `hover:text-blue-400`
- **Status:** Should include magnetic button effect

#### 2. **Footer Social Links**
- **File:** `app/components/ui/social-link.tsx` (lines 12)
- **Current hover:** `hover:text-blue-300` (slightly different from nav color)
- **Status:** Should include magnetic button effect and color transition

#### 3. **Blog Post Cards**
- **File:** `app/blog/_components/post-card.tsx` (lines 67-70)
- **Current hover:**
  - Border: `hover:border-sky-400/70`
  - Shadow: `hover:shadow-lg hover:shadow-sky-400/10`
  - Image scale: `group-hover:scale-[1.02]`
  - Text color: `group-hover:text-sky-300`
- **Status:** Could benefit from subtle magnetic effect on the card container

#### 4. **Experience Section Logos**
- **File:** `app/components/experience.tsx` (line 24)
- **Current hover:** Border color transition `hover:border-[rgb(147,197,253)]`
- **Status:** Could include magnetic effect

#### 5. **Activity Heatmap (If Interactive)**
- **File:** `app/components/activity-heatmap.tsx`
- **Status:** Check if any click/hover states exist

#### 6. **UI Button Component (shadcn)**
- **File:** `app/components/ui/button.tsx` (lines 7-36)
- **Current hover variants:**
  - `default: 'hover:bg-primary/90'`
  - `destructive: 'hover:bg-destructive/90'`
  - `outline: 'hover:bg-accent'`
  - `secondary: 'hover:bg-secondary/80'`
  - `ghost: 'hover:bg-accent'`
  - `link: 'hover:underline'`
- **Status:** Should have consistent hover pattern; magnetic effect could be optional for buttons vs. links

#### 7. **Header Logo (Brand Name)**
- **File:** `app/components/header.tsx` (line 12)
- **Current hover:** `hover:text-blue-400`
- **Status:** Should include magnetic effect for consistency

---

## Proposed Approach

### Recommended Strategy: **Wrapper Component + Magnetic Button Enhancement**

**Rationale:**
1. The `MagneticButton` component is well-designed and isolated
2. It should be **renamed/generalized** to `MagneticElement` or `HoverMagnet` to reflect that it can wrap more than just links
3. The component is currently limited to `<a>` (anchor) tags; we need to make it flexible (`asChild` prop similar to shadcn Button)
4. Use **class-variance-authority (CVA)** which is already in the codebase (seen in `button.tsx`) to create reusable hover variants
5. Create a **composable hover effect system** that separates:
   - Magnetic motion (JavaScript)
   - Color transitions (Tailwind classes)
   - Additional effects (shadow, scale, etc.)

### Implementation Architecture

#### Option A: Enhance MagneticButton (Recommended)
- Rename to `MagneticElement` (more semantic)
- Add `asChild` prop to support wrapping any element
- Add optional `variant` prop for different magnetic intensities
- Apply consistently to:
  - All navigation links (header, footer)
  - Call-to-action buttons
  - Brand logo
  - Optional: post cards (subtle effect)

#### Option B: Create a Tailwind Utility Class
- Add a custom Tailwind plugin in `globals.css` for the magnetic effect
- Use CSS `@apply` to define reusable hover patterns
- Limitations: CSS transitions alone can't achieve the magnetic pull (requires JS)
- Not recommended unless we use CSS custom properties + houdini

**Decision: Use Option A** - It leverages existing component patterns and maintains the sophisticated hover experience.

---

## Step-by-Step Implementation Plan

### Phase 1: Refactor MagneticButton (Safe, Non-Breaking)
1. **Create wrapper component `MagneticElement`** that can wrap any element
   - File: `app/components/magnetic-element.tsx`
   - Base `MagneticButton` on `MagneticElement` (backward compatible)
   - Props: `asChild`, `children`, `className`, `href`, `target`, `rel`, `magneticIntensity` (default 0.3)

2. **Export both** `MagneticButton` and `MagneticElement` from magnetic module
   - Ensures no breaking changes to existing uses
   - Allows gradual adoption

### Phase 2: Identify Magnetic-Ready Components (No Changes, Just Mapping)
1. Create a list of all interactive elements (links, buttons, cards)
2. Categorize by priority:
   - **P0 (High Impact):** Header nav, header logo, footer social links, CTA buttons
   - **P1 (Medium Impact):** Blog post cards, experience logos
   - **P2 (Nice to have):** Hover effects on modal links, accordion items

### Phase 3: Apply Magnetic Effects (Incremental)
1. **Header Navigation Links** → Wrap with `MagneticElement`
   - File: `app/components/header.tsx`
   - File: `app/components/ui/nav-link.tsx`
   - Test on desktop + mobile (hover vs. touch)

2. **Footer Social Links** → Wrap with `MagneticElement`
   - File: `app/components/ui/social-link.tsx`
   - Adjust color consistency (currently `hover:text-blue-300`, should align with others)

3. **Header Logo** → Wrap with `MagneticElement`
   - File: `app/components/header.tsx` line 10
   - Subtle effect; ensure it doesn't interfere with navigation

4. **Blog Post Cards** (Optional, Light Effect)
   - File: `app/blog/_components/post-card.tsx`
   - Consider: apply magnetic effect to the entire card or just the title
   - Keep subtle (magnetic intensity 0.15?) to avoid jankiness with image scale effect

### Phase 4: Consistency Pass
1. Audit all hover colors
   - Navigation: `hover:text-blue-400` (consistent)
   - Social links: Update `hover:text-blue-300` → `hover:text-blue-400` (for consistency)
   - Blog cards: Using `sky-400` (distinct intentional design—keep it)
   - Buttons: Use existing variants from shadcn Button

2. Test focus states
   - Ensure keyboard navigation still works (`:focus-visible` rings)
   - Magnetic effect should not interfere with `focus-visible` styles

3. Accessibility audit
   - `prefers-reduced-motion`: Disable magnetic effect if user prefers reduced motion
   - Touch devices: Magnetic effect should gracefully degrade (only on mouse)

### Phase 5: Testing & Refinement
1. Cross-browser testing (Chrome, Firefox, Safari)
2. Mobile testing (ensure no magnetic effect on touch)
3. Dark/light mode (if applicable—currently dark mode only)
4. Performance: Ensure the magnetic effect doesn't cause layout thrashing

---

## Verification Checklist

### Pre-Implementation
- [ ] Confirm `MagneticButton` code review (component logic is sound)
- [ ] Verify `asChild` prop pattern is understood (from shadcn Button example)
- [ ] Check browser DevTools for any hover effect edge cases on current buttons

### Component Changes
- [ ] `MagneticElement` created and tested standalone
- [ ] `MagneticButton` refactored to use `MagneticElement` (backward compatible)
- [ ] No breaking changes to existing `MagneticButton` usage in `HeroText` and `hero.tsx`

### Integration Testing
- [ ] Header navigation links have magnetic + color effect
- [ ] Header logo has magnetic effect
- [ ] Footer social links have magnetic + color effect
- [ ] Keyboard focus still works on all wrapped elements
- [ ] `prefers-reduced-motion` disables magnetic effect

### Visual Regression Testing
- [ ] Hero buttons still work identically (no regression)
- [ ] Blog card grid layout unchanged
- [ ] Header layout unchanged (no overflow)
- [ ] Mobile layout works (no magnetic on touch)

### Pages to Check
1. **Home page (`app/page.tsx`):**
   - Hero section buttons (magnetic effect is source of truth)
   - Navigation header
   - Footer links
   - Experience logos (if enhanced)

2. **Blog page (`app/blog/page.tsx`):**
   - Post card hovers
   - Header/footer navigation

3. **Projects page (`app/projects/page.tsx`):**
   - Header/footer navigation

4. **All pages on mobile (iPad/iPhone):**
   - Touch interactions should not trigger magnetic effect
   - Navigation should remain accessible

### Hover/Focus Testing
For each modified element, test:
- [ ] **Hover:** Element responds smoothly, color changes as expected
- [ ] **Focus (Keyboard):** Focus ring visible, no overlap with magnetic effect
- [ ] **Active/Visited:** If applicable, preserved state styling
- [ ] **Reduced Motion:** Magnetic effect disabled, color transitions still work

---

## Definition of Done

A component is considered "hover effect parity complete" when:

1. **Functionality:**
   - Magnetic pull effect mirrors the Hero button implementation (or intentionally differs with documented rationale)
   - Color/style transitions execute smoothly with `transition-colors` or `transition-all`
   - No layout shift or jank during hover

2. **Accessibility:**
   - Focus ring is visible and properly positioned
   - `prefers-reduced-motion` media query respected (magnetic disabled)
   - Touch targets remain at least 44x44px (mobile)

3. **Code Quality:**
   - Component is DRY; no duplicate magnetic logic
   - PropTypes or TypeScript types defined
   - Component accepts optional styling overrides

4. **Testing:**
   - Tested on desktop (Chrome/Firefox/Safari)
   - Tested on mobile (iOS Safari, Chrome Mobile)
   - No visual regressions on existing pages
   - No performance degradation (60fps smooth)

5. **Documentation:**
   - Component exports documented in component file comments
   - Any non-obvious props explained
   - Example usage in component file or Storybook (if used)

---

## Risk Mitigation

### Potential Issues & Mitigations

| Issue | Risk | Mitigation |
|-------|------|-----------|
| **Breaking changes to existing MagneticButton usage** | High | Keep MagneticButton API identical; create MagneticElement as new component; verify hero buttons still work post-refactor |
| **Magnetic effect feels janky on slow devices** | Medium | Implement `requestAnimationFrame` for smooth animations; test on lower-end devices; provide magnetic intensity option |
| **Touch devices trigger unwanted magnetic effect** | High | Explicitly guard `onMouseMove` with `window.matchMedia('(hover: hover)')` check or detect touch vs. mouse |
| **Accessibility: focus rings hidden by magnetic motion** | Medium | Ensure focus ring is positioned outside the element; test with keyboard navigation; use `focus-visible` pseudo-class |
| **Layout shift when applying `transform`** | Low | Using `transform` is GPU-accelerated and doesn't cause layout thrashing; verify with DevTools paint metrics |
| **Dark/light mode colors conflict** | Low | Current site appears to be dark mode only; if light mode added, test color transitions in both modes |
| **Blog card magnetic + scale effect creates jank** | Medium | Either apply subtle magnetic effect (intensity 0.15) or skip cards entirely; decide based on visual testing |

---

## Post-Implementation Checklist

- [ ] All targeted UI elements have magnetic hover effect (or documented why they don't)
- [ ] All existing functionality preserved (no regressions)
- [ ] Accessibility audit passed (focus, reduced-motion, keyboard nav)
- [ ] Performance verified (60fps on Chrome DevTools)
- [ ] Code reviewed by team lead
- [ ] Tests written for new `MagneticElement` component
- [ ] Component documented with usage examples
- [ ] Branch ready for pull request

---

## Timeline Estimate (Removed Per Instructions)
See implementation strategy above for phased approach. Each phase can be completed and tested independently.
