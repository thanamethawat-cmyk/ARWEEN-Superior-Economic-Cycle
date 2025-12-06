import React from 'react';
import { Truck, LayoutDashboard, Menu, X, ShieldCheck, Globe } from 'lucide-react';
import { AIChatbot } from './features/AIChatbot';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'dashboard';
  setActiveTab: (tab: 'home' | 'dashboard') => void;
  language: 'th' | 'en';
  setLanguage: (lang: 'th' | 'en') => void;
}

// Translation Dictionary for Menu Items
const MENU_TEXT = {
  th: {
    vision: "วิสัยทัศน์ & พันธกิจ",
    pillars: "4 เสาหลัก ARWEEN",
    impact: "ผลลัพธ์ที่คาดการณ์",
    founder: "เกี่ยวกับผู้ก่อตั้ง",
    dashboard: "แพลตฟอร์มอัจฉริยะ",
    privacy: "นโยบายความเป็นส่วนตัว",
    terms: "เงื่อนไขการใช้งาน",
    contact: "ติดต่อเรา",
    slogan: "Zero Accident & Life First."
  },
  en: {
    vision: "Vision & Mission",
    pillars: "4 Pillars",
    impact: "Expected Impact",
    founder: "Founder",
    dashboard: "Intelligent Platform",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    contact: "Contact Us",
    slogan: "Zero Accident & Life First."
  }
};

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, language, setLanguage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const t = MENU_TEXT[language];

  const handleMobileNav = (target: string) => {
    if (target === 'dashboard') {
      setActiveTab('dashboard');
      setIsMobileMenuOpen(false);
      window.scrollTo(0, 0);
      return;
    }

    // If target is a section on home page
    setActiveTab('home');
    setIsMobileMenuOpen(false);
    
    // Small delay to ensure DOM is ready if switching from dashboard
    setTimeout(() => {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Truck className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ARWEEN
              </span>
            </div>
            
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'home' 
                    ? 'text-white bg-slate-800' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t.vision}
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'dashboard' 
                    ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-900' 
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </button>

                {/* Language Switcher (Desktop) */}
                <div className="h-6 w-px bg-slate-800 mx-2"></div>
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 hover:border-cyan-500/50 transition-all text-xs font-bold"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className={`${language === 'th' ? 'text-cyan-400' : 'text-slate-500'}`}>ไทย</span>
                  <span className="text-slate-600">|</span>
                  <span className={`${language === 'en' ? 'text-cyan-400' : 'text-slate-500'}`}>EN</span>
                </button>
              </div>
            </div>

            <div className="-mr-2 flex lg:hidden items-center gap-4">
               {/* Language Switcher (Mobile) */}
               <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-xs font-bold"
                >
                  <span className={`${language === 'th' ? 'text-cyan-400' : 'text-slate-500'}`}>ไทย</span>
                  <span className="text-slate-600">|</span>
                  <span className={`${language === 'en' ? 'text-cyan-400' : 'text-slate-500'}`}>EN</span>
                </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => handleMobileNav('vision')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {t.vision}
              </button>
              <button
                onClick={() => handleMobileNav('pillars')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {t.pillars}
              </button>
              <button
                onClick={() => handleMobileNav('impact')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {t.impact}
              </button>
              <button
                onClick={() => handleMobileNav('founder')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {t.founder}
              </button>
              <button
                onClick={() => handleMobileNav('dashboard')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-cyan-400 bg-slate-800 mt-2"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div key={activeTab} className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Floating Chatbot Widget */}
      <AIChatbot />

      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <ShieldCheck className="text-slate-500 w-5 h-5" />
             <p className="text-slate-500 text-sm">© 2025 ARWEEN Platform. {t.slogan}</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
             <span className="hover:text-white cursor-pointer">{t.privacy}</span>
             <span className="hover:text-white cursor-pointer">{t.terms}</span>
             <span className="hover:text-white cursor-pointer">{t.contact}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
