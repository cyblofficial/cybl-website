import Header from "./components/layout/Header";
import Hero from "./components/home/Hero";
import AboutSection from "./components/home/AboutSection";
import UpcomingTournament from "./components/home/UpcomingTournament";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <AboutSection />
      <UpcomingTournament />
    </>
  );
}