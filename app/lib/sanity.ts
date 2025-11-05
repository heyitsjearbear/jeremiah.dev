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

const sharedConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published' as const,
  token,
}

export const sanityClient = createClient(sharedConfig)

export const previewClient = createClient({
  ...sharedConfig,
  useCdn: false,
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

export async function fetchSanity<T>(query: string, params: QueryParams = {}) {
  return sanityClient.fetch<T>(query, params, {
    next: {
      revalidate: 60,
    },
  })
}

export const getPublishedPosts = async (): Promise<PostCard[]> => {
  const query = groq`*[_type == "post" && defined(slug.current) && publishedAt <= now() && !(_id in path("drafts.**"))] | order(publishedAt desc) ${postFields}`
  return fetchSanity<PostCard[]>(query)
}

export const getPostSlugs = async (): Promise<string[]> => {
  const query = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current }`
  const results = await fetchSanity<Array<{slug: string}>>(query)
  return results.map((item) => item.slug)
}

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const query = groq`*[_type == "post" && slug.current == $slug][0]${postDetailFields}`
  const post = await fetchSanity<Post | null>(query, {slug})
  return post ?? null
}

export const getPostForMetadata = async (slug: string) => {
  const query = groq`*[_type == "post" && slug.current == $slug][0]{title, excerpt, seo, coverImage, publishedAt}`
  return fetchSanity<{
    title?: string
    excerpt?: string
    publishedAt?: string
    seo?: {
      metaTitle?: string
      metaDescription?: string
      metaImage?: SanityImage
    }
    coverImage?: SanityImage
  } | null>(query, {slug})
}
