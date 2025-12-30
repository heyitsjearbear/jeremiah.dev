/**
 * YouTube URL parsing and utility functions.
 * Centralized to avoid duplication across blog and video components.
 */

/**
 * Extracts YouTube video ID from various URL formats:
 * - youtu.be/{id}
 * - youtube.com/shorts/{id}
 * - youtube.com/embed/{id}
 * - youtube.com/watch?v={id}
 *
 * Returns null for invalid URLs, playlist URLs, or when ID extraction fails.
 */
export const getYouTubeId = (url?: string | null): string | null => {
  if (!url) {
    return null
  }

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    // Reject playlist URLs
    if (parsed.pathname.includes('/playlist') || parsed.searchParams.has('list')) {
      return null
    }

    if (host === 'youtu.be') {
      // Extract ID and strip trailing slashes
      const id = parsed.pathname.slice(1).replace(/\/$/, '')
      return id || null
    }

    if (host === 'youtube.com') {
      // Handle /shorts/{id}
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shortsMatch?.[1]) {
        return shortsMatch[1]
      }

      // Handle /embed/{id}
      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/)
      if (embedMatch?.[1]) {
        return embedMatch[1]
      }

      // Handle /watch?v={id}
      const videoId = parsed.searchParams.get('v')
      if (videoId) {
        return videoId
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Generates YouTube thumbnail URL for a given video ID.
 * Uses maxresdefault.jpg for highest quality (1280x720).
 * Note: maxresdefault.jpg may not exist for older videos or some shorts.
 * Use getYouTubeThumbnailFallbackUrl for a guaranteed fallback.
 */
export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * Generates fallback YouTube thumbnail URL (hqdefault.jpg, 480x360).
 * This resolution is guaranteed to exist for all YouTube videos.
 */
export const getYouTubeThumbnailFallbackUrl = (videoId: string): string => {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Generates YouTube watch URL for a given video ID.
 */
export const getYouTubeWatchUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`
}
