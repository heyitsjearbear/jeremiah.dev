'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import TypewriterText from './typewriter-text'
import MagneticButton from './magnetic-button'
import { useIntro } from './providers/intro-context'
import TerminalReveal from './TerminalReveal'

export default function HeroText() {
  const { introComplete } = useIntro()
  const [commentComplete, setCommentComplete] = useState(false)
  const [headlineComplete, setHeadlineComplete] = useState(false)

  return (
    <section className="min-h-[calc(100vh_-_var(--header-height))] flex items-center justify-center px-4 md:px-6">
      <TerminalReveal
        threshold={0.3}
        once={false}
        className="max-w-5xl mx-auto text-center"
      >
        <div className="flex flex-col gap-6">
        {/* Comment line */}
        <div className="font-mono text-sm md:text-base" style={{ color: "rgb(96, 165, 250)" }}>
          <TypewriterText
            text="// student founder – systems + ai + dev"
            speed={40}
            start={introComplete}
            onComplete={() => setCommentComplete(true)}
            showCursorAfterComplete={false}
          />
        </div>

        {/* Headline - types after comment */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
          <TypewriterText
            text="I build systems that help people think clearly and get more done."
            speed={30}
            start={commentComplete}
            onComplete={() => setHeadlineComplete(true)}
            showCursorAfterComplete={false}
          />
        </h1>

        {/* Description - fades in after headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: headlineComplete ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          <p className="text-base md:text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto">
            Founder of Zenergy—tools for focus, habits, and mental clarity. Experience across legal tech (Quilia), consumer research platforms (SightX: web dev + QA), and AI Camp (applied AI projects & mentorship).
          </p>
        </motion.div>

        {/* CTA Buttons - fade in after description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: headlineComplete ? 1 : 0, y: headlineComplete ? 0 : 10 }}
          transition={{ duration: 0.5, delay: 2.7 }}
        >
          <div className="flex gap-3 justify-center">
            <MagneticButton
              href="https://zenergy-ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer bg-blue-400 hover:bg-blue-500 text-sm inline-block"
            >
              View Zenergy
            </MagneticButton>
            <MagneticButton
              href="/projects"
              className="border border-gray-600 px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer text-gray-200 hover:border-blue-400 hover:text-blue-400 text-sm inline-block"
            >
              See Projects
            </MagneticButton>
          </div>
        </motion.div>
        </div>
      </TerminalReveal>
    </section>
  )
}
