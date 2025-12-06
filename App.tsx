import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Pillars } from './components/Pillars';
import { ImpactStats } from './components/ImpactStats';
import { GeminiDemo } from './components/GeminiDemo';
import { FounderStatement } from './components/FounderStatement';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>('home');
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      language={language}
      setLanguage={setLanguage}
    >
      {activeTab === 'home' ? (
        <div className="space-y-20 pb-20">
          <section id="vision" className="scroll-mt-24">
            <Hero onGetStarted={() => setActiveTab('dashboard')} />
          </section>
          <section id="pillars" className="scroll-mt-24">
            <Pillars />
          </section>
          <section id="impact" className="scroll-mt-24">
            <ImpactStats />
          </section>
          <section id="founder" className="scroll-mt-24">
            <FounderStatement />
          </section>
        </div>
      ) : (
        <div className="py-10">
          <GeminiDemo />
        </div>
      )}
    </Layout>
  );
};

export default App;