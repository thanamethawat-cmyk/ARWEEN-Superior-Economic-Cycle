import React, { useEffect, useRef, useState } from 'react';
import { Database, BrainCircuit, HeartHandshake, Umbrella } from 'lucide-react';

export const Pillars: React.FC = () => {
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

  const pillars = [
    {
      icon: <Database className="w-8 h-8 text-cyan-400" />,
      title: "1. ฐานข้อมูลความจริง (Single Source of Truth)",
      desc: "สร้างมาตรฐานข้อมูลที่โปร่งใสด้วย Telemetry และระบบ Real-time Payment เพื่อแก้ปัญหาสภาพคล่องของแรงงาน และตัดวงจรหนี้นอกระบบ"
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
      title: "2. การบริหารจัดการเชิงกลยุทธ์ (Legal & Green)",
      desc: "ใช้ AI คำนวณพิกัดน้ำหนักที่เหมาะสมที่สุด (Max Payload) และบริหารจัดการคาร์บอนเครดิตแบบอัตโนมัติ"
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-pink-400" />,
      title: "3. เศรษฐศาสตร์แห่งความยั่งยืน (Incentive & Inclusion)",
      desc: "นำพาแรงงานเข้าสู่ระบบภาษี (Tax Entry), สนับสนุนสิทธิประกันสังคม (Social Security) และสร้างประวัติทางการเงิน (Credit Scoring)"
    },
    {
      icon: <Umbrella className="w-8 h-8 text-yellow-400" />,
      title: "4. ความปลอดภัยอัจฉริยะ (Safety Intelligence)",
      desc: "ระบบบริหารความเสี่ยงจากสภาพอากาศ (Safety Override) และการแจ้งเตือนภัยแบบ Real-time เพื่อความปลอดภัยสูงสุด"
    }
  ];

  return (
    <section 
      ref={ref}
      className={`relative transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="text-center mb-12">
         <h2 className="text-3xl font-bold text-white mb-4">4 เสาหลักแห่งระบบนิเวศ ARWEEN</h2>
         <p className="text-slate-400">ระบบถูกออกแบบให้ทำงานสอดประสานกันเพื่อประสิทธิภาพสูงสุดและความยั่งยืน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all group">
            <div className="mb-4 p-3 bg-slate-950 rounded-lg w-fit group-hover:scale-110 transition-transform">
              {pillar.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{pillar.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};