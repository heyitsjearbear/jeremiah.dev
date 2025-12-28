'use client'

import { motion } from 'framer-motion'
import { techStack } from '../config/site'
import { TechBadge } from './ui/tech-badge'
import MotionSection from './MotionSection'
import { staggerItem, staggerContainer } from './animation-variants'

export default function TechStack() {
  return (
    <MotionSection
      className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem}>
        <div className="text-gray-400 font-mono text-xs md:text-sm mb-4 md:mb-6">
          {'// tech stack'}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {techStack.map((tech) => (
          <motion.div key={tech} variants={staggerItem}>
            <TechBadge name={tech} />
          </motion.div>
        ))}
      </div>
    </MotionSection>
  )
}
