import { motion } from 'framer-motion';

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

export default function MatchCircle({ score = 40, size = 124 }) {
  const safeScore = clampPercent(score);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (safeScore / 100) * circumference;

  const color =
    safeScore >= 70 ? '#10b981' :
      safeScore >= 40 ? '#f59e0b' :
        '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 124 124" role="img" aria-label={`Job match ${safeScore}%`}>
        <circle cx="62" cy="62" r={radius} fill="none" stroke="#ffffff1f" strokeWidth="10" />
        <motion.circle
          cx="62"
          cy="62"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          transform="rotate(-90 62 62)"
        />
        <text x="62" y="60" textAnchor="middle" fill="#f8fafc" fontSize="24" fontWeight="700">
          {safeScore}%
        </text>
        <text x="62" y="78" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Match
        </text>
      </svg>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Job Match Score</p>
    </div>
  );
}
