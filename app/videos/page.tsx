import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import Header from '@/app/components/header'
import Footer from '@/app/components/footer'
import {VideoCard} from './_components/video-card'
import {getPostsWithVideos} from '@/app/lib/sanity'
import {getYouTubeId} from '@/app/lib/youtube'
import {siteConfig} from '@/app/config/site'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Videos | ${siteConfig.name}`,
  description:
    'Technical deep dives, build logs, and product walkthroughs. Watch the process behind shipping calm systems.',
}

export default async function VideosPage() {
  const draft = await draftMode()
  const previewEnabled = draft.isEnabled || process.env.NODE_ENV !== 'production'
  const posts = await getPostsWithVideos({preview: previewEnabled})

  // Filter out posts with invalid YouTube URLs (should be rare due to schema validation)
  const videoPosts = posts.filter((post) => getYouTubeId(post.youtubeUrl) !== null)

  // Log filtered posts for debugging (won't appear in production builds)
  if (process.env.NODE_ENV !== 'production') {
    const invalidPosts = posts.filter((post) => getYouTubeId(post.youtubeUrl) === null)
    if (invalidPosts.length > 0) {
      console.warn(
        'Posts with invalid YouTube URLs filtered out:',
        invalidPosts.map((p) => ({id: p._id, title: p.title, youtubeUrl: p.youtubeUrl}))
      )
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-800 text-white">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-16 pt-16 md:px-6 lg:px-8">
        {previewEnabled ? (
          <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.25em] text-blue-200">
            Preview mode · Draft content visible only to you
          </div>
        ) : null}
        {videoPosts.length ? (
          <>
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Videos
                </h1>
                <p className="max-w-2xl text-base text-gray-300 md:text-lg">
                  Deep dives, build logs, and product walkthroughs. Click to read the full post and
                  watch the video.
                </p>
                <p className="font-mono text-sm text-sky-300">
                  {videoPosts.length} video{videoPosts.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videoPosts.map((post) => (
                <VideoCard key={post._id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <section className="mx-auto flex min-h-[50vh] w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 text-center">
            <p className="rounded-full border border-blue-400/30 bg-blue-500/5 px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
              No videos yet
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Videos coming soon
            </h1>
            <p className="max-w-2xl text-base text-gray-300 md:text-lg">
              Technical deep dives and build logs are on the way. Check back soon for video content.
            </p>
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
}
