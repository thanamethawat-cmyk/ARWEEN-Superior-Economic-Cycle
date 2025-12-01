import React, { useState, useRef, useEffect } from 'react';
import { Truck, User, Package, Calendar, CheckCircle, Clock, MapPin, BarChart3, FileText, Search, Filter, X, Ruler, Wrench, Gauge, Info, ScanEye, Upload, AlertTriangle, PlayCircle, Loader2, Shield, Camera, Image as ImageIcon, Film, ChevronRight, ChevronDown, Building2, Users, Star, ArrowLeft, ShieldCheck, LayoutGrid, ArrowRight, Save, ClipboardList } from 'lucide-react';
import { analyzeSafetyMedia } from '../../services/geminiService';

// --- Types ---
type Tab = 'vision' | 'kpi';

interface Company {
  id: string;
  name: string;
  drivers: number;
  safetyScore: number;
  status: 'ACTIVE' | 'INACTIVE';
  color: string;
  logoBg: string;
}

// --- Mock Data Companies ---
const COMPANIES: Company[] = [
  { id: 'C01', name: 'SCG Logistics', drivers: 1450, safetyScore: 98, status: 'ACTIVE', color: 'text-red-500', logoBg: 'bg-red-500/10 border-red-500/20' },
  { id: 'C02', name: 'Flash Express', drivers: 3200, safetyScore: 94, status: 'ACTIVE', color: 'text-yellow-500', logoBg: 'bg-yellow-500/10 border-yellow-500/20' },
  { id: 'C03', name: 'Kerry Express', drivers: 2800, safetyScore: 96, status: 'ACTIVE', color: 'text-orange-500', logoBg: 'bg-orange-500/10 border-orange-500/20' },
  { id: 'C04', name: 'JWD Group', drivers: 850, safetyScore: 99, status: 'ACTIVE', color: 'text-blue-500', logoBg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'C05', name: 'DHL Supply Chain', drivers: 1200, safetyScore: 97, status: 'ACTIVE', color: 'text-yellow-400', logoBg: 'bg-yellow-400/10 border-yellow-400/20' },
  { id: 'C06', name: 'Linfox Thailand', drivers: 600, safetyScore: 95, status: 'ACTIVE', color: 'text-red-600', logoBg: 'bg-red-600/10 border-red-600/20' },
];

