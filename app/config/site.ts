export type NavLink = {
  label: string
  href: string
}

export type SocialLink = {
  label: string
  href: string
}

export type ExperienceItem = {
  src: string
  alt: string
}

export type TechItem = string

export const siteConfig = {
  name: "jeremiah.dev",
  title: "Jeremiah | Systems & AI Engineer",
  description: "Student founder building tools for focus, clarity, and impact.",
}

export const navigation: NavLink[] = [
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "Videos", href: "#videos" },
  { label: "Resume", href: "#resume" },
]

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "Email", href: "mailto:hello@jeremiah.dev" },
]

export const experience: ExperienceItem[] = [
  { src: "/logos/sightx.webp", alt: "SightX" },
  { src: "/logos/ai-camp.png", alt: "AI Camp" },
  { src: "/logos/quilia.jpg", alt: "Quilia" },
]

export const techStack: TechItem[] = [
  "Go",
  "Next.js",
  "Node",
  "Redis",
  "Postgres",
  "Supabase",
  "Tailwind",
  "TypeScript",
  "Docker",
  "Vercel",
]
