// app/page.tsx
import IntroSection from '../components/sections/IntroSection';
import FeatureBlurbs from '../components/sections/FeatureBlurbs';
import CounterSection from '../components/sections/CounterSection';
import EcoFutureSection from '../components/sections/EcoFutureSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import NavBar from '../components/layout/NavBar';

export default function Home() {
  return (
      <div>
      <IntroSection />
      <CounterSection />
      <EcoFutureSection />
      <TestimonialsSection />
    </div>
  );
}
