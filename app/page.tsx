"use client";

import { motion } from "framer-motion";
import Header from "./components/header";
import Hero from "./components/hero";
import TechStack from "./components/tech-stack";
import Experience from "./components/experience";
import Footer from "./components/footer";
import { TerminalIntro } from "./components/terminal-intro";
import { useIntro } from "./components/providers/intro-context";

export default function Home() {
  const { introComplete, markComplete } = useIntro();

  return (
    <main className="min-h-screen bg-gray-800 text-white">
      {!introComplete && <TerminalIntro onComplete={markComplete} />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 10 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Header />
        <Hero />
        <TechStack />
        <Experience />
        <Footer />
      </motion.div>
    </main>
  );
}
