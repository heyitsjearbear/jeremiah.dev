'use client'

import { useRef, MouseEvent, ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  href?: string
  target?: string
  rel?: string
}

export default function MagneticButton({
  children,
  className = "",
  href,
  target,
  rel,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
  }

  const handleMouseLeave = () => {
    const btn = btnRef.current
    if (!btn) return
    btn.style.transform = 'translate(0, 0)'
  }

  return (
    <a
      ref={btnRef}
      href={href}
      target={target}
      rel={rel}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </a>
  )
}
