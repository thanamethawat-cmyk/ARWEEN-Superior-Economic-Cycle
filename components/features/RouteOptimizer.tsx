import React, { useState, useEffect, useRef } from 'react';
import { optimizeLogistics, scanWaybill } from '../../services/geminiService';
import { Send, Loader2, Truck, Scale, BrainCircuit, MapPin, AlertTriangle, Leaf, ShieldCheck, Navigation, Clock, Coins, Info, Route, Factory, CheckCircle, XCircle, Activity, ChevronRight, Zap, Map as MapIcon, FileText, ScanLine, Camera, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

interface LogisticsData {
  route: {
    distance_km: number;
    duration_hours: number;
    primary_highway: string;
    risk_level: "Low" | "Medium" | "High";
  };
  legal: {
    vehicle_type_assumed: string;
    max_legal_weight_tons: number;
    current_cargo_weight_estimated_tons: number,
    is_compliant: boolean;
    compliance_status: "PASS" | "WARNING" | "ILLEGAL",
    law_citation: string;
  };
  eco: {
    carbon_emission_kg: number;
    benchmark_average_emission_kg: number;
    sustainability_rating: "A" | "B" | "C" | "D",
    carbon_credit_potential_thb: number;
  };
  strategy: {
    main_recommendation: string;
    cost_saving_tip: string;
    urgent_alerts: string[];
  };
  error?: boolean;
  message?: string;
}

// Simulation steps for the "Thinking" UI
const LOADING_STEPS = [
  "กำลังเชื่อมต่อดาวเทียมเพื่อคำนวณระยะทาง...",
  "กำลังตรวจสอบกฎหมายน้ำหนักบรรทุกกรมทางหลวง...",
  "กำลังวิเคราะห์สภาพจราจรและจุดเสี่ยงอุบัติเหตุ...",
  "กำลังประเมิน Carbon Footprint และเครดิต...",
  "กำลังสร้างแผนกลยุทธ์การเดินรถ..."
];

export const RouteOptimizer: React.FC = () => {
  const [origin, setOrigin] = useState("ท่าเรือแหลมฉบัง ชลบุรี");
  const [dest, setDest] = useState("นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี");
  const [cargo, setCargo] = useState("ชิ้นส่วนเครื่องจักรขนาดใหญ่ 15 ตัน");
  const [result, setResult] = useState<LogisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate progressive loading steps
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleOptimize = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await optimizeLogistics(origin, dest, cargo);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setIsScanning(true);
        try {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            const data = await scanWaybill(base64, file.type);
            if (data) {
                if (data.origin) setOrigin(data.origin);
                if (data.destination) setDest(data.destination);
                if (data.cargo) setCargo(data.cargo);
            }
        } catch(e) {
            console.error(e);
            alert("ไม่สามารถอ่านไฟล์ได้ โปรดลองใหม่อีกครั้ง");
        } finally {
            setIsScanning(false);
            // Reset input so the same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }
  };

  const getEcoColor = (rating: string) => {
    if (['A', 'B'].includes(rating)) return '#4ade80'; // green-400
    if (rating === 'C') return '#facc15'; // yellow-400
    return '#f87171'; // red-400
  };

  return (
    <div className="flex flex-col lg:flex-row bg-slate-950 w-full min-h-[650px] h-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Input Panel (Left Side / Top) */}
      <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950 z-20 relative flex-shrink-0">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf" 
          onChange={handleFileChange} 
        />

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="text-cyan-400 w-6 h-6" />
            <span>กำหนดค่าการขนส่ง</span>
          </h3>
          <div className="flex gap-2">
             <button 
                onClick={handleScanClick}
                disabled={isScanning || loading}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 transition-all text-xs font-bold disabled:opacity-50"
             >
                {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <ScanLine className="w-3.5 h-3.5" />}
                {isScanning ? "Scanning..." : "Scan Waybill"}
             </button>
             <div className="hidden sm:block px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono tracking-wider pt-1.5">AI CORE</div>
          </div>
        </div>

        {/* Mobile Scan Button (Visible only on small screens) */}
        <button 
            onClick={handleScanClick}
            disabled={isScanning || loading}
            className="sm:hidden mb-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
        >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4" />}
            {isScanning ? "AI กำลังอ่านเอกสาร..." : "ถ่ายรูปใบงาน / Invoice"}
        </button>
        
        <div className="space-y-6 flex-grow relative">
          {/* Scanning Overlay Effect */}
          {isScanning && (
             <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-cyan-500/30">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-lg animate-pulse"></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                   <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 w-8 h-8" />
                </div>
                <p className="mt-4 text-cyan-400 font-bold text-sm animate-pulse">AI Reading Waybill...</p>
                <p className="text-slate-500 text-xs">Extraction in progress</p>
             </div>
          )}

          {/* Origin Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div> 
               ต้นทาง (Origin)
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Factory className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-sm shadow-inner"
                placeholder="ระบุต้นทาง..."
              />
            </div>
          </div>

          {/* Destination Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div> 
               ปลายทาง (Destination)
            </label>
            <div className="relative group">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors">
                <MapPin className="w-4 h-4 fill-current" />
              </div>
              <input
                type="text"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-sm shadow-inner"
                placeholder="ระบุปลายทาง..."
              />
            </div>
          </div>

          {/* Cargo Details */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> 
               สินค้าที่บรรทุก (Cargo Payload)
            </label>
            <div className="relative group">
              <Truck className="absolute left-3 top-4 text-slate-500 group-focus-within:text-slate-300 w-4 h-4 transition-colors" />
              <textarea
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none h-28 lg:h-32 transition-all text-sm leading-relaxed shadow-inner"
                placeholder="ระบุประเภทสินค้าและน้ำหนัก..."
              />
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || isScanning}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group relative overflow-hidden active:scale-[0.98]"
          >
            {loading && (
               <div className="absolute inset-0 bg-white/10 animate-[shimmer_2s_infinite] skew-x-12"></div>
            )}
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            {loading ? "กำลังประมวลผล..." : "วิเคราะห์เส้นทาง (Analyze)"}
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-800 hidden lg:block">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
             <Info className="w-4 h-4" />
             <span>ขับเคลื่อนโดย Gemini 3.0 Pro (Thinking Mode)</span>
          </div>
        </div>
      </div>

      {/* Output Panel (Right Side / Bottom) */}
      <div className="w-full lg:w-2/3 p-4 sm:p-6 lg:p-8 bg-slate-950 relative flex flex-col min-h-[400px]">
        
        {/* Map Overlay Background (Abstract) */}
        <div className="absolute inset-0 pointer-events-none opacity-15 z-0">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
             <circle cx="80%" cy="20%" r="100" fill="url(#grid)" stroke="#0891b2" strokeWidth="1" opacity="0.2" />
           </svg>
           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950"></div>
        </div>

        {/* Intelligent Loading State */}
        {loading && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm rounded-2xl">
              <div className="relative mb-8">
                 <div className="w-24 h-24 border-4 border-cyan-500/20 rounded-full animate-spin"></div>
                 <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
                 <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 w-8 h-8 animate-pulse" />
              </div>
              
              <div className="flex flex-col items-center gap-3 max-w-md px-4 text-center">
                 <h3 className="text-xl font-bold text-white tracking-widest animate-pulse uppercase">AI Processing</h3>
                 <div className="space-y-2 w-full">
                   {LOADING_STEPS.map((step, idx) => (
                     <div 
                        key={idx} 
                        className={`text-sm transition-all duration-500 flex items-center gap-3 justify-start pl-4 ${
                          idx === loadingStep 
                            ? 'text-cyan-400 opacity-100 scale-105 font-bold bg-cyan-950/30 py-2 rounded-lg' 
                            : idx < loadingStep 
                              ? 'text-green-500/60 opacity-60' 
                              : 'text-slate-600 opacity-30'
                        }`}
                     >
                        {idx < loadingStep ? <CheckCircle size={14} /> : idx === loadingStep ? <Loader2 size={14} className="animate-spin"/> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700"></div>}
                        {step}
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        )}

        {result && !result.error ? (
          <div className="relative z-10 flex flex-col gap-6 animate-fade-in w-full pb-4">
            
            {/* 1. Route Dashboard Header */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 to-blue-600"></div>
               
               <div className="flex flex-col gap-6 pl-2">
                  {/* Origin & Destination Flow */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Origin */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                         <div className="mt-1 w-3 h-3 rounded-full border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] flex-shrink-0 bg-slate-950"></div>
                         <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">ต้นทาง</div>
                            <div className="font-bold text-slate-200 text-sm sm:text-base leading-tight break-words">{origin}</div>
                         </div>
                      </div>

                      {/* Arrow / Distance for Mobile */}
                      <div className="md:hidden pl-6 border-l border-slate-800 ml-1.5 py-2">
                         <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                            <ChevronRight className="w-3 h-3" />
                            {result.route.distance_km} กม.
                         </div>
                      </div>

                      {/* Visual Path (Desktop) */}
                      <div className="hidden md:flex flex-grow-[0.5] items-center px-4 opacity-60">
                         <div className="h-[2px] w-full bg-slate-700 relative flex items-center">
                            <div className="absolute right-0 w-2 h-2 bg-slate-700 rotate-45 transform translate-x-1"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 text-xs text-cyan-400 font-mono border border-slate-700 rounded-full whitespace-nowrap shadow-lg">
                               {result.route.distance_km} KM
                            </div>
                         </div>
                      </div>

                      {/* Destination */}
                      <div className="flex items-start gap-3 flex-1 md:justify-end md:text-right min-w-0">
                         <div className="md:order-2 mt-1 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] flex-shrink-0"></div>
                         <div className="min-w-0 md:order-1">
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">ปลายทาง</div>
                            <div className="font-bold text-white text-sm sm:text-base leading-tight break-words">{dest}</div>
                         </div>
                      </div>
                  </div>
                  
                  {/* Key Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/50">
                     <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex flex-col justify-center hover:border-cyan-500/30 transition-colors">
                        <div className="text-slate-500 text-[10px] uppercase flex items-center gap-1 mb-1 font-bold"><Clock className="w-3 h-3" /> ระยะเวลา</div>
                        <div className="text-sm sm:text-base font-bold text-white font-mono truncate">{result.route.duration_hours} <span className="text-xs text-slate-600 font-sans">ชม.</span></div>
                     </div>
                     <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex flex-col justify-center hover:border-cyan-500/30 transition-colors">
                        <div className="text-slate-500 text-[10px] uppercase flex items-center gap-1 mb-1 font-bold"><Route className="w-3 h-3" /> ระยะทาง</div>
                        <div className="text-sm sm:text-base font-bold text-white font-mono truncate">{result.route.distance_km} <span className="text-xs text-slate-600 font-sans">กม.</span></div>
                     </div>
                     <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 col-span-2 flex flex-col justify-center hover:border-cyan-500/30 transition-colors">
                        <div className="text-slate-500 text-[10px] uppercase flex items-center gap-1 mb-1 font-bold"><Navigation className="w-3 h-3" /> เส้นทางแนะนำ</div>
                        <div className="text-sm font-bold text-cyan-400 truncate" title={result.route.primary_highway}>{result.route.primary_highway}</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 2. Logistics Process Flow (Thai Infographic) */}
            <div className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-800/60 shadow-inner">
               <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  กระบวนการโลจิสติกส์อัจฉริยะ (Smart Flow)
               </h4>

               {/* Responsive Infographic Container */}
               <div className="relative">
                  {/* Connecting Line (Visible on Desktop) */}
                  <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-1 bg-slate-800 rounded-full z-0"></div>
                  <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-1 bg-gradient-to-r from-cyan-600 via-blue-500 to-emerald-500 rounded-full z-0 opacity-50 animate-pulse"></div>
                  
                  {/* Connecting Line (Visible on Mobile) */}
                  <div className="md:hidden absolute top-6 bottom-6 left-6 w-1 bg-slate-800 rounded-full z-0 transform -translate-x-1/2"></div>
                  <div className="md:hidden absolute top-6 bottom-6 left-6 w-1 bg-gradient-to-b from-cyan-600 via-blue-500 to-emerald-500 rounded-full z-0 opacity-50 animate-pulse transform -translate-x-1/2"></div>

                  {/* Steps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-2 relative z-10">
                     
                     {/* Step 1: Check Weight */}
                     <div className="flex md:flex-col items-center gap-4 md:gap-3 p-3 md:p-0 rounded-xl bg-slate-950 md:bg-transparent border border-slate-800 md:border-none animate-fade-in-up" style={{animationDelay: '0ms'}}>
                        <div className={`w-12 h-12 flex-shrink-0 rounded-full border-4 flex items-center justify-center shadow-lg transition-all z-10 bg-slate-950 ${result.legal.is_compliant ? 'border-green-500/30 text-green-400 shadow-green-900/20' : 'border-red-500/30 text-red-400 shadow-red-900/20'}`}>
                           {result.legal.is_compliant ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        </div>
                        <div className="text-left md:text-center flex-grow md:flex-grow-0">
                           <div className="text-sm md:text-xs text-slate-300 font-bold">1. ตรวจสอบน้ำหนัก</div>
                           <div className={`text-xs md:text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block border ${result.legal.is_compliant ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                              {result.legal.is_compliant ? 'ผ่านเกณฑ์' : 'เกินพิกัด'}
                           </div>
                        </div>
                     </div>

                     {/* Step 2: AI Analysis */}
                     <div className="flex md:flex-col items-center gap-4 md:gap-3 p-3 md:p-0 rounded-xl bg-slate-950 md:bg-transparent border border-slate-800 md:border-none animate-fade-in-up" style={{animationDelay: '150ms'}}>
                        <div className="w-12 h-12 flex-shrink-0 rounded-full border-4 border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-900/20 z-10 bg-slate-950">
                           <BrainCircuit size={20} />
                        </div>
                        <div className="text-left md:text-center flex-grow md:flex-grow-0">
                           <div className="text-sm md:text-xs text-slate-300 font-bold">2. วิเคราะห์ด้วย AI</div>
                           <div className="text-xs md:text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block border bg-cyan-950/30 border-cyan-500/20 text-cyan-400">
                              ประมวลผลแล้ว
                           </div>
                        </div>
                     </div>

                     {/* Step 3: Risk Assessment */}
                     <div className="flex md:flex-col items-center gap-4 md:gap-3 p-3 md:p-0 rounded-xl bg-slate-950 md:bg-transparent border border-slate-800 md:border-none animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        <div className={`w-12 h-12 flex-shrink-0 rounded-full border-4 flex items-center justify-center shadow-lg z-10 bg-slate-950 transition-all ${result.route.risk_level === 'Low' ? 'border-blue-500/30 text-blue-400' : result.route.risk_level === 'Medium' ? 'border-yellow-500/30 text-yellow-400' : 'border-red-500/30 text-red-400'}`}>
                           <ShieldCheck size={20} />
                        </div>
                        <div className="text-left md:text-center flex-grow md:flex-grow-0">
                           <div className="text-sm md:text-xs text-slate-300 font-bold">3. ประเมินความเสี่ยง</div>
                           <div className={`text-xs md:text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block border ${result.route.risk_level === 'Low' ? 'bg-blue-900/20 border-blue-500/20 text-blue-400' : result.route.risk_level === 'Medium' ? 'bg-yellow-900/20 border-yellow-500/20 text-yellow-400' : 'bg-red-900/20 border-red-500/20 text-red-400'}`}>
                              {result.route.risk_level === 'Low' ? 'ความเสี่ยงต่ำ' : result.route.risk_level === 'Medium' ? 'ปานกลาง' : 'สูง'}
                           </div>
                        </div>
                     </div>

                     {/* Step 4: Carbon Credit */}
                     <div className="flex md:flex-col items-center gap-4 md:gap-3 p-3 md:p-0 rounded-xl bg-slate-950 md:bg-transparent border border-slate-800 md:border-none animate-fade-in-up" style={{animationDelay: '450ms'}}>
                        <div className="w-12 h-12 flex-shrink-0 rounded-full border-4 border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/20 z-10 bg-slate-950">
                           <Leaf size={20} />
                        </div>
                        <div className="text-left md:text-center flex-grow md:flex-grow-0">
                           <div className="text-sm md:text-xs text-slate-300 font-bold">4. คำนวณเครดิตคาร์บอน</div>
                           <div className="text-xs md:text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block border bg-emerald-950/30 border-emerald-500/20 text-emerald-400">
                              Eco Grade {result.eco.sustainability_rating}
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
            </div>

            {/* 3. Tactical Alert Map (Replaces Simple Alert Box) */}
            {(result.legal.compliance_status !== 'PASS' || result.strategy.urgent_alerts.length > 0) && (
               <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-red-500/40 shadow-[0_0_25px_rgba(220,38,38,0.15)] group">
                  {/* Simulated Map Background (Chonburi - Rayong Area) */}
                  <div className="absolute inset-0 bg-[#0f172a]">
                    {/* Coastline (Gulf of Thailand) */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
                      <path d="M0 200 L0 150 Q50 120 80 160 T150 180 L400 180 L400 200 Z" fill="#334155" />
                      {/* Highway 7 (Motorway) */}
                      <path d="M50 180 Q200 80 380 50" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="8,4" />
                      <path d="M50 180 Q200 80 380 50" fill="none" stroke="#0891b2" strokeWidth="2" className="animate-pulse" opacity="0.5" />
                      
                      {/* Highway 3 (Sukhumvit) */}
                      <path d="M60 190 Q120 170 250 190" fill="none" stroke="#334155" strokeWidth="3" />
                      
                      {/* Route Path */}
                      <circle cx="50" cy="180" r="4" fill="#06b6d4" /> {/* Laem Chabang */}
                      <circle cx="380" cy="50" r="4" fill="#ef4444" /> {/* Amata / Destination */}
                      
                      {/* Risk Zone Overlay */}
                      <circle cx="200" cy="100" r="30" fill="rgba(239, 68, 68, 0.2)" className="animate-pulse" />
                      <circle cx="200" cy="100" r="15" fill="rgba(239, 68, 68, 0.3)" />
                    </svg>
                    
                    {/* Map Labels */}
                    <div className="absolute bottom-4 left-4 text-[10px] font-bold text-cyan-500 bg-slate-950/80 px-1 rounded">ท่าเรือแหลมฉบัง</div>
                    <div className="absolute top-8 right-4 text-[10px] font-bold text-red-400 bg-slate-950/80 px-1 rounded">นิคมฯ อมตะ</div>
                    
                    {/* Dynamic Moving Truck */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-transform duration-[5s]">
                       <div className="relative">
                          <div className="absolute -inset-2 bg-cyan-500/20 rounded-full animate-ping"></div>
                          <div className="bg-slate-900 p-1 rounded-full border border-cyan-500 shadow-lg z-10 relative">
                             <Truck className="w-4 h-4 text-cyan-400" />
                          </div>
                       </div>
                    </div>

                    {/* Alert Marker */}
                    <div className="absolute top-[40%] left-[45%] animate-bounce">
                       <div className="bg-red-600 text-white p-1 rounded-full shadow-lg shadow-red-900/50 border-2 border-white">
                          <AlertTriangle className="w-4 h-4" />
                       </div>
                    </div>
                  </div>

                  {/* Glassmorphism Alert Panel Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-red-500/30 p-4 z-20">
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-500/20 rounded-lg shrink-0 animate-pulse">
                           <MapIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-grow">
                           <h4 className="font-bold text-red-400 uppercase tracking-wider text-xs mb-2 flex items-center justify-between">
                              <span>ตรวจพบความเสี่ยงในเส้นทาง (Route Alert)</span>
                              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                           </h4>
                           <div className="space-y-1.5 max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                              {result.legal.compliance_status !== 'PASS' && (
                                 <div className="flex items-start gap-2 text-slate-200 text-sm bg-slate-800/50 p-2 rounded border border-red-500/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                                    <span className="leading-snug">น้ำหนักเกินพิกัดด่านชั่ง ({result.legal.current_cargo_weight_estimated_tons} / {result.legal.max_legal_weight_tons} ตัน)</span>
                                 </div>
                              )}
                              {result.strategy.urgent_alerts.map((alert, i) => (
                                 <div key={i} className="flex items-start gap-2 text-slate-200 text-sm bg-slate-800/50 p-2 rounded border border-red-500/20">
                                    <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                                    <span className="leading-snug">{alert}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* 4. Infographics & Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
               {/* Legal Compliance Card (Donut Chart) */}
               <div className={`bg-slate-900/80 p-5 rounded-2xl border ${result.legal.is_compliant ? 'border-slate-800' : 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'} transition-all hover:bg-slate-900`}>
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                        <ShieldCheck className={result.legal.is_compliant ? "text-green-400" : "text-red-400"} size={16} />
                        สถานะทางกฎหมาย
                     </h4>
                     <span className={`text-[10px] px-2 py-1 rounded font-bold border ${result.legal.is_compliant ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {result.legal.compliance_status === 'PASS' ? 'ผ่านเกณฑ์ (PASS)' : 'ไม่ผ่าน (FAIL)'}
                     </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                     <div className="w-32 h-32 relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={[
                                    { name: 'Payload', value: result.legal.current_cargo_weight_estimated_tons },
                                    { name: 'Space', value: Math.max(0, result.legal.max_legal_weight_tons - result.legal.current_cargo_weight_estimated_tons) }
                                 ]}
                                 innerRadius={38}
                                 outerRadius={52}
                                 startAngle={180}
                                 endAngle={0}
                                 paddingAngle={2}
                                 dataKey="value"
                                 stroke="none"
                              >
                                 <Cell fill={result.legal.is_compliant ? '#22d3ee' : '#ef4444'} />
                                 <Cell fill="#1e293b" />
                              </Pie>
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                           <div className="text-2xl font-bold text-white leading-none">{Math.min(100, Math.round((result.legal.current_cargo_weight_estimated_tons / result.legal.max_legal_weight_tons) * 100))}%</div>
                           <div className="text-[8px] text-slate-500 uppercase tracking-wide mt-1">LOAD</div>
                        </div>
                     </div>
                     <div className="flex-grow w-full min-w-0 space-y-2">
                        <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                           <span className="text-slate-500">น้ำหนักบรรทุก</span>
                           <span className="text-white font-bold">{result.legal.current_cargo_weight_estimated_tons} ตัน</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                           <span className="text-slate-500">ขีดจำกัดกฎหมาย</span>
                           <span className={`font-bold ${result.legal.is_compliant ? 'text-cyan-400' : 'text-red-400'}`}>{result.legal.max_legal_weight_tons} ตัน</span>
                        </div>
                        <div className="pt-1">
                           <div className="text-[10px] text-slate-400 mb-1">อ้างอิงกฎหมาย:</div>
                           <div className="text-[10px] text-slate-500 bg-slate-950 p-2 rounded border border-slate-800 leading-relaxed break-words">
                              {result.legal.law_citation}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Eco Impact Card (Bar Chart) */}
               <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all hover:bg-slate-900">
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                        <Leaf className="text-emerald-400" size={16} />
                        โลจิสติกส์สีเขียว (Green)
                     </h4>
                     <span className="text-[10px] px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">Carbon Emission</span>
                  </div>
                  
                  <div className="flex items-end gap-4 h-32">
                     <div className="flex-grow h-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={[
                              { name: 'Trip', val: result.eco.carbon_emission_kg, fill: getEcoColor(result.eco.sustainability_rating) },
                              { name: 'Avg', val: result.eco.benchmark_average_emission_kg || result.eco.carbon_emission_kg * 1.2, fill: '#334155' }
                           ]} barSize={24}>
                              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                              <RechartsTooltip 
                                 contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff'}}
                                 itemStyle={{color: '#cbd5e1'}}
                                 cursor={{fill: 'transparent'}}
                              />
                              <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                 {
                                    [0, 1].map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={index === 0 ? getEcoColor(result.eco.sustainability_rating) : '#334155'} />
                                    ))
                                 }
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="min-w-[100px] flex flex-col items-end justify-center text-right flex-shrink-0 h-full pb-2">
                         <div className="text-4xl font-black tracking-tighter" style={{color: getEcoColor(result.eco.sustainability_rating)}}>
                           {result.eco.sustainability_rating}
                         </div>
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mb-3">Eco Rating</div>
                         <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/50 whitespace-nowrap">
                           <Coins size={12} />
                           +{result.eco.carbon_credit_potential_thb.toLocaleString()} บาท
                         </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 5. Strategic Command */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-slate-700 p-6 relative overflow-hidden shadow-lg">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <h4 className="text-cyan-400 text-sm font-bold uppercase flex items-center gap-2 mb-4 relative z-10">
                  <BrainCircuit size={18} />
                  คำแนะนำเชิงกลยุทธ์ (AI Strategy)
               </h4>
               
               <div className="space-y-5 relative z-10">
                  <div className="flex gap-4 items-start">
                     <div className="w-1 h-full min-h-[40px] bg-gradient-to-b from-cyan-500/50 to-transparent rounded-full flex-shrink-0"></div>
                     <p className="text-slate-200 text-sm leading-7 tracking-wide font-medium break-words">
                        {result.strategy.main_recommendation}
                     </p>
                  </div>
                  
                  <div className="bg-yellow-950/10 rounded-xl p-4 border border-yellow-500/20 flex items-start gap-4 hover:bg-yellow-950/20 transition-colors">
                     <div className="p-2 bg-yellow-500/10 rounded-lg flex-shrink-0 border border-yellow-500/20">
                        <Coins className="text-yellow-400 w-5 h-5" />
                     </div>
                     <div className="min-w-0">
                        <h5 className="text-yellow-500 text-xs font-bold uppercase mb-1 tracking-wide">โอกาสลดต้นทุน</h5>
                        <p className="text-slate-400 text-sm leading-relaxed break-words">{result.strategy.cost_saving_tip}</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        ) : (
          // Empty State with nice visual
          <div className="h-full flex flex-col items-center justify-center text-slate-600 relative z-10 min-h-[400px]">
            {!result?.error && (
               <div className="text-center max-w-md px-4 animate-fade-in-up">
                  <div className="w-24 h-24 mx-auto rounded-full bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center mb-6 relative group">
                     <div className="absolute inset-0 bg-cyan-500/5 rounded-full animate-pulse"></div>
                     <Truck className="w-10 h-10 text-slate-700 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 mb-3">พร้อมวิเคราะห์แผนการขนส่ง</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
                     ระบบ AI จะช่วยคำนวณเส้นทาง ตรวจสอบน้ำหนักบรรทุกตามกฎหมายไทย และประเมิน Carbon Credit ให้คุณโดยอัตโนมัติ
                  </p>
                  <button 
                     onClick={handleScanClick}
                     className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 hover:bg-slate-700 hover:border-cyan-500/50 transition-all font-bold text-sm"
                  >
                     <ScanLine className="w-4 h-4" />
                     ลองสแกนใบงานดูสิ
                  </button>
               </div>
            )}
            {result?.error && (
               <div className="text-center text-red-400 p-8 bg-red-950/10 rounded-3xl border border-red-900/30 shadow-xl max-w-sm mx-auto">
                  <div className="bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">การวิเคราะห์ขัดข้อง</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{result.message}</p>
                  <button onClick={handleOptimize} className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                     ลองใหม่อีกครั้ง
                  </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};