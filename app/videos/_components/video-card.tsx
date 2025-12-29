import Image from 'next/image'
import Link from 'next/link'
import {PlayCircle} from 'lucide-react'
import {type PostCard as SanityPostCard} from '@/app/lib/sanity'
import {getYouTubeId, getYouTubeThumbnailUrl} from '@/app/lib/youtube'
import {cn} from '@/app/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

type VideoCardProps = {
  post: SanityPostCard
  className?: string
}

export function VideoCard({post, className}: VideoCardProps) {
  const videoId = getYouTubeId(post.youtubeUrl)

  if (!videoId) {
    return null
  }

  const youtubeThumbnailUrl = getYouTubeThumbnailUrl(videoId)
  const href = `/blog/${post.slug.current}`
  const formattedPublishedAt = post.publishedAt
    ? dateFormatter.format(new Date(post.publishedAt))
    : 'Draft'

  return (
    <article>
      <Link
        href={href}
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/70 transition duration-300 hover:border-sky-400/70 hover:shadow-lg hover:shadow-sky-400/10',
          className
        )}
        aria-label={`Watch video: ${post.title}`}
      >
        <div className="relative aspect-video overflow-hidden bg-gray-800/70">
          <Image
            src={youtubeThumbnailUrl}
            alt={post.coverImage?.alt ?? `Video thumbnail for ${post.title}`}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 90vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition duration-300 group-hover:opacity-100" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full border border-white/50 bg-black/40 p-3 text-white shadow-lg transition duration-300 group-hover:border-sky-200 group-hover:scale-110 group-hover:text-sky-200"
              aria-hidden="true"
            >
              <PlayCircle className="h-10 w-10" />
            </div>
          </div>

          <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center rounded-full bg-black/60 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-sky-300">
            {formattedPublishedAt}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-white transition duration-300 group-hover:text-sky-300">
            {post.title}
          </h2>

          {post.excerpt ? (
            <p className="line-clamp-2 text-sm text-gray-300">{post.excerpt}</p>
          ) : null}

          {post.tags?.length ? (
            <div className="mt-auto flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-sky-500/40 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-sky-300 transition duration-200 group-hover:border-sky-400 group-hover:text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
