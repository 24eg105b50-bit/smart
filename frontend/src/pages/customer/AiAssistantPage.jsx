import React, { useState, useEffect, useRef } from 'react';
import { aiApi } from '../../api/apiServices';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import {
  Sparkles,
  Send,
  Bot,
  User,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Loader2,
  BookOpen,
  Laptop,
  Cpu,
} from 'lucide-react';

export const AiAssistantPage = () => {
  const { addToCart } = useCart();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested starter queries
  const suggestions = [
    'I need a laptop for Java & Spring Boot coding under 60000',
    'Prescribed algorithms and operating systems textbooks',
    'What is the campus return policy for electronics & Arduino kits?',
    'Ergonomic mechanical keyboards for late-night hostel coding',
    'Scientific calculator approved for university semester exams',
  ];

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await aiApi.getSessions();
      if (res.success && res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setCurrentSessionId(sessionId);
      const res = await aiApi.getSessionMessages(sessionId);
      if (res.success && res.data) {
        setMessages(
          res.data.map((m) => ({
            sender: m.sender,
            text: m.message,
            recommendedProducts: [],
            sourceReferences: [],
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || sending) return;

    // Optimistically append user message
    const newMsgList = [
      ...messages,
      { sender: 'USER', text: query, recommendedProducts: [], sourceReferences: [] },
    ];
    setMessages(newMsgList);
    setInputQuery('');
    setSending(true);

    try {
      const res = await aiApi.chat(query, currentSessionId);
      if (res.success && res.data) {
        if (!currentSessionId) {
          setCurrentSessionId(res.data.sessionId);
          loadSessions();
        }

        setMessages([
          ...newMsgList,
          {
            sender: 'ASSISTANT',
            text: res.data.reply,
            recommendedProducts: res.data.recommendedProducts || [],
            sourceReferences: res.data.sourceReferences || [],
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMsgList,
        {
          sender: 'ASSISTANT',
          text: 'I encountered an error querying the catalog: ' + err.message,
          recommendedProducts: [],
          sourceReferences: [],
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            ShopSphere AI Shopping Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded in actual campus store inventory • Zero hallucinations • AU-R24 policy assistance
          </p>
        </div>

        <button
          onClick={handleStartNewSession}
          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-[750px]">
        {/* Previous Chat Sessions Sidebar */}
        <div className="hidden lg:flex flex-col bg-white p-4 rounded-2xl border border-slate-200 h-full overflow-hidden shadow-xs">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Chat History
          </h2>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous chats</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSessionMessages(s.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition line-clamp-1 ${
                    currentSessionId === s.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {s.title}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Stream & Input Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12 max-w-lg mx-auto space-y-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">How can I help your semester today?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Ask in plain English about coding laptops, textbook editions, Arduino sensors, or campus policies.
                  </p>
                </div>

                {/* Starter Prompt Chips */}
                <div className="space-y-2 text-left">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Suggested Questions:
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="p-2.5 bg-slate-50 hover:bg-blue-50/80 hover:text-blue-700 text-xs font-medium text-slate-700 rounded-xl border border-slate-200 transition text-left"
                      >
                        💡 {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3.5 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ASSISTANT' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-4 max-w-2xl ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'USER'
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-slate-50 text-slate-800 rounded-bl-xs border border-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Policy References (RAG) */}
                    {msg.sourceReferences?.length > 0 && (
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-blue-700 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Grounded Campus Policy Reference:
                        </p>
                        {msg.sourceReferences.map((ref, rIdx) => (
                          <p key={rIdx} className="text-[11px] text-slate-700">
                            {ref}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Grounded Recommended Product Cards */}
                    {msg.recommendedProducts?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Verified Campus Inventory Matches:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.recommendedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'USER' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex gap-3 items-center text-xs text-slate-500 italic">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Searching catalog and generating grounded answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about laptops, books, Arduino kits, or campus policies..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={sending}
                className="flex-1 text-xs px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || sending}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
