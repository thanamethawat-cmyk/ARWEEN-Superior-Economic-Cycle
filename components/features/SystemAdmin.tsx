import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Users, Server, Lock, Unlock, Zap, Power, AlertTriangle, RefreshCw, Cpu, Database, Network, Clock, CheckCircle, Settings, Sliders, Bell, Globe, Save, FileBarChart, PieChart, TrendingUp, Calendar, Leaf, Download, ChevronDown, Award, Truck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { checkSystemHealth, SystemTelemetry } from '../../services/geminiService';

// Mock Data for Charts
const LOAD_DATA = [
  { time: '00:00', load: 20 },
  { time: '04:00', load: 15 },
  { time: '08:00', load: 65 },
  { time: '12:00', load: 85 },
  { time: '16:00', load: 75 },
  { time: '20:00', load: 45 },
  { time: '24:00', load: 30 },
];

const MOCK_USERS = [
  { id: 'DRV-089', name: 'สมชาย ใจดี', status: 'ONLINE', role: 'Driver', risk: 'LOW', lastActive: '2 min ago' },
  { id: 'DRV-112', name: 'วิชัย มั่นคง', status: 'OFFLINE', role: 'Driver', risk: 'LOW', lastActive: '4 hours ago' },
  { id: 'DRV-056', name: 'อำนาจ รักถิ่น', status: 'ONLINE', role: 'Driver', risk: 'HIGH', lastActive: 'Just now' },
  { id: 'OPS-001', name: 'System Admin', status: 'ONLINE', role: 'Admin', risk: 'SAFE', lastActive: 'Online' },
  { id: 'DRV-099', name: 'ปิติ สุขใจ', status: 'ONLINE', role: 'Driver', risk: 'LOW', lastActive: '10 min ago' },
  { id: 'DRV-105', name: 'กมล เทพารักษ์', status: 'OFFLINE', role: 'Driver', risk: 'MEDIUM', lastActive: '1 day ago' },
];

// Mock Data for Reports (Bi-Weekly)
const REPORT_PERIODS = [
  { id: 'P1-NOV', label: '1 - 15 พฤศจิกายน 2568' },
  { id: 'P2-OCT', label: '16 - 31 ตุลาคม 2568' },
  { id: 'P1-OCT', label: '1 - 15 ตุลาคม 2568' },
];

const COMPANY_KPI_DATA = {
  'P1-NOV': [
    { name: 'SCG Logistics', carbon: 1250, safety: 98.5, onTime: 99.2, drivers: 1450, color: '#ef4444' },
    { name: 'Flash Express', carbon: 3400, safety: 94.2, onTime: 97.5, drivers: 3200, color: '#f59e0b' },
    { name: 'Kerry Express', carbon: 2800, safety: 96.0, onTime: 98.1, drivers: 2800, color: '#f97316' },
    { name: 'JWD Group', carbon: 950, safety: 99.1, onTime: 99.8, drivers: 850, color: '#3b82f6' },
    { name: 'DHL Supply Chain', carbon: 1100, safety: 97.5, onTime: 98.9, drivers: 1200, color: '#eab308' },
  ],
  'P2-OCT': [
    { name: 'SCG Logistics', carbon: 1180, safety: 97.8, onTime: 98.5, drivers: 1445, color: '#ef4444' },
    { name: 'Flash Express', carbon: 3100, safety: 93.5, onTime: 96.0, drivers: 3150, color: '#f59e0b' },
    { name: 'Kerry Express', carbon: 2650, safety: 95.2, onTime: 97.5, drivers: 2780, color: '#f97316' },
    { name: 'JWD Group', carbon: 920, safety: 98.5, onTime: 99.0, drivers: 840, color: '#3b82f6' },
    { name: 'DHL Supply Chain', carbon: 1050, safety: 96.8, onTime: 98.0, drivers: 1190, color: '#eab308' },
  ]
};

type AdminTab = 'DASHBOARD' | 'USERS' | 'SETTINGS' | 'REPORTS';

