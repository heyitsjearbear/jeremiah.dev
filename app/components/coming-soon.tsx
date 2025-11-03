type ComingSoonProps = {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <section className="max-w-3xl mx-auto px-4 md:px-6 py-24 md:py-32 text-center space-y-6">
      <div className="font-mono text-sm md:text-base" style={{ color: "rgb(96, 165, 250)" }}>
        {`// ${title.toLowerCase()} — in progress`}
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold text-white">{title}</h1>
      <p className="text-base md:text-lg text-gray-300 leading-relaxed">
        {description ?? "This page is under construction. Check back soon for updates."}
      </p>
    </section>
  )
}
