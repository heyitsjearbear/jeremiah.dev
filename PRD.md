# Portfolio Website Plan

## 🌐 **Top-Level Pages**

| Page | Purpose |
| --- | --- |
| **/** (Home) | Who you are, skills, experience, mission |
| **/projects** | Highlight Zenergy + other projects |
| **/projects/zenergy** | Deep dive w/ architecture, commits, repo activity |
| **/blog** | Pull long-form posts from Sanity (live preview + ISR) |
| **/videos** | Pull YouTube dev videos / playlists |
| **/contact** | Simple contact info + social links |

Optional future pages:

- `/now` (what you're working on)
- `/activity` (live dev activity — later)

---

# 🏠 **Home Page Content**

### Sections

- Hero line
- Headshot (or simple avatar)
- Skills + tech logos (Next.js, Go, Redis, Supabase, Tailwind)
- Work experience logos
- Featured project CTA: “See Zenergy”
- Social / links row
- Footer

**Tone: calm engineering confidence**

![6102bdc8-8fd8-403a-8cd6-cb1d80d67a48.png](6102bdc8-8fd8-403a-8cd6-cb1d80d67a48.png)

### 🎬 About Your Animation Request

> “When the site loads, show a terminal typing jeremiah.dev, then it animates up to the logo, then the site fades in.”
> 

This is *chef’s kiss*.

Flow:

1. Page loads — background stays blank or dim
2. A terminal pops up in center
3. Typing animation: `jeremiah.dev`
4. After typing finishes:
    - Terminal shrinks & slides to **top-left**
    - It becomes the header logo text
5. Rest of homepage fades in behind it

Result → **hack-startup cinematic intro vibe**.

---

### ✅ Rough Animation Blueprint (how it behaves)

Imagine this sequence:

```
[ Fade In Black Overlay ]
         ↓
+---------------------+
| ▋ typing: jeremiah.dev |
+---------------------+
         ↓
[ shrink + slide to top-left ]
         ↓
[ UI fades in smoothly ]

```

Duration: ~1.8 seconds

Feel: **cyber-clean, not gimmicky**

---

### 🧠 Tech to build this

| Feature | Tech |
| --- | --- |
| Typing effect | JavaScript / React utility OR Framer Motion typed effect |
| Terminal animation | Tailwind + Framer Motion |
| Slide & shrink | Framer Motion (scale + translate) |
| Fade in UI | Framer Motion / Tailwind delay classes |

---

### 🧩 Code Mock (Next.js + Tailwind + Framer Motion)

> This is a concept skeleton — not full production yet, but shows how it works.
> 

**`app/page.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [showUI, setShowUI] = useState(false);
  const [text, setText] = useState("");
  const fullText = "jeremiah.dev";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowUI(true), 500);
      }
    }, 100);
  }, []);

  return (
    <main className="min-h-screen bg-white">

      {/* Terminal Typing Intro */}
      {!showUI && (
        <motion.divinitial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
        >
          <motion.divinitial={{ scale: 1 }}
            animate={{ scale: 0.35, x: "-42vw", y: "-42vh" }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 1 }}
            className="bg-black text-green-400 font-mono px-6 py-4 rounded-lg border border-green-400 shadow-lg"
          >
            <span>{text}</span>
            <span className="animate-pulse">▋</span>
          </motion.div>
        </motion.div>
      )}

      {/* Actual Site UI */}
      <motion.divinitial={{ opacity: 0 }}
        animate={{ opacity: showUI ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className={showUI ? "block" : "hidden"}
      >
        {/* Navbar */}
        <nav className="px-8 py-6 flex justify-between items-center">
          <div className="font-mono text-xl font-bold text-neutral-900">
            jeremiah<span className="text-blue-600">.dev</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/projects">Projects</a>
            <a href="/blog">Blog</a>
            <a href="/videos">Videos</a>
          </div>
        </nav>

        {/* Hero (placeholder) */}
        <section className="px-8 pt-24">
          <h1 className="text-5xl font-bold">Welcome to my world.</h1>
        </section>
      </motion.div>
    </main>
  );
}

```

---

# 🚀 **Projects Page**

## Featured Project — **Zenergy**

- Logo + description
- Architecture preview (small)
- “View full case study → /zenergy”
- Tech stack badges
- Demo video button
- Commit summary section

## Other Projects

Grid cards with:

- Title
- Short description
- Tech badges
- Demo + GitHub links (if public)

---

# 🤯 **Zenergy Case Study Page**

### Sections

| Part | Content |
| --- | --- |
| Teaser | What Zenergy is in 2–3 sentences |
| Vision | Why you're building it |
| Architecture | System diagram |
| Tech stack | Go, Redis, Supabase, Vercel, Next.js |
| Key features | Bullet breakdown |
| Dev activity | ✅ GitHub commit feed ✅ heatmap |
| Video demo | Embed or Loom |
| Future roadmap | Next features |
| Access button | “Request private repo access” |

---

# ✍️ **Blog Page**

- Feed pulls from **Sanity Studio** via GROQ helpers (`getPublishedPosts`) with ISR + webhook-driven revalidation
- Portable Text rendering with custom serializers for code blocks, embeds, responsive cover imagery
- Preview pane in Studio mirrors site styling before publish
- Env: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_WEBHOOK_SECRET`
- Posts include:
    - system breakdowns
    - Zenergy dev logs
    - learning Go
    - productivity + cognitive performance topics

**This makes you look thoughtful + capable.**

---

# 🎬 **Videos Page (/videos)**

### Fetch from YouTube API ([https://developers.google.com/youtube/v3/docs/videos](https://developers.google.com/youtube/v3/docs/videos))

- Displays:
    - newest videos
    - thumbnails + titles
    - view on YouTube button

Content ideas:

- “Building a habit engine in Go”
- “Event-driven architecture for students”
- “Why I built my own orchestrator”
- short dev logs + semester balance content

---

# ✉️ **Contact Page**

- Email link
- LinkedIn
- GitHub
- (Optional) contact form later

---

# ⚙️ **Tech Stack**

| Part | Tools |
| --- | --- |
| Framework | Next.js (App Router) |
| Styling | TailwindCSS |
| Content | Sanity Studio + @sanity/client |
| Activity | GitHub API (private repo metadata) |
| Videos | YouTube API |
| Hosting | Vercel |
| Analytics | Vercel or Plausible |

> No DB needed — lean + fast.
> 

---

# 📁 **Folder Structure**

```
/app
  /page.tsx         (home)
  /projects
	  /zenergy
  /blog
  /videos
  /contact
/components
  navbar, footer, cards, heatmap, commit-feed
/lib
  github.ts
  sanity.ts
  youtube.ts
/public
  logos, headshot

```
