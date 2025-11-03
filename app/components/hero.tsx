import Image from "next/image"

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:gap-12 md:items-center">
        <div className="flex-1 mb-8 md:mb-0">
          <div className="text-blue-600 font-mono text-xs md:text-sm mb-4 md:mb-6">
            // student founder – systems + ai + dev
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight text-balance">
            I build systems that help people think clearly and get more done.
          </h1>

          <p className="text-base md:text-lg mb-8 md:mb-10 max-w-2xl leading-relaxed bg-gradient-to-r from-yellow-500 via-cyan-500 to-pink-500 bg-clip-text text-transparent">
            Founder of Zenergy—tools for focus, habits, and mental clarity. Experience across legal tech (Quilia),
            consumer research platforms (SightX: web dev + QA), and AI Camp (applied AI projects & mentorship).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto">
              View Zenergy
            </button>
            <button className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:border-gray-400 transition-colors w-full sm:w-auto">
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
