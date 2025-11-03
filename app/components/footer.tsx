import { socialLinks } from '../config/site'
import { SocialLinkComponent } from './ui/social-link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-6 mb-6 text-sm font-medium">
          {socialLinks.map((link) => (
            <SocialLinkComponent key={link.label} {...link} />
          ))}
        </div>

        <div className="text-gray-500 text-sm">© 2025 Jeremiah. All rights reserved.</div>
      </div>
    </footer>
  )
}
