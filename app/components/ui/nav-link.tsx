import Link from "next/link"

import { type NavLink } from '../../config/site'

export function NavLinkComponent({ label, href }: NavLink) {
  return (
    <Link
      href={href}
      className="text-gray-300 transition-colors cursor-pointer hover:text-blue-400"
    >
      {label}
    </Link>
  )
}
