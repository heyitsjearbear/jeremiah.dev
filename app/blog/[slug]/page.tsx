import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {ArrowLeft} from 'lucide-react'
import {BlogPortableText} from '../_components/portable-text'
import Header from '@/app/components/header'
import Footer from '@/app/components/footer'
import {
  getPostBySlug,
  getPostForMetadata,
  getPostSlugs,
  urlForImage,
  type CodeBlockValue,
  type Post,
} from '@/app/lib/sanity'
import {draftMode} from 'next/headers'

type PageParams = {
  params: Promise<{
    slug: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: PageParams): Promise<Metadata> {
  const {slug} = await params
  const draft = await draftMode()
  const previewEnabled = draft.isEnabled || process.env.NODE_ENV !== 'production'
  const post = await getPostForMetadata(slug, {preview: previewEnabled})

  if (!post) {
    return {
      title: 'Post not found',
    }
  }

  const title = post.seo?.metaTitle || post.title || 'Blog post'
  const description = post.seo?.metaDescription || post.excerpt || undefined
  const ogImage = urlForImage(post.seo?.metaImage ?? post.coverImage)
    ?.width(1200)
    .height(630)
    .quality(80)
    .url()

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      images: ogImage ? [{url: ogImage, alt: title}] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

const isCodeBlock = (block: Post['body'][number]): block is CodeBlockValue =>
  block._type === 'codeBlock'

const estimateReadingMinutes = (post: Post) => {
  const words = post.body.reduce((total, block) => {
    if (block._type === 'block') {
      const blockChildren = (block.children ?? []).map((child) => ('text' in child ? child.text : ''))
      const childWords = blockChildren
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
      return total + childWords
    }

    if (isCodeBlock(block)) {
      const code = block.code ?? ''
      return total + code.trim().split(/\s+/).filter(Boolean).length
    }

    return total
  }, 0)

  return Math.max(1, Math.round(words / 200))
}

export default async function BlogPostPage({params}: PageParams) {
  const {slug} = await params
  const draft = await draftMode()
  const previewEnabled = draft.isEnabled || process.env.NODE_ENV !== 'production'
  const post = await getPostBySlug(slug, {preview: previewEnabled})

  if (!post) {
    notFound()
  }

  const heroUrl = urlForImage(post.coverImage)?.width(1600).height(900).quality(85).url()
  const readingMinutes = estimateReadingMinutes(post)
  const publishedDate = post.publishedAt ? dateFormatter.format(new Date(post.publishedAt)) : null

  return (
    <main className="flex min-h-screen flex-col bg-gray-800 text-white">
      <Header />
      <article className="relative flex-1 pb-24">
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-gray-900 via-gray-950 to-black" />
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-16 md:px-6">
          {previewEnabled ? (
            <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.25em] text-blue-200">
              Preview mode · Draft content visible only to you
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:border-sky-400/60 hover:bg-sky-500/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to posts
            </Link>
            {post.tags?.length ? (
              <div className="flex flex-wrap justify-end gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-sky-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <header className="space-y-6">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
                {publishedDate ?? 'Draft'}
                {readingMinutes ? ` • ${readingMinutes} min read` : null}
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                {post.title}
              </h1>
            </div>
            <p className="max-w-3xl text-lg text-gray-300 md:text-xl">{post.excerpt}</p>
          </header>

          {heroUrl ? (
            <figure className="overflow-hidden rounded-3xl border border-white/10 bg-gray-900/80 shadow-lg shadow-sky-400/10">
              <Image
                src={heroUrl}
                alt={post.coverImage.alt ?? post.title}
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
              {(post.coverImage.caption || post.coverImage.alt) && (
                <figcaption className="border-t border-white/5 px-6 py-4 text-sm text-gray-400">
                  {post.coverImage.caption || post.coverImage.alt}
                </figcaption>
              )}
            </figure>
          ) : null}

          <BlogPortableText value={post.body} className="text-base" />
        </div>
      </article>
      <Footer />
    </main>
  )
}
