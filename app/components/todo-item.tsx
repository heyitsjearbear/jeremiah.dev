'use client'

import {useState, type MouseEvent} from 'react'

type TodoItemProps = {
  id: string
  title: string
  isCompleted: boolean
}

export default function TodoItem({id, title, isCompleted}: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({x: 0, y: 0})

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    })
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <>
      <div
        className="flex items-start gap-2 group relative rounded-md px-1.5 py-0.5 transition-all hover:bg-blue-500/5 hover:ring-1 hover:ring-blue-400/40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="mt-0.5 flex-shrink-0">
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
            }`}
          >
            {isCompleted && (
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span
          className={`text-[10px] leading-tight flex-1 truncate ${
            isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'
          }`}
        >
          {title}
        </span>
      </div>

      {/* Fixed-position tooltip */}
      {isHovered && (
        <div
          className="fixed z-50 rounded-lg border border-gray-700 bg-gray-900 px-2.5 py-2 text-[10px] text-gray-300 shadow-2xl pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {title}
        </div>
      )}
    </>
  )
}
