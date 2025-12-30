'use client'

import { forwardRef, MouseEvent, ReactNode, useCallback, useRef, useState, useEffect } from 'react'
import { Slot } from '@radix-ui/react-slot'

interface MagneticElementProps {
  children: ReactNode
  className?: string
  asChild?: boolean
  magneticIntensity?: number
}

const MagneticElement = forwardRef<HTMLElement, MagneticElementProps>(
  (
    {
      children,
      className = '',
      asChild = false,
      magneticIntensity = 0.3,
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement | null>(null)
    // Initialize as false to avoid hydration mismatch - sync in useEffect
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const setRefs = useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node
        if (!forwardedRef) return
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else {
          forwardedRef.current = node
        }
      },
      [forwardedRef]
    )

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      // Sync initial value on mount
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
      // Skip magnetic effect if user prefers reduced motion or on touch devices
      if (
        prefersReducedMotion ||
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          !window.matchMedia('(pointer: fine)').matches)
      ) {
        return
      }

      const element = internalRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      element.style.transform = `translate(${x * magneticIntensity}px, ${y * magneticIntensity}px)`
    }

    const handleMouseLeave = () => {
      const element = internalRef.current
      if (!element) return
      element.style.transform = 'translate(0, 0)'
    }

    if (asChild) {
      return (
        <Slot
          ref={setRefs}
          className={`transition-transform duration-300 ease-out ${className}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </Slot>
      )
    }

    return (
      <div
        ref={setRefs}
        className={`transition-transform duration-300 ease-out ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    )
  }
)

MagneticElement.displayName = 'MagneticElement'

export default MagneticElement
