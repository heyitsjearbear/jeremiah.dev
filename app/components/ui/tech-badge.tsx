interface TechBadgeProps {
  name: string
}

export function TechBadge({ name }: TechBadgeProps) {
  return (
    <div className="px-3 md:px-4 py-2 border border-[rgb(75,85,99)] text-gray-200 rounded-full text-xs md:text-sm font-medium transition-colors hover:border-[rgb(96,165,250)] hover:text-[rgb(96,165,250)]">
      {name}
    </div>
  )
}
