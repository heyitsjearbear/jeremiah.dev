import {siteConfig} from '@/app/config/site'
import {HEATMAP_RANGE_DAYS, type TodoHeatmapItem, type TodoPriority} from '@/app/lib/sanity'

export type HeatmapDay = {
  date: string
  count: number
  score: number
  tasks: string[]
}

const priorityWeights: Record<TodoPriority, number> = {
  low: 1,
  medium: 3,
  high: 5,
}

const defaultTimeZone = siteConfig.timeZone ?? 'UTC'

const toTimeZoneParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  if (!year || !month || !day) {
    return null
  }
  return {year, month, day}
}

const toTimeZoneDayKey = (date: Date, timeZone: string) => {
  const parts = toTimeZoneParts(date, timeZone)
  if (!parts) {
    return null
  }
  return `${parts.year}-${parts.month}-${parts.day}`
}

const toCalendarDayKey = (value: string, timeZone: string) => {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return toTimeZoneDayKey(parsed, timeZone)
  }
  const datePart = value.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart
  }
  return null
}

export const buildHeatmapDays = (
  todos: TodoHeatmapItem[],
  days = HEATMAP_RANGE_DAYS,
  today = new Date(),
  timeZone = defaultTimeZone,
): HeatmapDay[] => {
  const totals = new Map<string, {count: number; score: number; tasks: string[]}>()

  for (const todo of todos) {
    const dayKey = toCalendarDayKey(todo.completedAt, timeZone)
    if (!dayKey) {
      continue
    }
    const entry = totals.get(dayKey) ?? {count: 0, score: 0, tasks: []}
    entry.count += 1
    entry.score += priorityWeights[todo.priority] ?? 1
    entry.tasks.push(todo.title || 'Untitled task')
    totals.set(dayKey, entry)
  }

  const results: HeatmapDay[] = []
  const endDayKey = toTimeZoneDayKey(today, timeZone) ?? toTimeZoneDayKey(today, 'UTC')
  const dayCount = Math.max(0, days)

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const current = endDayKey ? new Date(`${endDayKey}T00:00:00Z`) : new Date()
    current.setUTCDate(current.getUTCDate() - offset)
    const dayKey = current.toISOString().slice(0, 10)
    const entry = totals.get(dayKey)
    results.push({
      date: dayKey,
      count: entry?.count ?? 0,
      score: entry?.score ?? 0,
      tasks: entry?.tasks ?? [],
    })
  }

  return results
}
