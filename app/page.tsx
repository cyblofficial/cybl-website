import Header from "./components/layout/Header";
import Hero from "./components/home/Hero";
import LiveBanner from "./components/home/LiveBanner";
import WhyCYBL from "./components/home/WhyCYBL";
import UpcomingTournament from "./components/home/UpcomingTournament";
import AboutSection from "./components/home/AboutSection";
import Contact from "./components/home/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <LiveBanner />
      <WhyCYBL />
      <UpcomingTournament />
      <AboutSection />
      <Contact />
    </>
  );
}