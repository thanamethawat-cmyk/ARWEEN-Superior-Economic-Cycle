import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'การชำระเงิน', value: 100, target: 100, suffix: '% (Real-time)', color: '#22d3ee' }, // Real-time
  { name: 'เข้าระบบแรงงาน', value: 100, target: 100, suffix: '% (Social Security)', color: '#a855f7' }, // Formal Labor
  { name: 'ลดการปล่อยคาร์บอน', value: 35, target: 35, suffix: '%', color: '#4ade80' }, // Green
  { name: 'เพิ่ม GDP Impact', value: 15, target: 15, suffix: '%', color: '#eab308' }, // GDP
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-semibold">{label}</p>
        <p className="text-cyan-400">{`เป้าหมาย: ${payload[0].payload.suffix}`}</p>
      </div>
    );
  }
  return null;
};

export const ImpactStats: React.FC = () => {
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
      className={`bg-slate-900/50 border border-slate-800 rounded-3xl p-8 lg:p-12 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">ผลลัพธ์ที่คาดการณ์ (The Ripple Effect)</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
               <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
               <div>
                 <h4 className="text-white font-medium">ความมั่นคงทางการเงิน</h4>
                 <p className="text-slate-400 text-sm">เปลี่ยนจากการจ่ายล่าช้าเป็น <span className="text-white font-bold">Real-time Payment</span> สร้างสภาพคล่องทันที</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="mt-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
               <div>
                 <h4 className="text-white font-medium">ยกระดับคุณภาพชีวิต</h4>
                 <p className="text-slate-400 text-sm">แรงงานเข้าสู่ระบบ (Tax Entry) และได้รับสิทธิ <span className="text-white font-bold">ประกันสังคม</span> ครบถ้วน</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="mt-1 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
               <div>
                 <h4 className="text-white font-medium">เศรษฐกิจและสิ่งแวดล้อม</h4>
                 <p className="text-slate-400 text-sm">เปลี่ยนมลพิษเป็น <span className="text-white font-bold">Carbon Credit</span> และเพิ่มความเร็วในการหมุนเวียนของระบบเศรษฐกิจ</p>
               </div>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{fill: '#64748b'}} />
              <YAxis dataKey="name" type="category" width={110} stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b', opacity: 0.4}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};