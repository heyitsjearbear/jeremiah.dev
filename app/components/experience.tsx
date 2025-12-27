import Image from "next/image"

import { experience } from '../config/site'

export default function Experience() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-gray-400 font-mono text-sm mb-6">{'// experience'}</div>

      <div className="flex gap-8 mb-6 items-center">
        {experience.map((item) => (
          <div
            key={item.alt}
            className="relative w-24 h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-[rgb(96,165,250)] transition-colors hover:border-[rgb(147,197,253)]"
          >
            <Image
              src={item.src || "/placeholder.svg"}
              alt={item.alt}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
