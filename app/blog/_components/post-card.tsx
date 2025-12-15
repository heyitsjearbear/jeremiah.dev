import Image from 'next/image'
import Link from 'next/link'
import {urlForImage, type PostCard as SanityPostCard} from '@/app/lib/sanity'
import {cn} from '@/app/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const getYouTubeId = (youtubeUrl?: string | null) => {
  if (!youtubeUrl) {
    return null
  }
  try {
    const parsed = new URL(youtubeUrl)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      return parsed.pathname.slice(1)
    }

    if (host === 'youtube.com') {
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/)
      if (shortsMatch?.[1]) {
        return shortsMatch[1]
      }

      const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)/)
      if (embedMatch?.[1]) {
        return embedMatch[1]
      }

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

type PostCardProps = {
  post: SanityPostCard
  className?: string
}

export function PostCard({post, className}: PostCardProps) {
  const imageUrl = urlForImage(post.coverImage)?.width(960).height(540).quality(85).url()
  const youtubeId = getYouTubeId(post.youtubeUrl)
  const youtubeThumbnailUrl = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
    : null
  const fallbackImageUrl = imageUrl || youtubeThumbnailUrl
  const href = `/blog/${post.slug.current}`
  const formattedPublishedAt = post.publishedAt
    ? dateFormatter.format(new Date(post.publishedAt))
    : 'Draft'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/70 transition duration-300 hover:border-sky-400/70 hover:shadow-lg hover:shadow-sky-400/10',
        className
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-800/70">
        {fallbackImageUrl ? (
          <Image
            src={fallbackImageUrl}
            alt={post.coverImage?.alt ?? post.title}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 544px, (min-width: 768px) 50vw, 90vw"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition duration-300 group-hover:opacity-100" />
        <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-sky-300">
          {formattedPublishedAt}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold leading-tight text-white transition duration-300 group-hover:text-sky-300">
            {post.title}
          </h3>
          <p className="text-base text-gray-300">{post.excerpt}</p>
        </div>

        {post.tags?.length ? (
          <div className="mt-auto flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-sky-300">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-sky-500/40 px-3 py-1 font-mono text-[0.65rem] text-sky-300 transition duration-200 group-hover:border-sky-400 group-hover:text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
