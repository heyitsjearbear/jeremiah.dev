import type {Metadata} from 'next'
import Link from 'next/link'
import {ArrowUpRight} from 'lucide-react'
import {draftMode} from 'next/headers'
import Header from '@/app/components/header'
import Footer from '@/app/components/footer'
import {PostCard} from './_components/post-card'
import {getPublishedPosts} from '@/app/lib/sanity'
import {siteConfig} from '@/app/config/site'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description:
    'Published notes on systems, focus, and shipping craft. Fresh entries refresh automatically when new posts go live.',
}

export default async function BlogPage() {
  const draft = await draftMode()
  const previewEnabled = draft.isEnabled || process.env.NODE_ENV !== 'production'
  const posts = await getPublishedPosts({preview: previewEnabled})

  return (
    <main className="flex min-h-screen flex-col bg-gray-800 text-white">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-16 pt-16 md:px-6 lg:px-8">
        {previewEnabled ? (
          <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.25em] text-blue-200">
            Preview mode · Draft content visible only to you
          </div>
        ) : null}
        {posts.length ? (
          <>
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Shipping calm systems in public
                </h1>
                <p className="max-w-2xl text-base text-gray-300 md:text-lg">
                  Field notes on engineering clarity, building in the open, and the frameworks
                  powering jeremiah.dev. New posts land here as soon as they publish in Sanity.
                </p>
              </div>
            </div>
            <div className="grid gap-10 sm:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <section className="mx-auto flex min-h-[50vh] w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 text-center">
            <p className="rounded-full border border-blue-400/30 bg-blue-500/5 px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
              No posts yet
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Drafting the first stories
            </h1>
            <p className="max-w-2xl text-base text-gray-300 md:text-lg">
              Nothing’s live just yet, but the first drops are in motion. Once a post publishes in
              Sanity, it will surface here instantly.
            </p>
            <Link
              href="mailto:jeremiah@jeremiah.dev"
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 font-mono text-sm uppercase tracking-[0.2em] text-blue-300 transition hover:border-blue-300 hover:bg-blue-500/20 hover:text-white"
            >
              Notify me
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
}
