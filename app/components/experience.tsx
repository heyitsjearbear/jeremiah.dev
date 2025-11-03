import { experience } from '../config/site'

export default function Experience() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-gray-400 font-mono text-sm mb-8">// experience</div>

      <div className="flex gap-8 mb-8 items-center">
        {experience.map((item) => (
          <div
            key={item.alt}
            className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 cursor-pointer transition-colors"
            style={{ borderColor: "rgb(96, 165, 250)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgb(147, 197, 253)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgb(96, 165, 250)"; }}
          >
            <img src={item.src || "/placeholder.svg"} alt={item.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <p className="text-gray-300 leading-relaxed max-w-2xl">
        Currently onboarding law firms into modern automation systems at Quilia &amp; studying CS at UNLV. Previously
        shift lead at 7 Leaves, robotics program, tutoring underserved students.
      </p>
    </section>
  )
}
