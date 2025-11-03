import Header from "./components/header"
import Hero from "./components/hero"
import TechStack from "./components/tech-stack"
import Experience from "./components/experience"
import Footer from "./components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <Hero />
      <TechStack />
      <Experience />
      <Footer />
    </main>
  )
}
