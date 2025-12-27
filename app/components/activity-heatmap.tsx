'use client'

import {useState, type MouseEvent} from 'react'
import type {HeatmapDay} from '@/app/lib/todo-heatmap'

type ActivityHeatmapProps = {
  days: HeatmapDay[]
}

export default function ActivityHeatmap({days}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  const maxCount = days.reduce((max, day) => Math.max(max, day.count), 0)

  const getIntensity = (count: number): number => {
    if (count === 0 || maxCount === 0) return 0
    const ratio = count / maxCount
    if (ratio <= 0.25) return 1
    if (ratio <= 0.5) return 2
    if (ratio <= 0.75) return 3
    return 4
  }

  const getColor = (count: number): string => {
    const intensity = getIntensity(count)
    if (intensity === 0) return 'bg-gray-800'
    if (intensity === 1) return 'bg-blue-900'
    if (intensity === 2) return 'bg-blue-700'
    if (intensity === 3) return 'bg-blue-500'
    return 'bg-blue-400'
  }

  // Group days into weeks
  const weeks: HeatmapDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const dayLabels = ['Mon', 'Wed', 'Fri']

  const handleMouseEnter = (day: HeatmapDay, event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setModalPosition({ x: rect.left, y: rect.bottom })
    setHoveredDay(day)
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-1.5 flex-shrink-0">Locked In</h3>
      <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800 relative flex-1 flex flex-col min-h-0">
        <div className="flex gap-1 flex-1 min-h-0">
          {/* Day labels */}
          <div className="flex flex-col justify-around pr-1.5 flex-shrink-0">
            {dayLabels.map((day, idx) => (
              <div key={idx} className="text-[9px] text-gray-500 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.5 flex-1 items-stretch overflow-hidden">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5 flex-1 justify-between">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`w-full flex-1 min-h-[10px] max-h-[18px] rounded-[2px] ${getColor(day.count)} transition-colors hover:ring-1 hover:ring-blue-400 cursor-pointer`}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-gray-500 flex-shrink-0">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2.5 h-2.5 rounded-[2px] ${getColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Modal */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3 min-w-[200px] max-w-[280px]"
          style={{
            left: `${modalPosition.x}px`,
            top: `${modalPosition.y + 8}px`,
          }}
        >
          <div className="text-xs font-medium text-gray-300 mb-2">
            {new Date(`${hoveredDay.date}T00:00:00Z`).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </div>

          {hoveredDay.tasks.length > 0 ? (
            <div className="space-y-1.5">
              {hoveredDay.tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <span className="text-[11px] text-gray-400 leading-tight">{task}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 italic">No activity</div>
          )}

          <div className="mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-600">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'contribution' : 'contributions'}
          </div>
        </div>
      )}
    </div>
  )
}