export const SystemAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [safetyOverride, setSafetyOverride] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Reports State
  const [selectedPeriod, setSelectedPeriod] = useState('P1-NOV');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // System Settings State
  const [settings, setSettings] = useState({
    maxWeightTolerance: 0,
    speedLimitBuffer: 5,
    autoApprovePaymentLimit: 5000,
    notificationLevel: 'ALL'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const performHealthCheck = async () => {
    setIsChecking(true);
    const data = await checkSystemHealth();
    setTelemetry(data);
    setIsChecking(false);
  };

  useEffect(() => {
    performHealthCheck();
    const interval = setInterval(performHealthCheck, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => setIsSavingSettings(false), 1000);
  };

  const handleDownloadReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => setIsGeneratingReport(false), 1500);
  };

  // Calculate Aggregates for Report
  const currentReportData = COMPANY_KPI_DATA[selectedPeriod as keyof typeof COMPANY_KPI_DATA] || COMPANY_KPI_DATA['P1-NOV'];
  const totalCarbon = currentReportData.reduce((acc, curr) => acc + curr.carbon, 0);
  const avgSafety = (currentReportData.reduce((acc, curr) => acc + curr.safety, 0) / currentReportData.length).toFixed(1);
  const avgOnTime = (currentReportData.reduce((acc, curr) => acc + curr.onTime, 0) / currentReportData.length).toFixed(1);
  const totalDrivers = currentReportData.reduce((acc, curr) => acc + curr.drivers, 0);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-slate-950 min-h-[600px] text-slate-200 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 shadow-lg shadow-red-900/20">
              <ShieldAlert className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 System Command Center
                 <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">ADMIN ACCESS</span>
              </h2>
              <p className="text-slate-400 text-sm">ควบคุมระบบความปลอดภัย จัดการผู้ใช้งาน และตั้งค่าแพลตฟอร์ม</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300">{new Date().toLocaleTimeString('th-TH')}</span>
           </div>
           <button 
             onClick={performHealthCheck} 
             disabled={isChecking}
             className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700"
           >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
        >
          <Activity className="w-4 h-4" /> แดชบอร์ดระบบ (System)
        </button>
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'REPORTS' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
        >
          <FileBarChart className="w-4 h-4" /> แดชบอร์ด KPI (Business)
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'USERS' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> จัดการผู้ใช้งาน
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'SETTINGS' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
        >
          <Settings className="w-4 h-4" /> ตั้งค่าระบบ
        </button>
      </div>

      {activeTab === 'DASHBOARD' && (
        <>
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {/* 1. API Status */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Network className="w-5 h-5"/></div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${telemetry?.apiStatus === 'ONLINE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {telemetry?.apiStatus || 'CHECKING...'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1 font-mono">
                  {telemetry ? `${telemetry.latencyMs} ms` : '--'}
                </div>
                <div className="text-xs text-slate-500">Gemini API Latency</div>
            </div>

            {/* 2. System Load */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Cpu className="w-5 h-5"/></div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">STABLE</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1 font-mono">
                  {telemetry ? `${telemetry.aiLoad}%` : '--'}
                </div>
                <div className="text-xs text-slate-500">AI Compute Load</div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${telemetry?.aiLoad || 0}%` }}></div>
                </div>
            </div>

            {/* 3. Active Users */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Users className="w-5 h-5"/></div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">LIVE</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1 font-mono">1,248</div>
                <div className="text-xs text-slate-500">Active Drivers</div>
            </div>

            {/* 4. Database */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Database className="w-5 h-5"/></div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">SYNCED</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1 font-mono">45ms</div>
                <div className="text-xs text-slate-500">DB Response Time</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
              {/* Server Load Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    สถานะการทำงานของระบบ (System Load)
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={LOAD_DATA}>
                          <defs>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px'}}
                            itemStyle={{color: '#fff'}}
                          />
                          <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                </div>
              </div>

              {/* Emergency Controls Panel */}
              <div className="space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    ควบคุมสถานการณ์ฉุกเฉิน (Emergency Control)
                  </h3>
                  
                  <div className={`border rounded-2xl p-6 transition-all ${safetyOverride ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-500"><AlertTriangle className="w-6 h-6"/></div>
                        <button 
                          onClick={() => setSafetyOverride(!safetyOverride)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${safetyOverride ? 'bg-red-600' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${safetyOverride ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                    </div>
                    <h4 className="text-white font-bold mb-1">Global Safety Override</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        บังคับหยุดการเดินรถทั้งหมดในกรณีเกิดภัยพิบัติหรือเหตุฉุกเฉินระดับวิกฤต (Force Fleet Stop)
                    </p>
                    {safetyOverride && (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse bg-red-950/50 p-2 rounded border border-red-500/20">
                          <AlertTriangle className="w-3 h-3" /> SYSTEM LOCKDOWN ACTIVE
                        </div>
                    )}
                  </div>

                  <div className={`border rounded-2xl p-6 transition-all ${maintenanceMode ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500"><Server className="w-6 h-6"/></div>
                        <button 
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-yellow-600' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                    </div>
                    <h4 className="text-white font-bold mb-1">Maintenance Mode</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        ระงับการเข้าถึงของผู้ใช้งานชั่วคราวเพื่อปรับปรุงระบบ (User Access Suspended)
                    </p>
                  </div>
              </div>
          </div>
        </>
      )}

      {activeTab === 'REPORTS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="relative flex-grow sm:flex-grow-0">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">เลือกช่วงเวลา (Report Period)</label>
                  <div className="relative">
                    <select 
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="appearance-none bg-slate-950 border border-slate-700 hover:border-cyan-500 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-64 cursor-pointer"
                    >
                      {REPORT_PERIODS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
             </div>
             
             <button 
               onClick={handleDownloadReport}
               disabled={isGeneratingReport}
               className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
               {isGeneratingReport ? "Generating PDF..." : "Export Report (PDF)"}
             </button>
          </div>

          {/* 1. AI Executive Summary Block (Insight First) */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 relative z-10">
                <Settings className="w-5 h-5 animate-spin-slow" /> AI Executive Summary
             </h3>
             
             <div className="space-y-4 text-sm text-slate-300 leading-relaxed relative z-10">
                <p>
                   <strong className="text-white">ภาพรวมประจำปักษ์:</strong> ในช่วงวันที่ {REPORT_PERIODS.find(p => p.id === selectedPeriod)?.label} ภาพรวมระบบมีประสิทธิภาพสูงขึ้น โดยเฉพาะ <strong className="text-emerald-400">Flash Express</strong> ที่ทำยอด Carbon Credit สูงสุด ({Math.max(...currentReportData.map(d => d.carbon))} Tokens) จากการปรับปรุงเส้นทางขนส่ง
                </p>
                <p>
                   <strong className="text-white">จุดที่น่าชื่นชม:</strong> ค่าเฉลี่ยความปลอดภัยรวมอยู่ที่ <strong className="text-purple-400">{avgSafety}%</strong> ซึ่งสูงกว่าค่ามาตรฐาน (95%) แสดงถึงความสำเร็จของมาตรการแจ้งเตือนความเสี่ยง (Risk Alert)
                </p>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-700/50 flex gap-3 items-start">
                   <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                   <div>
                      <strong className="text-yellow-400 text-xs uppercase block mb-1">คำแนะนำเชิงกลยุทธ์ (Recommendation)</strong>
                      <p className="text-xs text-slate-400">
                         แนะนำให้ <span className="text-white font-bold">JWD Group</span> เพิ่มจำนวนคนขับในระบบเพื่อรองรับปริมาณงานที่เพิ่มขึ้น และให้ <span className="text-white font-bold">Flash Express</span> ตรวจสอบความเร็วเฉลี่ยในบางเส้นทางเพื่อรักษาคะแนนความปลอดภัยให้คงที่
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* 2. Aggregated KPI Cards - Prioritized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Card 1: Carbon (ESG Priority) */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-all hover:bg-slate-900/80">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                   <Leaf className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">รวมคาร์บอนเครดิต</div>
                   <div className="text-2xl font-black text-white leading-none">{totalCarbon.toLocaleString()}</div>
                   <div className="text-[10px] text-emerald-400 font-medium mt-1">+12% vs last period</div>
                </div>
             </div>

             {/* Card 2: Safety (Social Priority) */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all hover:bg-slate-900/80">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                   <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">ความปลอดภัยเฉลี่ย</div>
                   <div className="text-2xl font-black text-white leading-none">{avgSafety}%</div>
                   <div className="text-[10px] text-purple-400 font-medium mt-1">Target: 95%</div>
                </div>
             </div>

             {/* Card 3: Efficiency (Economic Priority) */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-500/30 transition-all hover:bg-slate-900/80">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                   <Truck className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">ส่งตรงเวลา (On-Time)</div>
                   <div className="text-2xl font-black text-white leading-none">{avgOnTime}%</div>
                   <div className="text-[10px] text-blue-400 font-medium mt-1">High Efficiency</div>
                </div>
             </div>

             {/* Card 4: Scale (Operations) */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-cyan-500/30 transition-all hover:bg-slate-900/80">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                   <Users className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">พนักงานขับรถ</div>
                   <div className="text-2xl font-black text-white leading-none">{totalDrivers.toLocaleString()}</div>
                   <div className="text-[10px] text-cyan-400 font-medium mt-1">Active Accounts</div>
                </div>
             </div>
          </div>

          {/* 3. Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Carbon Ranking Chart */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-emerald-400" />
                   Corporate Carbon Performance
                </h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentReportData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                         <XAxis type="number" stroke="#64748b" fontSize={10} />
                         <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={100} />
                         <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px'}}
                            cursor={{fill: '#1e293b', opacity: 0.4}}
                         />
                         <Bar dataKey="carbon" name="Carbon Credit" radius={[0, 4, 4, 0]} barSize={20} fill="#10b981" />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Safety Trend Chart */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                   <Award className="w-5 h-5 text-purple-400" />
                   Safety Score Comparison
                </h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentReportData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                         <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split(' ')[0]} />
                         <YAxis domain={[90, 100]} stroke="#64748b" fontSize={10} />
                         <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px'}}
                            cursor={{fill: '#1e293b', opacity: 0.4}}
                         />
                         <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                         <Bar dataKey="safety" name="Safety Score (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                         <Bar dataKey="onTime" name="On-Time Delivery (%)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* 4. Detailed Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
             <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2">
                <FileBarChart className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">สรุปผลรายองค์กร (Organizational Breakdown)</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-950/30 text-xs uppercase text-slate-500 font-bold">
                      <tr>
                         <th className="p-4">องค์กร (Organization)</th>
                         <th className="p-4 text-center">คนขับ (Drivers)</th>
                         <th className="p-4 text-center">Safety Score</th>
                         <th className="p-4 text-center">On-Time %</th>
                         <th className="p-4 text-right">Carbon Credit</th>
                         <th className="p-4 text-center">สถานะ (Status)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800 text-sm">
                      {currentReportData.map((row, idx) => (
                         <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-bold text-white border-l-4" style={{borderLeftColor: row.color}}>
                               {row.name}
                            </td>
                            <td className="p-4 text-center text-slate-300">{row.drivers.toLocaleString()}</td>
                            <td className="p-4 text-center">
                               <span className={`px-2 py-1 rounded font-bold ${row.safety >= 98 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                  {row.safety}%
                               </span>
                            </td>
                            <td className="p-4 text-center text-slate-300">{row.onTime}%</td>
                            <td className="p-4 text-right font-mono font-bold text-emerald-400">+{row.carbon.toLocaleString()}</td>
                            <td className="p-4 text-center">
                               {row.safety >= 98 ? (
                                  <span className="text-[10px] text-green-500 bg-green-950/30 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold">Excellent</span>
                               ) : (
                                  <span className="text-[10px] text-yellow-500 bg-yellow-950/30 border border-yellow-500/20 px-2 py-0.5 rounded uppercase font-bold">Good</span>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden animate-fade-in">
           <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                 <Users className="w-4 h-4 text-cyan-500" /> User Directory
              </h3>
              <div className="flex gap-2">
                <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-700">Total: {MOCK_USERS.length}</span>
                <button className="text-xs bg-cyan-600 text-white px-3 py-1 rounded-lg hover:bg-cyan-500 transition-colors">Add User</button>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {MOCK_USERS.map(user => (
                 <div 
                    key={user.id} 
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between cursor-pointer transition-all ${selectedUser === user.id ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                 >
                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${user.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                          {user.name.charAt(0)}
                       </div>
                       <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                             {user.name}
                             {user.role === 'Admin' && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">ADMIN</span>}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                             <span className="font-mono">{user.id}</span>
                             <span>•</span>
                             <span className={user.status === 'ONLINE' ? 'text-green-400' : 'text-slate-500'}>{user.status}</span>
                             <span>•</span>
                             <span>Last active: {user.lastActive}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pl-14 md:pl-0">
                       {user.risk === 'HIGH' && (
                          <div className="flex items-center gap-1 text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-500/20 text-xs">
                             <AlertTriangle className="w-3 h-3" /> High Risk
                          </div>
                       )}
                       
                       {selectedUser === user.id && (
                          <div className="flex gap-2 animate-fade-in-up">
                             <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white flex items-center gap-1">
                                <Lock size={12}/> Reset Pass
                             </button>
                             <button className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded text-xs text-red-400 border border-red-900 flex items-center gap-1">
                                <Power size={12}/> Suspend
                             </button>
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
           {/* General Settings */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                 <Sliders className="w-5 h-5 text-cyan-400" />
                 ตั้งค่าพารามิเตอร์ระบบ (Parameters)
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm text-slate-400 mb-2">เกณฑ์ความคลาดเคลื่อนน้ำหนัก (Weight Tolerance)</label>
                    <div className="flex items-center gap-4">
                       <input 
                         type="range" min="0" max="10" step="0.5"
                         value={settings.maxWeightTolerance}
                         onChange={(e) => setSettings({...settings, maxWeightTolerance: parseFloat(e.target.value)})}
                         className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                       />
                       <span className="font-mono text-cyan-400 font-bold w-12 text-right">{settings.maxWeightTolerance}%</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">ค่าที่ยอมรับได้ก่อนแจ้งเตือน Overweight Alert</p>
                 </div>

                 <div>
                    <label className="block text-sm text-slate-400 mb-2">บัฟเฟอร์จำกัดความเร็ว (Speed Limit Buffer)</label>
                    <div className="flex items-center gap-4">
                       <input 
                         type="range" min="0" max="20" step="1"
                         value={settings.speedLimitBuffer}
                         onChange={(e) => setSettings({...settings, speedLimitBuffer: parseFloat(e.target.value)})}
                         className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                       />
                       <span className="font-mono text-cyan-400 font-bold w-12 text-right">+{settings.speedLimitBuffer}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">กม./ชม. เกินจากป้ายจำกัดความเร็ว</p>
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <label className="block text-sm text-slate-400 mb-2">วงเงินอนุมัติอัตโนมัติ (Auto-Approve Limit)</label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">฿</div>
                       <input 
                          type="number"
                          value={settings.autoApprovePaymentLimit}
                          onChange={(e) => setSettings({...settings, autoApprovePaymentLimit: parseInt(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Notifications & System Info */}
           <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                 <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    การแจ้งเตือน (Notifications)
                 </h3>
                 <div className="space-y-3">
                    {['Critical Alerts Only', 'All Safety Alerts', 'All Activity'].map((opt) => (
                       <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors">
                          <input 
                             type="radio" 
                             name="notif" 
                             checked={
                                (opt.startsWith('All Act') && settings.notificationLevel === 'ALL') ||
                                (opt.startsWith('Crit') && settings.notificationLevel === 'CRITICAL') ||
                                (opt.startsWith('All Safe') && settings.notificationLevel === 'SAFETY')
                             }
                             onChange={() => setSettings({...settings, notificationLevel: opt.startsWith('Crit') ? 'CRITICAL' : opt.startsWith('All Safe') ? 'SAFETY' : 'ALL'})}
                             className="text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-600"
                          />
                          <span className="text-sm text-slate-300">{opt}</span>
                       </label>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                 <div>
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                       <Globe className="w-5 h-5 text-blue-400" />
                       Regional Settings
                    </h3>
                    <div className="text-sm text-slate-400 mb-4">
                       Current Region: <span className="text-white font-bold">Thailand (EEC)</span>
                       <br/>Timezone: <span className="text-white font-bold">Asia/Bangkok (GMT+7)</span>
                    </div>
                 </div>
                 
                 <button 
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                 >
                    {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                    {isSavingSettings ? "Saving Changes..." : "Save Configuration"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};