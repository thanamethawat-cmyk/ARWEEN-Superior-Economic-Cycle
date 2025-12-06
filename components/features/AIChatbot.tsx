import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, MinusCircle, Sparkles, Mic, Volume2, VolumeX, MicOff, MoreHorizontal } from 'lucide-react';
import { fastChat } from '../../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

// Global speech recognition definition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'bot', text: 'สวัสดีครับ ARWEEN Voice Assistant พร้อมดูแลคุณตลอดเส้นทางครับ (กดไมค์เพื่อสั่งงาน)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Suggested Actions for Driver
  const SUGGESTED_ACTIONS = [
    "สภาพจราจรตอนนี้",
    "จุดพักรถที่ใกล้ที่สุด",
    "อีกไกลไหมกว่าจะถึง",
    "รายงานอุบัติเหตุ",
    "สภาพอากาศปลายทาง"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop after one sentence
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'th-TH'; // Thai language

        recognitionRef.current.onstart = () => {
            setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            // Auto send after speech
            handleSend(transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    } else {
        console.warn("Speech Recognition API not supported in this browser");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
        // Cancel any ongoing speech first
        if (synthesisRef.current.speaking) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Mic start error", e);
        }
    } else if (!recognitionRef.current) {
        alert("ขออภัย เบราว์เซอร์ของคุณไม่รองรับคำสั่งเสียง");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !synthesisRef.current) return;
    
    // Clean text for cleaner speech (remove MD symbols)
    const cleanText = text.replace(/\*/g, '').replace(/#/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 1.1; // Slightly faster for efficiency
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Gemini API
      const response = await fastChat(textToSend.trim());
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
      
      // Auto-speak response
      if (voiceEnabled) {
        speakText(response);
      }
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: 'ขออภัย ระบบขัดข้องชั่วคราว โปรดลองใหม่' };
      setMessages(prev => [...prev, errorMsg]);
      speakText("ขออภัย ระบบขัดข้องชั่วคราว");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleVoice = () => {
      if (voiceEnabled) {
          synthesisRef.current.cancel();
          setIsSpeaking(false);
      }
      setVoiceEnabled(!voiceEnabled);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border border-white/10 ${
          isOpen 
            ? 'bg-slate-800 rotate-90 text-slate-400 hover:text-white' 
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/30'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            {isSpeaking ? (
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
            ) : null}
            <MessageSquare className="w-6 h-6 relative z-10" />
            {!isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border border-blue-600"></span>
                </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-[340px] sm:w-[380px] max-w-[calc(100vw-48px)] bg-slate-950/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-50 overflow-hidden ${
          isOpen 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10">
                {isSpeaking ? <Volume2 className="text-white w-6 h-6 animate-pulse" /> : <Bot className="text-white w-6 h-6" />}
             </div>
             <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  ARWEEN Assistant
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </h3>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                   <span className="text-[10px] text-slate-400">Gemini 2.5 Flash Lite</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-1 relative z-10">
              <button 
                onClick={toggleVoice} 
                className={`p-1.5 rounded-lg transition-colors ${voiceEnabled ? 'text-cyan-400 hover:bg-cyan-900/20' : 'text-slate-600 hover:bg-slate-800'}`}
                title={voiceEnabled ? "Mute TTS" : "Enable TTS"}
              >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex items-start gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-cyan-950/50 text-cyan-400 border-cyan-500/20'
                }`}>
                   {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-tr-none border border-slate-600' 
                    : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'
                }`}>
                   {msg.text}
                </div>
             </div>
           ))}
           
           {/* Typing Indicator */}
           {isLoading && (
              <div className="flex items-start gap-2 animate-fade-in">
                 <div className="w-8 h-8 rounded-full bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-800 flex gap-1 items-center h-10">
                    <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>
        
        {/* Suggested Actions Chips */}
        {!isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 animate-fade-in">
                {SUGGESTED_ACTIONS.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="text-xs bg-slate-800/80 hover:bg-cyan-900/40 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                    >
                        {action}
                    </button>
                ))}
            </div>
        )}

        {/* Dynamic Voice Status Bar */}
        {(isListening || isSpeaking) && (
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-2 relative overflow-hidden">
                {/* Visualizer Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none gap-1">
                   {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-1 bg-cyan-500 rounded-full animate-[music_1s_ease-in-out_infinite]`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                   ))}
                </div>

                {isListening && (
                    <div className="flex items-center gap-2 text-xs text-red-400 font-bold relative z-10 animate-pulse">
                        <Mic className="w-3.5 h-3.5" /> กำลังฟังเสียงของคุณ...
                    </div>
                )}
                {isSpeaking && !isListening && (
                    <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold relative z-10 animate-pulse">
                        <Volume2 className="w-3.5 h-3.5" /> ARWEEN กำลังพูด...
                    </div>
                )}
            </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-slate-950/50 border-t border-slate-800">
           <div className="relative flex items-center gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-xl transition-all shadow-lg shrink-0 ${
                    isListening 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 animate-pulse shadow-red-900/20' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-500'
                }`}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
              >
                 {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="relative flex-grow">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "พิมพ์ข้อความ..."}
                    disabled={isLoading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 shadow-inner disabled:opacity-50"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyan-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-cyan-500"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
           </div>
           
           {!isListening && (
                <div className="text-[10px] text-center text-slate-600 mt-2 font-mono flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                   Hands-Free System Ready
                </div>
           )}
        </div>
      </div>

      <style>{`
        @keyframes music {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
      `}</style>
    </>
  );
};