'use client'

import { useRef, type ReactNode, type RefObject } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { staggerContainer } from './animation-variants'

interface MotionSectionProps {
  children: ReactNode
  className?: string
  variants?: Variants
  threshold?: number
  once?: boolean
}

/**
 * MotionSection - Client wrapper for section-level staggered animations
 *
 * Use this to wrap entire sections (Tech Stack, Experience) that contain
 * multiple items that should stagger in when the section comes into view.
 *
 * Children should be wrapped in motion.div with staggerItem variants
 * to properly participate in the stagger effect.
 */
export default function MotionSection({
  children,
  className = '',
  variants = staggerContainer,
  threshold = 0.4,
  once = false,
}: MotionSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref as RefObject<Element>, {
    amount: threshold,
    once,
  })

  return (
    <section className={className} ref={ref}>
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={variants}
      >
        {children}
      </motion.div>
    </section>
  )
}