// --- Mock Data for KPI Dashboard ---
const KPI_DATA = [
  {
    id: "JOB-2567-001",
    driver: "สมชาย ใจดี",
    driverId: "DRV-089",
    plate: "70-4582",
    route: "R01: แหลมฉบัง - อมตะซิตี้",
    round: "08:00 - 12:00",
    cargo: "ชิ้นส่วนอิเล็กทรอนิกส์",
    weight: "12.5 ตัน",
    status: "COMPLETED",
    timestamp: "10:45 น.",
    vehicleDetails: {
      type: "รถบรรทุก 10 ล้อ (ตู้ทึบ)",
      model: "ISUZU DECA 360",
      dimensions: "กว้าง 2.5 x ยาว 7.6 x สูง 3.6 ม.",
      lastMaintenance: "15 ม.ค. 2567",
      mileage: "345,120 กม.",
      condition: "95% (พร้อมใช้งาน)"
    }
  },
  {
    id: "JOB-2567-002",
    driver: "วิชัย มั่นคง",
    driverId: "DRV-112",
    plate: "72-9914",
    route: "R04: บางนา - สระบุรี",
    round: "09:30 - 15:00",
    cargo: "วัสดุก่อสร้าง (ปูนซีเมนต์)",
    weight: "28.0 ตัน",
    status: "IN_TRANSIT",
    timestamp: "กำลังดำเนินการ",
    vehicleDetails: {
      type: "รถพ่วง 22 ล้อ (กระบะเหล็ก)",
      model: "HINO VICTOR 500",
      dimensions: "กว้าง 2.5 x ยาว 12.0 x สูง 3.8 ม.",
      lastMaintenance: "02 ก.พ. 2567",
      mileage: "512,880 กม.",
      condition: "88% (ควรตรวจเช็คเบรก)"
    }
  },
  {
    id: "JOB-2567-003",
    driver: "อำนาจ รักถิ่น",
    driverId: "DRV-056",
    plate: "64-1023",
    route: "R02: ลาดกระบัง - อยุธยา",
    round: "13:00 - 18:00",
    cargo: "สินค้าอุปโภคบริโภค",
    weight: "15.2 ตัน",
    status: "PENDING",
    timestamp: "รอปล่อยรถ",
    vehicleDetails: {
      type: "รถบรรทุก 6 ล้อ (ตู้ทึบ)",
      model: "ISUZU FRR 210",
      dimensions: "กว้าง 2.3 x ยาว 6.5 x สูง 3.2 ม.",
      lastMaintenance: "20 ธ.ค. 2566",
      mileage: "189,400 กม.",
      condition: "92% (พร้อมใช้งาน)"
    }
  },
  {
    id: "JOB-2567-004",
    driver: "ปิติ สุขใจ",
    driverId: "DRV-099",
    plate: "71-5567",
    route: "R01: แหลมฉบัง - อีสเทิร์นซีบอร์ด",
    round: "14:00 - 17:00",
    cargo: "อะไหล่ยานยนต์",
    weight: "8.4 ตัน",
    status: "COMPLETED",
    timestamp: "16:20 น.",
    vehicleDetails: {
      type: "รถบรรทุก 4 ล้อใหญ่ (จัมโบ้)",
      model: "HINO 300 ATOM",
      dimensions: "กว้าง 2.0 x ยาว 4.5 x สูง 2.8 ม.",
      lastMaintenance: "05 ก.พ. 2567",
      mileage: "89,500 กม.",
      condition: "98% (ใหม่มาก)"
    }
  },
  {
    id: "JOB-2567-005",
    driver: "กมล เทพารักษ์",
    driverId: "DRV-101",
    plate: "70-8821",
    route: "R05: ชลบุรี - ระยอง",
    round: "22:00 - 02:00",
    cargo: "เคมีภัณฑ์ (อันตราย)",
    weight: "18.0 ตัน",
    status: "SCHEDULED",
    timestamp: "เตรียมการ",
    vehicleDetails: {
      type: "รถบรรทุกวัตถุอันตราย (Tanker)",
      model: "VOLVO FM13",
      dimensions: "กว้าง 2.5 x ยาว 8.0 x สูง 3.5 ม.",
      lastMaintenance: "01 มี.ค. 2567",
      mileage: "220,150 กม.",
      condition: "100% (ตรวจสอบพิเศษแล้ว)"
    }
  }
];

