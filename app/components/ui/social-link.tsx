import { type SocialLink } from '../../config/site'
import MagneticElement from '../magnetic-element'

export function SocialLinkComponent({ label, href }: SocialLink) {
  const target = href ? '_blank' : undefined
  const rel = target ? 'noopener noreferrer' : undefined

  return (
    <MagneticElement asChild magneticIntensity={0.3}>
      <a
        href={href}
        target={target}
        rel={rel}
        className="text-blue-400 transition-colors cursor-pointer hover:text-blue-300"
      >
        {label}
      </a>
    </MagneticElement>
  )
}
