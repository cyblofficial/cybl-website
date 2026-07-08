import Header from "./components/layout/Header";
import Hero from "./components/home/Hero";
import WhyCYBL from "./components/home/WhyCYBL";
import UpcomingTournament from "./components/home/UpcomingTournament";
import AboutSection from "./components/home/AboutSection";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <WhyCYBL />
      <UpcomingTournament />
      <AboutSection />
    </>
  );
}