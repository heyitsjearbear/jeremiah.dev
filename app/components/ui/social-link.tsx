import { type SocialLink } from '../../config/site'

export function SocialLinkComponent({ label, href }: SocialLink) {
  return (
    <a href={href} className="transition-colors cursor-pointer" style={{ color: "rgb(96, 165, 250)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(147, 197, 253)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(96, 165, 250)"; }}>
      {label}
    </a>
  )
}
