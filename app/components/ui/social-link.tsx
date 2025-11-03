import { type SocialLink } from '../../config/site'

export function SocialLinkComponent({ label, href }: SocialLink) {
  return (
    <a href={href} className="text-blue-600 hover:text-blue-700 transition-colors">
      {label}
    </a>
  )
}
