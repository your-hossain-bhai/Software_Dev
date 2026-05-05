export default function LearningDNACard({
  learningStyle = 'Hybrid',
  strengths = [],
  weakAreas = [],
  dropoutRisk = 28,
  careerMatch = 'Strong',
}) {
  const risk = Math.max(0, Math.min(100, dropoutRisk));

  return (
    <section className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-[0_0_30px_rgba(124,58,237,0.18)] hover:shadow-[0_0_42px_rgba(124,58,237,0.24)] hover:border-purple-400/45 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Learning DNA</p>
          <h3 className="text-xl font-semibold text-white">Adaptive learner profile</h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
          {learningStyle}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-300 uppercase tracking-wide">Strong areas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {strengths.length ? strengths.map((item) => (
              <span key={item} className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-100 text-xs font-medium border border-emerald-400/20">
                {item}
              </span>
            )) : <span className="text-sm text-emerald-100">No strong areas yet</span>}
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-300 uppercase tracking-wide">Weak areas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {weakAreas.length ? weakAreas.map((item) => (
              <span key={item} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-100 text-xs font-medium border border-amber-400/20">
                {item}
              </span>
            )) : <span className="text-sm text-amber-100">No major gaps detected</span>}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/35 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Dropout risk</p>
            <span className={`text-sm font-semibold ${risk < 30 ? 'text-emerald-300' : risk < 60 ? 'text-amber-300' : 'text-rose-300'}`}>
              {risk}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" style={{ width: `${risk}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/35 p-4">
          <p className="text-sm font-medium text-white mb-1">Career match</p>
          <p className="text-sm text-slate-300 leading-relaxed">{careerMatch}</p>
        </div>
      </div>
    </section>
  );
}