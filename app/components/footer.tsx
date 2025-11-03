import { socialLinks } from '../config/site'
import { SocialLinkComponent } from './ui/social-link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 mt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div className="text-gray-500 text-xs md:text-sm text-center md:text-left">
            © 2025 Jeremiah. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-sm font-medium">
            {socialLinks.map((link) => (
              <SocialLinkComponent key={link.label} {...link} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
