# Resume Route Removal Plan

## Summary

The resume route (`/resume`) is currently a **coming-soon placeholder page** that displays:
- Title: "Resume"
- Description: "A refreshed resume and media kit will live here."

The route is fully functional but serves no content—it's a stub awaiting future implementation. Removing it involves:
1. Deleting the route directory and page file
2. Removing the navigation link from the site config
3. Removing references from documentation/PRD
4. Ensuring no internal links remain

---

## Exact File Paths Found (Grouped by Type)

### 🔀 Routes & Pages
- `app/resume/page.tsx` — The main resume page (currently using ComingSoonPage component)

### 🧭 Navigation & Configuration
- `app/config/site.ts` — **Line 29**: Resume link in navigation array
  ```typescript
  { label: "Resume", href: "/resume" },
  ```

### 📄 Documentation & PRD
- `PRD.md` — Multiple mentions:
  - Line 12: Table row listing `/resume` | PDF download + inline version
  - Line 248: Section heading "# 📄 **Resume Page**"
  - Line 290: Example route `/resume`
  - Line 157: HTML link example `<a href="/resume">Resume</a>`
- `AGENTS.md` — Line 26: Mention of "Resume" in core data flows description

### ✅ Shared Components (NOT resume-specific, reused by other coming-soon pages)
- `app/components/coming-soon-page.tsx` — Shared wrapper component used by:
  - `/projects` (uses ComingSoonPage)
  - `/videos` (uses ComingSoonPage)
  - `/resume` (uses ComingSoonPage) ← to be removed
- `app/components/coming-soon.tsx` — Shared coming-soon UI

### 🎨 Layout & Header
- `app/components/header.tsx` — Dynamically renders navigation links from config (no hard-coded resume link)

### ⚙️ No Resume-Specific Build/Deploy Config Found
- Searched: `next.config.ts`, `package.json` — No resume-specific entries

### ✅ No Tests Found
- Repository has no test files (`.test.ts`, `.spec.ts`, `__tests__/`)

### ✅ No API Routes Found
- Resume route has no associated API endpoints (`app/api/resume/`)

### ✅ No CMS/Sanity References
- No CMS content specifically for resume

---

## Safe Deletion & Refactor Plan (Ordered Steps)

### Phase 1: Remove Navigation Link (Safe, Low Risk)
**Step 1.1** — Edit `app/config/site.ts`
- Remove line 29: `{ label: "Resume", href: "/resume" },`
- This immediately removes the Resume link from header (desktop & mobile)
- **Impact**: Users cannot navigate to `/resume` via UI; direct URL still works temporarily

### Phase 2: Delete Route (Safe, No Cascading Dependencies)
**Step 2.1** — Delete `app/resume/` directory
- Contains only `page.tsx` (no sub-routes or special files)
- No other code imports from this directory
- `coming-soon-page.tsx` remains (used by projects & videos)
- **Impact**: Visiting `/resume` returns 404 (Next.js standard behavior)

### Phase 3: Clean Up Documentation (Safe, No Functional Impact)
**Step 3.1** — Edit `PRD.md`
- Delete line 12: Table row for resume
- Delete lines 248-290: Entire "Resume Page" section
- Delete line 157: HTML link example (if part of a general examples section) or update context if it's in a broader discussion
- Keep overall structure/heading changes minimal

**Step 3.2** — Edit `AGENTS.md`
- Line 26: Modify "plus static Resume/About/Projects copy" → "plus static About/Projects copy"
- Or remove "Resume" mention if it's in a list

### Phase 4: Verify No Orphaned Code
**Step 4.1** — Confirm `coming-soon-page.tsx` and `coming-soon.tsx` are still used
- These components are reused by `/projects` and `/videos`
- **Do NOT delete them**

---

## Potential Risks & Regression Testing

### Risk 1: Broken External Links (SEO/UX)
- **Scenario**: If `/resume` was indexed by search engines or shared externally
- **Mitigation**: Consider adding a redirect rule in `next.config.ts` or a catch-all 404 handler
- **Verification**:
  - Search: `grep -r "\/resume" .` after deletion to ensure no links remain
  - Manually visit `/resume` → should see Next.js 404 page

### Risk 2: Header Navigation Breaks
- **Scenario**: Header component fails to render after removing resume from config
- **Mitigation**: Header.tsx dynamically maps over `navigation` array—removing an item is safe
- **Verification**:
  - Build: `npm run build` (should succeed)
  - Dev: `npm run dev` → Visit home page, check header renders all 3 remaining links (Projects, Blog, Videos)
  - Mobile & desktop views

### Risk 3: Hardcoded References Missed
- **Scenario**: A component or config somewhere else hard-codes `/resume`
- **Mitigation**: Comprehensive grep search performed during investigation
- **Verification**:
  - `grep -r "resume\|Resume\|/resume" app/` (should return 0 results)
  - `grep -r "resume\|Resume\|/resume" *.json *.ts *.js` (should return 0 results)
  - Build check: `npm run build` (must succeed with no errors/warnings about missing routes)

### Risk 4: Build Failures
- **Scenario**: Deleting the directory causes import/reference errors
- **Mitigation**: `/resume` has no incoming imports (verified via grep)
- **Verification**:
  - `npm run build` → must complete with exit code 0
  - `npm run lint` → must pass (no ESLint errors on remaining code)

### Risk 5: User Expectations
- **Scenario**: Users bookmarked or expect the resume page to exist
- **Mitigation**: This is a placeholder with no actual content, so impact is minimal
- **Verification**: No action needed (informational only)

---

## Definition of Done Checklist

### Code Changes Complete
- [ ] `app/resume/` directory deleted
- [ ] `app/config/site.ts` updated (resume link removed)
- [ ] `PRD.md` updated (resume sections removed)
- [ ] `AGENTS.md` updated (resume mention removed)

### Build & Lint Passing
- [ ] `npm run build` succeeds (no errors, no warnings)
- [ ] `npm run lint` succeeds (no errors, no warnings)
- [ ] No broken imports or references

### Verification Steps Completed
- [ ] `grep -r "resume\|Resume\|/resume" app/` returns 0 results
- [ ] `grep -r "resume\|Resume\|/resume" *.ts *.js *.json` returns 0 results (excluding node_modules/package-lock.json)
- [ ] Manual local test: `npm run dev` → Visit `/resume` → Returns Next.js 404
- [ ] Manual local test: Header navigation displays 3 links (Projects, Blog, Videos) with no Resume link
- [ ] Both desktop & mobile header views confirmed

### No Orphaned Code
- [ ] `app/components/coming-soon-page.tsx` still used by `/projects` and `/videos` (do not delete)
- [ ] `app/components/coming-soon.tsx` still used by coming-soon-page (do not delete)

### Git Commit Ready
- [ ] All changes staged: `git add .`
- [ ] Commit message: `chore: remove resume route placeholder`
- [ ] Branch: `chore/remove-resume-route`

---

## Notes for Implementation

1. **Execution Order**: Follow Phase 1 → Phase 2 → Phase 3 → Phase 4 strictly
2. **No Redirects**: Since the page is a placeholder with no real content, no redirect is needed (404 is appropriate)
3. **Shared Components**: Keep `coming-soon-page.tsx` and `coming-soon.tsx`—they're used elsewhere
4. **Documentation**: Be thorough with PRD/AGENTS cleanup so future developers don't discover stale references
5. **Build Check**: Always run `npm run build` after each major phase to catch issues early
