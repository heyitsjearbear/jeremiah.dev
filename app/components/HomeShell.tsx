"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TerminalIntro } from "./terminal-intro";
import { useIntro } from "./providers/intro-context";

type HomeShellProps = {
  children: ReactNode;
};

export default function HomeShell({ children }: HomeShellProps) {
  const { introComplete, markComplete } = useIntro();

  return (
    <main className="min-h-screen bg-gray-800 text-white">
      {!introComplete && <TerminalIntro onComplete={markComplete} />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 10 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </main>
  );
}
