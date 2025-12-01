
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getWeatherInsight, getAutocompleteSuggestions, queryLocationIntelligence, WeatherData } from '../../services/geminiService';
import { Search, Truck, AlertTriangle, Navigation, Layers, MapPin, ZoomIn, ZoomOut, RefreshCw, CloudRain, Sun, Cloud, CloudLightning, Wind, Droplets, Thermometer, Filter, X, LayoutGrid, LocateFixed, Volume2, VolumeX, Siren, Navigation2, Circle, Octagon, Info, MousePointer2, List, ShieldCheck, ArrowRight, CornerUpRight, CheckCircle, ArrowUpRight, Flag, Building2, Anchor, Map, ExternalLink, Loader2, Sparkles } from 'lucide-react';

// --- Types & Constants ---

interface RiskZone {
  id: string;
  type: 'FLOOD' | 'STORM' | 'CONGESTION' | 'ACCIDENT';
  lat: number;
  lng: number;
  level: 'CRITICAL' | 'MODERATE' | 'WARNING';
  value: string;
  desc: string;
  locationName: string;
  advice: string;
}

interface FleetVehicle {
  id: string;
  plate: string;
  lat: number;
  lng: number;
  status: 'MOVING' | 'IDLE' | 'RISK_WARNING' | 'CRITICAL_STOP' | 'REROUTED' | 'SAFE_ARRIVAL';
  driver: string;
  cargo: string;
  destination: string;
  speed: number;
  heading: number;
}

interface LocationPOI {
  name: string;
  lat: number;
  lng: number;
  type: string;
}

// Chonburi (EEC) Coordinate System for Simulation
const BOUNDS = { 
  minLat: 12.80, // Sattahip
  maxLat: 13.50, // Chonburi City
  minLng: 100.80, // Gulf
  maxLng: 101.20 // Ban Bueng
};

const SAFE_HAVEN = { lat: 13.40, lng: 100.95, name: 'จุดพักรถปลอดภัย (Safe Zone)' };

const LOCATIONS: LocationPOI[] = [
  { name: 'อมตะซิตี้', lat: 13.42, lng: 101.03, type: 'FACTORY' },
  { name: 'ท่าเรือแหลมฉบัง', lat: 13.08, lng: 100.88, type: 'PORT' },
  { name: 'เมืองชลบุรี', lat: 13.36, lng: 100.98, type: 'CITY' },
  { name: 'เมืองพัทยา', lat: 12.92, lng: 100.88, type: 'CITY' },
  { name: 'ศรีราชา', lat: 13.17, lng: 100.93, type: 'CITY' },
  { name: 'มาบตาพุด', lat: 12.85, lng: 101.15, type: 'FACTORY' },
];

// Mock Data
const MOCK_RISK_ZONES: RiskZone[] = [
  { 
    id: 'Z-01', type: 'CONGESTION', lat: 13.08, lng: 100.90, level: 'MODERATE', 
    value: 'รถติดหนัก', desc: 'การจราจรหนาแน่นหน้าท่าเรือแหลมฉบัง เฟส 2', locationName: 'ถ.สุขุมวิท (แหลมฉบัง)',
    advice: 'ควรใช้เส้นทางเลี่ยง หรือเผื่อเวลา 30 นาที'
  },
  { 
    id: 'Z-02', type: 'FLOOD', lat: 13.35, lng: 101.02, level: 'WARNING', 
    value: 'น้ำท่วม 20cm', desc: 'ฝนตกหนักระบายไม่ทัน ผิวจราจรมีน้ำขัง', locationName: 'บายพาสเลี่ยงเมืองชลบุรี',
    advice: 'รถเล็กควรหลีกเลี่ยง ใช้ทางขนานมอเตอร์เวย์'
  },
  { 
    id: 'Z-03', type: 'ACCIDENT', lat: 13.25, lng: 101.08, level: 'CRITICAL', 
    value: 'อุบัติเหตุรุนแรง', desc: 'รถบรรทุกพลิกคว่ำ กีดขวาง 2 ช่องทางขวา', locationName: 'มอเตอร์เวย์ สาย 7 (กม.85)',
    advice: 'หยุดรถทันที หรือลดความเร็วเหลือ 30 กม./ชม.'
  },
];

// Initial fleet state
const INITIAL_FLEET: FleetVehicle[] = [
  { id: 'T-01', plate: '70-4582', lat: 13.15, lng: 101.02, status: 'MOVING', driver: 'สมชาย มีสุข', cargo: 'อิเล็กทรอนิกส์', destination: 'อมตะซิตี้', speed: 85, heading: 340 },
  { id: 'T-02', plate: '72-9914', lat: 13.09, lng: 100.89, status: 'IDLE', driver: 'วิชัย มั่นคง', cargo: 'ตู้คอนเทนเนอร์', destination: 'ท่าเรือ A2', speed: 0, heading: 180 },
  { id: 'T-03', plate: '64-1023', lat: 13.19, lng: 101.04, status: 'RISK_WARNING', driver: 'อำนาจ รักถิ่น', cargo: 'เคมีภัณฑ์', destination: 'ระยอง', speed: 20, heading: 160 },
  // This truck will be simulated to move towards the accident
  { id: 'T-04', plate: '71-5567', lat: 13.15, lng: 101.00, status: 'MOVING', driver: 'ปิติ สุขใจ', cargo: 'ชิ้นส่วนยานยนต์', destination: 'กรุงเทพฯ (Motorway)', speed: 90, heading: 45 },
  // Extra trucks for clustering demo
  { id: 'T-05', plate: '70-1111', lat: 13.16, lng: 101.03, status: 'MOVING', driver: 'ทดสอบ ระบบ', cargo: 'พัสดุ', destination: 'ชลบุรี', speed: 80, heading: 330 },
  { id: 'T-06', plate: '70-2222', lat: 13.085, lng: 100.895, status: 'IDLE', driver: 'สมหมาย', cargo: 'ตู้เย็น', destination: 'ท่าเรือ', speed: 0, heading: 0 },
];

