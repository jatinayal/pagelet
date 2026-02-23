import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import UseCases from '@/components/home/UseCases';
import CTA from '@/components/home/CTA';
import Footer from '@/components/home/Footer';

export default function HomePage() {
  return (
    <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <CTA />
      <Footer />
    </main>
  );
}
