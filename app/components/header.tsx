import { navigation, siteConfig } from '../config/site'
import { NavLinkComponent } from './ui/nav-link'

export default function Header() {
  return (
    <header className="border-b border-gray-700">
      <nav className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
        <div className="text-lg md:text-xl font-semibold tracking-tight text-white cursor-pointer">{siteConfig.name}</div>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          {navigation.map((link) => (
            <NavLinkComponent key={link.label} {...link} />
          ))}
        </div>
      </nav>
    </header>
  )
}
