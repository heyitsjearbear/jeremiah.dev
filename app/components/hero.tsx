import Image from "next/image"

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:gap-12 md:items-center">
        <div className="flex-1 mb-8 md:mb-0">
          <div className="font-mono text-xs md:text-sm mb-4 md:mb-6" style={{ color: "rgb(96, 165, 250)" }}>
            // student founder – systems + ai + dev
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight text-balance">
            I build systems that help people think clearly and get more done.
          </h1>

          <p className="text-base md:text-lg mb-8 md:mb-10 max-w-2xl leading-relaxed bg-clip-text text-gray-300">
            Founder of Zenergy—tools for focus, habits, and mental clarity. Experience across legal tech (Quilia),
            consumer research platforms (SightX: web dev + QA), and AI Camp (applied AI projects & mentorship).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button className="text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto cursor-pointer" style={{ backgroundColor: "rgb(96, 165, 250)" }}>
              View Zenergy
            </button>
            <button className="border px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto cursor-pointer text-gray-200" style={{ borderColor: "rgb(107, 114, 128)", }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgb(96, 165, 250)"; e.currentTarget.style.color = "rgb(96, 165, 250)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgb(107, 114, 128)"; e.currentTarget.style.color = "rgb(209, 213, 219)"; }}>
              See Projects
            </button>
          </div>
        </div>

        <div className="flex-1 md:block mt-8 md:mt-0">
          <Image
            src="/jeremiah-headshot.jpg"
            alt="Jeremiah"
            width={400}
            height={500}
            className="rounded-lg object-cover w-full max-w-sm md:max-w-none mx-auto md:mx-0"
            priority
          />
        </div>
      </div>
    </section>
  )
}
