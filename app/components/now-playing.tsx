'use client'

import { useState, useEffect } from 'react'

export default function NowPlaying() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Mock song data
  const song = {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200, // seconds
    currentTime: 0,
  }

  // Animate the progress bar
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 0.5
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentSeconds = Math.floor((progress / 100) * song.duration)
  const remainingSeconds = song.duration - currentSeconds

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Now Playing</h3>
      <div className="bg-gray-900/50 rounded-lg p-1.5 border border-gray-800 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-pulse" />

        <div className="relative flex items-center gap-4">
          {/* Album Art / Visualizer */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            {/* Animated bars */}
            <div className="flex items-end justify-center gap-0.5 h-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: '100%',
                    animation: `pulse ${0.5 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-200 truncate">
                  {song.title}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                  {song.artist}
                </p>
              </div>

              {/* Playing indicator */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-blue-400 rounded-full"
                      style={{
                        height: '10px',
                        animation: isPlaying
                          ? `musicBar ${0.8 + i * 0.2}s ease-in-out infinite`
                          : 'none',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-gray-500">
                <span>{formatTime(currentSeconds)}</span>
                <span>-{formatTime(remainingSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes musicBar {
            0%, 100% { height: 4px; }
            50% { height: 12px; }
          }
        `}</style>
      </div>
    </div>
  )
}
