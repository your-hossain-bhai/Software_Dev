import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const strengthToScore = {
  strong: 90,
  medium: 60,
  weak: 30,
};

const fallbackSkills = [
  { name: 'React', strength: 80 },
  { name: 'Node.js', strength: 65 },
  { name: 'MongoDB', strength: 45 },
  { name: 'Python', strength: 58 },
];

export default function SkillChart({ skills = [] }) {
  const data = useMemo(() => {
    if (!Array.isArray(skills) || skills.length === 0) return fallbackSkills;

    return skills.slice(0, 6).map((skill) => {
      const normalized = String(skill?.strength || '').toLowerCase();
      const computedStrength = Number.isFinite(skill?.score)
        ? Math.max(0, Math.min(100, skill.score))
        : strengthToScore[normalized] || 50;

      return {
        name: skill?.name || 'Unknown',
        strength: computedStrength,
      };
    });
  }, [skills]);

  return (
    <section className="h-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_0_35px_rgba(59,130,246,0.08)] hover:shadow-[0_0_45px_rgba(124,58,237,0.12)] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Skill Strength Analysis</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-200 border border-blue-400/25">
          Live profile
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="skillStrengthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#ffffff09' }}
              contentStyle={{
                backgroundColor: '#0f172acc',
                border: '1px solid #ffffff1f',
                borderRadius: '10px',
                color: '#e5e7eb',
              }}
            />
            <Bar dataKey="strength" fill="url(#skillStrengthGradient)" radius={[10, 10, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
