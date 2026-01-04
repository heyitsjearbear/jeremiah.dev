import {getFocusTodos} from '@/app/lib/sanity'
import TodoItem from './todo-item'

export default async function QuickTodos() {
  const {incomplete, completed} = await getFocusTodos()
  const displayedTotalCount = incomplete.length + completed.length
  const displayedCompletedCount = completed.length
  const progress = displayedTotalCount > 0 ? (displayedCompletedCount / displayedTotalCount) * 100 : 0
  const hasCompleted = completed.length > 0
  const hasTodos = displayedTotalCount > 0

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-1.5 flex-shrink-0">
        Focus {hasTodos ? `(${displayedCompletedCount}/${displayedTotalCount})` : ''}
      </h3>
      <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800 flex-1 flex flex-col min-h-0">
        <div className="space-y-1 flex-1 overflow-y-scroll overflow-x-hidden pr-1 scrollbar-blue">
          {!hasTodos && (
            <div className="text-[10px] leading-tight text-gray-500 italic">
              No focus items yet.
            </div>
          )}
          {incomplete.map((todo) => (
            <TodoItem key={todo._id} title={todo.title} isCompleted={false} />
          ))}
          {hasCompleted && (
            <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
              Recently completed
            </div>
          )}
          {completed.map((todo) => (
            <TodoItem key={todo._id} title={todo.title} isCompleted={true} />
          ))}
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