export const MapAssistant: React.FC = () => {
  // State for Viewport
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });
  
  // State for Data & UI
  const [query, setQuery] = useState("");
  const [activeLayers, setActiveLayers] = useState({ traffic: true, risk: true, fleet: true, weather: true });
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [selectedStaticLocation, setSelectedStaticLocation] = useState<LocationPOI | null>(null);
  const [locationAnalysis, setLocationAnalysis] = useState<{text: string, locations: any[]} | null>(null);
  const [isAnalyzingLocation, setIsAnalyzingLocation] = useState(false);

  const [weatherInfo, setWeatherInfo] = useState<WeatherData | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time Features State
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [alertSystem, setAlertSystem] = useState<{active: boolean, vehicleId: string, zoneId: string} | null>(null);
  const [reroutedVehicles, setReroutedVehicles] = useState<Set<string>>(new Set());
  const [arrivalNotification, setArrivalNotification] = useState<string | null>(null);
  
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBeepTimeRef = useRef(0);

  // --- Audio Logic (Synthesizer) ---
  const playAlertSound = useCallback(() => {
    if (!audioEnabled) return;
    
    const now = Date.now();
    if (now - lastBeepTimeRef.current < 2000) return; // Debounce 2 sec
    lastBeepTimeRef.current = now;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    // Warning siren sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, [audioEnabled]);

  const playSuccessSound = useCallback(() => {
    if (!audioEnabled) return;
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, [audioEnabled]);

  const handleReroute = (vehicleId: string) => {
    setReroutedVehicles(prev => {
        const next = new Set(prev);
        next.add(vehicleId);
        return next;
    });
    setAlertSystem(null); // Clear alert immediately
    
    // Play confirmation sound
    if (audioEnabled && audioContextRef.current) {
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }
  };

  const handleLocationClick = async (e: React.MouseEvent, loc: LocationPOI) => {
    e.stopPropagation();
    setSelectedStaticLocation(loc);
    setSelectedVehicle(null);
    setSelectedZone(null);
    setLocationAnalysis(null);
    setIsAnalyzingLocation(true);

    try {
      const result = await queryLocationIntelligence(
        `ข้อมูลเชิงลึกโลจิสติกส์ของ ${loc.name} เช่น เส้นทางเข้าออกหลัก, จุดจอดพักรถบรรทุก, สภาพจราจรช่วงเวลาเร่งด่วน, และสิ่งอำนวยความสะดวก`,
        loc.lat,
        loc.lng
      );
      setLocationAnalysis(result);
    } catch (error) {
      console.error(error);
      setLocationAnalysis({ text: "ไม่สามารถดึงข้อมูลได้ในขณะนี้", locations: [] });
    } finally {
      setIsAnalyzingLocation(false);
    }
  };

  const handleSearchAnalysis = async (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
    
    // Create a dynamic POI for the search
    const searchLocation: LocationPOI = { 
        name: term, 
        lat: 13.36, // Default to Center for context
        lng: 100.98, 
        type: 'SEARCH_RESULT' 
    };

    setSelectedStaticLocation(searchLocation);
    setSelectedVehicle(null);
    setSelectedZone(null);
    setLocationAnalysis(null);
    setIsAnalyzingLocation(true);

    try {
        const result = await queryLocationIntelligence(
            `ข้อมูลโลจิสติกส์และสภาพจราจรของ "${term}" ในเขตพื้นที่ชลบุรี/EEC หรือพื้นที่ใกล้เคียง`, 
            13.36, 
            100.98
        );
        setLocationAnalysis(result);
    } catch (e) {
        console.error(e);
        setLocationAnalysis({ text: "ไม่สามารถวิเคราะห์ข้อมูลได้", locations: [] });
    } finally {
        setIsAnalyzingLocation(false);
    }
  };

  // --- Simulation & Proximity Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      setFleet(prevFleet => {
        // 1. Calculate new positions
        const newFleet = prevFleet.map(v => {
          if (v.status === 'SAFE_ARRIVAL') return v;
          if (v.status !== 'MOVING' && v.status !== 'RISK_WARNING' && v.status !== 'REROUTED') return v;
          
          // Simulation for T-04 (Risk Scenario)
          if (v.id === 'T-04') {
            const isRerouted = reroutedVehicles.has(v.id);
            
            if (isRerouted) {
                // Reroute Logic: Move North-West (Safe bypass) to SAFE_HAVEN
                const safeLat = SAFE_HAVEN.lat; 
                const safeLng = SAFE_HAVEN.lng;
                const latDiff = safeLat - v.lat;
                const lngDiff = safeLng - v.lng;
                
                // If reached safety (Arrival Logic)
                if (Math.abs(latDiff) < 0.005 && Math.abs(lngDiff) < 0.005) {
                    return { ...v, status: 'SAFE_ARRIVAL' as const, speed: 0 };
                }

                return {
                 ...v,
                 lat: v.lat + (latDiff * 0.03),
                 lng: v.lng + (lngDiff * 0.03),
                 heading: 315, // Approx NW
                 status: 'REROUTED' as const
               };
            } else {
                // Original Route Logic: Move towards Accident (Z-03)
                const target = MOCK_RISK_ZONES.find(z => z.id === 'Z-03');
                if (target) {
                   const latDiff = target.lat - v.lat;
                   const lngDiff = target.lng - v.lng;
                   
                   // Stop if too close (Critical)
                   if (Math.abs(latDiff) < 0.003 && Math.abs(lngDiff) < 0.003) {
                       return { ...v, status: 'CRITICAL_STOP' as const, speed: 0 };
                   }
                   
                   // Move closer
                   return {
                     ...v,
                     lat: v.lat + (latDiff * 0.02),
                     lng: v.lng + (lngDiff * 0.02),
                     status: 'RISK_WARNING' as const,
                     speed: 60 // Slow down
                   };
                }
            }
          }
          return v;
        });

        // 2. Check Proximity
        let activeAlert = null;
        newFleet.forEach(v => {
          if (reroutedVehicles.has(v.id) || v.status === 'SAFE_ARRIVAL') return; // Ignore if handled or arrived

          MOCK_RISK_ZONES.forEach(z => {
            const dist = Math.sqrt(Math.pow(v.lat - z.lat, 2) + Math.pow(v.lng - z.lng, 2));
            // Alert radius ~0.04 degrees
            if (dist < 0.04 && (z.level === 'CRITICAL' || z.level === 'WARNING')) {
               activeAlert = { active: true, vehicleId: v.id, zoneId: z.id };
            }
          });
        });

        setAlertSystem(activeAlert);
        if (activeAlert) playAlertSound();

        return newFleet;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [playAlertSound, reroutedVehicles]);

  // Handle Arrival Events
  useEffect(() => {
    const arrivedVehicle = fleet.find(v => v.status === 'SAFE_ARRIVAL');
    if (arrivedVehicle) {
        // If it's still in the reroute set, we trigger the success event
        if (reroutedVehicles.has(arrivedVehicle.id)) {
            setReroutedVehicles(prev => {
                const next = new Set(prev);
                next.delete(arrivedVehicle.id);
                return next;
            });
            setArrivalNotification(arrivedVehicle.plate);
            playSuccessSound();

            // Clear notification after 5 seconds and reset vehicle state if needed
            setTimeout(() => {
                setArrivalNotification(null);
                // Optionally reset vehicle to IDLE or Keep as ARRIVED
            }, 6000);
        }
    }
  }, [fleet, reroutedVehicles, playSuccessSound]);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherInfo({
        temp: "32°C",
        condition: "CLOUDY",
        precipitation_mm: "10 mm",
        wind_speed: "15 km/h",
        risk_level: "LOW",
        advice: "สภาพอากาศปกติ ขับขี่ปลอดภัย"
      });
      try {
        const data = await getWeatherInsight(13.36, 100.98);
        if(data) setWeatherInfo(data);
      } catch (e) { console.log(e) }
    };
    fetchWeather();
  }, []);

  // --- Helpers for Thai Localization ---
  const getStatusInThai = (status: string) => {
    switch (status) {
      case 'MOVING': return 'กำลังวิ่ง (ปกติ)';
      case 'IDLE': return 'จอดพัก';
      case 'RISK_WARNING': return 'เฝ้าระวังความเสี่ยง';
      case 'CRITICAL_STOP': return 'หยุดฉุกเฉิน';
      case 'REROUTED': return 'เปลี่ยนเส้นทาง';
      case 'SAFE_ARRIVAL': return 'ถึงจุดปลอดภัย';
      default: return status;
    }
  };

  const getRiskLevelInThai = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'วิกฤต (สีแดง)';
      case 'MODERATE': return 'ปานกลาง (สีส้ม)';
      case 'WARNING': return 'เฝ้าระวัง (สีเหลือง)';
      case 'LOW': return 'ต่ำ (สีเขียว)';
      default: return level;
    }
  };

  // --- Coordinate Helpers ---
  const getPos = (lat: number, lng: number) => {
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    return { top: Math.max(0, Math.min(100, y)), left: Math.max(0, Math.min(100, x)) };
  };

  // --- Clustering Logic ---
  const visibleFleet = useMemo(() => {
    if (zoom > 1.8) {
        return fleet.map(v => ({ type: 'single', data: v }));
    }
    const clusters: any[] = [];
    const processed = new Set<string>();
    const threshold = 5; 

    fleet.forEach((v, i) => {
        if (processed.has(v.id)) return;
        const posV = getPos(v.lat, v.lng);
        const clusterGroup = [v];
        processed.add(v.id);
        fleet.forEach((other, j) => {
            if (i === j || processed.has(other.id)) return;
            const posOther = getPos(other.lat, other.lng);
            const dist = Math.sqrt(Math.pow(posV.left - posOther.left, 2) + Math.pow(posV.top - posOther.top, 2));
            if (dist < threshold) {
                clusterGroup.push(other);
                processed.add(other.id);
            }
        });
        if (clusterGroup.length > 1) {
            clusters.push({ type: 'cluster', data: clusterGroup, pos: posV });
        } else {
            clusters.push({ type: 'single', data: v });
        }
    });
    return clusters;
  }, [fleet, zoom]);

  // --- Search ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length > 2) {
      searchTimeout.current = setTimeout(async () => {
        const results = await getAutocompleteSuggestions(val, 13.36, 100.98);
        setSuggestions(results);
        setShowSuggestions(true);
      }, 600);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.length > 1) {
        handleSearchAnalysis(query);
    }
  };

  // --- Zoom & Pan ---
  const handleZoom = (dir: 'in' | 'out') => {
    setZoom(prev => Math.min(4, Math.max(1, dir === 'in' ? prev + 0.4 : prev - 0.4)));
  };

  const handleResetView = () => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    lastPan.current = { x: 0, y: 0 };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastPan.current = { ...pan };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: lastPan.current.x + dx,
      y: lastPan.current.y + dy
    });
  };

  const onMouseUp = () => { setIsDragging(false); };
  const onMouseLeave = () => { setIsDragging(false); };
  const handleItemClick = (e: React.MouseEvent, callback: () => void) => { e.stopPropagation(); callback(); };

  const WeatherIcon = ({ condition }: { condition: string }) => {
    switch (condition) {
      case 'CLEAR': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'RAIN': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'STORM': return <CloudLightning className="w-5 h-5 text-purple-400" />;
      case 'FOG': return <Wind className="w-5 h-5 text-slate-400" />;
      default: return <Cloud className="w-5 h-5 text-slate-300" />;
    }
  };

  // --- Visual Renderers ---

  const renderProjectedRoutes = () => {
    // 1. Draw Safe Reroutes (Green)
    const rerouteVisuals = Array.from(reroutedVehicles).map(vid => {
        const v = fleet.find(veh => veh.id === vid);
        if(!v) return null;
        const vPos = getPos(v.lat, v.lng);
        // Project path to SAFE_HAVEN
        const safePos = getPos(SAFE_HAVEN.lat, SAFE_HAVEN.lng); 
        return (
             <g key={`reroute-${vid}`}>
                <line 
                    x1={`${vPos.left}%`} y1={`${vPos.top}%`} 
                    x2={`${safePos.left}%`} y2={`${safePos.top}%`} 
                    stroke="#10b981" strokeWidth="3" strokeDasharray="6,4"
                    className="animate-[dash_1s_linear_infinite]"
                />
                <circle cx={`${safePos.left}%`} cy={`${safePos.top}%`} r="3" fill="#10b981" className="animate-ping" />
             </g>
        );
    });

    // 2. Draw Risk Trajectories (Red/Warning) - Specifically for T-04
    const riskVisuals = fleet.filter(v => v.id === 'T-04' && !reroutedVehicles.has(v.id) && v.status !== 'SAFE_ARRIVAL').map(v => {
        const targetZone = MOCK_RISK_ZONES.find(z => z.id === 'Z-03');
        if (!targetZone) return null;
        
        const vPos = getPos(v.lat, v.lng);
        const zPos = getPos(targetZone.lat, targetZone.lng);
        
        const isAlerting = alertSystem?.vehicleId === v.id;
        const strokeColor = isAlerting ? "#ef4444" : "#f59e0b"; // Red if alert, Orange if approaching
        const strokeWidth = isAlerting ? "3" : "2";
        const animation = isAlerting ? "animate-pulse" : "";

        return (
            <g key={`risk-${v.id}`}>
                {/* Path Line */}
                <line 
                    x1={`${vPos.left}%`} y1={`${vPos.top}%`} 
                    x2={`${zPos.left}%`} y2={`${zPos.top}%`} 
                    stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="5,5"
                    className={animation}
                    opacity={isAlerting ? "1" : "0.7"}
                />
                {/* Destination Marker (Danger) */}
                {!isAlerting && (
                    <circle cx={`${zPos.left}%`} cy={`${zPos.top}%`} r="2" fill={strokeColor} opacity="0.5" />
                )}
            </g>
        );
    });

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
         <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
            </marker>
         </defs>
         {riskVisuals}
         {rerouteVisuals}
      </svg>
    );
  };

  const renderVehicleMarker = (truck: FleetVehicle) => {
    const pos = getPos(truck.lat, truck.lng);
    const isAlertSource = alertSystem?.vehicleId === truck.id;
    const isRerouted = truck.status === 'REROUTED';
    const isArrived = truck.status === 'SAFE_ARRIVAL';
    const isSelected = selectedVehicle?.id === truck.id;

    let Icon = Navigation2;
    let baseColor = "bg-cyan-500";
    let ringColor = "border-cyan-200";
    let shadowColor = "shadow-cyan-500/50";
    let iconRotate = truck.heading;
    
    if (truck.status === 'IDLE') {
        Icon = Circle; baseColor = "bg-slate-500"; ringColor = "border-slate-300"; shadowColor = "shadow-slate-500/50"; iconRotate = 0;
    } else if (truck.status === 'RISK_WARNING') {
        Icon = AlertTriangle; baseColor = "bg-orange-500"; ringColor = "border-orange-200"; shadowColor = "shadow-orange-500/50"; iconRotate = 0;
    } else if (truck.status === 'CRITICAL_STOP') {
        Icon = Octagon; baseColor = "bg-red-600"; ringColor = "border-red-200"; shadowColor = "shadow-red-600/50"; iconRotate = 0;
    } else if (isRerouted) {
        Icon = CornerUpRight; baseColor = "bg-emerald-500"; ringColor = "border-emerald-200"; shadowColor = "shadow-emerald-500/50"; iconRotate = 0;
    } else if (isArrived) {
        Icon = Flag; baseColor = "bg-green-600"; ringColor = "border-green-300"; shadowColor = "shadow-green-500/80"; iconRotate = 0;
    }

    if (isAlertSource) {
        baseColor = "bg-red-600"; ringColor = "border-white"; shadowColor = "shadow-red-500/80";
    }

    return (
        <div key={truck.id} 
             className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group/marker"
             style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
             onMouseDown={(e) => e.stopPropagation()} 
             onClick={(e) => handleItemClick(e, () => { setSelectedVehicle(truck); setSelectedZone(null); setSelectedStaticLocation(null); })}
        >
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-slate-900/95 text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap border border-slate-700 shadow-2xl flex flex-col items-center gap-0.5">
                   <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${baseColor}`}></span>
                      <span className="font-bold font-mono text-cyan-400">{truck.plate}</span>
                   </div>
                   <div className="text-slate-400 text-[9px]">{getStatusInThai(truck.status)} • {truck.speed} กม./ชม.</div>
                </div>
                <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
             </div>
             <div className={`relative transition-transform duration-300 ${isSelected ? 'scale-125' : 'group-hover/marker:scale-110'}`}>
                 {(truck.status === 'MOVING' || truck.status === 'RISK_WARNING' || isAlertSource || isRerouted) && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${baseColor}`}></div>
                 )}
                 <div className={`w-8 h-8 rounded-full border-2 ${ringColor} shadow-lg ${shadowColor} flex items-center justify-center transition-all ${baseColor}`}>
                     <Icon size={14} fill="currentColor" color="white" style={{ transform: `rotate(${iconRotate}deg)` }} />
                 </div>
                 {isAlertSource && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-bounce shadow-sm"></div>}
                 {isArrived && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-green-600 animate-pulse shadow-sm flex items-center justify-center"><CheckCircle size={8} className="text-green-600"/></div>}
             </div>
        </div>
    );
  };

  const renderClusterMarker = (item: any, idx: number) => {
      const vehicles = item.data as FleetVehicle[];
      const count = vehicles.length;
      const isRiskInside = vehicles.some(v => v.status === 'RISK_WARNING' || v.status === 'CRITICAL_STOP');
      const pos = item.pos;
      return (
        <div key={`cluster-${idx}`} 
             className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer group/cluster"
             style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
             onClick={(e) => { e.stopPropagation(); setZoom(zoom + 1); setPan({x:0, y:0}); }}
             onMouseDown={(e) => e.stopPropagation()} 
        >
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/cluster:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-slate-900/95 text-white text-[10px] py-1 px-2 rounded border border-slate-700 shadow-xl">{count} คัน</div>
             </div>
            <div className={`relative transition-transform duration-300 group-hover/cluster:scale-110`}>
                <div className={`absolute top-0 left-0 w-full h-full rounded-full ${isRiskInside ? 'bg-orange-600' : 'bg-slate-600'} transform -translate-y-1 scale-90 opacity-60`}></div>
                <div className={`w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-bold text-sm ${isRiskInside ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-700 text-white'}`}>{count}</div>
            </div>
        </div>
      );
  };

  const handleNavigate = (lat: number, lng: number) => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="relative w-full h-[700px] bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl font-sans group/map text-slate-200 border border-slate-800 select-none">
        
        {/* --- 1. BACKGROUND MAP LAYER --- */}
        <div 
          className={`absolute inset-0 w-full h-full bg-[#242f3e] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
        >
             <div 
                className="w-full h-full relative transition-transform duration-100 ease-linear"
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
             >
                <div className="absolute inset-0 bg-[#242f3e]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,0 L40,0 C35,20 30,40 45,50 C50,55 45,70 40,80 L35,100 L0,100 Z" fill="#17263c" />
                    <path d="M40,10 L90,15 M45,20 L95,25 M40,30 L85,35 M50,40 L90,45 M45,60 L85,65" stroke="#38414e" strokeWidth="0.2" fill="none" />
                    <path d="M40,0 L95,100" stroke="#d59563" strokeWidth="1.2" fill="none" opacity="0.8" />
                    <path d="M40,0 L95,100" stroke="#f59e0b" strokeWidth="0.4" fill="none" />
                    <path d="M45,0 C40,20 35,40 50,50 C55,55 50,70 45,80 L40,100" stroke="#eab308" strokeWidth="0.3" fill="none" />
                    <path d="M70,0 L85,100" stroke="#746855" strokeWidth="0.8" fill="none" />
                </svg>

                {renderProjectedRoutes()}

                {/* Locations */}
                {LOCATIONS.map((loc, i) => {
                  const pos = getPos(loc.lat, loc.lng);
                  const isSelected = selectedStaticLocation?.name === loc.name;
                  return (
                    <div 
                      key={i} 
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10 hover:z-20 transition-all ${isSelected ? 'scale-125' : 'hover:scale-110'}`} 
                      style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                      onClick={(e) => handleLocationClick(e, loc)}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className={`p-1.5 rounded-full shadow-lg border border-white/20 mb-1 ${isSelected ? 'bg-cyan-500 text-white animate-bounce' : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                        {loc.type === 'PORT' ? <Anchor size={14} /> : loc.type === 'FACTORY' ? <Building2 size={14} /> : <Map size={14} />}
                      </div>
                      <div className={`text-[10px] font-medium drop-shadow-md whitespace-nowrap px-2 py-0.5 rounded-full border backdrop-blur-sm transition-colors ${isSelected ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-[#242f3e]/80 text-[#9ca3af] border-white/5 group-hover:text-white group-hover:bg-slate-900'}`}>
                        {loc.name}
                      </div>
                    </div>
                  );
                })}
                
                {/* Safe Zone Marker (When active) */}
                {(reroutedVehicles.size > 0 || arrivalNotification) && (
                  <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-fade-in-up"
                       style={{ top: `${getPos(SAFE_HAVEN.lat, SAFE_HAVEN.lng).top}%`, left: `${getPos(SAFE_HAVEN.lat, SAFE_HAVEN.lng).left}%` }}>
                      <div className="text-emerald-500 animate-bounce drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                         <ShieldCheck size={28} fill="currentColor" className="text-emerald-900"/>
                      </div>
                      <div className="text-[10px] bg-emerald-900/90 text-emerald-400 px-2 py-0.5 rounded mt-1 whitespace-nowrap border border-emerald-500/30 font-bold shadow-lg">
                         {SAFE_HAVEN.name}
                      </div>
                  </div>
                )}

                {/* Risk Zones */}
                {activeLayers.risk && MOCK_RISK_ZONES.map((zone) => {
                   const pos = getPos(zone.lat, zone.lng);
                   const isCrit = zone.level === 'CRITICAL';
                   const colors = isCrit ? 'bg-red-500 text-red-500' : zone.level === 'WARNING' ? 'bg-orange-500 text-orange-500' : 'bg-yellow-500 text-yellow-500';
                   const pulseColor = isCrit ? 'bg-red-500' : 'bg-orange-500';
                   return (
                     <div key={zone.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/zone" 
                        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleItemClick(e, () => { setSelectedZone(zone); setSelectedVehicle(null); setSelectedStaticLocation(null); })}
                     >
                        {/* Zone Radius */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border ${isCrit ? 'border-red-500/30 bg-red-900/10' : 'border-orange-500/20 bg-orange-900/5'} pointer-events-none`}></div>
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/zone:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                             <div className="bg-slate-900/90 text-white text-[10px] py-1 px-2 rounded border border-slate-700 flex items-center gap-2">
                                <AlertTriangle size={10} className={colors.split(' ')[1]} />
                                <span>{zone.value}</span>
                             </div>
                        </div>

                        <div className={`absolute inset-0 ${pulseColor} opacity-40 rounded-full animate-ping w-full h-full`}></div>
                        <div className={`relative w-6 h-6 ${colors.split(' ')[0]} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white transform transition-transform group-hover/zone:scale-125`}>
                           <AlertTriangle size={12} fill="currentColor" />
                        </div>
                     </div>
                   );
                })}

                {activeLayers.fleet && visibleFleet.map((item, idx) => {
                    if (item.type === 'cluster') return renderClusterMarker(item, idx);
                    return renderVehicleMarker(item.data);
                })}
             </div>
        </div>

        {/* --- 2. FLOATING UI CONTROLS --- */}

        <div className="absolute top-4 left-4 z-40 w-full max-w-xs sm:max-w-sm">
             <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none"><Search className="w-4 h-4" /></div>
                <input 
                  type="text" 
                  value={query} 
                  onChange={handleInputChange} 
                  onKeyDown={handleKeyPress}
                  placeholder="ค้นหาสถานที่เพื่อวิเคราะห์ข้อมูลเชิงลึก..."
                  className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-slate-900 shadow-lg transition-all placeholder:text-slate-500"
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
                    {suggestions.map((s, i) => (
                      <div key={i} className="px-4 py-2 text-sm hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-2" onClick={() => handleSearchAnalysis(s)}>
                        <Sparkles className="w-3 h-3 text-cyan-400"/> <span className="text-slate-300">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>

        <div className="absolute top-4 right-4 z-40">
            {activeLayers.weather && weatherInfo && (
                <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2 shadow-lg hover:bg-slate-900 transition-colors cursor-default">
                    <WeatherIcon condition={weatherInfo.condition} />
                    <div className="text-right">
                        <div className="text-lg font-bold text-white leading-none">{weatherInfo.temp}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{getRiskLevelInThai(weatherInfo.risk_level)}</div>
                    </div>
                </div>
            )}
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-40 flex items-end justify-between pointer-events-none">
             <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 pointer-events-auto">
                <button onClick={() => setActiveLayers(p => ({...p, fleet: !p.fleet}))} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${activeLayers.fleet ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:bg-white/5'}`} title="แสดง/ซ่อน รถ"><Truck className="w-5 h-5" /></button>
                <button onClick={() => setActiveLayers(p => ({...p, risk: !p.risk}))} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${activeLayers.risk ? 'bg-orange-500/20 text-orange-400' : 'text-slate-500 hover:bg-white/5'}`} title="แสดง/ซ่อน จุดเสี่ยง"><AlertTriangle className="w-5 h-5" /></button>
                <div className="w-px h-5 bg-slate-700 mx-1"></div>
                <button onClick={() => setAudioEnabled(!audioEnabled)} className={`p-2 rounded-xl transition-all ${audioEnabled ? 'text-white bg-slate-700' : 'text-slate-500 hover:text-white'}`} title={audioEnabled ? "ปิดเสียง" : "เปิดเสียง"}>{audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
             </div>

             <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 pointer-events-auto">
               <button onClick={() => handleZoom('out')} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><ZoomOut className="w-5 h-5" /></button>
               <button onClick={handleResetView} className="px-3 py-1 text-xs font-mono text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-slate-600">{Math.round(zoom * 100)}%</button>
               <button onClick={() => handleZoom('in')} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><ZoomIn className="w-5 h-5" /></button>
            </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-20 left-4 z-30 pointer-events-none hidden md:block">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-lg">
               <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">สัญลักษณ์แผนที่</div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]"></div><span className="text-xs text-slate-300">รถปฏิบัติงาน (Active)</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div><span className="text-xs text-slate-300">จอดพัก (Idle)</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]"></div><span className="text-xs text-slate-300">พื้นที่เฝ้าระวัง</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]"></div><span className="text-xs text-slate-300">จุดวิกฤต/หยุดเดินรถ</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div><span className="text-xs text-slate-300">เปลี่ยนเส้นทางแล้ว (Safe)</span></div>
               </div>
            </div>
        </div>

        {/* HUD Alerts with Reroute Action */}
        {alertSystem && (
           <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-950/90 backdrop-blur-xl border border-red-500/50 rounded-2xl p-4 shadow-[0_0_50px_rgba(220,38,38,0.4)] z-50 flex flex-col sm:flex-row items-center gap-4 max-w-lg animate-fade-in-up w-[90%] pointer-events-auto">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="bg-red-600 p-3 rounded-full text-white shadow-lg animate-pulse shrink-0"><Siren className="w-6 h-6" /></div>
                  <div className="flex-grow min-w-0">
                     <h4 className="text-red-400 font-bold uppercase text-xs tracking-wider mb-1 flex justify-between">
                        <span>แจ้งเตือนความเสี่ยงระดับสูง</span>
                        <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded animate-pulse font-bold">สด (LIVE)</span>
                     </h4>
                     <p className="text-white font-bold text-sm leading-tight">
                        รถทะเบียน <span className="text-red-200 font-mono text-lg">{fleet.find(v => v.id === alertSystem.vehicleId)?.plate}</span> กำลังมุ่งหน้าเข้าสู่จุดเกิดอุบัติเหตุ!
                     </p>
                  </div>
              </div>
              
              <div className="w-full h-px bg-red-500/30 sm:hidden"></div>

              <button 
                  onClick={() => handleReroute(alertSystem.vehicleId)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-105 whitespace-nowrap"
              >
                  <ShieldCheck className="w-4 h-4" />
                  เปลี่ยนเส้นทาง (Reroute)
              </button>
           </div>
        )}

        {/* Success Feedback for Rerouting */}
        {!alertSystem && reroutedVehicles.size > 0 && Array.from(reroutedVehicles).map(vid => {
            const v = fleet.find(veh => veh.id === vid);
            if (!v || v.status === 'SAFE_ARRIVAL') return null; // Don't show this if arrived
            return (
               <div key={vid} className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-emerald-950/90 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-2xl z-40 animate-fade-in-up min-w-[320px]">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400"><CheckCircle size={20} /></div>
                      <div>
                          <div className="text-emerald-400 font-bold text-sm">เปลี่ยนเส้นทางสำเร็จ (Rerouted)</div>
                          <div className="text-white text-xs opacity-70">AI ได้กำหนดเส้นทางปลอดภัยใหม่แล้ว</div>
                      </div>
                   </div>
                   
                   {/* Next Steps (Sequence) */}
                   <div className="bg-black/30 rounded-lg p-3 space-y-2 border border-emerald-500/10">
                      <div className="flex items-center gap-2 text-xs text-emerald-300/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                          <span>คำนวณเส้นทางใหม่...</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-300/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                          <span>หลีกเลี่ยง: มอเตอร์เวย์ กม.85</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                          <span>มุ่งหน้า: {SAFE_HAVEN.name}</span>
                      </div>
                   </div>
               </div>
            );
        })}

        {/* SAFE ARRIVAL NOTIFICATION (Mission Complete) */}
        {arrivalNotification && (
           <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-1 shadow-2xl z-50 animate-fade-in-up">
              <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-4">
                 <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-900/30 shrink-0">
                    <Flag className="w-6 h-6 fill-current" />
                 </div>
                 <div className="min-w-[200px]">
                     <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-0.5">ภารกิจสำเร็จ (MISSION COMPLETE)</h3>
                     <div className="text-white font-bold text-lg">ถึงจุดปลอดภัยแล้ว</div>
                     <div className="text-slate-400 text-xs">รถทะเบียน <span className="text-white font-mono">{arrivalNotification}</span> จอดพักเรียบร้อย</div>
                 </div>
              </div>
           </div>
        )}

        {/* Detail Card (Vehicles, Zones, or Static Locations) */}
        {(selectedVehicle || selectedZone || selectedStaticLocation) && !alertSystem && !arrivalNotification && (
            <div className="absolute bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-24 sm:w-96 max-h-[60vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-5 shadow-2xl z-50 animate-fade-in-up pointer-events-auto">
                <button onClick={() => { setSelectedVehicle(null); setSelectedZone(null); setSelectedStaticLocation(null); setLocationAnalysis(null); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-slate-400 transition-colors"><X size={16} /></button>
                
                {selectedVehicle ? (
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${selectedVehicle.status === 'MOVING' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : selectedVehicle.status === 'REROUTED' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : selectedVehicle.status === 'SAFE_ARRIVAL' ? 'bg-gradient-to-br from-green-600 to-lime-600' : 'bg-slate-700'}`}>
                            {selectedVehicle.status === 'SAFE_ARRIVAL' ? <Flag size={24} /> : <Truck size={24} />}
                         </div>
                         <div>
                            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-0.5">หมายเลขรถ: {selectedVehicle.id}</div>
                            <h3 className="text-xl font-bold text-white leading-none mb-1">{selectedVehicle.plate}</h3>
                            <div className="text-xs text-slate-400 flex items-center gap-1"><MousePointer2 size={10}/> {selectedVehicle.driver}</div>
                         </div>
                      </div>
                      
                      <div className="h-px bg-slate-700/50 w-full"></div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                         <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                            <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold">สถานะ</span>
                            <span className={`font-bold ${selectedVehicle.status === 'MOVING' ? 'text-cyan-400' : selectedVehicle.status === 'REROUTED' ? 'text-emerald-400' : selectedVehicle.status === 'SAFE_ARRIVAL' ? 'text-green-400' : 'text-white'}`}>{getStatusInThai(selectedVehicle.status)}</span>
                         </div>
                         <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                            <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold">ความเร็ว</span>
                            <span className="text-white font-bold font-mono">{selectedVehicle.speed} กม./ชม.</span>
                         </div>
                         <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 col-span-2">
                            <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold">ปลายทาง</span>
                            <span className="text-white font-medium truncate">{selectedVehicle.destination}</span>
                         </div>
                      </div>

                      <button 
                         onClick={() => handleNavigate(selectedVehicle.lat, selectedVehicle.lng)}
                         className="w-full py-2 bg-slate-800 hover:bg-cyan-900/30 text-cyan-400 border border-slate-700 hover:border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                         <Navigation size={14} /> นำทางไปที่รถ (Google Maps)
                      </button>
                      
                      {selectedVehicle.status === 'RISK_WARNING' && !reroutedVehicles.has(selectedVehicle.id) && (
                          <button onClick={() => handleReroute(selectedVehicle.id)} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-900/20 animate-pulse">
                             ⚠️ เปลี่ยนเส้นทางฉุกเฉิน (Emergency)
                          </button>
                      )}
                   </div>
                ) : selectedZone ? (
                   <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${selectedZone.level === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                             <div className={`text-[10px] font-bold uppercase tracking-wider ${selectedZone.level === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>{getRiskLevelInThai(selectedZone.level)}</div>
                             <h3 className="text-lg font-bold text-white leading-tight">{selectedZone.value}</h3>
                          </div>
                       </div>
                       <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><MapPin size={12} /> {selectedZone.locationName}</div>
                          <p className="text-sm text-slate-200 leading-relaxed">{selectedZone.desc}</p>
                       </div>
                       <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 flex gap-3">
                          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-200">{selectedZone.advice}</p>
                       </div>
                       <button 
                         onClick={() => handleNavigate(selectedZone.lat, selectedZone.lng)}
                         className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-1"
                      >
                         <Navigation size={14} /> ดูเส้นทางเลี่ยง
                      </button>
                   </div>
                ) : selectedStaticLocation ? (
                   // --- STATIC LOCATION INTELLIGENCE PANEL ---
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                            {selectedStaticLocation.type === 'PORT' ? <Anchor size={24} /> : selectedStaticLocation.type === 'FACTORY' ? <Building2 size={24} /> : selectedStaticLocation.type === 'SEARCH_RESULT' ? <Sparkles size={24} /> : <Map size={24} />}
                         </div>
                         <div>
                            <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-0.5">Location Intelligence</div>
                            <h3 className="text-lg font-bold text-white leading-tight">{selectedStaticLocation.name}</h3>
                         </div>
                      </div>
                      
                      {isAnalyzingLocation ? (
                         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center gap-3">
                             <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                             <div className="text-sm text-slate-300">กำลังวิเคราะห์ข้อมูลโลจิสติกส์...</div>
                             <div className="text-xs text-slate-500">Connecting to Gemini Maps Grounding</div>
                         </div>
                      ) : locationAnalysis ? (
                         <div className="animate-fade-in space-y-4">
                             {/* Analysis Text */}
                             <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                 {locationAnalysis.text}
                             </div>

                             {/* Grounding Links */}
                             {locationAnalysis.locations && locationAnalysis.locations.length > 0 && (
                                <div className="space-y-2">
                                   <div className="text-[10px] text-slate-500 uppercase font-bold">สถานที่ที่เกี่ยวข้อง (Google Maps)</div>
                                   <div className="flex flex-col gap-2">
                                      {locationAnalysis.locations.map((loc, idx) => (
                                         <a 
                                           key={idx} 
                                           href={loc.uri} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-2 rounded-lg transition-colors group"
                                         >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                               <MapPin size={12} className="text-red-400 shrink-0" />
                                               <span className="text-xs text-slate-300 truncate">{loc.title}</span>
                                            </div>
                                            <ExternalLink size={12} className="text-slate-500 group-hover:text-cyan-400" />
                                         </a>
                                      ))}
                                   </div>
                                </div>
                             )}

                             <button 
                                onClick={() => handleNavigate(selectedStaticLocation.lat, selectedStaticLocation.lng)}
                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                             >
                                <Navigation size={14} /> เริ่มนำทาง (Start Navigation)
                             </button>
                         </div>
                      ) : (
                         <div className="text-center py-4 text-slate-500 text-xs">
                            ไม่พบข้อมูล
                         </div>
                      )}
                   </div>
                ) : null}
            </div>
        )}
    </div>
  );
};
