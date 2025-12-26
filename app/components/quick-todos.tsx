interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function QuickTodos() {
  const todos: Todo[] = [
    { id: 1, text: 'Ship Zenergy MVP', completed: true },
    { id: 2, text: 'Refactor API endpoints', completed: true },
    { id: 3, text: 'Review PRs', completed: false },
    { id: 4, text: 'Write documentation', completed: false },
    { id: 5, text: 'Optimize performance', completed: false },
  ]

  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-1.5 flex-shrink-0">
        Focus ({completedCount}/{todos.length})
      </h3>
      <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800 flex-1 flex flex-col min-h-0">
        <div className="space-y-1 flex-1 overflow-hidden">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-2 group relative"
              title={todo.text}
            >
              <div className="mt-0.5 flex-shrink-0">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-600'
                  }`}
                >
                  {todo.completed && (
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
                  todo.completed
                    ? 'text-gray-500 line-through'
                    : 'text-gray-300'
                }`}
              >
                {todo.text}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-800 flex-shrink-0">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(completedCount / todos.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
