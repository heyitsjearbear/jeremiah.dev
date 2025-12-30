import {createClient, type QueryParams} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import groq from 'groq'
import type {PortableTextBlock} from '@portabletext/types'
import {siteConfig} from '@/app/config/site'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable.')
}

if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET environment variable.')
}

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const token = process.env.SANITY_API_READ_TOKEN
const warnMissingToken =
  process.env.NODE_ENV !== 'production' && !token

if (warnMissingToken) {
  console.warn(
    'Preview/Draft fetching requires SANITY_API_READ_TOKEN. Draft content will fall back to published data until the token is set.',
  )
}

const sharedConfig = {
  projectId,
  dataset,
  apiVersion,
  token,
}

export const sanityClient = createClient({
  ...sharedConfig,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published' as const,
})

export const previewClient = createClient({
  ...sharedConfig,
  useCdn: false,
  perspective: 'drafts' as const,
})

const builder = imageUrlBuilder({
  projectId,
  dataset,
})

export type SanityImage = {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
  alt?: string
  caption?: string
}

export type Song = {
  _id: string
  title: string
  artist: string
  album: string
  duration: number
  albumCover: SanityImage
  spotifyUrl?: string
}

export type CodeBlockValue = {
  _type: 'codeBlock'
  title?: string
  language?: string
  filename?: string
  highlightedLines?: number[]
  code?: string
}

export type BlogPortableTextValue = Array<PortableTextBlock | CodeBlockValue | SanityImage>

export const urlForImage = (source: SanityImage | null | undefined) => {
  if (!source?.asset?._ref) {
    return null
  }
  return builder.image(source).auto('format').fit('max')
}

export const urlForNowPlayingImage = (source: SanityImage | null | undefined) => {
  if (!source?.asset?._ref) {
    return null
  }
  return builder.image(source).width(256).height(256).auto('format').fit('max')
}

type BasePostFields = {
  _id: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  excerpt: string
  coverImage?: SanityImage | null
  tags: string[]
  youtubeUrl?: string | null
}

export type PostCard = BasePostFields & {
  _createdAt: string
  _updatedAt: string
}

export type Post = BasePostFields & {
  body: BlogPortableTextValue
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaImage?: SanityImage
  }
}

export type TodoStatus = 'todo' | 'in_progress' | 'done'
export type TodoPriority = 'low' | 'medium' | 'high'

export type Todo = {
  _id: string
  title: string
  status: TodoStatus
  priority: TodoPriority
  completedAt?: string | null
  createdAt: string
}

export type TodoHeatmapItem = {
  _id: string
  title: string
  priority: TodoPriority
  completedAt: string
}

export const HEATMAP_RANGE_DAYS = 91

const postFields = groq`{
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug,
  publishedAt,
  excerpt,
  coverImage,
  youtubeUrl,
  "tags": coalesce(tags, []),
}`

const postDetailFields = groq`{
  _id,
  title,
  "slug": slug,
  publishedAt,
  excerpt,
  coverImage,
  youtubeUrl,
  "tags": coalesce(tags, []),
  body,
  seo
}`

const songFields = groq`{
  _id,
  title,
  artist,
  album,
  duration,
  albumCover,
  spotifyUrl
}`

type SanityFetchOptions = {
  preview?: boolean
  revalidate?: number
}

const defaultRevalidate = 60
let previewFallbackLogged = false

async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  {preview = false, revalidate = defaultRevalidate}: SanityFetchOptions = {},
) {
  const usePreviewClient = preview && token
  const client = usePreviewClient ? previewClient : sanityClient
  if (preview && !token && process.env.NODE_ENV !== 'production' && !previewFallbackLogged) {
    console.warn(
      'Preview requested but SANITY_API_READ_TOKEN is missing. Falling back to published content.',
    )
    previewFallbackLogged = true
  }
  const fetchOptions = usePreviewClient
    ? {cache: 'no-store' as const}
    : {
        next: {
          revalidate,
        },
      }

  return client.fetch<T>(query, params, fetchOptions)
}

const publishedPostsQuery = groq`*[_type == "post" && defined(slug.current) && publishedAt <= now() && !(_id in path("drafts.**"))] | order(publishedAt desc) ${postFields}`

const previewPostsQuery = groq`*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _updatedAt) desc) ${postFields}`

export const getPublishedPosts = async ({preview = false}: {preview?: boolean} = {}) => {
  const query = preview ? previewPostsQuery : publishedPostsQuery
  return sanityFetch<PostCard[]>(query, {}, {preview})
}

