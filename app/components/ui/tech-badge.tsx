interface TechBadgeProps {
  name: string
}

export function TechBadge({ name }: TechBadgeProps) {
  return (
    <div className="px-3 md:px-4 py-2 border border-gray-600 text-gray-200 rounded-full text-xs md:text-sm font-medium transition-colors" style={{ borderColor: "rgb(75, 85, 99)" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgb(96, 165, 250)"; e.currentTarget.style.color = "rgb(96, 165, 250)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgb(75, 85, 99)"; e.currentTarget.style.color = "rgb(209, 213, 219)"; }}>
      {name}
    </div>
  )
}
