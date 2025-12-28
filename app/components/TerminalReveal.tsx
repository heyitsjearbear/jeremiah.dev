'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { terminalReveal } from './animation-variants'

interface TerminalRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  variants?: Variants
  threshold?: number
  once?: boolean
}

/**
 * TerminalReveal - Client wrapper for scroll-triggered reveal animations
 *
 * IMPORTANT: This component does NOT unmount children when out of view.
 * It only animates opacity/transform to preserve stateful widgets like
 * NowPlaying, ActivityHeatmap, and QuickTodos.
 */
export default function TerminalReveal({
  children,
  className = '',
  delay = 0,
  variants = terminalReveal,
  threshold = 0.4,
  once = false,
}: TerminalRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasEntered, setHasEntered] = useState(false)
  const isInView = useInView(ref as RefObject<Element>, {
    amount: threshold,
    once,
  })

  useEffect(() => {
    if (!isInView || hasEntered) return
    const timeout = setTimeout(() => {
      setHasEntered(true)
    }, 0)
    return () => clearTimeout(timeout)
  }, [isInView, hasEntered])

  const revealDelay = hasEntered ? 0 : delay

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={variants}
        custom={revealDelay}
      >
        {children}
      </motion.div>
    </div>
  )
}
