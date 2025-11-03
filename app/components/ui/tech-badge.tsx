interface TechBadgeProps {
  name: string
}

export function TechBadge({ name }: TechBadgeProps) {
  return (
    <div className="px-3 md:px-4 py-2 border border-gray-300 rounded-full text-xs md:text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors">
      {name}
    </div>
  )
}
