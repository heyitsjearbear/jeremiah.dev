'use client'

import {useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {PlayCircle} from 'lucide-react'
import {getYouTubeThumbnailUrl, getYouTubeThumbnailFallbackUrl} from '@/app/lib/youtube'

type YouTubeThumbnailProps = {
  videoId: string
  watchUrl: string
  title: string
}

export function YouTubeThumbnail({videoId, watchUrl, title}: YouTubeThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  const maxresThumbnail = getYouTubeThumbnailUrl(videoId)
  const hqThumbnail = getYouTubeThumbnailFallbackUrl(videoId)

  // Fallback chain: maxresdefault -> hqdefault -> gradient
  const currentSrc = imgSrc ?? maxresThumbnail

  const handleImageError = () => {
    if (imgSrc === null) {
      setImgSrc(hqThumbnail)
    } else {
      setHasError(true)
    }
  }

  return (
    <Link
      href={watchUrl}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-3xl border border-sky-500/40 bg-gray-900/70 shadow-lg shadow-sky-500/10 transition hover:border-sky-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
    >
      {hasError ? (
        <div className="aspect-video w-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />
      ) : (
        <Image
          src={currentSrc}
          alt={`YouTube video for ${title}`}
          width={1600}
          height={900}
          className="h-auto w-full object-cover transition group-hover:scale-[1.01]"
          onError={handleImageError}
        />
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full border border-white/50 bg-black/40 p-4 text-white shadow-lg transition group-hover:border-sky-200 group-hover:text-sky-200">
          <PlayCircle className="h-12 w-12" />
        </div>
      </div>
      <span className="sr-only">Open featured video on YouTube</span>
    </Link>
  )
}
