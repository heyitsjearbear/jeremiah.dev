import {createClient, type QueryParams} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import groq from 'groq'
import type {PortableTextBlock} from '@portabletext/types'

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

type BasePostFields = {
  _id: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  excerpt: string
  coverImage: SanityImage
  tags: string[]
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

const postFields = groq`{
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug,
  publishedAt,
  excerpt,
  coverImage,
  "tags": coalesce(tags, []),
}`

const postDetailFields = groq`{
  _id,
  title,
  "slug": slug,
  publishedAt,
  excerpt,
  coverImage,
  "tags": coalesce(tags, []),
  body,
  seo
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

const previewPostsQuery = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _updatedAt) desc) ${postFields}`

export const getPublishedPosts = async ({preview = false}: {preview?: boolean} = {}) => {
  const query = preview ? previewPostsQuery : publishedPostsQuery
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
    coverImage?: SanityImage
  } | null>(postMetadataQuery, {slug}, {preview})
}
