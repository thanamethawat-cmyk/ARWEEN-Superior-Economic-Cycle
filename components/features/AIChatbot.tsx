import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, MinusCircle, Sparkles } from 'lucide-react';
import { fastChat } from '../../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'bot', text: 'สวัสดีครับ ทีมงาน Operations ผมคือผู้ช่วย AI สำหรับผู้ดูแลระบบ มีอะไรให้ผมช่วยตรวจสอบวันนี้ครับ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Small delay to simulate thinking/network for better UX if response is too fast
      // await new Promise(resolve => setTimeout(resolve, 600)); 
      
      const response = await fastChat(userText);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: 'ขออภัย ระบบขัดข้องชั่วคราว ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Toggle Button (Floating Action Button) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border border-white/10 ${
          isOpen 
            ? 'bg-slate-800 rotate-90 text-slate-400 hover:text-white' 
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/30'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border border-blue-600"></span>
            </span>
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
          {/* Header Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10">
                <Bot className="text-white w-6 h-6" />
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
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-500 hover:text-white transition-colors relative z-10 p-1 hover:bg-white/5 rounded-lg"
          >
             <MinusCircle className="w-5 h-5" />
          </button>
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

        {/* Input Area */}
        <div className="p-3 bg-slate-950/50 border-t border-slate-800">
           <div className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="พิมพ์คำถามของคุณ..."
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 shadow-lg shadow-cyan-900/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
           <div className="text-[10px] text-center text-slate-600 mt-2 font-mono">
              ARWEEN AI • Powered by Gemini
           </div>
        </div>
      </div>
    </>
  );
};