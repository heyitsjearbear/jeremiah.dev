"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface TerminalIntroProps {
  onComplete: () => void;
  duration?: number;
}

export function TerminalIntro({ onComplete, duration = 1.25 }: TerminalIntroProps) {
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = "jeremiah.dev";

  // Typing animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(blink);
  }, []);

  // Auto-complete after animation
  useEffect(() => {
    if (isTypingComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isTypingComplete, duration, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgb(31, 41, 55)",
          zIndex: 50,
        }}
      >
        {/* Terminal Text */}
        <motion.div
          initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          animate={
            isTypingComplete
              ? { scale: 0.25, x: "-47vw", y: "-47vh", opacity: 0 }
              : { scale: 1, x: 0, y: 0, opacity: 1 }
          }
          transition={{ 
            duration: 1.2, 
            ease: "easeInOut",
            delay: isTypingComplete ? 0.2 : 0
          }}
          exit={{ opacity: 0 }}
          style={{
            fontFamily: "monospace",
            fontSize: "2rem",
            color: "rgb(96, 165, 250)",
            letterSpacing: "0.1em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{text}</span>
            {!isTypingComplete && showCursor && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{
                  width: "0.5rem",
                  height: "2rem",
                  backgroundColor: "rgb(96, 165, 250)",
                  display: "inline-block",
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
