import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  User, 
  HelpCircle,
  Languages,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Radio,
  Info
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
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

// Multilingual evaluation chips
const SAMPLE_QUESTIONS = {
  en: [
    'Which crop is suitable for black cotton soil?',
    'When is the best time to sow paddy in Kharif season?',
    'Why are my tomato crop leaves turning yellow?',
    'How can I control whiteflies and sucking pests organically?',
    'When and how should urea fertilizer be applied to paddy?',
    'What precautions protect standing crops during heavy rainfall?',
    'What benefits does the PM-KISAN scheme offer?'
  ],
  hi: [
    'काली मिट्टी में कौन सी फसल सबसे अच्छी होती है?',
    'धान में यूरिया डालने का सही समय और तरीका क्या है?',
    'टमाटर के पत्तों के पीले पड़ने का क्या कारण और इलाज है?',
    'कपास में सफेद मक्खी की रोकथाम के लिए जैविक उपाय क्या हैं?',
    'भारी बारिश में खड़ी फसलों को नुकसान से कैसे बचाएं?',
    'पीएम-किसान योजना के क्या लाभ हैं?'
  ],
  te: [
    'నల్ల రేగడి నేలల్లో ఏ పంటలు వేస్తే మంచి దిగుబడి వస్తుంది?',
    'వరి పైరుకు యూరియా ఎరువును ఏయే దశల్లో వేయాలి?',
    'టమాటా ఆకులు పసుపు రంగులోకి మారడానికి గల కారణాలేమిటి?',
    'పత్తి పంటలో తెల్లదోమ నివారణకు ఎలాంటి చర్యలు తీసుకోవాలి?',
    'భారీ వర్షాలు పడినప్పుడు నిలిచిన నీటిని ఎలా తొలగించాలి?',
    'ప్రభుత్వ రైతు సంక్షేమ పథకాలు (పీఎం-కిసాన్) వివరాలేమిటి?'
  ]
};

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

      const defaultGreeting = {
        id: 'initial_welcome',
        sender: 'bot',
        text: getLocalizedGreeting(selectedLanguage, user?.name),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([defaultGreeting]);
    }

    loadInitialChat();
  }, []);

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
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
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

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Send message handler
  const handleSendMessage = async (textToSend = null, isVoiceInput = false) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
    }

    // Stop active speech
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

    try {
      const result = await sendChatMessage({
        message: query,
        language: selectedLanguage,
        isVoice: isVoiceInput || isListening
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

        // Auto-play speech synthesis if voice mode is enabled
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

  // Change conversation language
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    if (newLang !== i18n.language) {
      i18n.changeLanguage(newLang);
      localStorage.setItem('agri_preferred_language', newLang);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
  };

  // Clear conversation history
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      try {
        await clearChatHistory();
      } catch {
        // Continue
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingId(null);
      }
      setMessages([
        {
          id: `welcome_${Date.now()}`,
          sender: 'bot',
          text: getLocalizedGreeting(selectedLanguage, user?.name),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleQuestions = SAMPLE_QUESTIONS[selectedLanguage] || SAMPLE_QUESTIONS.en;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase">
              {t('common.module', 'Module 05')}
            </span>
            <span className="text-xs text-slate-400 font-medium">Bilingual Speech-to-Text & Generative Agronomy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Multilingual Voice & AI Farming Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Voice-enabled interactive conversational advisor answering natural language farming inquiries in 8 Indian languages
          </p>
        </div>

        {/* Controls: Language Selector & Voice Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const newState = !isVoiceResponseActive;
              setIsVoiceResponseActive(newState);
              if (!newState && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                setCurrentlySpeakingId(null);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition ${
              isVoiceResponseActive
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Voice Output (Text-To-Speech)"
          >
            {isVoiceResponseActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Voice Speech On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Voice Speech Off</span>
              </>
            )}
          </button>

          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 transition shadow-sm text-xs"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="disclaimer"
        title="Verified Agricultural Safety & Advisory Protocol"
        message="The AI assistant is strictly bound to agronomic science, ICAR dosage guidelines, and organic practices. It automatically deflects non-agricultural topics and refuses unverified chemical tank mixes. Always verify agrochemical sprays with your local extension officer."
      />

      {speechError && (
        <AlertBanner
          variant="warning"
          title="Voice Hardware Notice"
          message={speechError}
        />
      )}

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Window Container */}
        <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden">
          
          {/* Chat Window Header */}
          <div className="p-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>AI Agriculture Decision Support</span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.2 rounded-full uppercase">
                    {selectedLanguage.toUpperCase()}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Assistant • Web Speech STT & Generative Agronomy Ready</span>
                </p>
              </div>
            </div>

            <Badge variant="neutral">
              {messages.filter(m => m.sender === 'user').length} Inquiries
            </Badge>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-agri-600 shadow-agri-600/20' 
                      : 'bg-purple-600 shadow-purple-600/20'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-[13px] leading-relaxed shadow-sm transition ${
                      msg.sender === 'user'
                        ? 'bg-agri-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    <p className="whitespace-pre-line font-medium">{msg.text}</p>
                  </div>

                  {/* Bubble Footer Actions */}
                  <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{msg.timestamp}</span>

                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text, msg.id)}
                          className={`p-1 rounded-md transition hover:bg-slate-200/60 ${
                            currentlySpeakingId === msg.id ? 'text-purple-600 bg-purple-50' : 'text-slate-400'
                          }`}
                          title="Read Aloud (TTS)"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${currentlySpeakingId === msg.id ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-xs flex items-center gap-2 text-slate-500">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 ml-1">
                    Analyzing agricultural knowledge base...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Active Strip */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>Microphone active... Speak your farming question now</span>
              </div>
              <button
                type="button"
                onClick={() => recognitionRef.current?.stop()}
                className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2">
            
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3 rounded-2xl transition flex items-center justify-center shrink-0 shadow-sm ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/20'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak Question (Speech-to-Text)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : selectedLanguage === 'te'
                  ? 'వ్యవసాయ లేదా పంట సంబంధిత ప్రశ్న అడగండి...'
                  : selectedLanguage === 'hi'
                  ? 'खेती या फसल से संबंधित कोई भी सवाल पूछें...'
                  : 'Ask any farming, crop, fertilizer, pest, or weather question...'
              }
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm text-slate-800 transition"
              disabled={loading}
            />

            {/* Send Button */}
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              icon={Send}
              loading={loading}
              className="!bg-purple-600 hover:!bg-purple-700 shrink-0 px-4 py-2.5 rounded-2xl shadow-md shadow-purple-600/30"
            >
              <span className="hidden sm:inline">Ask AI</span>
            </Button>
          </div>

        </div>

        {/* Suggested Prompts Column */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title="Instant Evaluation Prompts"
            subtitle="Click any agricultural question chip to test live"
            icon={HelpCircle}
          >
            <div className="space-y-2 pt-1">
              {sampleQuestions.map((question, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-xs text-slate-700 hover:text-purple-900 transition font-medium cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span className="text-purple-600 font-bold mr-1.5">?</span>
                  "{question}"
                </button>
              ))}
            </div>
          </Card>

          <Card
            title="Voice & Speech Guidelines"
            subtitle="How to use speech features"
            icon={Info}
          >
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Voice Input (STT):</strong> Click the purple microphone, speak in your chosen language, and your speech will transcribe automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Speech Output (TTS):</strong> Keep 'Voice Speech On' to hear responses read aloud in native Indian accents. Click the speaker icon to replay.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Multi-Language:</strong> Switch language anytime from the header dropdown to toggle both UI and speech synthesizer.</span>
              </li>
            </ul>
          </Card>
        </div>

      </div>

    </div>
  );
}

/**
 * Localized Greeting Helper
 */
function getLocalizedGreeting(lang, userName = 'Farmer') {
  const name = userName || 'Farmer';
  switch (lang) {
    case 'hi':
      return `नमस्ते ${name}! मैं आपका एआई कृषि सलाहकार हूं। आप मुझसे फसलों, मिट्टी की जांच, खाद की मात्रा, जैविक कीट नियंत्रण या मौसम की सावधानियों के बारे में बोलकर या लिखकर पूछ सकते हैं।`;
    case 'te':
      return `నమస్కారం ${name}! నేను మీ ఏఐ వ్యవసాయ సలహాదారుడిని. మీరు పంటల ఎంపిక, నేల స్వభావం, ఎరువుల సమయాలు, చీడపీడల నివారణ లేదా వాతావరణ హెచ్చరికల గురించి టైప్ చేయడం ద్వారా లేదా మాట్లాడటం ద్వారా నన్ను అడగవచ్చు.`;
    case 'ta':
      return `வணக்கம் ${name}! நான் உங்கள் ஏஐ விவசாய ஆலோசகர். பயிர்கள், உர மேலாண்மை, பூச்சி கட்டுப்பாடு அல்லது வானிலை குறித்து வாய்மொழி அல்லது தட்டச்சு மூலம் என்னிடம் கேட்கலாம்.`;
    case 'kn':
      return `ನಮಸ್ಕಾರ ${name}! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಎಐ ಸಲಹೆಗಾರ. ಬೆಳೆಗಳು, ರಸಗೊಬ್ಬರ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣದ ಬಗ್ಗೆ ಧ್ವನಿ ಅಥವಾ ಟೈಪಿಂಗ್ ಮೂಲಕ ನನ್ನನ್ನು ಕೇಳಬಹುದು.`;
    case 'ml':
      return `നമസ്കാരം ${name}! ഞാൻ നിങ്ങളുടെ കാർഷിക എഐ സഹായിയാണ്. കൃഷി, വളപ്രയോഗം, കീടനിയന്ത്രണം എന്നിവയെക്കുറിച്ച് ചോദിക്കാം.`;
    case 'mr':
      return `नमस्कार ${name}! मी आपला एआय शेती सल्लागार आहे. पिके, खते, कीड नियंत्रण किंवा हवामानाविषयी आपण मला बोलून किंवा लिहून विचारू शकता.`;
    case 'bn':
      return `নমস্কার ${name}! আমি আপনার এআই কৃষি উপদেষ্টা। ফসল, সার ও পোকা দমন সম্পর্কে আপনি আমাকে ভয়েস বা টাইপ করে জিজ্ঞাসা করতে পারেন।`;
    default:
      return `Namaste ${name}! I am your AI Agriculture Advisor. You can ask me questions about crops, soil health, fertilizer timings, organic pest management, or severe weather precautions via typing or voice.`;
  }
}
