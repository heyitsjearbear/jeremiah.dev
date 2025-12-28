'use client'

import Image from "next/image"
import { motion } from 'framer-motion'
import { experience } from '../config/site'
import MotionSection from './MotionSection'
import { staggerItem, staggerContainer } from './animation-variants'

export default function Experience() {
  return (
    <MotionSection
      className="max-w-6xl mx-auto px-6 py-8"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem}>
        <div className="text-gray-400 font-mono text-sm mb-6">
          {'// experience'}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 md:gap-8 mb-6 items-center">
        {experience.map((item) => (
          <motion.div key={item.alt} variants={staggerItem}>
            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-[rgb(96,165,250)] transition-colors hover:border-[rgb(147,197,253)]">
              <Image
                src={item.src || "/placeholder.svg"}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 64px, 96px"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </MotionSection>
  )
}
