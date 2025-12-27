import {defineField, defineType} from 'sanity'

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) {
    return '0:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default defineType({
  name: 'song',
  title: 'Song',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().error('Song title is required.'),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      validation: (rule) => rule.required().error('Artist name is required.'),
    }),
    defineField({
      name: 'album',
      title: 'Album',
      type: 'string',
      validation: (rule) => rule.required().error('Album name is required.'),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error('Duration must be a positive number of seconds.'),
    }),
    defineField({
      name: 'albumCover',
      title: 'Album cover',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) =>
        rule.required().error('Album cover artwork is required.'),
    }),
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'artist',
      duration: 'duration',
    },
    prepare({title, artist, duration}) {
      return {
        title: title || 'Untitled song',
        subtitle: `${artist || 'Unknown artist'} · ${formatDuration(duration)}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
