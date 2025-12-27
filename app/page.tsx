import Header from "./components/header";
import Hero from "./components/hero";
import TechStack from "./components/tech-stack";
import Experience from "./components/experience";
import Footer from "./components/footer";
import HomeShell from "./components/HomeShell";

export default function Home() {
  return (
    <HomeShell>
      <Header />
      <Hero />
      <TechStack />
      <Experience />
      <Footer />
    </HomeShell>
  );
}
