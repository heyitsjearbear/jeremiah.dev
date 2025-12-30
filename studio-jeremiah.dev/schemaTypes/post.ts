import {defineArrayMember, defineField, defineType} from 'sanity'

type PublishedContext = {
  document?: {
    publishedAt?: string | null
  }
}

const requireWhenPublished =
  (message: string) => (value: unknown, context: PublishedContext) => {
    const isScheduledOrPublished = Boolean(context.document?.publishedAt)
    if (!isScheduledOrPublished) {
      return true
    }
    if (Array.isArray(value)) {
      return value.length > 0 || message
    }
    if (typeof value === 'string') {
      return value.trim().length > 0 || message
    }
    return value ? true : message
  }

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'metadata', title: 'Metadata'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) =>
        rule.required().min(8).error('Posts need a descriptive headline.'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'metadata',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, ''),
      },
      validation: (rule) =>
        rule.required().error('Every post needs a unique slug.'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'metadata',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (rule) =>
        rule
          .max(240)
          .warning('Keep excerpts tight so cards stay punchy.')
          .custom(requireWhenPublished('Excerpt is required before publishing.')),
    }),
    defineField({
      name: 'coverImage',
      title: 'Hero image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (rule) =>
            rule
              .required()
              .error('Hero images need alt text for accessibility.'),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube video URL',
      type: 'url',
      group: 'content',
      description: 'Optional video to feature alongside the post.',
      validation: (rule) =>
        rule
          .uri({
            scheme: ['https', 'http'],
            allowRelative: false,
          })
          .custom((value) => {
            if (!value) {
              return true
            }
            try {
              const parsed = new URL(value)
              const hostname = parsed.hostname.replace(/^www\./, '')
              const allowedHosts = ['youtube.com', 'youtu.be']

              if (!allowedHosts.includes(hostname)) {
                return 'Use a valid YouTube URL.'
              }

              // Reject playlist URLs
              if (parsed.pathname.includes('/playlist') || parsed.searchParams.has('list')) {
                return 'Playlists are not supported. Use an individual video URL.'
              }

              return true
            } catch {
              return 'Enter a valid URL.'
            }
          }),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
      validation: (rule) =>
        rule.custom(
          requireWhenPublished('Body content is required before publishing.'),
        ),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'string',
        }),
      ],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'metadata',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta title',
          type: 'string',
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: 'metaImage',
          title: 'Social image',
          type: 'image',
          options: {hotspot: true},
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      media: 'coverImage',
      slug: 'slug.current',
    },
    prepare({title, publishedAt, media, slug}) {
      const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Draft'
      return {
        title: title || 'Untitled post',
        media,
        subtitle: slug ? `${formattedDate} · /blog/${slug}` : formattedDate,
      }
    },
  },
  orderings: [
    {
      title: 'Publish date, newest first',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'},
        {field: 'title', direction: 'asc'},
      ],
    },
    {
      title: 'Publish date, oldest first',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
  ],
})
