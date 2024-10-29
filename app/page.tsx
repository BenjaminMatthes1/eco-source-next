// app/page.tsx
import IntroSection from '../components/IntroSection';
import FeatureBlurbs from '../components/FeatureBlurbs';
import CounterSection from '../components/CounterSection';
import EcoFutureSection from '../components/EcoFutureSection';
import TestimonialsSection from '../components/TestimonialsSection';
import NavBar from '../components/NavBar';

export default function Home() {
  return (
      <div>
      <NavBar />
      <IntroSection />
      <CounterSection />
      <EcoFutureSection />
      <TestimonialsSection />
    </div>
  );
}
