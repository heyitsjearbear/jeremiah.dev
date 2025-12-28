import Header from "./components/header";
import HeroText from "./components/HeroText";
import HeroWidgets from "./components/HeroWidgets";
import TechStack from "./components/tech-stack";
import Experience from "./components/experience";
import Footer from "./components/footer";
import HomeShell from "./components/HomeShell";

export default function Home() {
  return (
    <HomeShell>
      <Header />
      <HeroText />
      <HeroWidgets />
      <TechStack />
      <Experience />
      <Footer />
    </HomeShell>
  );
}
