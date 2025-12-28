import Image from "next/image"
import Link from "next/link"
import ActivityHeatmap from "./activity-heatmap"
import QuickTodos from "./quick-todos"
import NowPlaying from "./now-playing"
import {getCompletedTodosForHeatmap} from "@/app/lib/sanity"
import {buildHeatmapDays} from "@/app/lib/todo-heatmap"

export default async function Hero() {
  const completedTodos = await getCompletedTodosForHeatmap()
  const heatmapDays = buildHeatmapDays(completedTodos)

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-6 md:gap-4 md:grid-cols-[42%_1fr] md:grid-rows-[1fr_auto] md:h-[560px]">
        {/* Left column */}
        <div className="md:col-start-1 md:row-start-1 flex flex-col gap-3 md:h-full">
          <div className="font-mono text-xs md:text-sm" style={{ color: "rgb(96, 165, 250)" }}>
            {'// student founder – systems + ai + dev'}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            I build systems that help people think clearly and get more done.
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-gray-300">
            Founder of Zenergy—tools for focus, habits, and mental clarity. Experience across legal tech (Quilia), consumer research platforms (SightX: web dev + QA), and AI Camp (applied AI projects & mentorship).
          </p>

          <div className="flex gap-2 md:gap-3">
            <a
              href="https://zenergy-ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-blue-400 hover:bg-blue-500 text-sm"
            >
              View Zenergy
            </a>
            <Link
              href="/projects"
              className="border border-gray-600 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-gray-200 hover:border-blue-400 hover:text-blue-400 text-sm"
            >
              See Projects
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-start-2 md:row-start-1 md:row-span-2 flex flex-col gap-3 md:h-full overflow-hidden">
          <Image
            src="/jeremiah-headshot.jpg"
            alt="Jeremiah"
            width={400}
            height={320}
            className="rounded-lg object-cover object-[50%_15%] w-full h-[320px] flex-shrink-0"
            priority
          />

          <div className="w-full flex-1 flex gap-1.5 overflow-hidden">
            <div className="w-28 flex-shrink-0 h-full">
              <QuickTodos />
            </div>
            <div className="flex-1 h-full">
              <ActivityHeatmap days={heatmapDays} />
            </div>
          </div>
        </div>

        <div className="md:col-start-1 md:row-start-2">
          <NowPlaying />
        </div>
      </div>
    </section>
  )
}
