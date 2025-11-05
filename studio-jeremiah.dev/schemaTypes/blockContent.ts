import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      title: 'Block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {
            title: 'Accent',
            value: 'accent',
            icon: () => 'A',
          },
          {title: 'Code', value: 'code'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule) => rule.required().uri({allowRelative: true}),
              }),
              defineField({
                name: 'openInNewTab',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: false,
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (rule) =>
            rule.required().warning('Alt text keeps the experience accessible.'),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
        defineField({
          name: 'attribution',
          type: 'string',
          title: 'Attribution',
        }),
      ],
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Code block',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          type: 'string',
          title: 'Title',
          description: 'Shown above the snippet in the front-end when provided.',
        }),
        defineField({
          name: 'language',
          type: 'string',
          title: 'Language',
          initialValue: 'typescript',
          options: {
            list: [
              {title: 'TypeScript', value: 'typescript'},
              {title: 'JavaScript', value: 'javascript'},
              {title: 'Bash', value: 'bash'},
              {title: 'JSON', value: 'json'},
              {title: 'CSS', value: 'css'},
              {title: 'MDX', value: 'mdx'},
            ],
            layout: 'dropdown',
          },
        }),
        defineField({
          name: 'filename',
          type: 'string',
          title: 'Filename',
        }),
        defineField({
          name: 'highlightedLines',
          type: 'array',
          title: 'Highlighted lines',
          of: [{type: 'number'}],
          validation: (rule) =>
            rule.unique().warning('Duplicate highlighted lines will be ignored.'),
        }),
        defineField({
          name: 'code',
          type: 'text',
          title: 'Code',
          rows: 12,
          validation: (rule) =>
            rule.required().error('Code blocks need content before publishing.'),
        }),
      ],
      preview: {
        select: {
          title: 'title',
          language: 'language',
          code: 'code',
        },
        prepare({title, language, code}) {
          return {
            title: title || `Code (${language ?? 'plaintext'})`,
            subtitle: code ? `${code.split('\n').length} lines` : 'No code provided yet',
          }
        },
      },
    }),
  ],
})
