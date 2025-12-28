"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TerminalIntro } from "./terminal-intro";
import { useIntro } from "./providers/intro-context";

type HomeShellProps = {
  children: ReactNode;
};

export default function HomeShell({ children }: HomeShellProps) {
  const { introComplete, markComplete } = useIntro();
  const { scrollY } = useScroll();
  const imageOpacity = useTransform(scrollY, [0, 260], [1, 0.3]);
  const overlayOpacity = useTransform(scrollY, [0, 260], [0.2, 0.7]);
  const gradientOpacity = useTransform(scrollY, [0, 260], [0.15, 0.85]);

  return (
    <main className="relative min-h-screen bg-gray-900 text-white">
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0">
          <motion.div style={{ opacity: imageOpacity, height: "100%", width: "100%", position: "relative" }}>
            <Image
              src="/portfolio-hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              quality={100}
              className="object-cover object-center"
            />
          </motion.div>
        </div>
        <div className="absolute inset-0">
          <motion.div
            style={{
              opacity: overlayOpacity,
              height: "100%",
              width: "100%",
              backgroundColor: "rgb(17, 24, 39)",
            }}
          />
        </div>
        <div className="absolute inset-0">
          <motion.div
            style={{
              opacity: gradientOpacity,
              height: "100%",
              width: "100%",
              backgroundImage:
                "linear-gradient(to bottom, rgba(17, 24, 39, 0.3), rgba(17, 24, 39, 0.55), rgba(17, 24, 39, 0.85))",
            }}
          />
        </div>
      </div>
      {!introComplete && <TerminalIntro onComplete={markComplete} />}

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 10 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
