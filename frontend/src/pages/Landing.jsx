import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustedBy from '../components/TrustedBy';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import MatchmakingPreview from '../components/MatchmakingPreview';
import TeamDiscovery from '../components/TeamDiscovery';
import AiMatchSystem from '../components/AiMatchSystem';
import Testimonials from '../components/Testimonials';
import FinalCta from '../components/FinalCta';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <MatchmakingPreview />
        <TeamDiscovery />
        <AiMatchSystem />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
};

export default Landing;
