import { useMemo, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getSkillName, getStrength } from '../../utils/skillStrength';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const CATEGORY_COLORS = {
  Technical: '#f59e0b',
  Frontend: '#06b6d4',
  'AI/ML': '#ec4899',
  'Problem Solving': '#8b5cf6',
  Tools: '#10b981',
  Versatility: '#94a3b8',
};

const CATEGORY_ORDER = ['Technical', 'Frontend', 'AI/ML', 'Problem Solving', 'Tools', 'Versatility'];

const SKILL_STRENGTH_SCORE = {
  strong: 82,
  medium: 60,
  basic: 35,
};

const getScore = (skill) => {
  const strength = getStrength(skill);
  const base = SKILL_STRENGTH_SCORE[strength] || SKILL_STRENGTH_SCORE.basic;
  return clamp(base, 10, 85);
};

const getCategoryScore = (skills) => {
  if (!skills.length) {
    return 0;
  }

  const average = skills.reduce((sum, skill) => sum + getScore(skill), 0) / skills.length;
  const depthBonus = Math.min(8, Math.log2(skills.length + 1) * 3);
  return clamp(Math.round(average + depthBonus), 10, 85);
};

const normalizeTo100 = (rows) => {
  const safeRows = rows
    .filter((row) => Number.isFinite(Number(row?.score)))
    .map((row) => ({
      subject: row.subject,
      score: Number(row.score),
    }));
  const total = safeRows.reduce((sum, row) => sum + Number(row.score), 0);

  if (total <= 0) {
    return [];
  }

  const precise = safeRows.map((row, index) => {
    const raw = (Number(row.score) / total) * 100;
    return {
      index,
      subject: row.subject,
      score: Number(row.score),
      base: Math.floor(raw),
      remainder: raw - Math.floor(raw),
    };
  });

  let used = precise.reduce((sum, row) => sum + row.base, 0);
  let remaining = 100 - used;

  [...precise]
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((row) => {
      if (remaining > 0) {
        precise[row.index].base += 1;
        remaining -= 1;
      }
    });

  used = precise.reduce((sum, row) => sum + row.base, 0);
  if (used !== 100 && precise.length > 0) {
    precise[0].base += 100 - used;
  }

  const withPercentage = precise.map((row) => ({
    subject: row.subject,
    score: row.score,
    percentage: row.base,
  }));

  const orderMap = new Map(withPercentage.map((row) => [row.subject, row]));
  return CATEGORY_ORDER.map((subject) => orderMap.get(subject)).filter(Boolean);
};

const renderDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + ((outerRadius - innerRadius) * 0.62);
  const x = cx + (radius * Math.cos(-midAngle * RADIAN));
  const y = cy + (radius * Math.sin(-midAngle * RADIAN));

  return (
    <text
      x={x}
      y={y}
      fill="#e2e8f0"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {payload?.percentage || 0}%
    </text>
  );
};

