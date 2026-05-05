import { useMemo, useState } from 'react';
import { getSkillName, getStrength } from '../../utils/skillStrength';

const categoryConfig = {
  frontend: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.4)', label: 'Frontend' },
  backend: { color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)', label: 'Backend' },
  ai: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', label: 'AI/ML' },
  tools: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', label: 'Tools' },
  fullstack: { color: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', label: 'Full Stack' },
  other: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', label: 'Other' },
};

const getCategory = (skillName = '') => {
  const s = skillName.toLowerCase();

  if (['react', 'vue', 'html', 'css', 'tailwind', 'javascript', 'typescript', 'flutter', 'dart', 'bootstrap'].some((k) => s.includes(k))) return 'frontend';
  if (['node', 'express', 'django', 'fastapi', 'python', 'rest', 'mongodb', 'sql', 'firebase', 'sqlite'].some((k) => s.includes(k))) return 'backend';
  if (['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'ai', 'ml'].some((k) => s.includes(k))) return 'ai';
  if (['git', 'docker', 'aws', 'linux', 'figma', 'design'].some((k) => s.includes(k))) return 'tools';
  if (['full stack', 'fullstack', 'mobile', 'android', 'ios'].some((k) => s.includes(k))) return 'fullstack';

  return 'other';
};

const getBubbleSizeClass = (strength) => {
  if (strength === 'strong') return 'text-sm px-4 py-2';
  if (strength === 'medium') return 'text-xs px-3 py-1.5';
  return 'text-xs px-2.5 py-1';
};

const getBubbleFontClass = (strength) => {
  if (strength === 'strong') return 'text-sm font-bold';
  if (strength === 'medium') return 'text-xs font-semibold';
  return 'text-xs';
};

export default function SkillBubble({ skills = [] }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const normalizedSkills = useMemo(
    () => (skills || []).map((skill) => ({
      ...(typeof skill === 'object' && skill !== null ? skill : {}),
      resolvedName: getSkillName(skill),
      resolvedStrength: getStrength(skill),
    })),
    [skills],
  );

  const grouped = useMemo(
    () => normalizedSkills.reduce((acc, skill) => {
      const category = getCategory(skill.resolvedName);
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {}),
    [normalizedSkills],
  );

  if (!normalizedSkills.length) {
    return (
      <section className="bg-[#1e2433] rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center h-72">
        <p className="text-gray-300 text-sm text-center">Add skills to see your dynamic skill map.</p>
        <a href="/profile" className="mt-3 text-cyan-400 text-sm hover:underline">Add Skills</a>
      </section>
    );
  }

  return (
    <section className="bg-[#1e2433] rounded-2xl p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-bold text-base">Skill Galaxy</h3>
          <p className="text-gray-500 text-xs mt-0.5">{normalizedSkills.length} skills across {Object.keys(grouped).length} domains</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {[
            { label: 'Strong', size: 'w-4 h-4' },
            { label: 'Medium', size: 'w-3 h-3' },
            { label: 'Basic', size: 'w-2 h-2' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`${item.size} rounded-full bg-purple-400 opacity-70`} />
              <span className="text-gray-500 text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, catSkills]) => {
          const config = categoryConfig[cat] || categoryConfig.other;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold" style={{ color: config.color }}>{config.label}</span>
                <div className="flex-1 h-px opacity-20" style={{ backgroundColor: config.color }} />
                <span className="text-xs text-gray-600">{catSkills.length}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {catSkills.map((skill) => (
                  <div
                    key={skill.resolvedName}
                    className={`relative cursor-default rounded-full border transition-all duration-300 hover:scale-110 hover:shadow-lg ${getBubbleSizeClass(skill.resolvedStrength)}`}
                    style={{
                      backgroundColor: config.bg,
                      borderColor: hoveredSkill === skill.resolvedName ? config.color : config.border,
                      boxShadow: hoveredSkill === skill.resolvedName ? `0 0 15px ${config.color}40` : 'none',
                      color: config.color,
                    }}
                    onMouseEnter={() => setHoveredSkill(skill.resolvedName)}
                    onMouseLeave={() => setHoveredSkill(null)}
                  >
                    <span className={getBubbleFontClass(skill.resolvedStrength)}>{skill.resolvedName}</span>
                    {skill.resolvedStrength === 'strong' ? (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border border-[#1e2433]" />
                    ) : null}

                    {hoveredSkill === skill.resolvedName ? (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f1117] border border-white/20 rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-xl">
                        <p className="text-white text-xs font-semibold">{skill.resolvedName}</p>
                        <p className="text-gray-400 text-xs capitalize">{skill.resolvedStrength}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-xl font-bold text-green-400">{normalizedSkills.filter((s) => s.resolvedStrength === 'strong').length}</div>
          <div className="text-gray-500 text-xs mt-0.5">Strong Skills</div>
        </div>
        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-xl font-bold text-purple-400">{normalizedSkills.length}</div>
          <div className="text-gray-500 text-xs mt-0.5">Total Skills</div>
        </div>
        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-xl font-bold text-cyan-400">{Object.keys(grouped).length}</div>
          <div className="text-gray-500 text-xs mt-0.5">Domains</div>
        </div>
      </div>
    </section>
  );
}