const postsWithVideosQuery = groq`*[
  _type == "post"
  && defined(slug.current)
  && defined(youtubeUrl)
  && publishedAt <= now()
  && !(_id in path("drafts.**"))
] | order(publishedAt desc) ${postFields}`

const previewPostsWithVideosQuery = groq`*[
  _type == "post"
  && defined(slug.current)
  && defined(youtubeUrl)
] | order(coalesce(publishedAt, _updatedAt) desc) ${postFields}`

export const getPostsWithVideos = async ({preview = false}: {preview?: boolean} = {}) => {
  const query = preview ? previewPostsWithVideosQuery : postsWithVideosQuery
  return sanityFetch<PostCard[]>(query, {}, {preview})
}

export const getPostSlugs = async (): Promise<string[]> => {
  const query = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current }`
  const results = await sanityFetch<Array<{slug: string}>>(query)
  return results.map((item) => item.slug)
}

const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0]${postDetailFields}`

export const getPostBySlug = async (slug: string, {preview = false}: {preview?: boolean} = {}) => {
  const post = await sanityFetch<Post | null>(postBySlugQuery, {slug}, {preview})
  return post ?? null
}

const postMetadataQuery = groq`*[_type == "post" && slug.current == $slug][0]{title, excerpt, seo, coverImage, publishedAt}`

export const getPostForMetadata = async (
  slug: string,
  {preview = false}: {preview?: boolean} = {},
) => {
  return sanityFetch<{
    title?: string
    excerpt?: string
    publishedAt?: string
    seo?: {
      metaTitle?: string
      metaDescription?: string
      metaImage?: SanityImage
    }
    coverImage?: SanityImage | null
  } | null>(postMetadataQuery, {slug}, {preview})
}

const shuffleArray = <T,>(items: T[]) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const randomSongsQuery = groq`*[_type == "song"] ${songFields}`

export const getRandomSongs = async (count = 10) => {
  const songs = await sanityFetch<Song[]>(randomSongsQuery, {}, {revalidate: 60})
  if (!songs.length) {
    return []
  }
  return shuffleArray(songs).slice(0, count)
}

const todoFields = groq`{
  _id,
  title,
  status,
  priority,
  completedAt,
  "createdAt": coalesce(createdAt, _createdAt)
}`

const focusIncompleteTodosQuery = groq`*[_type == "todo" && status != "done" && !(_id in path("drafts.**"))] | order(createdAt desc)[0..19] ${todoFields}`

const focusCompletedTodosQuery = groq`*[_type == "todo" && status == "done" && defined(completedAt) && !(_id in path("drafts.**"))] | order(completedAt desc)[0..4] ${todoFields}`

const focusIncompleteTodosCountQuery = groq`count(*[_type == "todo" && status != "done" && !(_id in path("drafts.**"))])`

const focusCompletedTodosCountQuery = groq`count(*[_type == "todo" && status == "done" && defined(completedAt) && !(_id in path("drafts.**"))])`

const completedTodosForHeatmapQuery = groq`*[_type == "todo" && status == "done" && defined(completedAt) && completedAt >= $heatmapStart && !(_id in path("drafts.**"))] | order(completedAt asc){_id, title, priority, completedAt}`

export const getFocusTodos = async () => {
  const [incomplete, completed, incompleteCount, completedCount] = await Promise.all([
    sanityFetch<Todo[]>(focusIncompleteTodosQuery),
    sanityFetch<Todo[]>(focusCompletedTodosQuery),
    sanityFetch<number>(focusIncompleteTodosCountQuery),
    sanityFetch<number>(focusCompletedTodosCountQuery),
  ])
  return {incomplete, completed, incompleteCount, completedCount}
}

export const getCompletedTodosForHeatmap = async () => {
  const now = new Date()
  const timeZone = siteConfig.timeZone ?? 'UTC'
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const dayKey = formatter.format(now)
  const safeDayKey = /^\d{4}-\d{2}-\d{2}$/.test(dayKey)
    ? dayKey
    : now.toISOString().slice(0, 10)
  const heatmapStart = new Date(`${safeDayKey}T00:00:00Z`)
  heatmapStart.setUTCDate(heatmapStart.getUTCDate() - (HEATMAP_RANGE_DAYS - 1))
  return sanityFetch<TodoHeatmapItem[]>(completedTodosForHeatmapQuery, {
    heatmapStart: heatmapStart.toISOString(),
  })
}
