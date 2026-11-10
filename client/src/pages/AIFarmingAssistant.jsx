import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Radio,
  Info,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../services/chatService';

// Speech recognition BCP-47 locale code mappings
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

const SUGGESTED_QUESTIONS = [
  'Which crop is suitable for black cotton soil?',
  'How can I control pests organically?',
  'When should I apply fertilizer to paddy?'
];

export default function AIFarmingAssistant() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || user?.preferredLanguage || 'en');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceResponseActive, setIsVoiceResponseActive] = useState(true);
  const [speechError, setSpeechError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [inquiriesCount, setInquiriesCount] = useState(0);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync selected language when i18n changes
  useEffect(() => {
    if (i18n.language && i18n.language !== selectedLanguage) {
      setSelectedLanguage(i18n.language);
    }
  }, [i18n.language]);

  // Initial welcome greeting & fetch history
  useEffect(() => {
    async function loadInitialChat() {
      try {
        const historyRes = await getChatHistory(30);
        if (historyRes.success && Array.isArray(historyRes.data) && historyRes.data.length > 0) {
          setInquiriesCount(historyRes.data.length);
          const formatted = historyRes.data.reverse().flatMap((item) => [
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
        // Fallback to default greeting
      }

      const farmerName = user?.name ? ` ${user.name}` : '';
      const defaultGreeting = {
        id: 'initial_welcome',
        sender: 'bot',
        text: `Namaste${farmerName}! How can I help you with your farming today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([defaultGreeting]);
      setInquiriesCount(0);
    }

    loadInitialChat();
  }, [user?.name]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputMessage(currentTranscript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setSpeechError(`Microphone notice: ${event.error}. You can also type your question.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  // Toggle voice listening
  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setSpeechError(null);
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

  // Text-To-Speech function
  const handleSpeakText = (text, messageId = null) => {
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
    utterance.pitch = 1.0;

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message handler
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }

    const userMessageId = `user_${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);
    setSpeechError(null);
    setInquiriesCount((c) => c + 1);

    try {
      const result = await sendChatMessage({
        message: query,
        language: selectedLanguage,
        isVoice: isListening
      });

      if (result.success && result.data) {
        const botMessageId = `bot_${Date.now()}`;
        const botMsg = {
          id: botMessageId,
          sender: 'bot',
          text: result.data.response,
          category: result.data.category,
          source: result.data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMsg]);

        if (isVoiceResponseActive) {
          handleSpeakText(result.data.response, botMessageId);
        }
      }
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'bot',
        text: `Sorry, I encountered an issue: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      try {
        await clearChatHistory();
        const farmerName = user?.name ? ` ${user.name}` : '';
        setMessages([
          {
            id: `welcome_${Date.now()}`,
            sender: 'bot',
            text: `Namaste${farmerName}! How can I help you with your farming today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setInquiriesCount(0);
      } catch (err) {
        console.warn('Failed to clear history:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      
      {/* Main Chatbot Adaptive Card matching Crop, Fertilizer, and Disease modules */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 p-5 sm:p-7 text-slate-900 shadow-premium relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123D2A] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-[#B6D957]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#123D2A]">
                  AI Farming Assistant
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Your multilingual agricultural advisory companion
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Assistant Active
              </span>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-slate-500 font-bold">
              {inquiriesCount} Inquiries
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Audio Read-Aloud Toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceResponseActive(!isVoiceResponseActive)}
                className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                  isVoiceResponseActive 
                    ? 'bg-emerald-50 border-emerald-300 text-[#123D2A] font-bold shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={isVoiceResponseActive ? 'Speech read-aloud ON' : 'Speech read-aloud OFF'}
              >
                {isVoiceResponseActive ? <Volume2 className="w-4 h-4 text-[#246B45]" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer shadow-xs"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="my-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            {speechError}
          </div>
        )}

        {/* Messages Stream */}
        <div className="py-5 space-y-4 max-h-[500px] overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-200`}
              >
                {/* Bot Label & Icon */}
                {!isUser && (
                  <div className="flex items-center gap-2 text-[#123D2A] font-bold text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-lg bg-[#123D2A] flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-[#B6D957]" />
                    </div>
                    <span>AI Agriculture Advisor</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#123D2A] to-[#246B45] text-white rounded-tr-none font-medium max-w-[85%] shadow-sm'
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200 max-w-[90%] shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Action Bar for Bot Messages */}
                {!isUser && (
                  <div className="flex items-center gap-3 pl-2 text-[11px] text-slate-500 font-medium">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleSpeakText(msg.text, msg.id)}
                      className={`hover:text-[#123D2A] transition cursor-pointer flex items-center gap-1 ${
                        currentlySpeakingId === msg.id ? 'text-[#246B45] font-bold' : ''
                      }`}
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="hover:text-[#123D2A] transition cursor-pointer flex items-center gap-1"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 w-fit">
              <Bot className="w-4 h-4 text-[#246B45] animate-spin" />
              <span>Analyzing agricultural advisory database...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* "Try asking" Section */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Try asking
          </h3>
          <div className="space-y-1.5">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => handleSendMessage(question)}
                disabled={loading}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-[#F7F7F0] border border-slate-200 hover:border-[#246B45] text-slate-700 text-xs sm:text-sm font-medium hover:text-[#123D2A] transition cursor-pointer flex items-center justify-between group shadow-xs disabled:opacity-50"
              >
                <span>{question}</span>
                <span className="text-xs text-slate-400 group-hover:text-[#246B45] font-bold transition">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Card */}
        <div className="mt-4 rounded-2xl border border-slate-300 focus-within:border-[#123D2A] focus-within:ring-1 focus-within:ring-[#123D2A] bg-white p-3 transition shadow-sm">
          <textarea
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening 
                ? 'Listening to speech...' 
                : 'Ask your farming question...'
            }
            disabled={loading}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
            {/* Microphone Icon on bottom-left */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isListening
                  ? 'bg-rose-50 text-rose-600 animate-pulse ring-2 ring-rose-500/30'
                  : 'text-[#246B45] hover:text-[#123D2A] hover:bg-slate-100'
              }`}
              title={isListening ? 'Listening... Speak now' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Pill Send Button on bottom-right */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-1.5 rounded-full font-bold text-xs bg-[#123D2A] hover:bg-[#1D5939] active:bg-[#0E2F20] text-white flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-sm"
            >
              <span>Send</span>
              <span className="text-sm font-extrabold leading-none">↑</span>
            </button>
          </div>
        </div>

        {/* Bottom Helper Caption */}
        <p className="text-[11px] text-slate-500 mt-2.5 text-left font-medium">
          Voice input and spoken responses available in supported languages.
        </p>

      </div>

      {/* Advisory & Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong>Advisory Notice:</strong> AI Agriculture Advisor provides scientific and organic farming guidance based on ICAR recommendations. Always verify chemical dosages with local Krishi Vigyan Kendra (KVK) officers before large-scale pesticide applications.
        </p>
      </div>

    </div>
  );
}
