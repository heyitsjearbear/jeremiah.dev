'use client'

import Image from 'next/image'
import {useEffect, useMemo, useState} from 'react'

import {formatSecondsToTime} from '@/app/lib/utils'
import {urlForNowPlayingImage, type Song} from '@/app/lib/sanity'
import {useIntro} from '@/app/components/providers/intro-context'

type NowPlayingSong = Omit<Song, 'albumCover'> & {
  albumCover?: Song['albumCover'] | null
}

type NowPlayingClientProps = {
  initialSongs?: NowPlayingSong[]
}

const fallbackSongs: NowPlayingSong[] = [
  {
    _id: 'mock-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
  },
  {
    _id: 'mock-2',
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    duration: 240,
  },
  {
    _id: 'mock-3',
    title: 'Electric Feel',
    artist: 'MGMT',
    album: 'Oracular Spectacular',
    duration: 230,
  },
]

export default function NowPlayingClient({
  initialSongs,
}: NowPlayingClientProps) {
  const songs = useMemo(
    () => (initialSongs && initialSongs.length > 0 ? initialSongs : fallbackSongs),
    [initialSongs],
  )
  const {introComplete} = useIntro()
  const hasSanitySongs = (initialSongs?.length ?? 0) > 0
  const [playback, setPlayback] = useState({
    currentSongIndex: 0,
    progress: 0,
  })
  const isPlaying = introComplete

  const safeIndex = songs.length
    ? playback.currentSongIndex % songs.length
    : 0
  const currentSong = songs[safeIndex] ?? songs[0]
  const duration = Math.max(currentSong.duration, 1)
  const currentSeconds = Math.floor((playback.progress / 100) * duration)
  const remainingSeconds = Math.max(duration - currentSeconds, 0)

  useEffect(() => {
    if (!songs.length) {
      return
    }

    const interval = setInterval(() => {
      setPlayback((prev) => {
        const song = songs[prev.currentSongIndex] ?? songs[0]
        const songDuration = Math.max(song.duration, 1)
        const step = 100 / songDuration
        const nextProgress = prev.progress + step

        if (nextProgress >= 100) {
          const nextIndex = (prev.currentSongIndex + 1) % songs.length
          return {currentSongIndex: nextIndex, progress: 0}
        }

        return {
          currentSongIndex: prev.currentSongIndex,
          progress: nextProgress,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [songs])

  const handleSkip = () => {
    setPlayback((prev) => ({
      currentSongIndex: (prev.currentSongIndex + 1) % songs.length,
      progress: 0,
    }))
  }

  const albumCoverUrl = currentSong.albumCover
    ? urlForNowPlayingImage(currentSong.albumCover)?.url()
    : null

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Now Playing</h3>
      <div className="bg-gray-900/50 rounded-lg p-1.5 border border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5" />

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
            {albumCoverUrl ? (
              <Image
                src={albumCoverUrl}
                alt={`${currentSong.title} album art`}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-200 truncate">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                  {currentSong.artist}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-blue-400 rounded-full origin-bottom"
                      style={{
                        height: '10px',
                        transform: 'scaleY(0.4)',
                        animation: isPlaying
                          ? `musicBar ${0.8 + i * 0.2}s ease-in-out infinite`
                          : 'none',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                {hasSanitySongs ? (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs font-mono font-semibold text-blue-100 bg-blue-500/25 border border-blue-400/40 rounded-md px-2.5 py-1 hover:text-blue-400 hover:border-blue-400/70 transition-colors cursor-pointer"
                    aria-label="Skip to next song"
                    title="Skip to next song"
                  >
                    &gt;
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                  style={{width: `${playback.progress}%`}}
                />
              </div>

              <div className="flex justify-between text-[9px] text-gray-500">
                <span>{formatSecondsToTime(currentSeconds)}</span>
                <span>-{formatSecondsToTime(remainingSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes musicBar {
            0%,
            100% {
              transform: scaleY(0.4);
            }
            50% {
              transform: scaleY(1);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
