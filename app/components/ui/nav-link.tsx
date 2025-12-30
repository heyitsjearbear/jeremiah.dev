import Link from "next/link"

import { type NavLink } from "../../config/site"
import { cn } from "../../lib/utils"
import MagneticElement from "../magnetic-element"

type NavLinkProps = NavLink & {
  className?: string
}

export function NavLinkComponent({ label, href, className }: NavLinkProps) {
  return (
    <MagneticElement asChild magneticIntensity={0.3}>
      <Link
        href={href}
        className={cn(
          "text-gray-300 transition-colors cursor-pointer hover:text-blue-400",
          className,
        )}
      >
        {label}
      </Link>
    </MagneticElement>
  )
}
