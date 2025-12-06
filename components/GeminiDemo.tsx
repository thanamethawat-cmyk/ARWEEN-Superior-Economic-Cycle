
import React, { useState } from 'react';
import { RouteOptimizer } from './features/RouteOptimizer';
import { OperationalKPI } from './features/SafetyScanner';
import { MapAssistant } from './features/MapAssistant';
import { DriverWallet } from './features/DriverWallet';
import { SystemAdmin } from './features/SystemAdmin';
import { BrainCircuit, BarChart3, MapPin, Cpu, Wallet, ShieldAlert } from 'lucide-react';

export const GeminiDemo: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<'optimizer' | 'safety' | 'map' | 'wallet' | 'admin'>('optimizer');

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
           <Cpu className="w-6 h-6" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">ARWEEN Intelligent Core</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          ศูนย์ควบคุมและสั่งการด้วยปัญญาประดิษฐ์ (AI Command Center) ที่เชื่อมโยงข้อมูลทุกภาคส่วนเข้าด้วยกัน
        </p>
      </div>

      {/* Control Console Navigation */}
      <div className="flex justify-center mb-10 overflow-x-auto">
        <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 inline-flex gap-1 sm:gap-2 shadow-2xl min-w-max">
          <button
            onClick={() => setActiveFeature('optimizer')}
            className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeFeature === 'optimizer'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-900/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">AI Route Planner</span>
            <span className="sm:hidden">Routes</span>
          </button>

          <button
            onClick={() => setActiveFeature('safety')}
            className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeFeature === 'safety'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Operational KPI</span>
            <span className="sm:hidden">KPIs</span>
          </button>

          <button
            onClick={() => setActiveFeature('map')}
            className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeFeature === 'map'
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Map Intelligence</span>
            <span className="sm:hidden">Map</span>
          </button>

          <button
            onClick={() => setActiveFeature('wallet')}
            className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeFeature === 'wallet'
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white shadow-lg shadow-yellow-900/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Smart Wallet</span>
            <span className="sm:hidden">Wallet</span>
          </button>

          <button
            onClick={() => setActiveFeature('admin')}
            className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeFeature === 'admin'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-900/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">System Admin</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content Area with subtle glowing border */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-50 -z-10"></div>
        <div className="bg-slate-950 rounded-[23px] overflow-hidden min-h-[600px]">
          {activeFeature === 'optimizer' && <RouteOptimizer />}
          {activeFeature === 'safety' && <OperationalKPI />}
          {activeFeature === 'map' && <MapAssistant />}
          {activeFeature === 'wallet' && <DriverWallet />}
          {activeFeature === 'admin' && <SystemAdmin />}
        </div>
      </div>
      
      <div className="text-center mt-6 text-xs text-slate-600 font-mono">
         SYSTEM VERSION: 2.5.0-BETA | CONNECTED TO GEMINI 2.5 FLASH/3.0 PRO
      </div>
    </div>
  );
};