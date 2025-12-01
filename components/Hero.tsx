import React, { useState } from 'react';
import { ArrowRight, Zap, Leaf, ShieldAlert, Activity, Server, BrainCircuit, Route, ShieldCheck, CheckCircle2, X, FileText, Target, AlertTriangle, Lightbulb, RefreshCw, Layers, Scale } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [showProposal, setShowProposal] = useState(false);

  return (
    <div className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pb-28">
      {/* Dynamic Central Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse-slow" />

      <div className="text-center max-w-6xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-8 uppercase tracking-wider animate-fade-in-up backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          ARWEEN: Truth-Driven Evolution
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1] drop-shadow-2xl">
          แพลตฟอร์มบริหารจัดการ<br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">ทรัพยากรพนักงานขับรถอัจฉริยะ</span>
        </h1>
        
        {/* Updated Vision & Mission Section (Based on latest PDF) */}
        <div className="max-w-5xl mx-auto mb-12 text-left sm:text-center space-y-6 bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-800/60 backdrop-blur-md shadow-xl animate-fade-in-up relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600"></div>
           
           <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-light">
              <strong className="text-cyan-400 font-bold mr-2 block sm:inline mb-2 sm:mb-0">วิสัยทัศน์และพันธกิจ:</strong>
              ARWEEN มุ่งมั่นยกระดับอุตสาหกรรมโลจิสติกส์สู่การเป็น <span className="text-white font-medium">"ผู้สร้างระบบนิเวศทางธุรกิจ" (Ecosystem Enabler)</span> โดยวางตำแหน่งตนเองเป็น <span className="text-white font-medium">"ทางออกเชิงโครงสร้าง" (Structural Exit)</span> เพื่อนำพาผู้มีส่วนได้ส่วนเสียออกจากวงจรปัญหาเรื้อรังของระบบขนส่งเดิม
           </p>
           <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light border-t border-slate-800/50 pt-4 mt-4">
              เราบูรณาการเทคโนโลยี <span className="text-slate-200 font-medium">AI Optimization</span> และ <span className="text-slate-200 font-medium">Telemetry</span> เพื่อทำหน้าที่เป็น <span className="text-cyan-400 font-medium">"ตัวกลางที่เป็นกลาง" (Neutral Orchestrator)</span> ในการเชื่อมโยงทรัพยากรและข้อมูล เป้าหมายสำคัญคือการเปลี่ยนสถานะ <span className="text-white">"แรงงานนอกระบบ"</span> ให้เข้าสู่ระบบภาษีและสวัสดิการสังคมอย่างถูกต้อง และเปลี่ยน <span className="text-white">"ต้นทุนแฝงทางสิ่งแวดล้อม"</span> ให้เป็นมูลค่าทางเศรษฐกิจ ภายใต้หลักการ <span className="text-green-400 font-bold">"Zero Accident & Life First"</span> (ความปลอดภัยและคุณภาพชีวิตเป็นลำดับแรก)
           </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-xl shadow-cyan-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group border border-white/10"
          >
            <Activity className="w-5 h-5" />
            เข้าสู่ระบบแพลตฟอร์ม
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setShowProposal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-cyan-500/50 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Server className="w-5 h-5" />
            อ่านข้อเสนอโครงการ
          </button>
        </div>

        {/* Live System Status - Redesigned Grid */}
        <div className="mx-auto max-w-5xl">
           <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[10px] font-mono text-green-400 tracking-[0.2em] uppercase">Live System Telemetry</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Block 1: AI Engine */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-900/60 hover:border-slate-700 transition-all group shadow-lg">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                       <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">AI Core Engine</div>
                       <div className="text-white font-bold text-sm flex items-center gap-2">
                          ONLINE <span className="text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 tracking-wide">99.9%</span>
                       </div>
                    </div>
                 </div>
                 <div className="relative w-2 h-2 mr-2">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
                 </div>
              </div>

              {/* Block 2: Optimized Routes */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-900/60 hover:border-slate-700 transition-all group shadow-lg">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                       <Route className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Optimized Routes</div>
                       <div className="text-white font-bold text-sm flex items-center gap-2">
                          1,248 <span className="text-[9px] text-slate-400 font-normal">Jobs Today</span>
                       </div>
                    </div>
                 </div>
                 <Activity className="w-4 h-4 text-cyan-500/50" />
              </div>

              {/* Block 3: Safety Override */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-900/60 hover:border-slate-700 transition-all group shadow-lg">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Safety Guard</div>
                       <div className="text-white font-bold text-sm flex items-center gap-2">
                          ACTIVE <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 tracking-wide">SECURE</span>
                       </div>
                    </div>
                 </div>
                 <CheckCircle2 className="w-4 h-4 text-purple-500/50" />
              </div>
           </div>
        </div>

        {/* Quick Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-800/50 pt-10">
           <div className="group p-4 rounded-2xl hover:bg-slate-900/50 transition-colors cursor-default">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-500 border border-blue-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1">อุบัติเหตุเป็นศูนย์</h3>
              <p className="text-xs text-slate-500">Zero Accident Protocol</p>
           </div>
           <div className="group p-4 rounded-2xl hover:bg-slate-900/50 transition-colors cursor-default">
              <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform duration-500 border border-cyan-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1">ประสิทธิภาพสูงสุด</h3>
              <p className="text-xs text-slate-500">Thinking Mode AI Logic</p>
           </div>
           <div className="group p-4 rounded-2xl hover:bg-slate-900/50 transition-colors cursor-default">
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-4 text-green-400 group-hover:scale-110 transition-transform duration-500 border border-green-500/20">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1">โลจิสติกส์สีเขียว</h3>
              <p className="text-xs text-slate-500">Carbon Credit Standard</p>
           </div>
        </div>
      </div>

      {/* Project Proposal Modal (Updated Content) */}
      {showProposal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setShowProposal(false)}></div>
           
           {/* Modal Content */}
           <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl relative flex flex-col animate-fade-in-up overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                 <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
                       <FileText className="w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white">เอกสารข้อเสนอโครงการ (Project Proposal)</h2>
                       <p className="text-xs text-slate-400">โครงการ: ARWEEN | วันที่: 25 พฤศจิกายน 2568</p>
                    </div>
                 </div>
                 <button onClick={() => setShowProposal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-6 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                 <div className="space-y-10">
                    
                    {/* Section 1: Executive Summary */}
                    <section>
                       <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5" /> 1. บทสรุปสำหรับผู้บริหาร (Executive Summary)
                       </h3>
                       <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-slate-300 leading-relaxed text-sm">
                          <p className="mb-4">
                             <strong className="text-white">วิสัยทัศน์และพันธกิจ:</strong> ARWEEN มุ่งมั่นยกระดับอุตสาหกรรมโลจิสติกส์สู่การเป็น <span className="text-cyan-400 font-bold">"ผู้สร้างระบบนิเวศทางธุรกิจ" (Ecosystem Enabler)</span> โดยวางตำแหน่งตนเองเป็น <span className="text-white font-bold">"ทางออกเชิงโครงสร้าง" (Structural Exit)</span> เพื่อนำพาผู้มีส่วนได้ส่วนเสียออกจากวงจรปัญหาเรื้อรังของระบบขนส่งเดิม
                          </p>
                          <p>
                             เราบูรณาการเทคโนโลยี AI Optimization และ Telemetry เพื่อทำหน้าที่เป็น <span className="text-white">"ตัวกลางที่เป็นกลาง" (Neutral Orchestrator)</span> ในการเชื่อมโยงทรัพยากรและข้อมูล เป้าหมายสำคัญคือการเปลี่ยนสถานะ <span className="text-white">"แรงงานนอกระบบ"</span> ให้เข้าสู่ระบบภาษีและสวัสดิการสังคมอย่างถูกต้อง และเปลี่ยน <span className="text-white">"ต้นทุนแฝงทางสิ่งแวดล้อม"</span> ให้เป็นมูลค่าทางเศรษฐกิจ ภายใต้หลักการ <span className="text-green-400 font-bold">"Zero Accident & Life First"</span>
                          </p>
                       </div>
                    </section>

                    {/* Section 2: Structural Vicious Cycle */}
                    <section>
                       <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                          <RefreshCw className="w-5 h-5" /> 2. วงจรปัญหาเชิงโครงสร้าง (Structural Vicious Cycle)
                       </h3>
                       <div className="bg-slate-950/30 p-5 rounded-xl border border-red-500/20">
                          <p className="text-slate-400 text-sm mb-4">กระบวนการเกิดวงจรความล้มเหลว (The Failure Loop):</p>
                          <ul className="space-y-3 text-sm text-slate-300">
                             <li className="flex gap-3 items-start">
                                <span className="bg-red-500/20 text-red-400 font-bold px-2 rounded">1</span>
                                <span><strong className="text-white">จุดเริ่มต้น:</strong> ผู้ประกอบการชำระค่าจ้างด้วยเงินสด หรือชำระล่าช้า ทำให้เงินอยู่นอกระบบตรวจสอบ</span>
                             </li>
                             <li className="flex gap-3 items-start">
                                <span className="bg-red-500/20 text-red-400 font-bold px-2 rounded">2</span>
                                <span><strong className="text-white">ผลกระทบสภาพคล่อง:</strong> พนักงานขับรถขาดสภาพคล่อง ต้องพึ่งพาหนี้นอกระบบ</span>
                             </li>
                             <li className="flex gap-3 items-start">
                                <span className="bg-red-500/20 text-red-400 font-bold px-2 rounded">3</span>
                                <span><strong className="text-white">การสูญเสียสถานะ:</strong> ขาดอำนาจต่อรอง ไม่มีหลักฐานรายได้ ไม่ปรากฏในฐานข้อมูลประกันสังคม</span>
                             </li>
                             <li className="flex gap-3 items-start">
                                <span className="bg-red-500/20 text-red-400 font-bold px-2 rounded">4</span>
                                <span><strong className="text-white">จุดวิกฤต:</strong> จำยอมรับงานเสี่ยงหรือบรรทุกน้ำหนักเกินเพื่อหารายได้เพิ่ม นำไปสู่การปล่อยคาร์บอนโดยไม่มีการตรวจสอบ</span>
                             </li>
                          </ul>
                       </div>
                    </section>

                    {/* Section 3: System Architecture of Hope */}
                    <section>
                       <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                          <Layers className="w-5 h-5" /> 3. สถาปัตยกรรมระบบแห่งความยั่งยืน (5 Layers)
                       </h3>
                       <div className="space-y-3">
                          <div className="flex gap-4 items-center bg-slate-800/20 p-3 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                             <div className="text-purple-400 font-bold min-w-[3rem] text-center">Layer 1</div>
                             <div className="text-sm"><strong className="text-white">Data Acquisition:</strong> คนขับและรถส่งข้อมูลพิกัด/สถานะผ่าน Telemetry แบบ Real-time</div>
                          </div>
                          <div className="flex gap-4 items-center bg-slate-800/20 p-3 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                             <div className="text-purple-400 font-bold min-w-[3rem] text-center">Layer 2</div>
                             <div className="text-sm"><strong className="text-white">Intelligence Processing:</strong> AI ตรวจสอบงานและคำนวณ Carbon Credit ที่ลดได้</div>
                          </div>
                          <div className="flex gap-4 items-center bg-slate-800/20 p-3 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                             <div className="text-purple-400 font-bold min-w-[3rem] text-center">Layer 3</div>
                             <div className="text-sm"><strong className="text-white">Value Distribution:</strong> โอนเงินค่าจ้างเข้า Digital Wallet ทันที (Instant Payment)</div>
                          </div>
                          <div className="flex gap-4 items-center bg-slate-800/20 p-3 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                             <div className="text-purple-400 font-bold min-w-[3rem] text-center">Layer 4</div>
                             <div className="text-sm"><strong className="text-white">Compliance & Welfare:</strong> นำส่งภาษี/ประกันสังคมอัตโนมัติ ให้คนขับได้รับสิทธิทันที</div>
                          </div>
                          <div className="flex gap-4 items-center bg-slate-800/20 p-3 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                             <div className="text-purple-400 font-bold min-w-[3rem] text-center">Layer 5</div>
                             <div className="text-sm"><strong className="text-white">Economic Impact:</strong> ธุรกิจได้ Carbon Credit / สถาบันการเงินได้ข้อมูล Credit Scoring</div>
                          </div>
                       </div>
                    </section>

                    {/* Section 4: Strategic Positioning */}
                    <section>
                       <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                          <Scale className="w-5 h-5" /> 4. จุดยืนทางยุทธศาสตร์ (Strategic Positioning)
                       </h3>
                       <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-sm text-left">
                             <thead className="text-xs uppercase bg-slate-900 text-slate-400">
                                <tr>
                                   <th className="px-4 py-3">ปัจจัยการแข่งขัน</th>
                                   <th className="px-4 py-3">ระบบเดิม (Conventional)</th>
                                   <th className="px-4 py-3 text-cyan-400">ระบบนิเวศ ARWEEN</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                                <tr>
                                   <td className="px-4 py-3 font-medium text-slate-300">การชำระเงิน</td>
                                   <td className="px-4 py-3 text-slate-500">ล่าช้า / ขาดความแน่นอน</td>
                                   <td className="px-4 py-3 text-white">Real-time / โปร่งใส / ตรวจสอบได้</td>
                                </tr>
                                <tr>
                                   <td className="px-4 py-3 font-medium text-slate-300">สถานะแรงงาน</td>
                                   <td className="px-4 py-3 text-slate-500">นอกระบบ / ขาดหลักประกัน</td>
                                   <td className="px-4 py-3 text-white">ในระบบ / มีสิทธิประกันสังคม</td>
                                </tr>
                                <tr>
                                   <td className="px-4 py-3 font-medium text-slate-300">สิ่งแวดล้อม</td>
                                   <td className="px-4 py-3 text-slate-500">ปล่อยมลพิษ / ขาดการวัดผล</td>
                                   <td className="px-4 py-3 text-white">Carbon Credit / สิทธิลดหย่อนภาษี</td>
                                </tr>
                                <tr>
                                   <td className="px-4 py-3 font-medium text-slate-300">เป้าหมายสูงสุด</td>
                                   <td className="px-4 py-3 text-slate-500">กำไรระยะสั้นเฉพาะบุคคล</td>
                                   <td className="px-4 py-3 text-white">การเติบโตของ GDP & คุณภาพชีวิตสังคม</td>
                                </tr>
                             </tbody>
                          </table>
                       </div>
                    </section>

                    {/* Section 5: Creator's Statement */}
                    <section>
                       <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" /> 5. บทสรุปจากผู้สร้าง (Creator's Statement)
                       </h3>
                       <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 italic text-slate-300 leading-relaxed text-sm">
                          <p className="mb-4">
                             "จากมุมมองของคนรุ่นใหม่ (Gen Z) ปัญหาเชิงโครงสร้างในปัจจุบันเกิดจากกลไกและกติกาเดิมที่ไม่เอื้อต่อความยั่งยืน... ปรัชญาของ ARWEEN จึงมุ่งเน้นที่ <span className="text-white not-italic font-bold">'การสร้างบรรทัดฐานใหม่ทางธุรกิจ' (The New Business Paradigm)</span>"
                          </p>
                          <ul className="list-disc list-inside space-y-1 mb-4 text-slate-400">
                             <li>เปลี่ยน เอกสารกระดาษ สู่ ระบบดิจิทัล</li>
                             <li>เปลี่ยน ข้อมูล สู่ เกราะป้องกันทางธุรกิจ</li>
                             <li>เปลี่ยน ภาษี สู่ สวัสดิการชีวิตที่มั่นคง</li>
                             <li>เปลี่ยน คาร์บอน สู่ โอกาสทางเศรษฐกิจ</li>
                          </ul>
                          <p>
                             ARWEEN ถูกออกแบบมาเพื่อสร้างระบบนิเวศที่ <span className="text-cyan-400 not-italic font-bold">"แรงงานมีความหวัง ผู้ประกอบการมีความยั่งยืน และเศรษฐกิจของประเทศมีความมั่นคง"</span> ไปพร้อมกัน
                          </p>
                       </div>
                    </section>

                 </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                 <button 
                   onClick={() => setShowProposal(false)}
                   className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                 >
                   ปิดหน้าต่าง
                 </button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};