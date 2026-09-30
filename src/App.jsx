import Header from "./components/Header";
import Hero from "./components/Hero";
import HeritageIntro from "./components/HeritageIntro";
import MatchShowcase from "./components/MatchShowcase";
import Experience from "./components/Experience";
import Privacy from "./components/Privacy";
import BiodataShowcase from "./components/BiodataShowcase";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="site-shell">
      <Header />

      <main>
        <Hero />
        <HeritageIntro />
        <MatchShowcase />
        <Experience />
        <Privacy />
        <BiodataShowcase />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}