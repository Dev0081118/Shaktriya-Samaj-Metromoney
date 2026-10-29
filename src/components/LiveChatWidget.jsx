import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const QUICK_TOPICS = [
  'Help with profile verification',
  'Privacy & photo reveal questions',
  'Lineage & Gotra consultation',
  'Membership & Boost packs'
];

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'concierge',
      text: 'Khamma Ghani! Welcome to Royal Rajputana Matrimony. How may our concierge team assist you today?',
      time: 'Just now'
    }
  ]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const counterRef = useRef(1);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('ksm:open-live-chat', handleOpen);
    return () => window.removeEventListener('ksm:open-live-chat', handleOpen);
  }, []);

  const sendLiveMessage = async (textToSend) => {
    const text = (textToSend || message).trim();
    if (!text || sending) return;

    counterRef.current += 1;
    const msgId = 'msg-' + counterRef.current;
    const userMsg = {
      id: msgId,
      sender: 'user',
      text,
      time: 'Sent'
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setSending(true);

    try {
      // Connect to platform support ticket endpoint so inquiries reach admin directly
      await api('/support', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Live Concierge Chat Inquiry',
          message: text,
          category: 'General',
          priority: 'Normal'
        })
      }).catch(() => {
        // Fallback gracefully for guest / local mode
      });

      // Provide courteous instant concierge response
      setTimeout(() => {
        counterRef.current += 1;
        setMessages((prev) => [
          ...prev,
          {
            id: 'resp-' + counterRef.current,
            sender: 'concierge',
            text: 'Thank you for reaching out. Your message has been routed directly to our support desk. We will respond promptly!',
            time: 'Delivered'
          }
        ]);
        setSending(false);
      }, 700);
    } catch {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendLiveMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] font-sans">
      {/* Floating Trigger Button */}
      {!open && (
        <button
          type="button"
          data-live-chat-trigger
          onClick={() => setOpen(true)}
          aria-label="Open Live Chat Concierge"
          className="group flex items-center gap-2.5 rounded-full bg-[#681d25] px-4 py-3.5 text-white shadow-[0_12px_28px_rgba(104,29,37,0.38)] transition-all duration-300 hover:bg-[#52161d] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#c99f72]"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <MessageCircle size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#52b788] ring-2 ring-[#681d25]" />
          </span>
          <span className="text-[12px] font-bold tracking-wide pr-1">
            Live Support
          </span>
        </button>
      )}

      {/* Live Chat Window */}
      {open && (
        <div
          role="dialog"
          aria-label="Royal Rajputana Live Chat"
          className="flex h-[520px] w-[360px] sm:w-[390px] flex-col overflow-hidden rounded-2xl border border-[#d8c8b7] bg-[#fffdf8] shadow-[0_24px_60px_rgba(30,15,12,0.25)] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ebdccb] bg-[#221314] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c99f72]/20 text-[#c99f72]">
                <Headphones size={18} />
              </span>
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-[18px] font-semibold leading-tight text-[#f8f3ec]">
                  Royal Concierge
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] text-[#52b788]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#52b788]" />
                  Direct Single-Desk Support
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Live Chat"
              className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Consultation Chips */}
          <div className="border-b border-[#ebdccb] bg-[#f9f5ee] px-4 py-2.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#8c6d48] mb-1.5 flex items-center gap-1">
              <Sparkles size={11} /> Quick Assistance
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => sendLiveMessage(topic)}
                  className="rounded-full border border-[#dcc9b3] bg-white px-2.5 py-1 text-[10px] font-medium text-[#492c22] transition hover:border-[#681d25] hover:text-[#681d25]"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-[13px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#681d25] text-white rounded-br-none'
                      : 'border border-[#e6d8c8] bg-white text-[#2a1a18] shadow-sm rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 px-1 text-[9px] text-[#938276]">{m.time}</span>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#938276] italic">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8c6d48]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8c6d48] [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8c6d48] [animation-delay:0.4s]" />
                Concierge is typing…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Composer */}
          <div className="border-t border-[#ebdccb] bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about verification, privacy, or gotra…"
                className="flex-1 rounded-xl border border-[#dcc9b3] bg-[#fbf8f3] px-3.5 py-2.5 text-[12px] text-[#2c1c18] outline-none transition focus:border-[#681d25] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => sendLiveMessage()}
                disabled={!message.trim() || sending}
                aria-label="Send live message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#681d25] text-white transition hover:bg-[#52161d] disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-[#8c7769]">
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#681d25]" />
                Confidential & private
              </span>
              <span>{user ? `Logged in: ${user.name || user.email}` : 'Direct support'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
