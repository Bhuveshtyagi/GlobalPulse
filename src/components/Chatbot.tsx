"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let botContent = "";
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Append raw text chunk directly from streamTextResponse
        const chunk = decoder.decode(value, { stream: true });
        botContent += chunk;
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = botContent;
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-accent text-white rounded-full shadow-2xl hover:scale-105 transition-transform"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] h-[550px] bg-bone dark:bg-ink rounded-2xl shadow-2xl border border-ink/10 dark:border-bone/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-ink/10 dark:border-bone/10 flex items-center justify-between bg-ink/5 dark:bg-bone/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink dark:text-bone">Pulse AI</h3>
                  <p className="font-mono text-[8px] tracking-widest uppercase text-accent">Intelligence Node Active</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-ink/60 dark:text-bone/60 hover:text-ink dark:hover:text-bone">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                  <MessageSquare size={32} />
                  <p className="font-sans text-sm">Ask me about current geopolitics, market trends, or request a brief on world events.</p>
                </div>
              )}
              {messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 flex gap-3 ${m.role === 'user' ? 'bg-ink dark:bg-bone text-bone dark:text-ink rounded-tr-sm' : 'bg-ink/5 dark:bg-bone/5 text-ink dark:text-bone rounded-tl-sm'}`}>
                    {m.role !== 'user' && <Bot size={16} className="mt-1 flex-shrink-0 opacity-60" />}
                    <div className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-ink/5 dark:bg-bone/5 text-ink dark:text-bone rounded-tl-sm flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-accent" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-accent">Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-ink/10 dark:border-bone/10 bg-bone dark:bg-ink">
              <form onSubmit={onSubmitForm} className="relative flex items-center">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Query intelligence node..."
                  className="w-full bg-ink/5 dark:bg-bone/5 border border-ink/10 dark:border-bone/10 rounded-full pl-5 pr-12 py-3 font-sans text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-ink dark:text-bone"
                />
                <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-2 p-2 bg-accent text-white rounded-full disabled:opacity-50 hover:scale-105 transition-transform">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
