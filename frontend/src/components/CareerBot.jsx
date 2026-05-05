import { useState } from 'react';
import { careerBot } from '../services/api';

const QUICK_ACTIONS = [
  {
    label: 'Improve skills',
    prompt: 'Based on my profile, what are the top 3 skills I should improve this month and how should I learn them?',
  },
  {
    label: 'Career advice',
    prompt: 'Give me practical career advice for the next 30 days based on my current level.',
  },
  {
    label: 'Interview prep',
    prompt: 'How should I prepare for interviews for roles that match my current profile?',
  },
  {
    label: 'Learning plan',
    prompt: 'Create a one-week learning sprint for me with daily goals.',
  },
];

function renderStructuredText(content) {
  const cleaned = (content || '').trim();
  if (!cleaned) return null;

  const sections = cleaned.split(/\n\s*\n/);

  return sections.map((section, idx) => {
    const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
    const isList = lines.length > 1 && lines.every((line) => /^[-*\d.]/.test(line));

    if (isList) {
      return (
        <ul key={idx} className="space-y-2 list-disc pl-5 text-sm text-slate-200">
          {lines.map((line, lineIdx) => (
            <li key={lineIdx}>{line.replace(/^[-*\d.\s]+/, '')}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} className="text-sm text-slate-200 leading-relaxed">
        {lines.join(' ')}
      </p>
    );
  });
}

export default function CareerBot() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatbotIconUrl = 'https://img.icons8.com/?size=100&id=LShLF30xSbPP&format=png&color=00d4ff';

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await careerBot(question);
      setAnswer(res.data);
    } catch (err) {
      setAnswer({ answer: 'Sorry, something went wrong.', disclaimer: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const askPrompt = async (prompt) => {
    if (loading) return;
    setQuestion(prompt);
    setLoading(true);
    setAnswer(null);
    try {
      const res = await careerBot(prompt);
      setAnswer(res.data);
    } catch (err) {
      setAnswer({ answer: 'Sorry, something went wrong.', disclaimer: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-slate-800/80 via-cyan-900/30 to-slate-800/80 px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <img src={chatbotIconUrl} alt="" aria-hidden="true" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">CareerBot</h3>
            <p className="text-sm text-gray-400">AI-powered career guidance</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleAsk} className="flex gap-3 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How do I prepare for internships?"
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Ask'
            )}
          </button>
        </form>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Suggested prompts</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => askPrompt(item.prompt)}
                className="px-3 py-1.5 text-xs rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {!answer && !loading && (
          <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 text-center">
            <p className="text-gray-500 text-sm">Ask anything about your career path, interview tips, or skill development</p>
          </div>
        )}

        {answer && (
          <div className="p-5 bg-gradient-to-br from-slate-900/60 to-cyan-900/20 border border-cyan-500/20 rounded-xl space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">AI Response</p>
            {renderStructuredText(answer.answer)}
            {answer.disclaimer && (
              <p className="mt-4 text-gray-500 italic text-xs border-t border-white/5 pt-3">{answer.disclaimer}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
