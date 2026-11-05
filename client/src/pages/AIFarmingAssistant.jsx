import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { useAuth } from '../context/AuthContext';

const SAMPLE_QUESTIONS = [
  'Which crop is suitable for black cotton soil?',
  'When is the best time to sow paddy in Kharif season?',
  'Why are my tomato crop leaves turning yellow?',
  'How can I identify fungal leaf infections early?',
  'What natural methods control pests in cotton?'
];

export default function AIFarmingAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Namaste ${user?.name || 'Farmer'}! I am your AI Agriculture Advisor. You can ask me general farming questions about crops, soil health, fertilizer timings, organic pest management, or weather precautions via typing or voice.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || 'en');

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Shell response simulation: demonstrates conversation flow
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Regarding "${query}": In ${selectedLanguage === 'te' ? 'Telugu context' : selectedLanguage === 'hi' ? 'Hindi context' : 'agricultural practice'}, maintaining adequate organic matter (FYM or compost), ensuring soil drainage, and choosing certified resistant seed varieties provide the most sustainable farming results. Always verify dosage with local extension officers.`,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase">
              Module 05
            </span>
            <span className="text-xs text-slate-400 font-medium">Conversational Generative AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Multilingual Voice & AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Voice-enabled conversational agriculture assistant answering natural language questions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ml">മലയാളം (Malayalam)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
          <Badge variant="info" pulse={true}>
            Phase 9 AI Voice Shell
          </Badge>
        </div>
      </div>

      <AlertBanner
        variant="disclaimer"
        title="AI Assistant Safety Protocol"
        message="The AI assistant provides agricultural guidance based on scientific agronomy. It never hallucinates hazardous chemical mixtures or unverified pesticide dosages. For critical farm infestations, contact your district agriculture officer."
      />

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Window */}
        <div className="lg:col-span-8 flex flex-col h-[560px] bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800">Agricultural Decision Assistant</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Gemini API & Web Speech Engine Ready
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSpeaking(!isSpeaking)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition text-xs flex items-center gap-1"
              title="Toggle Text-to-Speech"
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    msg.sender === 'user' ? 'bg-agri-600' : 'bg-purple-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-agri-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`text-[9px] mt-1 block opacity-60 text-right ${
                      msg.sender === 'user' ? 'text-agri-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsListening(!isListening)}
              className={`p-2.5 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input (Speak)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask any agricultural or crop question..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 text-xs sm:text-sm"
            />

            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              icon={Send}
              className="!bg-purple-600 hover:!bg-purple-700"
            >
              Send
            </Button>
          </div>

        </div>

        {/* Suggested Prompts Column */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title="Common Questions"
            subtitle="Click any prompt to ask instantly"
            icon={HelpCircle}
          >
            <div className="space-y-2">
              {SAMPLE_QUESTIONS.map((question, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-agri-50 border border-slate-100 hover:border-agri-200 text-xs text-slate-700 hover:text-agri-800 transition font-medium cursor-pointer"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}

