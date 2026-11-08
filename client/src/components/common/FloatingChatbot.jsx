import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../../services/chatService';
import { SUPPORTED_LANGUAGES } from '../../i18n';

// Speech recognition locale code mappings
const SPEECH_LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN'
};

export default function FloatingChatbot() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || user?.preferredLanguage || 'en');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceResponseActive, setIsVoiceResponseActive] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initial welcome greeting
  const getGreeting = () => {
    const farmerName = user?.name ? ` ${user.name}` : '';
    return `Namaste${farmerName}! How can I help you with your farming today?`;
  };

  // Sync selected language when i18n changes
  useEffect(() => {
    if (i18n.language && i18n.language !== selectedLanguage) {
      setSelectedLanguage(i18n.language);
    }
  }, [i18n.language]);

  // Load chat on mount
  useEffect(() => {
    async function loadRecentHistory() {
      try {
        const res = await getChatHistory(10);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.reverse().flatMap((item) => [
            {
              id: `${item._id || item.id}_user`,
              sender: 'user',
              text: item.message,
              timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: `${item._id || item.id}_bot`,
              sender: 'bot',
              text: item.response,
              category: item.category,
              timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setMessages(formatted);
          return;
        }
      } catch {
        // Fallback
      }

      setMessages([
        {
          id: 'initial_welcome',
          sender: 'bot',
          text: getGreeting(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    loadRecentHistory();
  }, [user?.name]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [selectedLanguage]);

  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';
          recognitionRef.current.start();
        }
      } catch {
        recognitionRef.current?.stop();
      }
    }
  };

  const handleSpeakText = (text, messageId) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === messageId && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentlySpeakingId(messageId);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query || loading) return;

    if (isListening) recognitionRef.current?.stop();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }

    const userMsgId = `user_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await sendChatMessage({
        message: query,
        language: selectedLanguage,
        isVoice: isListening
      });

      if (res.success && res.data) {
        const botMsgId = `bot_${Date.now()}`;
        const botMsg = {
          id: botMsgId,
          sender: 'bot',
          text: res.data.response,
          category: res.data.category,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMsg]);

        if (isVoiceResponseActive) {
          handleSpeakText(res.data.response, botMsgId);
        }
      }
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'bot',
        text: `Sorry: ${err.message || 'Service temporarily unavailable.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear your conversation?')) {
      try {
        await clearChatHistory();
        setMessages([
          {
            id: `welcome_${Date.now()}`,
            sender: 'bot',
            text: getGreeting(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err) {
        console.warn('Failed to clear:', err);
      }
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#123D2A] hover:bg-[#1D5939] text-white shadow-xl shadow-[#123D2A]/30 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white focus:outline-none"
        title="Ask Agriculture Advisor"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-[#B6D957]" />
        )}
      </button>

      {/* Floating Chat Modal Panel matching dark theme */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[370px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[80vh] bg-[#060A07] rounded-3xl shadow-2xl border border-[#1F2937] flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-3 text-white">
          
          {/* Header */}
          <div className="p-4 bg-[#0A0D0B] text-white flex items-center justify-between shrink-0 border-b border-[#1F2937]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#052e16] border border-[#15803d]/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#00D26A]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight text-[#00D26A]">
                  AI Farming Assistant
                </h3>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Your multilingual agricultural companion
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Speech Output Toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceResponseActive(!isVoiceResponseActive)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isVoiceResponseActive ? 'bg-[#052e16] border border-[#15803d] text-[#22c55e]' : 'text-slate-400 hover:text-white'
                }`}
                title={isVoiceResponseActive ? 'Speech output ON' : 'Speech output OFF'}
              >
                {isVoiceResponseActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#060A07] text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                      <Bot className="w-3.5 h-3.5 text-[#00D26A]" />
                      <span>AI Agriculture Advisor</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#008744] text-white rounded-tr-none font-medium'
                        : 'bg-[#0B130E] text-slate-100 border border-[#1F2937] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs">{msg.text}</p>
                    
                    {!isUser && (
                      <div className="mt-2 pt-1 border-t border-[#1F2937]/60 flex items-center justify-between text-[10px] text-slate-400">
                        {msg.category && (
                          <span className="uppercase font-semibold text-[#00D26A]">
                            {msg.category}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text, msg.id)}
                          className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                          title="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-1.5 bg-[#0B130E] p-2.5 rounded-xl border border-[#1F2937] w-24">
                <div className="w-2 h-2 rounded-full bg-[#00D26A] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#00D26A] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#00D26A] animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (if few messages) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-[#1F2937] bg-[#0A0D0B] space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Try asking:
              </span>
              <div className="space-y-1">
                {[
                  'Which crop is suitable for black cotton soil?',
                  'How can I control pests organically?'
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setInputMessage(q);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl bg-black/40 border border-[#1F2937] hover:border-[#00D26A]/50 text-slate-300 text-[11px] truncate block transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-[#0A0D0B] border-t border-[#1F2937] space-y-1.5">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about crops, fertilizers, pests..."
                disabled={loading}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-[#1F2937] focus:border-[#00D26A] outline-none text-white placeholder-slate-500 transition"
              />

              {/* Microphone Voice Input */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/20 border border-rose-500 text-rose-400 animate-pulse'
                    : 'text-[#00D26A] hover:bg-white/5 border border-transparent'
                }`}
                title={isListening ? 'Listening... Speak now' : 'Speak your question'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2 rounded-full bg-[#008744] hover:bg-[#009E52] text-white font-bold text-xs disabled:opacity-40 transition cursor-pointer shadow-xs flex items-center gap-1"
                title="Send inquiry"
              >
                <span>Send</span>
                <span className="font-extrabold">↑</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Voice input available</span>
              <Link
                to="/ai-assistant"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 font-semibold text-[#00D26A] hover:underline"
              >
                <span>Full-Screen Assistant</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
