import Header from "./components/layout/Header";
import Hero from "./components/home/Hero";
import UpcomingTournament from "./components/home/UpcomingTournament";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <UpcomingTournament />
    </>
  );
}