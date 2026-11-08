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
  const { user, isAuthenticated } = useAuth();
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
  const getGreeting = (lang) => {
    switch (lang) {
      case 'hi':
        return `नमस्ते ${user?.name || 'किसान भाई'}! मैं आपका कृषि सलाहकार बॉट हूँ। आप फसल, खाद, बीमारी या मौसम से संबंधित कोई भी सवाल पूछ सकते हैं।`;
      case 'te':
        return `నమస్కారం ${user?.name || 'రైతు మిత్రమా'}! నేను మీ అగ్రికల్చర్ అడ్వైజర్ బాట్‌ను. పంటలు, ఎరువులు, తెగుళ్ళు లేదా వాతావరణం గురించి ఏదైనా ప్రశ్న అడగండి.`;
      default:
        return `Hello ${user?.name || 'Farmer'}! I am your Agriculture Advisor robot. Ask me any question about crops, fertilizers, pest control, or weather.`;
    }
  };

  // Load greeting or history on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: getGreeting(selectedLanguage),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

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

  // Microphone toggle
  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  // Text-To-Speech read aloud
  const handleSpeakText = (text, id) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === id && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentlySpeakingId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: userText,
        language: selectedLanguage,
        isVoice: isListening
      });

      if (response.success && response.data) {
        const botMsg = {
          id: response.data.id || `bot_${Date.now()}`,
          sender: 'bot',
          text: response.data.response,
          category: response.data.category,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);

        if (isVoiceResponseActive) {
          handleSpeakText(response.data.response, botMsg.id);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: 'Unable to reach the agricultural knowledge engine. Please check connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear conversation history?')) {
      try {
        await clearChatHistory();
      } catch {}
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setMessages([
        {
          id: 'welcome_reset',
          sender: 'bot',
          text: getGreeting(selectedLanguage),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <>
      {/* Floating Robot Trigger Button (Bottom-Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ask Agriculture Advisor Chatbot"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#176B45] hover:bg-[#114F33] text-white shadow-xl shadow-[#176B45]/30 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white focus:outline-none"
        title="Ask Agriculture Advisor"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[360px] sm:w-[390px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          
          {/* Header */}
          <div className="p-3.5 bg-[#176B45] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#A3E635]" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm leading-tight text-white">
                  Ask Agriculture Advisor
                </h3>
                <span className="text-[10px] text-emerald-200 block leading-tight">
                  AI Farming Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setMessages([
                    {
                      id: `welcome_${Date.now()}`,
                      sender: 'bot',
                      text: getGreeting(e.target.value),
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold rounded-lg px-2 py-1 outline-none border border-white/20 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-800">
                    {l.nativeName}
                  </option>
                ))}
              </select>

              {/* Speech Output Toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceResponseActive(!isVoiceResponseActive)}
                className={`p-1.5 rounded-lg transition ${
                  isVoiceResponseActive ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                }`}
                title={isVoiceResponseActive ? 'Speech output ON' : 'Speech output OFF'}
              >
                {isVoiceResponseActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F7FAF7] text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#176B45] text-white rounded-br-xs'
                        : 'bg-white text-[#1F2937] border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs">{msg.text}</p>
                    
                    {!isUser && (
                      <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        {msg.category && (
                          <span className="uppercase font-semibold text-[#176B45]">
                            {msg.category}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text, msg.id)}
                          className="hover:text-[#176B45] transition flex items-center gap-1 cursor-pointer"
                          title="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-1.5 bg-white p-2.5 rounded-xl border border-slate-200 w-24">
                <div className="w-2 h-2 rounded-full bg-[#176B45] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#176B45] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#176B45] animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2.5 bg-white border-t border-slate-200 space-y-1.5">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about crops, fertilizers, pests..."
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] outline-none text-slate-800 placeholder-slate-400 transition"
              />

              {/* Microphone Voice Input */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#176B45]'
                }`}
                title={isListening ? 'Listening... Speak now' : 'Speak your question'}
              >
                {isListening ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2 rounded-xl bg-[#176B45] hover:bg-[#114F33] text-white disabled:opacity-40 transition cursor-pointer shadow-xs"
                title="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Link to Full AI Assistant Page */}
            <div className="text-center pt-0.5">
              <Link
                to="/ai-assistant"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#176B45] hover:underline"
              >
                <span>Open Full-Screen AI Assistant</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
