import type { Variants } from 'framer-motion'

// Terminal-style reveal animation
// Uses smooth easing that feels like terminal output
export const terminalReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.45,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96], // Custom ease for terminal feel
      delay,
    },
  }),
}

// Container for staggered children
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
}

// Individual staggered item
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.45,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
}

// Fade only (no transform) - useful for text reveals
export const fadeReveal: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Scale reveal - for badges/icons
export const scaleReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
}
