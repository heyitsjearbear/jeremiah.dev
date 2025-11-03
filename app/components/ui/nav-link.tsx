import { type NavLink } from '../../config/site'

export function NavLinkComponent({ label, href }: NavLink) {
  return (
    <a href={href} className="text-gray-300 transition-colors cursor-pointer" onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(96, 165, 250)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(209, 213, 219)"; }}>
      {label}
    </a>
  )
}
