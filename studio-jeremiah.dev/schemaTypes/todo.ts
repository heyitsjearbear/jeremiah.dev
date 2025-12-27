import {defineField, defineType} from 'sanity'

type CompletionContext = {
  document?: {
    status?: string | null
  }
}

const requireWhenDone =
  (message: string) => (value: unknown, context: CompletionContext) => {
    if (context.document?.status !== 'done') {
      return true
    }
    return value ? true : message
  }

export default defineType({
  name: 'todo',
  title: 'Todo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) =>
        rule.required().error('Todos need a clear, short title.'),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Todo', value: 'todo'},
          {title: 'In progress', value: 'in_progress'},
          {title: 'Done', value: 'done'},
        ],
        layout: 'radio',
      },
      initialValue: 'todo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: 'Low', value: 'low'},
          {title: 'Medium', value: 'medium'},
          {title: 'High', value: 'high'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed at',
      type: 'datetime',
      validation: (rule) =>
        rule.custom(
          requireWhenDone('Completed tasks need a completion timestamp.'),
        ),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      priority: 'priority',
      completedAt: 'completedAt',
    },
    prepare({title, status, priority, completedAt}) {
      const statusLabel = status ? status.replace('_', ' ') : 'todo'
      const priorityLabel = priority || 'medium'
      const dateLabel = completedAt
        ? new Date(completedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Not completed'
      return {
        title: title || 'Untitled todo',
        subtitle: `${statusLabel} · ${priorityLabel} · ${dateLabel}`,
      }
    },
  },
})
