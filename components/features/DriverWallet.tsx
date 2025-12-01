import React, { useState } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield, Leaf, Activity, History, CreditCard, DollarSign, Umbrella, Award, Zap, ChevronRight, Loader2, CheckCircle, Sparkles, UserCog, FileText, Calculator, AlertCircle, X, Check, Gift, Eye, Save, Truck, User, ChevronDown, Users, ToggleLeft, ToggleRight, Search, Share2, Download, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeFinancialHealth, FinancialAdvice } from '../../services/geminiService';

// Mock Data
const INCOME_DATA = [
  { day: 'จ', income: 1200, carbon: 50 },
  { day: 'อ', income: 1500, carbon: 80 },
  { day: 'พ', income: 900, carbon: 30 },
  { day: 'พฤ', income: 1800, carbon: 120 },
  { day: 'ศ', income: 2100, carbon: 150 },
  { day: 'ส', income: 800, carbon: 20 },
  { day: 'อา', income: 0, carbon: 0 },
];

interface Transaction {
  id: string;
  title: string;
  type: 'INCOME' | 'CARBON' | 'WITHDRAW' | 'SSO' | 'TAX' | 'FEE';
  amount: number;
  time: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED' | 'AUTO_DEDUCT';
  details?: {
    gross: number;
    tax: number;
    fee: number;
    sso: number;
    net: number;
  };
  driverName?: string; // Added for Admin view
}

interface DriverProfile {
  name: string;
  phone: string;
  licensePlate: string;
  vehicleType: string;
  bankName: string;
  bankAccount: string;
}

interface DriverWelfare {
  id: string;
  name: string;
  ssoStatus: 'PAID' | 'UNPAID';
  lastPaid: string | null;
  contribution: number;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TX-9981', title: 'ค่าเที่ยวขนส่ง (Job #2567-001)', type: 'INCOME', amount: 1500, time: '10:45 น.', status: 'COMPLETED', details: { gross: 1500, tax: 45, fee: 0, sso: 0, net: 1455 } },
  { id: 'TX-9982', title: 'Carbon Credit Bonus', type: 'CARBON', amount: 45, time: '10:46 น.', status: 'COMPLETED', details: { gross: 45, tax: 0, fee: 0, sso: 0, net: 45 } },
  { id: 'TX-9980', title: 'หักนำส่งประกันสังคม (ม.33)', type: 'SSO', amount: -750, time: '08:00 น.', status: 'AUTO_DEDUCT', details: { gross: 0, tax: 0, fee: 0, sso: 750, net: -750 } },
  { id: 'TX-9979', title: 'ถอนเงินเข้าบัญชีธนาคาร', type: 'WITHDRAW', amount: -2000, time: 'เมื่อวาน', status: 'COMPLETED', details: { gross: 2000, tax: 60, fee: 15, sso: 0, net: 1925 } },
];

// Mock Data Generator for Admin Console
const MOCK_NAMES = [
  "วิชัย มั่นคง", "อำนาจ รักถิ่น", "ปิติ สุขใจ", "กมล เทพารักษ์", 
  "สุรพล มีทรัพย์", "ณัฐวุฒิ กล้าหาญ", "สมศักดิ์ รักชาติ", "ทวีศักดิ์ ภักดี",
  "บุญมี ศรีสุข", "มานะ อดทน", "วีระชัย ใจสู้", "ธนพล คนเก่ง",
  "ไพโรจน์ โชติช่วง", "ศักดิ์ดา หารกล้า", "วินัย ไกรบุตร", "ยอดชาย เมฆา",
  "เอกชัย ศรีวิชัย", "นนทิยา จิวบางป่า", "สุนารี ราชสีมา", "มนต์สิทธิ์ คำสร้อย"
];

const generateMockPendingTransactions = (count = 25): Transaction[] => {
  return Array.from({ length: count }).map((_, i) => {
    const amount = Math.floor(Math.random() * 4000) + 500; // Random amount 500-4500
    const driverName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    
    // Calculate deductions
    const tax = amount * 0.03;
    const fee = 15;
    const sso = Math.random() > 0.8 ? 750 : 0; // 20% chance of SSO deduction
    const net = amount - tax - fee - sso;

    // Random Time (Recent)
    const hour = Math.floor(Math.random() * 5) + 8; // 08:00 - 13:00
    const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');

    return {
      id: `REQ-${Math.floor(10000 + Math.random() * 90000)}`, // Random ID
      title: `คำขอถอนเงิน (รออนุมัติ)`,
      type: 'WITHDRAW',
      amount: -amount,
      time: `${hour}:${minute} น.`,
      status: 'PENDING',
      driverName: driverName,
      details: {
        gross: amount,
        tax,
        fee,
        sso,
        net
      }
    };
  });
};

const REWARDS = [
  { id: 'R01', name: 'คูปองเติมน้ำมัน 100 บาท', cost: 400, icon: <Zap className="w-5 h-5"/>, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'R02', name: 'ส่วนลดกาแฟ Amazon 20 บาท', cost: 80, icon: <Gift className="w-5 h-5"/>, color: 'text-orange-400 bg-orange-500/10' },
  { id: 'R03', name: 'ประกันอุบัติเหตุเพิ่ม 1 เดือน', cost: 1200, icon: <Shield className="w-5 h-5"/>, color: 'text-blue-400 bg-blue-500/10' },
];

export const DriverWallet: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(true); // Default to Admin Mode
  const [adminTab, setAdminTab] = useState<'APPROVALS' | 'WELFARE'>('APPROVALS'); // Admin Tab State