export default function LearningDNAChart({ user, profile }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const userSkills = useMemo(
    () => (Array.isArray(user?.skills) ? user.skills : []),
    [user?.skills],
  );

  const rawData = useMemo(() => {
    if (Array.isArray(profile) && profile.length) {
      return profile.map((item) => ({
        ...item,
        score: clamp(Math.round(Number(item?.score) || 10), 10, 85),
      }));
    }

    const skills = userSkills;

    const frontend = skills.filter((s) => {
      const name = getSkillName(s).toLowerCase();
      return ['react', 'vue', 'html', 'css', 'tailwind', 'javascript', 'typescript', 'flutter', 'dart', 'bootstrap'].some((k) => name.includes(k));
    });

    const backend = skills.filter((s) => {
      const name = getSkillName(s).toLowerCase();
      return ['node', 'express', 'python', 'django', 'fastapi', 'mongodb', 'sql', 'firebase', 'sqlite', 'rest'].some((k) => name.includes(k));
    });

    const aiSkills = skills.filter((s) => {
      const name = getSkillName(s).toLowerCase();
      return ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'ai', 'ml'].some((k) => name.includes(k));
    });

    const tools = skills.filter((s) => {
      const name = getSkillName(s).toLowerCase();
      return ['git', 'docker', 'figma', 'linux', 'aws'].some((k) => name.includes(k));
    });

    const frontendScore = getCategoryScore(frontend);
    const technicalScore = getCategoryScore(backend);
    const aiScore = getCategoryScore(aiSkills);
    const toolsScore = getCategoryScore(tools);

    const problemSolvingScore = clamp(
      Math.round((technicalScore * 0.5) + (aiScore * 0.3) + (toolsScore * 0.2)),
      0,
      85,
    );

    const activeCategories = [frontend, backend, aiSkills, tools].filter((arr) => arr.length > 0).length;
    const categoryAverage = (frontendScore + technicalScore + aiScore + toolsScore) / 4;
    const versatilityRaw = skills.length === 0
      ? 0
      : (18 + (activeCategories * 8) + Math.min(12, skills.length * 0.6) + (categoryAverage * 0.2));
    const versatilityScore = clamp(Math.round(versatilityRaw), 0, 85);

    return [
      { subject: 'Technical', score: technicalScore },
      { subject: 'Frontend', score: frontendScore },
      { subject: 'AI/ML', score: aiScore },
      { subject: 'Problem Solving', score: problemSolvingScore },
      { subject: 'Tools', score: toolsScore },
      { subject: 'Versatility', score: versatilityScore },
    ];
  }, [profile, userSkills]);

  const data = useMemo(() => normalizeTo100(rawData), [rawData]);

  const styleColor = useMemo(() => {
    const technical = data.find((d) => d.subject === 'Technical')?.score || 0;
    const ai = data.find((d) => d.subject === 'AI/ML')?.score || 0;
    const frontend = data.find((d) => d.subject === 'Frontend')?.score || 0;

    if (ai > 60) return '#f59e0b';
    if (technical > 70 && frontend > 70) return '#ec4899';
    if (frontend > technical) return '#06b6d4';
    return '#a855f7';
  }, [data]);

  const shouldRenderChart = (Array.isArray(profile) && profile.length > 0) || userSkills.length > 0;

  if (!shouldRenderChart) {
    return (
      <section className="h-full bg-gradient-to-br from-white/5 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/25 p-6 shadow-[0_0_30px_rgba(124,58,237,0.18)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Learning DNA</h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/25">
            Donut view
          </span>
        </div>
        <div className="h-80 rounded-2xl border border-white/10 bg-slate-900/35 flex items-center justify-center text-center px-6">
          <p className="text-sm text-slate-300">Add at least one skill in your profile to generate Learning DNA insights.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full bg-gradient-to-br from-white/5 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/25 p-6 shadow-[0_0_30px_rgba(124,58,237,0.18)] hover:shadow-[0_0_45px_rgba(124,58,237,0.24)] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Learning DNA</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/25">
          Donut view
        </span>
      </div>

      <div
        className="h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {Object.entries(CATEGORY_COLORS).map(([subject, color]) => (
                <linearGradient key={subject} id={`dnaGrad-${subject.replace(/\s|\//g, '')}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.65} />
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={data}
              dataKey="percentage"
              nameKey="subject"
              cx="41%"
              cy="50%"
              innerRadius={58}
              outerRadius={activeIndex >= 0 ? 106 : 102}
              cornerRadius={7}
              paddingAngle={2}
              stroke="#0f172a"
              strokeWidth={2}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              label={renderDonutLabel}
              labelLine={false}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {data.map((entry, index) => {
                const gradientId = `dnaGrad-${entry.subject.replace(/\s|\//g, '')}`;
                const isActive = index === activeIndex;
                return (
                  <Cell
                    key={entry.subject}
                    fill={`url(#${gradientId})`}
                    style={{
                      filter: isActive ? `drop-shadow(0 0 10px ${CATEGORY_COLORS[entry.subject]}99)` : 'none',
                      opacity: activeIndex < 0 || isActive ? 1 : 0.72,
                      transition: 'all 220ms ease',
                    }}
                  />
                );
              })}
            </Pie>

            <Tooltip
              formatter={(value, _name, details) => [`${value}%`, details?.payload?.subject || 'Category']}
              contentStyle={{
                backgroundColor: '#0f172acc',
                border: '1px solid #a855f74f',
                borderRadius: '10px',
                color: '#e5e7eb',
              }}
            />

            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              wrapperStyle={{ right: 0, color: '#cbd5e1', fontSize: '12px' }}
              formatter={(value, _entry, index) => {
                const row = data[index] || {};
                return `${value} (${row.percentage || 0}%)`;
              }}
            />

          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-3">
        {[...data].sort((a, b) => b.percentage - a.percentage).slice(0, 3).map((item) => (
          <div key={item.subject}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{item.subject}</span>
              <span className="text-white font-semibold">{item.percentage}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage}%`, backgroundColor: styleColor }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
