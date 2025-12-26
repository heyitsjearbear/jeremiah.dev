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
  title: "Jeremiah Ramiscal",
  description: "Student founder building tools for focus, clarity, and impact.",
}

export const navigation: NavLink[] = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Videos", href: "/videos" },
  { label: "Resume", href: "/resume" },
]

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/heyitsjearbear" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jeremiah-ramiscal/" },
  { label: "YouTube", href: "https://www.youtube.com/@heyitsjearbear"},
  { label: "Email", href: "" },
]

export const experience: ExperienceItem[] = [
  { src: "/logos/sightx.webp", alt: "SightX" },
  { src: "/logos/ai-camp.png", alt: "AI Camp" },
  { src: "/logos/quilia.jpg", alt: "Quilia" },
  { src: "/logos/mofloai_logo.png", alt: "MofloAI" },
]

export const techStack: TechItem[] = [
  "Next.js",
  "Postgres",
  "Supabase",
  "Tailwind",
  "TypeScript",
  "Vercel",
]
