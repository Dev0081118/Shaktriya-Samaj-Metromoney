import BiodataShowcase from '../components/BiodataShowcase';
import Experience from '../components/Experience';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import Header from '../components/Header';
import HeritageIntro from '../components/HeritageIntro';
import Hero from '../components/Hero';
import MatchShowcase from '../components/MatchShowcase';
import Privacy from '../components/Privacy';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
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