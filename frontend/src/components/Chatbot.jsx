import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getChatSession,
  getChatHistory,
  sendChatMessage,
  createChatSession,
} from '../services/api';

const SUGGESTED_PROMPTS = [
  'What skills should I learn next?',
  'Best career for me?',
  'Improve my weaknesses',
];

const QUICK_ACTIONS = [
  'What skills should I learn next?',
  'Best career for me?',
  'Improve my weaknesses',
];

function formatMessage(content) {
  const text = (content || '').trim();
  if (!text) return [];

  return text.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const bullets = lines.filter((line) => /^[-*•\d.]/.test(line));

    if (bullets.length === lines.length && bullets.length > 0) {
      return (
        <ul key={index} className="list-disc pl-5 space-y-1 text-sm text-slate-200">
          {bullets.map((line, idx) => (
            <li key={idx}>{line.replace(/^[-*•\d.\s]+/, '')}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {lines.join(' ')}
      </p>
    );
  });
}

function MessageBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[92%] md:max-w-[78%] rounded-2xl px-5 py-4 ${isUser ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-slate-800/60 border border-white/10 text-gray-200'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-cyan-300">CareerBot</span>
          </div>
        )}
        <div className="space-y-3">{formatMessage(message.content)}</div>
        <div className={`text-xs mt-3 ${isUser ? 'text-cyan-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-cyan-300">CareerBot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function Chatbot({ compact = false }) {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        setInitialLoading(true);
        const res = await getChatSession();
        const sid = res.data.sessionId;
        setSessionId(sid);
        const historyRes = await getChatHistory(sid);
        setMessages(historyRes.data.messages || []);
      } catch (err) {
        setError('Failed to initialize chat. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (text = input) => {
    const messageText = text.trim();
    if (!messageText || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    const tempUserMessage = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const res = await sendChatMessage(messageText, sessionId);
      if (res.data.sessionId) setSessionId(res.data.sessionId);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempUserMessage._id);
        return [...filtered, res.data.userMessage, res.data.assistantMessage];
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMessage._id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedPrompt = (prompt) => handleSend(prompt);

  const handleNewChat = async () => {
    try {
      setLoading(true);
      const res = await createChatSession();
      setSessionId(res.data.sessionId);
      setMessages([]);
      setError(null);
    } catch {
      setError('Failed to start new conversation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? 'bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.35)]' : 'min-h-[720px] bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 -mb-8 overflow-hidden flex flex-col'}>
      {!compact && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      )}

      <div className={compact ? 'p-0' : 'flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 min-h-0'}>
        <div className={`flex items-center justify-between shrink-0 ${compact ? 'px-6 pt-6 mb-4' : 'mb-4'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <svg className="w-6 h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CareerBot</h1>
              <p className="text-gray-400 text-sm">AI-powered career guidance for {user?.name || 'you'}</p>
            </div>
          </div>
          <button onClick={handleNewChat} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-xl text-gray-300 text-sm font-medium transition-all disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-5 px-6 pb-6 min-h-0 flex-1">
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col min-h-[520px] overflow-hidden">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
              {initialLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-400">Loading conversation...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Tell me what you need</h2>
                  <p className="text-gray-400 mb-8 max-w-md">I can help you identify the next skills to learn, the best career path, and the weakest parts of your profile.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                    {SUGGESTED_PROMPTS.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSuggestedPrompt(item)}
                        disabled={loading}
                        className="p-4 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 hover:border-cyan-500/30 rounded-xl text-left transition-all disabled:opacity-50"
                      >
                        <p className="text-white font-medium text-sm">{item}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => <MessageBubble key={msg._id} message={msg} isUser={msg.role === 'user'} />)}
                  {loading && <TypingIndicator />}
                </div>
              )}
            </div>

            {error && <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20 shrink-0"><p className="text-red-400 text-sm">{error}</p></div>}

            <div className="p-4 border-t border-white/10 bg-slate-900/60 shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about your career, learning plan, or job match..."
                  rows={2}
                  className="flex-1 px-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                />
                <button type="submit" disabled={loading || !input.trim()} className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? '...' : 'Send'}
                </button>
              </form>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-3">Suggested prompts</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => handleSuggestedPrompt(item)} className="px-3 py-1.5 text-xs rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-all">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-3">Quick actions</p>
              <div className="space-y-2">
                {['Improve skills', 'Career advice', 'Job fit check'].map((item) => (
                  <button key={item} type="button" onClick={() => handleSuggestedPrompt(item)} className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-sm text-gray-200 transition-all">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}