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
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-300 mb-3">
        Focus ({completedCount}/{todos.length})
      </h3>
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 group relative"
              title={todo.text}
            >
              <div className="mt-0.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-600'
                  }`}
                >
                  {todo.completed && (
                    <svg
                      className="w-3 h-3 text-white"
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
                className={`text-xs flex-1 ${
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

        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
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
