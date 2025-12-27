import {getFocusTodos, type Todo} from '@/app/lib/sanity'

export default async function QuickTodos() {
  const {incomplete, completed} = await getFocusTodos()
  const totalCount = incomplete.length + completed.length
  const completedCount = completed.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const hasCompleted = completed.length > 0
  const hasTodos = totalCount > 0

  const renderTodo = (todo: Todo, isCompleted: boolean) => (
    <div key={todo._id} className="flex items-start gap-2 group relative" title={todo.title}>
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
          }`}
        >
          {isCompleted && (
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span
        className={`text-[10px] leading-tight flex-1 truncate ${
          isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'
        }`}
      >
        {todo.title}
      </span>
    </div>
  )

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-1.5 flex-shrink-0">
        Focus {hasTodos ? `(${completedCount}/${totalCount})` : ''}
      </h3>
      <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800 flex-1 flex flex-col min-h-0">
        <div className="space-y-1 flex-1 overflow-hidden">
          {!hasTodos && (
            <div className="text-[10px] leading-tight text-gray-500 italic">
              No focus items yet.
            </div>
          )}
          {incomplete.map((todo) => renderTodo(todo, false))}
          {hasCompleted && (
            <div className="pt-1">
              <div className="border-t border-gray-800 pt-1 text-[9px] uppercase tracking-[0.2em] text-gray-500">
                Recently completed
              </div>
            </div>
          )}
          {completed.map((todo) => renderTodo(todo, true))}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-800 flex-shrink-0">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
