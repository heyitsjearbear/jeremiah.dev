'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  start?: boolean
  onComplete?: () => void
  showCursorAfterComplete?: boolean
}

export default function TypewriterText({
  text,
  speed = 50,
  className = "",
  start = true,
  onComplete,
  showCursorAfterComplete = true
}: TypewriterTextProps) {
  // Use a key that changes when we need to reset
  const [resetKey, setResetKey] = useState(0)

  return (
    <TypewriterTextInner
      key={resetKey}
      text={text}
      speed={speed}
      className={className}
      start={start}
      onComplete={onComplete}
      showCursorAfterComplete={showCursorAfterComplete}
      onReset={() => setResetKey(k => k + 1)}
    />
  )
}

interface TypewriterTextInnerProps extends TypewriterTextProps {
  onReset: () => void
}

function TypewriterTextInner({
  text,
  speed = 50,
  className = "",
  start = true,
  onComplete,
  showCursorAfterComplete = true,
  onReset,
}: TypewriterTextInnerProps) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const hasCompletedRef = useRef(false)
  const prevTextRef = useRef(text)
  const isTyping = start && displayText.length < text.length
  const isComplete = displayText.length === text.length && displayText.length > 0

  // Memoize onComplete callback
  const handleComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  // Detect text changes and trigger reset via parent
  useEffect(() => {
    if (text !== prevTextRef.current) {
      prevTextRef.current = text
      onReset()
    }
  }, [text, onReset])

  // Typing effect - uses setTimeout callback which is allowed
  useEffect(() => {
    if (!start) return
    if (displayText.length >= text.length) {
      // Fire completion only once
      if (!hasCompletedRef.current && text.length > 0) {
        hasCompletedRef.current = true
        handleComplete()
      }
      return
    }

    const timeout = setTimeout(() => {
      setDisplayText(prev => prev + text[prev.length])
    }, speed)

    return () => clearTimeout(timeout)
  }, [start, text, speed, displayText, handleComplete])

  // Cursor blink effect (after completion only)
  useEffect(() => {
    if (!showCursorAfterComplete || !isComplete) return
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [isComplete, showCursorAfterComplete])

  // Don't render cursor when not started
  if (!start && displayText.length === 0) {
    return <span className={className}></span>
  }

  return (
    <span className={className}>
      {displayText}
      {isTyping && (
        <span className="animate-pulse">█</span>
      )}
      {isComplete && showCursorAfterComplete && showCursor && (
        <span className="opacity-75">█</span>
      )}
    </span>
  )
}
