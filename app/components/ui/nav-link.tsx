import { type NavLink } from '../../config/site'

export function NavLinkComponent({ label, href }: NavLink) {
  return (
    <a href={href} className="hover:text-blue-600 transition-colors">
      {label}
    </a>
  )
}
