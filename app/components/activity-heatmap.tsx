'use client'

import { useState } from 'react'

interface HeatmapDay {
  date: Date
  count: number
  tasks: string[]
}

export default function ActivityHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  // Mock tasks for different activity levels
  const getTasksForCount = (count: number): string[] => {
    const allTasks = [
      'Pushed 3 commits to main',
      'Merged PR #42',
      'Fixed critical bug',
      'Reviewed team PRs',
      'Updated documentation',
      'Deployed to production',
      'Optimized API performance',
      'Added new feature',
      'Refactored authentication',
      'Wrote unit tests',
      'Updated dependencies',
      'Fixed TypeScript errors',
    ]

    if (count === 0) return []

    // Return random tasks based on count
    const shuffled = [...allTasks].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Generate last 20 weeks of data (140 days) to fill more space
  const generateHeatmapData = (): HeatmapDay[] => {
    const data: HeatmapDay[] = []
    const today = new Date()

    for (let i = 139; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      // Generate random activity data (0-4 scale)
      const count = Math.floor(Math.random() * 5)
      const tasks = getTasksForCount(count)
      data.push({ date, count, tasks })
    }

    return data
  }

  const heatmapData = generateHeatmapData()

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-gray-800'
    if (count === 1) return 'bg-blue-900'
    if (count === 2) return 'bg-blue-700'
    if (count === 3) return 'bg-blue-500'
    return 'bg-blue-400'
  }

  // Group days into weeks
  const weeks: HeatmapDay[][] = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7))
  }

  const days = ['Mon', 'Wed', 'Fri']

  const handleMouseEnter = (day: HeatmapDay, event: React.MouseEvent<HTMLDivElement>) => {
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
            {days.map((day, idx) => (
              <div key={idx} className="text-[9px] text-gray-500 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.5 flex-1 items-stretch overflow-hidden">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5 flex-1 justify-between">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
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
            {hoveredDay.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
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
