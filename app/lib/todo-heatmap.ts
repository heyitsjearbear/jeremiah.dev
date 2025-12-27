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

const toUtcDayKey = (date: Date) => date.toISOString().slice(0, 10)

const toUtcMidnight = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

export const buildHeatmapDays = (
  todos: TodoHeatmapItem[],
  days = HEATMAP_RANGE_DAYS,
  today = new Date(),
): HeatmapDay[] => {
  const totals = new Map<string, {count: number; score: number; tasks: string[]}>()

  for (const todo of todos) {
    const completedDate = new Date(todo.completedAt)
    if (Number.isNaN(completedDate.getTime())) {
      continue
    }
    const dayKey = toUtcDayKey(completedDate)
    const entry = totals.get(dayKey) ?? {count: 0, score: 0, tasks: []}
    entry.count += 1
    entry.score += priorityWeights[todo.priority] ?? 1
    entry.tasks.push(todo.title || 'Untitled task')
    totals.set(dayKey, entry)
  }

  const results: HeatmapDay[] = []
  const endDate = toUtcMidnight(today)
  const dayCount = Math.max(0, days)

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const current = new Date(endDate)
    current.setUTCDate(current.getUTCDate() - offset)
    const dayKey = toUtcDayKey(current)
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
