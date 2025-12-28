import Image from "next/image"
import ActivityHeatmap from "./activity-heatmap"
import QuickTodos from "./quick-todos"
import NowPlaying from "./now-playing"
import TerminalReveal from "./TerminalReveal"
import { getCompletedTodosForHeatmap } from "@/app/lib/sanity"
import { buildHeatmapDays } from "@/app/lib/todo-heatmap"

export default async function HeroWidgets() {
  const completedTodos = await getCompletedTodosForHeatmap()
  const heatmapDays = buildHeatmapDays(completedTodos)

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Headshot */}
        <TerminalReveal delay={0} className="md:col-span-2 lg:col-span-2">
          <Image
            src="/jeremiah-headshot.jpg"
            alt="Jeremiah"
            width={400}
            height={320}
            className="rounded-lg object-cover object-[50%_15%] w-full h-[280px] md:h-[320px]"
          />
        </TerminalReveal>

        {/* Quick Todos */}
        <TerminalReveal delay={0.2} className="h-[200px] md:h-[320px]">
          <div className="h-full">
            <QuickTodos />
          </div>
        </TerminalReveal>

        {/* Activity Heatmap */}
        <TerminalReveal delay={0.4} className="h-[200px] md:h-[320px]">
          <div className="h-full">
            <ActivityHeatmap days={heatmapDays} />
          </div>
        </TerminalReveal>

        {/* Now Playing - spans full width on mobile, half on desktop */}
        <TerminalReveal delay={0.6} className="md:col-span-2 lg:col-span-4">
          <NowPlaying />
        </TerminalReveal>
      </div>
    </section>
  )
}
