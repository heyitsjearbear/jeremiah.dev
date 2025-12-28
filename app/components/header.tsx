import Link from "next/link"

import { navigation, siteConfig } from '../config/site'
import { NavLinkComponent } from './ui/nav-link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-700 bg-gray-900/60 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg md:text-xl font-semibold tracking-tight text-white cursor-pointer hover:text-blue-400 transition-colors"
        >
          {siteConfig.name}
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          {navigation.map((link) => (
            <NavLinkComponent key={link.label} {...link} />
          ))}
        </div>
      </nav>

      <div className="md:hidden border-t border-gray-700/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          {navigation.map((link) => (
            <NavLinkComponent
              key={`mobile-${link.label}`}
              {...link}
              className="text-gray-300/90 hover:text-blue-400"
            />
          ))}
        </div>
      </div>
    </header>
  )
}