  const [balance, setBalance] = useState(4850.50);
  const [carbonBalance, setCarbonBalance] = useState(320);
  // Initialize with real user history + generated pending requests for admin
  const [transactions, setTransactions] = useState<Transaction[]>([
    ...generateMockPendingTransactions(5), // Start with 5 for cleaner initial view, load more later
    ...INITIAL_TRANSACTIONS
  ]);
  const [isSsoPaid, setIsSsoPaid] = useState(true); // Mock status: true means already deducted this month

  // Welfare Mock Data
  const [welfareList, setWelfareList] = useState<DriverWelfare[]>([
      { id: 'DRV-089', name: 'สมชาย ใจดี', ssoStatus: 'PAID', lastPaid: '25/10/2566', contribution: 750 },
      ...MOCK_NAMES.slice(0, 15).map((name, i) => ({
          id: `DRV-${100+i}`,
          name: name,
          ssoStatus: (Math.random() > 0.4 ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
          lastPaid: Math.random() > 0.4 ? '25/10/2566' : null,
          contribution: 750
      }))
  ]);

  // Profile State
  const [profile, setProfile] = useState<DriverProfile>({
    name: "สมชาย ใจดี",
    phone: "081-234-5678",
    licensePlate: "70-4582",
    vehicleType: "รถบรรทุก 10 ล้อ (ตู้ทึบ)",
    bankName: "ธนาคารกสิกรไทย",
    bankAccount: "089-2-12345-6"
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfile, setTempProfile] = useState<DriverProfile>(profile);
  const [savingProfile, setSavingProfile] = useState(false);

  // Withdrawal Flow State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redeem Flow State
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [processingRedeem, setProcessingRedeem] = useState<string | null>(null);

  // Carbon History State
  const [showCarbonHistory, setShowCarbonHistory] = useState(false);

  // Transaction Slip State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // AI State
  const [aiAdvice, setAiAdvice] = useState<FinancialAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Admin Search State
  const [welfareSearch, setWelfareSearch] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // --- Logic Helpers ---
  const calculateDeductions = (amount: number) => {
    const tax = amount * 0.03; // 3% Withholding Tax
    const fee = 15; // Fixed Platform Fee
    const sso = isSsoPaid ? 0 : 750; // Deduct 750 if not paid yet
    const net = amount - tax - fee - sso;
    return { tax, fee, sso, net };
  };

  const handleRequestWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > balance) return;

    setIsProcessing(true);
    
    // Simulate Network Delay
    setTimeout(() => {
      const { tax, fee, sso, net } = calculateDeductions(amount);
      
      const newTx: Transaction = {
        id: `TX-${Math.floor(Math.random() * 10000)}`,
        title: 'คำขอถอนเงิน (รออนุมัติ)',
        type: 'WITHDRAW',
        amount: -amount, // Show full deduction from balance logic perspective, but we might only hold it
        time: 'เมื่อสักครู่',
        status: 'PENDING',
        driverName: profile.name,
        details: {
            gross: amount,
            tax,
            fee,
            sso,
            net
        }
      };

      setTransactions(prev => [newTx, ...prev]);
      setBalance(prev => prev - amount); // Deduct from available balance immediately (hold)
      setShowWithdrawModal(false);
      setIsProcessing(false);
      setWithdrawAmount('');
    }, 1000);
  };

  const handleRedeem = (reward: typeof REWARDS[0]) => {
     if (carbonBalance < reward.cost) return;
     setProcessingRedeem(reward.id);
     
     setTimeout(() => {
        setCarbonBalance(prev => prev - reward.cost);
        const newTx: Transaction = {
            id: `RD-${Math.floor(Math.random() * 10000)}`,
            title: `แลกรางวัล: ${reward.name}`,
            type: 'CARBON',
            amount: -reward.cost,
            time: 'เมื่อสักครู่',
            status: 'COMPLETED'
        };
        setTransactions(prev => [newTx, ...prev]);
        setProcessingRedeem(null);
        setShowRedeemModal(false);
     }, 1000);
  };

