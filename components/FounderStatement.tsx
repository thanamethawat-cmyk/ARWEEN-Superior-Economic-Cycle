import React, { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

export const FounderStatement: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={ref}
      className={`max-w-4xl mx-auto px-4 py-16 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
       <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-3xl border border-slate-800 shadow-2xl">
         <div className="absolute top-0 left-0 -translate-x-4 -translate-y-4 bg-cyan-600 p-3 rounded-full text-white shadow-lg">
           <Quote className="w-6 h-6 fill-current" />
         </div>
         
         <h3 className="text-white font-bold text-xl mb-6">บทสรุปจากผู้สร้าง (Creator's Statement)</h3>
         
         <div className="text-lg text-slate-300 leading-relaxed italic mb-8 space-y-4">
           <p>
             "จากมุมมองของคนรุ่นใหม่ (Gen Z) ปัญหาเชิงโครงสร้างในปัจจุบันเกิดจากกลไกและกติกาเดิมที่ไม่เอื้อต่อความยั่งยืน นำไปสู่ความเหลื่อมล้ำและผลกระทบต่อสิ่งแวดล้อม"
           </p>
           <p>
             "ปรัชญาของ ARWEEN จึงมุ่งเน้นที่ <span className="text-white not-italic font-bold">'การสร้างบรรทัดฐานใหม่ทางธุรกิจ' (The New Business Paradigm)</span> เรามิได้มุ่งแก้ไขกฎระเบียบในระบบเก่าที่ชำรุด แต่เรากำลังสร้าง 'โครงสร้างพื้นฐานใหม่' ที่เปลี่ยนข้อมูลเป็นเกราะป้องกัน และเปลี่ยนคาร์บอนเป็นโอกาสทางเศรษฐกิจ"
           </p>
         </div>

         <div className="flex items-center gap-4 border-t border-slate-800 pt-6">
           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
             TS
           </div>
           <div>
             <div className="text-white font-bold">คุณธนเมธวัจน์ ศรีพิทักษ์</div>
             <div className="text-cyan-500 text-sm">ผู้พัฒนาโครงการ ARWEEN</div>
           </div>
         </div>
       </div>
    </section>
  );
};