import { techStack } from '../config/site'
import { TechBadge } from './ui/tech-badge'

export default function TechStack() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="text-gray-400 font-mono text-xs md:text-sm mb-6 md:mb-8">// tech stack</div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {techStack.map((tech) => (
          <TechBadge key={tech} name={tech} />
        ))}
      </div>
    </section>
  )
}
