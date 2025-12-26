import Image from "next/image"
import Link from "next/link"
import ActivityHeatmap from "./activity-heatmap"
import QuickTodos from "./quick-todos"
import NowPlaying from "./now-playing"

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:gap-12 md:items-center">
        <div className="flex-1 mb-6 md:mb-0">
          <div className="font-mono text-xs md:text-sm mb-3 md:mb-4" style={{ color: "rgb(96, 165, 250)" }}>
            {'// student founder – systems + ai + dev'}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight text-balance">
            I build systems that help people think clearly and get more done.
          </h1>

          <p className="text-base md:text-lg mb-6 md:mb-8 max-w-2xl leading-relaxed bg-clip-text text-gray-300">
            Founder of Zenergy—tools for focus, habits, and mental clarity. Experience across legal tech (Quilia),
            consumer research platforms (SightX: web dev + QA), and AI Camp (applied AI projects & mentorship).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <a
              href="https://zenergy-ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto cursor-pointer bg-blue-400 hover:bg-blue-500"
            >
              View Zenergy
            </a>
            <Link
              href="/projects"
              className="border border-gray-600 px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto cursor-pointer text-gray-200 hover:border-blue-400 hover:text-blue-400"
            >
              See Projects
            </Link>
          </div>
        </div>

        <div className="flex-1 md:block mt-6 md:mt-0 space-y-6">
          <Image
            src="/jeremiah-headshot.jpg"
            alt="Jeremiah"
            width={400}
            height={500}
            className="rounded-lg object-cover w-full max-w-sm md:max-w-none mx-auto md:mx-0"
            priority
          />

          <div className="w-full max-w-sm md:max-w-none mx-auto md:mx-0 space-y-6">
            <div className="flex gap-4 items-stretch">
              <div className="w-40 flex-shrink-0">
                <QuickTodos />
              </div>
              <div className="flex-1 flex">
                <ActivityHeatmap />
              </div>
            </div>

            <NowPlaying />
          </div>
        </div>
      </div>
    </section>
  )
}
