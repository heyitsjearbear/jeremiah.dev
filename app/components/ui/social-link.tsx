import { type SocialLink } from '../../config/site'

export function SocialLinkComponent({ label, href }: SocialLink) {
  const target = href ? '_blank' : undefined
  const rel = target ? 'noopener noreferrer' : undefined

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="text-blue-400 transition-colors cursor-pointer hover:text-blue-300"
    >
      {label}
    </a>
  )
}
