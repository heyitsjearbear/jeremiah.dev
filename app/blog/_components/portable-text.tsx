import {PortableText, type PortableTextComponents} from '@portabletext/react'
import Image from 'next/image'
import {cn} from '@/app/lib/utils'
import {urlForImage, type SanityImage, type BlogPortableTextValue} from '@/app/lib/sanity'

type PortableTextProps = {
  value: BlogPortableTextValue
  className?: string
}

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => (
      <p className="text-base text-gray-300 leading-relaxed md:text-lg">{children}</p>
    ),
    h2: ({children}) => (
      <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="text-xl md:text-2xl font-semibold text-gray-100 tracking-tight">{children}</h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="relative border-l-2 border-sky-400/80 pl-6 text-lg text-gray-200 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({children}) => <span className="font-semibold text-white">{children}</span>,
    em: ({children}) => <span className="italic text-gray-200">{children}</span>,
    code: ({children}) => (
      <code className="rounded bg-gray-800/80 px-2 py-1 text-sm font-mono text-sky-300">
        {children}
      </code>
    ),
    accent: ({children}) => (
      <span className="font-mono text-sky-400 tracking-tight">{children}</span>
    ),
    link: ({children, value}) => {
      const href = value?.href ?? '#'
      const target = value?.openInNewTab ? '_blank' : undefined
      const rel = value?.openInNewTab ? 'noopener noreferrer' : undefined
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className="text-sky-400 underline decoration-sky-400/60 underline-offset-4 transition hover:text-white"
        >
          {children}
        </a>
      )
    },
  },
  list: {
    bullet: ({children}) => (
      <ul className="space-y-2 pl-6 text-gray-300 marker:text-sky-400">{children}</ul>
    ),
    number: ({children}) => (
      <ol className="space-y-2 pl-6 text-gray-300 marker:text-sky-400">{children}</ol>
    ),
  },
  types: {
    image: ({value}) => {
      const image = value as SanityImage
      const imageUrl = urlForImage(image)?.width(1200).height(675).quality(85).url()
      if (!imageUrl) {
        return null
      }

      return (
        <figure className="overflow-hidden rounded-xl border border-white/5 bg-gray-900/70 shadow-lg shadow-sky-500/5">
          <Image
            src={imageUrl}
            alt={image.alt || ''}
            width={1200}
            height={675}
            className="h-auto w-full object-cover transition duration-500 ease-out"
            sizes="(min-width: 1024px) 768px, 90vw"
          />
          {(image.caption || image.alt) && (
            <figcaption className="border-t border-white/5 px-6 py-4 text-sm text-gray-400">
              {image.caption || image.alt}
            </figcaption>
          )}
        </figure>
      )
    },
    codeBlock: ({value}) => {
      const codeValue = value as {
        title?: string
        code?: string
        language?: string
        filename?: string
        highlightedLines?: number[]
      }

      if (!codeValue.code) {
        return null
      }

      const lines = codeValue.code.split('\n')
      const highlights = new Set(codeValue.highlightedLines ?? [])

      return (
        <figure className="overflow-hidden rounded-xl border border-white/10 bg-gray-900/80 shadow-lg shadow-sky-500/5">
          {(codeValue.title || codeValue.filename) && (
            <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-gray-400">
              <span>{codeValue.title || 'Snippet'}</span>
              {codeValue.filename && (
                <span className="font-mono text-xs text-sky-400">{codeValue.filename}</span>
              )}
            </figcaption>
          )}
          <pre className="overflow-x-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 px-5 py-6 text-sm leading-6 text-gray-200">
            <code className="block font-mono">
              {lines.map((line, index) => {
                const lineNumber = index + 1
                const isHighlighted = highlights.has(lineNumber)

                return (
                  <div
                    key={lineNumber}
                    className={cn(
                      'grid grid-cols-[auto_1fr] gap-4 whitespace-pre',
                      isHighlighted && 'rounded bg-sky-500/10 text-white'
                    )}
                  >
                    <span className="select-none text-right text-xs text-gray-500">
                      {lineNumber.toString().padStart(2, '0')}
                    </span>
                    <span>{line || ' '}</span>
                  </div>
                )
              })}
            </code>
          </pre>
        </figure>
      )
    },
  },
}

export function BlogPortableText({value, className}: PortableTextProps) {
  if (!value?.length) {
    return null
  }

  return (
    <div className={cn('prose prose-invert max-w-none space-y-8 prose-headings:font-semibold', className)}>
      <PortableText value={value} components={components} />
    </div>
  )
}
