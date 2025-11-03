import { techStack } from '../config/site'
import { TechBadge } from './ui/tech-badge'

export default function TechStack() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="text-gray-400 font-mono text-xs md:text-sm mb-4 md:mb-6">// tech stack</div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {techStack.map((tech) => (
          <TechBadge key={tech} name={tech} />
        ))}
      </div>
    </section>
  )
}