export const OperationalKPI: React.FC = () => {
  // Navigation State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>('vision');
  
  // Detail State
  const [selectedVehicle, setSelectedVehicle] = useState<typeof KPI_DATA[0] | null>(null);

  // Maintenance Log State
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState('NORMAL');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Search & Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL'); // ALL, COMPLETED, IN_TRANSIT, PENDING
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // --- Vision State ---
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset tab when company changes
  useEffect(() => {
    if (selectedCompany) {
        setActiveTab('vision');
        // Reset vision state
        setMediaFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
    }
  }, [selectedCompany]);

  // Reset maintenance form when vehicle changes
  useEffect(() => {
    if (selectedVehicle) {
        setMaintenanceNote('');
        setMaintenanceStatus('NORMAL');
        setSaveSuccess(false);
    }
  }, [selectedVehicle]);

  // --- Filter Logic ---
  const filteredKPIs = KPI_DATA.filter(item => {
    const matchesSearch = 
      item.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plate.includes(searchTerm) ||
      item.driverId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> จัดส่งสำเร็จ
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Truck className="w-3 h-3" /> อยู่ระหว่างขนส่ง
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3" /> รอตรวจสอบ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-400 border border-slate-600">
            <Calendar className="w-3 h-3" /> ตามกำหนดการ
          </span>
        );
    }
  };

  // --- Vision Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
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

  const handleAnalyze = async () => {
    if (!mediaFile) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const base64 = await fileToBase64(mediaFile);
      const prompt = mediaFile.type.startsWith('video') 
        ? "วิเคราะห์วิดีโอนี้เพื่อหาความเสี่ยงในการขับขี่ หรือสภาพการจราจรที่อันตราย"
        : "ตรวจสอบสภาพรถคันนี้อย่างละเอียด หาความเสียหาย รอยบุบ หรือจุดที่ต้องซ่อมบำรุง";
      
      const result = await analyzeSafetyMedia(base64, mediaFile.type, prompt);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      setAnalysisResult("เกิดข้อผิดพลาดในการวิเคราะห์ โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMaintenance = () => {
    if (!maintenanceNote.trim()) return;
    setIsSavingMaintenance(true);
    
    // Simulate API Call
    setTimeout(() => {
        setIsSavingMaintenance(false);
        setSaveSuccess(true);
        // Reset after 2 seconds
        setTimeout(() => setSaveSuccess(false), 2000);
    }, 1000);
  };

  // --- VIEW: COMPANY DIRECTORY ---
  if (!selectedCompany) {
    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto animate-fade-in">
             <div className="p-8 pb-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white mb-4 shadow-lg shadow-blue-900/40">
                   <Building2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Fleet Partner Directory</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                   เลือกบริษัทขนส่งพันธมิตรเพื่อเข้าสู่ระบบตรวจสอบความปลอดภัย (AI Safety Inspector) และดูข้อมูลการปฏิบัติงาน
                </p>
             </div>

             <div className="p-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {COMPANIES.map((company) => (
                      <div 
                         key={company.id}
                         onClick={() => setSelectedCompany(company)}
                         className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-900/10 group relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-800 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                         
                         <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${company.logoBg} ${company.color} shadow-lg`}>
                               <Building2 className="w-7 h-7" />
                            </div>
                            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                               <ShieldCheck className="w-4 h-4 text-emerald-400" />
                               <span className="text-sm font-bold text-white">{company.safetyScore}%</span>
                            </div>
                         </div>
                         
                         <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors relative z-10">{company.name}</h3>
                         
                         <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
                            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                               <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Drivers</div>
                               <div className="font-bold text-slate-200">{company.drivers.toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                               <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Truck className="w-3 h-3"/> Fleet</div>
                               <div className="font-bold text-slate-200">Active</div>
                            </div>
                         </div>

                         <div className="mt-6 flex items-center justify-between text-sm text-slate-500 border-t border-slate-800 pt-4">
                            <span>ID: {company.id}</span>
                            <span className="flex items-center gap-1 text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                               จัดการ (Manage) <ArrowRight className="w-4 h-4" />
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
        </div>
    );
  }

  // --- VIEW: COMPANY DETAIL (Tabs) ---
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 relative animate-fade-in">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
              >
                  <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${selectedCompany.logoBg} ${selectedCompany.color}`}>
                        <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                      <h2 className="text-lg font-bold text-white leading-tight">{selectedCompany.name}</h2>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {selectedCompany.drivers.toLocaleString()} Drivers</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3 h-3"/> Score {selectedCompany.safetyScore}%</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('vision')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'vision' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-900'
                }`}
            >
                <ScanEye className="w-4 h-4" />
                AI Safety Inspector
            </button>
            <button
                onClick={() => setActiveTab('kpi')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'kpi' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-900'
                }`}
            >
                <BarChart3 className="w-4 h-4" />
                Operational KPI
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 lg:p-6 flex-grow overflow-y-auto">
        
        {/* ================= AI VISION TAB ================= */}
        {activeTab === 'vision' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
             <div className="mb-6 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-start gap-4">
                 <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 hidden sm:block">
                     <ScanEye className="w-6 h-6" />
                 </div>
                 <div>
                     <h3 className="font-bold text-white mb-1">AI Safety Vision Scanner</h3>
                     <p className="text-sm text-slate-400">
                        ระบบตรวจสอบความปลอดภัยของ {selectedCompany.name} อัปโหลดภาพถ่ายสภาพรถ หรือวิดีโอกล้องหน้ารถเพื่อวิเคราะห์ความเสี่ยงด้วย Gemini 3 Pro Vision
                     </p>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left: Upload & Preview */}
                <div className="md:col-span-2 space-y-4">
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${mediaFile ? 'border-cyan-500/50 bg-slate-900' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-cyan-500/30'}`}
                   >
                      <input 
                         type="file" 
                         ref={fileInputRef} 
                         className="hidden" 
                         accept="image/*,video/*"
                         onChange={handleFileSelect}
                      />
                      
                      {previewUrl ? (
                         mediaFile?.type.startsWith('video') ? (
                           <video src={previewUrl} controls className="w-full h-full object-cover" />
                         ) : (
                           <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                         )
                      ) : (
                         <div className="text-center p-6">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-cyan-400">
                               <Upload className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-slate-300 mb-1">Upload Media</h4>
                            <p className="text-xs text-slate-500">Click or drag image/video here</p>
                            <div className="mt-4 flex justify-center gap-2">
                               <span className="p-1.5 bg-slate-800 rounded text-slate-500"><ImageIcon className="w-4 h-4"/></span>
                               <span className="p-1.5 bg-slate-800 rounded text-slate-500"><Film className="w-4 h-4"/></span>
                            </div>
                         </div>
                      )}
                      
                      {mediaFile && (
                         <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-black/80">
                            {mediaFile.type.startsWith('video') ? <Film className="w-3 h-3 text-cyan-400"/> : <ImageIcon className="w-3 h-3 text-purple-400"/>}
                            เปลี่ยนไฟล์
                         </div>
                      )}
                   </div>

                   <button
                      onClick={handleAnalyze}
                      disabled={!mediaFile || isAnalyzing}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                   >
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                      )}
                      {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin"/> : <ScanEye className="w-5 h-5 group-hover:scale-110 transition-transform"/>}
                      {isAnalyzing ? "AI กำลังวิเคราะห์..." : "เริ่มการตรวจสอบ (Analyze)"}
                   </button>
                </div>

                {/* Right: Analysis Result */}
                <div className="md:col-span-3">
                   <div className="h-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative min-h-[400px]">
                      {!analysisResult && !isAnalyzing && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <Shield className="w-16 h-16 mb-4 stroke-1" />
                            <p>รอผลการวิเคราะห์</p>
                         </div>
                      )}

                      {isAnalyzing && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="relative mb-4">
                               <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-spin"></div>
                               <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
                               <ScanEye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 w-6 h-6 animate-pulse" />
                            </div>
                            <p className="text-cyan-400 font-bold animate-pulse">กำลังประมวลผลข้อมูลภาพ...</p>
                            <p className="text-slate-500 text-xs mt-2">Connecting to Gemini 3 Pro Vision</p>
                         </div>
                      )}

                      {analysisResult && (
                         <div className="animate-fade-in-up h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                               <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 border border-green-500/20">
                                  <CheckCircle className="w-6 h-6" />
                               </div>
                               <div>
                                  <h3 className="text-white font-bold">ผลการวิเคราะห์ (Analysis Report)</h3>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                     <span>Confidence: 98.5%</span>
                                     <span>•</span>
                                     <span>Model: Gemini 3 Pro Vision</span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="prose prose-invert prose-sm max-w-none flex-grow overflow-y-auto pr-2 custom-scrollbar">
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap shadow-inner">
                                  {analysisResult}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3 pt-4 border-t border-slate-800">
                               <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors border border-slate-700">
                                  บันทึกรายงาน
                               </button>
                               <button className="flex-1 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  แจ้งเตือนหัวหน้างาน
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ================= KPI TAB (Existing Code) ================= */}
        {activeTab === 'kpi' && (
          <div className="animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
               <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <FileText className="text-purple-400 w-5 h-5" />
                  Operational Dashboard
                  </h3>
                  <p className="text-xs text-slate-400">ข้อมูลการปฏิบัติงานของ {selectedCompany.name}</p>
               </div>
               
               <div className="flex gap-2 relative">
                  <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                     type="text" 
                     placeholder="ค้นหาพนักงาน / ทะเบียนรถ..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="bg-slate-900 border border-slate-700 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 w-64 text-white placeholder:text-slate-600"
                  />
                  </div>
                  
                  {/* Filter Dropdown */}
                  <div className="relative">
                      <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`p-2 border rounded-lg transition-colors flex items-center gap-2 h-full ${
                            filterStatus !== 'ALL' 
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        {filterStatus !== 'ALL' && <span className="text-xs font-bold hidden sm:inline">{filterStatus}</span>}
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {showFilterMenu && (
                          <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                              <div className="p-1">
                                  {['ALL', 'IN_TRANSIT', 'COMPLETED', 'PENDING'].map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                            filterStatus === status ? 'bg-purple-500/10 text-purple-400' : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                      >
                                          {status === 'ALL' ? 'ทั้งหมด (All)' : status}
                                          {filterStatus === status && <CheckCircle className="w-3 h-3" />}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
               </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                     <Truck className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="text-xs text-slate-500 uppercase font-bold">รถที่วิ่งงานวันนี้</div>
                     <div className="text-2xl font-bold text-white">42 <span className="text-sm text-slate-600 font-normal">คัน</span></div>
                  </div>
               </div>
               
               <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                     <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="text-xs text-slate-500 uppercase font-bold">จัดส่งสำเร็จ (On-Time)</div>
                     <div className="text-2xl font-bold text-white">98.5%</div>
                  </div>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                     <Package className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="text-xs text-slate-500 uppercase font-bold">ปริมาณสินค้าสะสม</div>
                     <div className="text-2xl font-bold text-white">850 <span className="text-sm text-slate-600 font-normal">ตัน</span></div>
                  </div>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                     <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="text-xs text-slate-500 uppercase font-bold">คะแนนเฉลี่ยคนขับ</div>
                     <div className="text-2xl font-bold text-white">4.8 <span className="text-sm text-slate-600 font-normal">/ 5.0</span></div>
                  </div>
               </div>
            </div>

            {/* Table Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg min-h-[300px]">
               {filteredKPIs.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <th className="p-4 font-bold">พนักงานขับรถ (Driver)</th>
                        <th className="p-4 font-bold">ข้อมูลรถ (Vehicle)</th>
                        <th className="p-4 font-bold">รอบการวิ่ง (Round / Route)</th>
                        <th className="p-4 font-bold">สินค้า (Cargo)</th>
                        <th className="p-4 font-bold text-center">น้ำหนัก (Weight)</th>
                        <th className="p-4 font-bold text-center">สถานะ (Status)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                        {filteredKPIs.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                            <td className="p-4">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-white">{item.driver}</div>
                                <div className="text-xs text-slate-500">{item.driverId}</div>
                            </div>
                            </div>
                            </td>
                            <td className="p-4">
                            <div 
                            className="flex items-center gap-2 cursor-pointer group/vehicle hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); setSelectedVehicle(item); }}
                            >
                            <div className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-300 border border-slate-700 group-hover/vehicle:border-purple-500 group-hover/vehicle:text-purple-400 transition-colors flex items-center gap-2">
                                {item.plate}
                                <Info className="w-3 h-3 opacity-0 group-hover/vehicle:opacity-100 transition-opacity" />
                            </div>
                            </div>
                            </td>
                            <td className="p-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-300">
                                    <MapPin className="w-3 h-3 text-cyan-500" />
                                    <span className="truncate max-w-[150px]">{item.route}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {item.round}
                                </div>
                            </div>
                            </td>
                            <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-300">
                            <Package className="w-4 h-4 text-slate-500" />
                            {item.cargo}
                            </div>
                            </td>
                            <td className="p-4 text-center">
                            <span className="font-mono font-bold text-slate-300">{item.weight}</span>
                            </td>
                            <td className="p-4 text-center">
                            {getStatusBadge(item.status)}
                            <div className="text-[10px] text-slate-500 mt-1">{item.timestamp}</div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                </div>
               ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>ไม่พบข้อมูลที่ค้นหา</p>
                    <button 
                        onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                        className="mt-4 text-xs text-purple-400 hover:underline"
                    >
                        ล้างการค้นหา (Clear Filter)
                    </button>
                </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal (Same as before) */}
       {selectedVehicle && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] relative animate-fade-in-up">
               <button 
                 onClick={() => setSelectedVehicle(null)}
                 className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
               >
                 <X className="w-6 h-6" />
               </button>
               
               <div className="bg-slate-950/50 p-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-900/20">
                        <Truck className="w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">Vehicle Information</h4>
                        <h3 className="text-2xl font-bold text-white leading-none mb-1">{selectedVehicle.plate}</h3>
                        <p className="text-sm text-slate-400">{selectedVehicle.vehicleDetails.model}</p>
                     </div>
                  </div>
               </div>

               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                           <FileText className="w-3 h-3" /> ประเภทรถ
                        </div>
                        <div className="text-slate-200 font-medium text-sm">{selectedVehicle.vehicleDetails.type}</div>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                           <Ruler className="w-3 h-3" /> ขนาด (Dimension)
                        </div>
                        <div className="text-slate-200 font-medium text-sm">{selectedVehicle.vehicleDetails.dimensions}</div>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                           <Wrench className="w-3 h-3" /> บำรุงรักษาล่าสุด
                        </div>
                        <div className="text-slate-200 font-medium text-sm">{selectedVehicle.vehicleDetails.lastMaintenance}</div>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                           <Gauge className="w-3 h-3" /> เลขไมล์ (Odometer)
                        </div>
                        <div className="text-slate-200 font-medium text-sm">{selectedVehicle.vehicleDetails.mileage}</div>
                     </div>
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm font-medium">สภาพรถโดยรวม</span>
                        <span className="text-emerald-400 text-sm font-bold">{selectedVehicle.vehicleDetails.condition}</span>
                     </div>
                     <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                     </div>
                  </div>
                  
                  {/* --- MAINTENANCE LOG SECTION --- */}
                  <div className="pt-6 border-t border-slate-800">
                     <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                         <ClipboardList className="w-4 h-4 text-purple-400" />
                         บันทึกการซ่อมบำรุง (Maintenance Log)
                     </h4>
                     
                     <div className="space-y-4">
                         <div>
                             <label className="text-xs text-slate-500 block mb-1">บันทึกอาการ / รายการซ่อม</label>
                             <textarea 
                                value={maintenanceNote}
                                onChange={(e) => setMaintenanceNote(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none h-24 placeholder:text-slate-600"
                                placeholder="เช่น เปลี่ยนถ่ายน้ำมันเครื่อง, ตรวจเช็คเบรก, ปะยาง..."
                             />
                         </div>
                         
                         <div>
                             <label className="text-xs text-slate-500 block mb-1">สถานะหลังซ่อม</label>
                             <div className="grid grid-cols-3 gap-3">
                                 {['NORMAL', 'WARNING', 'CRITICAL'].map((status) => (
                                     <button
                                        key={status}
                                        onClick={() => setMaintenanceStatus(status)}
                                        className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                                            maintenanceStatus === status 
                                            ? status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : status === 'WARNING' ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'bg-red-500/20 text-red-400 border-red-500'
                                            : 'bg-slate-950 text-slate-400 border-slate-700 hover:bg-slate-800'
                                        }`}
                                     >
                                         {status === 'NORMAL' ? 'ปกติ (Normal)' : status === 'WARNING' ? 'เฝ้าระวัง (Warning)' : 'วิกฤต (Critical)'}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         
                         <button 
                             onClick={handleSaveMaintenance}
                             disabled={isSavingMaintenance || !maintenanceNote}
                             className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                 saveSuccess 
                                 ? 'bg-green-600 text-white'
                                 : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                             } disabled:opacity-50 disabled:cursor-not-allowed`}
                         >
                             {isSavingMaintenance ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                             {isSavingMaintenance ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกสำเร็จ!' : 'บันทึกงานซ่อม'}
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}