  const handleAdminAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    // Find transaction
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.map(t => {
        if (t.id === id) {
            return { ...t, status: action === 'REJECT' ? 'REJECTED' : 'COMPLETED', title: action === 'REJECT' ? 'คำขอถอนเงิน (ถูกปฏิเสธ)' : 'ถอนเงินเข้าบัญชี (อนุมัติแล้ว)' };
        }
        return t;
    }));

    if (action === 'REJECT') {
        // If it's the current user (simulation), refund.
        if (!tx.driverName || tx.driverName === profile.name) {
             setBalance(b => b + Math.abs(tx.amount)); 
        }
    } else {
        // APPROVE Logic
        // If SSO was included, update welfare status
        if (tx.details?.sso && tx.details.sso > 0) {
            const dName = tx.driverName || profile.name;
            
            // Update Welfare List
            setWelfareList(prev => prev.map(d => {
                if (d.name === dName) {
                    return { ...d, ssoStatus: 'PAID', lastPaid: new Date().toLocaleDateString('th-TH') };
                }
                return d;
            }));

            // Sync Simulation State if it's the main profile
            if (dName === profile.name) {
                setIsSsoPaid(true);
            }
        }
    }
  };

  const handleToggleWelfare = (id: string) => {
    setWelfareList(prev => prev.map(d => {
        if (d.id === id) {
            const newStatus = d.ssoStatus === 'PAID' ? 'UNPAID' : 'PAID';
            // Sync main profile
            if (d.name === profile.name) {
                setIsSsoPaid(newStatus === 'PAID');
            }
            return { 
                ...d, 
                ssoStatus: newStatus,
                lastPaid: newStatus === 'PAID' ? new Date().toLocaleDateString('th-TH') : null
            };
        }
        return d;
    }));
  };

  const handleAnalyzeFinance = async () => {
    setLoadingAdvice(true);
    setAiAdvice(null);
    try {
        const advice = await analyzeFinancialHealth(INCOME_DATA, transactions.filter(t => !t.driverName || t.driverName === profile.name));
        if (advice) {
            setAiAdvice(advice);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingAdvice(false);
    }
  };

  const handleSaveProfile = () => {
    setSavingProfile(true);
    setTimeout(() => {
        setProfile(tempProfile);
        setShowProfileModal(false);
        setSavingProfile(false);
    }, 1000);
  };

  const handleLoadMore = () => {
      setIsLoadingMore(true);
      setTimeout(() => {
          const newTransactions = generateMockPendingTransactions(5);
          setTransactions(prev => [...prev, ...newTransactions]);
          setIsLoadingMore(false);
      }, 1000);
  };

  // Get Pending Transactions for Admin
  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING');

  // Filter Welfare List
  const filteredWelfareList = welfareList.filter(d => 
      d.name.toLowerCase().includes(welfareSearch.toLowerCase()) || 
      d.id.toLowerCase().includes(welfareSearch.toLowerCase())
  );

  // Carbon History Logic
  const carbonTransactions = transactions.filter(t => t.type === 'CARBON' && (!t.driverName || t.driverName === profile.name));
  const totalCarbonEarned = carbonTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalCarbonSpent = carbonTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-slate-950 min-h-[600px] text-slate-200 animate-fade-in relative">
      
      {/* View Switcher (Operations vs Simulation) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-4 py-1.5 shadow-xl">
          <span className={`text-xs font-bold ${!isAdminMode ? 'text-yellow-400' : 'text-slate-500'}`}>Simulation</span>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isAdminMode ? 'bg-cyan-600' : 'bg-slate-700'}`}
          >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isAdminMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
          <span className={`text-xs font-bold ${isAdminMode ? 'text-cyan-400' : 'text-slate-500'}`}>Operations</span>
      </div>

      {isAdminMode ? (
        // ================= ADMIN VIEW (OPERATIONS CENTER) =================
        <div className="max-w-4xl mx-auto w-full animate-fade-in">
            <div className="mb-8 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                        <UserCog className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Operations Center</h2>
                        <p className="text-slate-400 text-sm">ระบบอนุมัติการจ่ายเงินและตรวจสอบสวัสดิการ (Admin Console)</p>
                    </div>
                </div>

                {/* Admin Tab Navigation */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setAdminTab('APPROVALS')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${adminTab === 'APPROVALS' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4" />
                        รายการอนุมัติ ({pendingTransactions.length})
                    </button>
                    <button 
                        onClick={() => setAdminTab('WELFARE')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${adminTab === 'WELFARE' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Umbrella className="w-4 h-4" />
                        จัดการสวัสดิการ (Welfare)
                    </button>
                </div>
            </div>

            {adminTab === 'APPROVALS' && (
                <div className="grid gap-6 animate-fade-in">
                    {pendingTransactions.length === 0 ? (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 mb-4 text-green-500/20" />
                            <p>ไม่มีรายการค้างในระบบ</p>
                            <button 
                                onClick={handleLoadMore}
                                className="mt-4 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ChevronDown className="w-4 h-4" /> สร้างรายการจำลอง
                            </button>
                        </div>
                    ) : (
                        <>
                        {pendingTransactions.map(tx => (
                            <div key={tx.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg animate-fade-in-up">
                                {/* Header */}
                                <div className="bg-slate-800/50 p-4 flex justify-between items-center border-b border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                                            <Loader2 className="w-5 h-5 animate-spin-slow" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">คำขอถอนเงิน #{tx.id}</div>
                                            <div className="text-xs text-slate-400">{tx.time} • คนขับ: <span className="text-white font-bold">{tx.driverName || profile.name}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase font-bold">ยอดถอนสุทธิ</div>
                                        <div className="text-xl font-bold text-white">{Math.abs(tx.amount).toLocaleString()} ฿</div>
                                    </div>
                                </div>

                                {/* Detailed Breakdown */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> รายละเอียดการหัก (Deductions)
                                        </h4>
                                        <div className="bg-slate-950 p-4 rounded-xl space-y-2 border border-slate-800">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">ยอดเงินต้น (Gross)</span>
                                                <span className="text-white font-mono">{tx.details?.gross.toLocaleString()} ฿</span>
                                            </div>
                                            <div className="w-full h-px bg-slate-800 my-1"></div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-red-300">ภาษีหัก ณ ที่จ่าย (3%)</span>
                                                <span className="text-red-400 font-mono">-{tx.details?.tax.toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-red-300">ค่าธรรมเนียม (Fee)</span>
                                                <span className="text-red-400 font-mono">-{tx.details?.fee.toLocaleString()} ฿</span>
                                            </div>
                                            {tx.details?.sso && tx.details.sso > 0 ? (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-purple-300">นำส่งประกันสังคม (ม.33)</span>
                                                    <span className="text-purple-400 font-mono">-{tx.details.sso.toLocaleString()} ฿</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between text-sm opacity-50">
                                                    <span className="text-slate-500">ประกันสังคม (จ่ายแล้ว)</span>
                                                    <span className="text-slate-500 font-mono">0.00 ฿</span>
                                                </div>
                                            )}
                                            <div className="w-full h-px bg-slate-800 my-1"></div>
                                            <div className="flex justify-between text-base font-bold">
                                                <span className="text-cyan-400">ยอดโอนสุทธิ (Net Pay)</span>
                                                <span className="text-cyan-400 font-mono">{tx.details?.net?.toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl mb-4">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <h5 className="text-yellow-500 font-bold text-sm mb-1">การตรวจสอบระบบอัตโนมัติ</h5>
                                                    <ul className="text-xs text-yellow-200/70 space-y-1 list-disc list-inside">
                                                        <li>สถานะบัญชีปลายทาง: <span className="text-green-400">ปกติ</span></li>
                                                        <li>วงเงินคงเหลือในระบบ: <span className="text-green-400">เพียงพอ</span></li>
                                                        <li>ประวัติการทุจริต: <span className="text-green-400">ไม่พบ</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3 mt-auto">
                                            <button 
                                                onClick={() => handleAdminAction(tx.id, 'REJECT')}
                                                className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/30 font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X className="w-5 h-5" /> ปฏิเสธ
                                            </button>
                                            <button 
                                                onClick={() => handleAdminAction(tx.id, 'APPROVE')}
                                                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-5 h-5" /> อนุมัติการโอน
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="w-full py-4 text-slate-500 hover:text-white border border-dashed border-slate-800 hover:border-slate-600 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin"/> : <ChevronDown className="w-4 h-4" />}
                            {isLoadingMore ? "กำลังดึงข้อมูล..." : "โหลดรายการเพิ่มเติม..."}
                        </button>
                        </>
                    )}
                </div>
            )}

            {adminTab === 'WELFARE' && (
                <div className="animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        {/* Table Header Controls */}
                        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="ค้นหาชื่อคนขับ..." 
                                    value={welfareSearch}
                                    onChange={(e) => setWelfareSearch(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cyan-500" 
                                />
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-slate-300">จ่ายแล้ว: {welfareList.filter(d => d.ssoStatus === 'PAID').length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-slate-300">ค้างชำระ: {welfareList.filter(d => d.ssoStatus === 'UNPAID').length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 font-bold">
                                    <tr>
                                        <th className="p-4">พนักงานขับรถ</th>
                                        <th className="p-4">ยอดนำส่ง (ม.33)</th>
                                        <th className="p-4">สถานะการจ่าย (ประจำเดือน)</th>
                                        <th className="p-4">วันที่ชำระล่าสุด</th>
                                        <th className="p-4 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-sm">
                                    {filteredWelfareList.length > 0 ? filteredWelfareList.map((driver) => (
                                        <tr key={driver.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{driver.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{driver.id}</div>
                                            </td>
                                            <td className="p-4 font-mono text-slate-300">{driver.contribution.toLocaleString()} ฿</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                                    driver.ssoStatus === 'PAID' 
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                    {driver.ssoStatus === 'PAID' ? 'ชำระแล้ว (PAID)' : 'ค้างชำระ (UNPAID)'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400">
                                                {driver.lastPaid || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleToggleWelfare(driver.id)}
                                                    className={`p-2 rounded-lg transition-colors border ${
                                                        driver.ssoStatus === 'PAID'
                                                        ? 'text-red-400 border-red-500/20 hover:bg-red-900/20'
                                                        : 'text-green-400 border-green-500/20 hover:bg-green-900/20'
                                                    }`}
                                                    title="Toggle Status"
                                                >
                                                    {driver.ssoStatus === 'PAID' ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                                ไม่พบข้อมูลที่ค้นหา
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
      ) : (
        // ================= DRIVER VIEW (SIMULATION) =================
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Simulation Context Banner */}
            <div className="w-full bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-0.5">
                     <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                     <span className="text-yellow-500 font-bold text-[10px] uppercase tracking-wider">Simulation Mode</span>
                  </div>
                  <div className="text-slate-300 text-xs flex items-center gap-2">
                     <Eye className="w-3.5 h-3.5" />
                     Viewing as: <span className="text-white font-bold">{profile.name} (ID: DRV-089)</span>
                     <button 
                        onClick={() => { setTempProfile(profile); setShowProfileModal(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] text-slate-300 transition-colors border border-slate-700 hover:text-white"
                     >
                        <UserCog className="w-3 h-3" />
                        Edit Profile
                     </button>
                  </div>
               </div>
               <button onClick={() => setIsAdminMode(true)} className="text-xs text-slate-500 hover:text-white underline decoration-slate-600 underline-offset-2">
                  Exit Simulation
               </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full">
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* 1. Main Balance Card */}
                    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 z-0"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] z-0"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] z-0"></div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 text-slate-400">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="text-slate-400 font-bold text-sm tracking-wider uppercase">ยอดเงินที่ถอนได้ (Available)</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                        ฿{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-green-400 bg-green-950/30 px-2 py-1 rounded-lg border border-green-500/20 w-fit">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+12.5% จากสัปดาห์ที่แล้ว</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowWithdrawModal(true)}
                                disabled={balance < 100}
                                className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-900/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                <DollarSign className="w-5 h-5" />
                                ถอนเงิน (Withdraw)
                            </button>
                        </div>
                    </div>

                    {/* 2. Stats & Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tax & SSO */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Umbrella className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">สวัสดิการสังคม</h4>
                                    <p className="text-[10px] text-slate-500">Social Security & Tax</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">นำส่งประกันสังคม (ม.33)</span>
                                    <span className="text-white font-mono font-bold">750 บ.</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">ภาษีหัก ณ ที่จ่าย (3%)</span>
                                    <span className="text-white font-mono font-bold">1,240 บ.</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className={`h-full w-[80%] transition-all ${isSsoPaid ? 'bg-purple-500' : 'bg-red-500'}`}></div>
                                </div>
                                {isSsoPaid ? (
                                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        ท่านอยู่ในระบบถูกต้องตามกฎหมาย
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        ค้างชำระ (จะหักอัตโนมัติเมื่อถอนเงิน)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Safety Score */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">คะแนนความปลอดภัย</h4>
                                    <p className="text-[10px] text-slate-500">Safety Score (Insurtech)</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-black text-blue-400">98</span>
                                <span className="text-sm text-slate-500 mb-1">/ 100</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                                ขับขี่ดีเยี่ยม! เบี้ยประกันภัยลดลง <span className="text-green-400 font-bold">15%</span>
                            </p>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 5 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Financial Insight */}
                    <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold text-white text-sm">AI Financial Coach</h4>
                            </div>
                            <button 
                            onClick={handleAnalyzeFinance}
                            disabled={loadingAdvice}
                            className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20 flex items-center gap-2"
                            >
                            {loadingAdvice ? <Loader2 className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3"/>}
                            {loadingAdvice ? "Analyzing..." : "Analyze Health"}
                            </button>
                        </div>
                        
                        {aiAdvice ? (
                            <div className="animate-fade-in flex flex-col md:flex-row gap-6 items-center">
                                {/* Score Circle */}
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
                                        <circle cx="48" cy="48" r="40" stroke={aiAdvice.health_score > 70 ? '#4ade80' : aiAdvice.health_score > 40 ? '#facc15' : '#f87171'} strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - aiAdvice.health_score / 100)} className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-white">{aiAdvice.health_score}</span>
                                        <span className="text--[10px] text-slate-400">SCORE</span>
                                    </div>
                                </div>
                                
                                {/* Analysis Content */}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-indigo-400 mb-1">{aiAdvice.status}</div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{aiAdvice.summary}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">คำแนะนำ (Action Plan):</div>
                                        {aiAdvice.recommended_actions.map((action, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/50 p-2 rounded border border-indigo-500/10">
                                                <CheckCircle className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                                                <span>{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-4">
                                กดปุ่มเพื่อวิเคราะห์สุขภาพทางการเงินและรับคำแนะนำในการบริหารจัดการหนี้สิน
                            </p>
                        )}
                    </div>

                    {/* 3. Transaction History */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex-1">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                                <History className="w-4 h-4 text-cyan-500" />
                                รายการล่าสุด (Transactions)
                            </h4>
                            <div className="text-[10px] text-slate-500 italic">
                                *คลิกเพื่อดูใบเสร็จ
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {transactions.filter(t => !t.driverName || t.driverName === profile.name).slice(0, 5).map((tx) => (
                                <div 
                                    key={tx.id} 
                                    className="p-4 hover:bg-slate-800/60 transition-colors flex justify-between items-center group cursor-pointer"
                                    onClick={() => setSelectedTransaction(tx)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all group-hover:scale-110 ${
                                            tx.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            tx.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            tx.type === 'INCOME' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            tx.type === 'CARBON' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            tx.type === 'WITHDRAW' ? 'bg-slate-700/50 text-slate-400 border-slate-600' :
                                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        }`}>
                                            {tx.status === 'PENDING' ? <Loader2 className="w-5 h-5 animate-spin-slow" /> :
                                            tx.status === 'REJECTED' ? <X className="w-5 h-5" /> :
                                            tx.type === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> :
                                            tx.type === 'CARBON' ? <Leaf className="w-5 h-5" /> :
                                            tx.type === 'WITHDRAW' ? <ArrowUpRight className="w-5 h-5" /> :
                                            <Umbrella className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm group-hover:text-cyan-400 transition-colors ${tx.status === 'REJECTED' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{tx.title}</div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                                {tx.time} • <span className="uppercase">{tx.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-right ${tx.amount > 0 ? 'text-green-400' : tx.status === 'PENDING' ? 'text-orange-400' : tx.status === 'REJECTED' ? 'text-slate-500' : 'text-slate-200'}`}>
                                        <div className="font-mono font-bold text-sm">
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ฿
                                        </div>
                                        <div className="text-[10px] opacity-60 uppercase flex items-center justify-end gap-1">
                                            {tx.status} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Carbon */}
                <div className="w-full lg:w-[350px] flex flex-col gap-6">
                    {/* Carbon Vault */}
                    <div className="bg-gradient-to-b from-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-emerald-400" />
                                Carbon Vault
                            </h3>
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/30">
                                Level 5: Eco Driver
                            </span>
                        </div>

                        <div className="text-center py-6">
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 drop-shadow-sm mb-2">
                                {carbonBalance}
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-6">ARWEEN Tokens Earned</div>
                            
                            <div className="grid grid-cols-2 gap-3 text-left">
                                <div className="bg-slate-950/50 p-3 rounded-xl border border-emerald-900/50">
                                    <div className="text-[10px] text-slate-500">ลด CO2 สะสม</div>
                                    <div className="text-white font-bold">1,240 kg</div>
                                </div>
                                <div className="bg-slate-950/50 p-3 rounded-xl border border-emerald-900/50">
                                    <div className="text-[10px] text-slate-500">มูลค่าเทียบเท่า</div>
                                    <div className="text-emerald-400 font-bold">~320 THB</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={() => setShowRedeemModal(true)}
                                className="flex-1 py-3 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group"
                            >
                                <Gift className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                แลกรางวัล
                            </button>
                            <button 
                                onClick={() => setShowCarbonHistory(true)}
                                className="px-3 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-all flex items-center justify-center"
                                title="ประวัติ Carbon Credit"
                            >
                                <History className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Weekly Income Chart */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 min-h-[250px] flex flex-col">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-500" />
                            วิเคราะห์รายได้ (Weekly)
                        </h4>
                        
                        <div className="flex-grow w-full h-full min-h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={INCOME_DATA}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px'}}
                                        itemStyle={{color: '#fff'}}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* CARBON HISTORY MODAL */}
      {showCarbonHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-emerald-900/50 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="p-4 bg-emerald-950/30 border-b border-emerald-900/50 flex justify-between items-center">
                      <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                          <Leaf className="w-5 h-5" />
                          ประวัติ Carbon Credit
                      </h3>
                      <button onClick={() => setShowCarbonHistory(false)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 border-b border-slate-800 bg-slate-950/50">
                     <div className="bg-emerald-900/20 rounded-xl p-3 border border-emerald-500/20 text-center">
                        <div className="text-[10px] text-emerald-400/70 uppercase mb-1">ได้รับรวม (Total Earned)</div>
                        <div className="text-xl font-bold text-emerald-400">+{totalCarbonEarned}</div>
                     </div>
                     <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-500 uppercase mb-1">ใช้ไปแล้ว (Total Spent)</div>
                        <div className="text-xl font-bold text-white">-{totalCarbonSpent}</div>
                     </div>
                  </div>

                  {/* List */}
                  <div className="max-h-[350px] overflow-y-auto p-2">
                     {carbonTransactions.length > 0 ? (
                        <div className="space-y-2">
                            {carbonTransactions.map(tx => (
                                <div key={tx.id} className="bg-slate-800/30 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                            {tx.amount > 0 ? <Leaf size={16}/> : <Gift size={16}/>}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">{tx.title}</div>
                                            <div className="text-[10px] text-slate-500">{tx.time}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                           ยังไม่มีประวัติรายการ
                        </div>
                     )}
                  </div>
              </div>
          </div>
      )}

      {/* TRANSACTION SLIP MODAL */}
      {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedTransaction(null)}>
              <div 
                  className="bg-white text-slate-900 w-full max-w-sm rounded-none sm:rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in-up" 
                  onClick={(e) => e.stopPropagation()}
              >
                  {/* Slip Header */}
                  <div className="bg-slate-100 p-6 text-center border-b border-dashed border-slate-300 relative">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950/80 -translate-y-1/2"></div>
                     <h3 className="text-xl font-black text-slate-800 tracking-tight">ARWEEN</h3>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Official E-Receipt</p>
                     
                     <div className="mt-4">
                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-2 shadow-lg ${
                            selectedTransaction.status === 'COMPLETED' ? 'bg-green-500' :
                            selectedTransaction.status === 'PENDING' ? 'bg-orange-500' :
                            'bg-red-500'
                        }`}>
                            {selectedTransaction.status === 'COMPLETED' ? <Check size={32}/> : selectedTransaction.status === 'PENDING' ? <Loader2 size={32} className="animate-spin"/> : <X size={32}/>}
                        </div>
                        <div className="font-bold text-lg text-slate-900">{selectedTransaction.status === 'COMPLETED' ? 'ทำรายการสำเร็จ' : selectedTransaction.status}</div>
                        <div className="text-xs text-slate-500">{selectedTransaction.time}</div>
                     </div>
                  </div>

                  {/* Slip Body */}
                  <div className="p-6 space-y-4">
                     <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                         <span className="text-slate-500">ประเภทรายการ</span>
                         <span className="font-bold text-slate-900">{selectedTransaction.title}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                         <span className="text-slate-500">หมายเลขอ้างอิง</span>
                         <span className="font-mono text-slate-600 text-xs">{selectedTransaction.id}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                         <span className="text-slate-500">ชื่อผู้ทำรายการ</span>
                         <span className="font-bold text-slate-900">{selectedTransaction.driverName || profile.name}</span>
                     </div>

                     {/* Financial Breakdown if Available */}
                     {selectedTransaction.details && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 mt-2">
                           {selectedTransaction.details.gross > 0 && (
                               <div className="flex justify-between text-xs">
                                   <span className="text-slate-500">ยอดเงินต้น</span>
                                   <span className="text-slate-700">{selectedTransaction.details.gross.toLocaleString()} ฿</span>
                               </div>
                           )}
                           {selectedTransaction.details.tax > 0 && (
                               <div className="flex justify-between text-xs text-red-500">
                                   <span>หักภาษี (3%)</span>
                                   <span>-{selectedTransaction.details.tax.toLocaleString()} ฿</span>
                               </div>
                           )}
                           {selectedTransaction.details.sso > 0 && (
                               <div className="flex justify-between text-xs text-red-500">
                                   <span>ประกันสังคม</span>
                                   <span>-{selectedTransaction.details.sso.toLocaleString()} ฿</span>
                               </div>
                           )}
                           {selectedTransaction.details.fee > 0 && (
                               <div className="flex justify-between text-xs text-red-500">
                                   <span>ค่าธรรมเนียม</span>
                                   <span>-{selectedTransaction.details.fee.toLocaleString()} ฿</span>
                               </div>
                           )}
                        </div>
                     )}

                     <div className="flex justify-between items-end pt-2">
                         <span className="text-slate-500 text-sm">จำนวนเงินรวม</span>
                         <span className={`text-2xl font-black tracking-tight ${selectedTransaction.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                            {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount.toLocaleString()} <span className="text-sm font-bold text-slate-400">THB</span>
                         </span>
                     </div>
                  </div>

                  {/* Slip Footer */}
                  <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                     <div className="flex items-center justify-center gap-2 mb-4">
                         <button className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                            <Save size={14} /> บันทึกรูปภาพ
                         </button>
                         <button className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                            <Share2 size={14} /> แชร์
                         </button>
                     </div>
                     <p className="text-[10px] text-slate-400">
                        เอกสารนี้จัดทำโดยระบบอิเล็กทรอนิกส์ ARWEEN Platform<br/>
                        ใช้เป็นหลักฐานยืนยันรายได้ทางกฎหมาย
                     </p>
                  </div>
              </div>
          </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-cyan-400" />
                          ระบุยอดที่ต้องการถอน
                      </h3>
                      <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6">
                      <div className="mb-6">
                          <label className="text-xs text-slate-500 font-bold uppercase block mb-2">จำนวนเงิน (บาท)</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                              <input 
                                  type="number" 
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                  placeholder="0.00"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                  Max: {balance.toLocaleString()}
                              </div>
                          </div>
                      </div>

                      {/* Live Calculation Preview - IMPROVED */}
                      {parseFloat(withdrawAmount) > 0 && (
                          <div className="bg-slate-950 rounded-xl border border-slate-800 mb-6 overflow-hidden animate-fade-in-up">
                             <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">ยอดเงินต้น (Gross Amount)</span>
                                    <span className="text-white font-bold font-mono">{parseFloat(withdrawAmount).toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</span>
                                </div>
                                
                                <div className="bg-red-950/10 border border-red-500/10 rounded-lg p-3 space-y-2">
                                   <div className="flex justify-between items-center text-xs text-red-300/70">
                                      <span>ภาษีหัก ณ ที่จ่าย (3%)</span>
                                      <span className="font-mono">-{calculateDeductions(parseFloat(withdrawAmount)).tax.toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</span>
                                   </div>
                                   <div className="flex justify-between items-center text-xs text-red-300/70">
                                      <span>ค่าธรรมเนียม (Fee)</span>
                                      <span className="font-mono">-15.00 ฿</span>
                                   </div>
                                   {!isSsoPaid && (
                                       <div className="flex justify-between items-center text-xs text-purple-300/70 pt-1 border-t border-red-500/10 mt-1">
                                          <span className="flex items-center gap-1"><Umbrella className="w-3 h-3"/> ประกันสังคม ม.33</span>
                                          <span className="font-mono text-purple-400">-750.00 ฿</span>
                                       </div>
                                   )}
                                </div>
                             </div>
                             
                             <div className="bg-cyan-950/20 p-4 border-t border-cyan-500/20 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-cyan-500 uppercase font-bold tracking-wider">ยอดโอนสุทธิ (Net Pay)</div>
                                        <div className="text-[10px] text-slate-500">เงินเข้าบัญชีภายใน 15 นาที</div>
                                    </div>
                                    <div className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
                                    {Math.max(0, calculateDeductions(parseFloat(withdrawAmount)).net).toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-sm font-bold text-cyan-600">฿</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-cyan-500/10 text-[10px] text-slate-400 flex items-center justify-between">
                                   <span>โอนเข้า: {profile.bankName}</span>
                                   <span className="font-mono">xxxx-{profile.bankAccount.slice(-4)}</span>
                                </div>
                             </div>
                          </div>
                      )}

                      <button 
                          onClick={handleRequestWithdraw}
                          disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || isProcessing}
                          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle className="w-5 h-5" />}
                          {isProcessing ? "กำลังส่งคำขอ..." : "ยืนยันการถอนเงิน"}
                      </button>
                      
                      <p className="text-[10px] text-slate-500 text-center mt-3">
                         รายการจะถูกส่งให้ผู้ดูแลระบบตรวจสอบและอนุมัติภายใน 15 นาที
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* REDEEM MODAL */}
      {showRedeemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="p-4 bg-emerald-950/30 border-b border-emerald-900/50 flex justify-between items-center">
                      <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                          <Gift className="w-5 h-5" />
                          แลกของรางวัล (Redeem)
                      </h3>
                      <button onClick={() => setShowRedeemModal(false)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-4 bg-slate-950/50 text-center border-b border-slate-800">
                      <div className="text-slate-500 text-xs mb-1">คะแนนคงเหลือ</div>
                      <div className="text-3xl font-black text-white">{carbonBalance}</div>
                      <div className="text-[10px] text-emerald-500 uppercase">TOKENS</div>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {REWARDS.map(reward => {
                          const canAfford = carbonBalance >= reward.cost;
                          return (
                              <div key={reward.id} className={`p-3 rounded-xl border flex items-center justify-between ${canAfford ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${reward.color}`}>
                                          {reward.icon}
                                      </div>
                                      <div>
                                          <div className="font-bold text-sm text-slate-200">{reward.name}</div>
                                          <div className="text-xs text-slate-500 font-mono">{reward.cost} Tokens</div>
                                      </div>
                                  </div>
                                  <button
                                    onClick={() => handleRedeem(reward)}
                                    disabled={!canAfford || !!processingRedeem}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        processingRedeem === reward.id ? 'bg-emerald-900 text-emerald-400' :
                                        canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                      {processingRedeem === reward.id ? <Loader2 className="w-4 h-4 animate-spin"/> : 'แลกเลย'}
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-cyan-400" />
                        แก้ไขข้อมูลส่วนตัว (Edit Profile)
                    </h3>
                    <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Personal Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3 h-3" /> ข้อมูลทั่วไป
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">ชื่อ-นามสกุล</label>
                                <input 
                                    type="text" 
                                    value={tempProfile.name}
                                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">เบอร์โทรศัพท์</label>
                                <input 
                                    type="text" 
                                    value={tempProfile.phone}
                                    onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                            <Truck className="w-3 h-3" /> ข้อมูลยานพาหนะ
                        </h4>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">ประเภทรถ</label>
                            <input 
                                type="text" 
                                value={tempProfile.vehicleType}
                                onChange={(e) => setTempProfile({...tempProfile, vehicleType: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">ทะเบียนรถ</label>
                            <input 
                                type="text" 
                                value={tempProfile.licensePlate}
                                onChange={(e) => setTempProfile({...tempProfile, licensePlate: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-3 h-3" /> บัญชีรับเงิน
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">ธนาคาร</label>
                                <input 
                                    type="text" 
                                    value={tempProfile.bankName}
                                    onChange={(e) => setTempProfile({...tempProfile, bankName: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">เลขที่บัญชี</label>
                                <input 
                                    type="text" 
                                    value={tempProfile.bankAccount}
                                    onChange={(e) => setTempProfile({...tempProfile, bankAccount: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2"
                    >
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                        {savingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};