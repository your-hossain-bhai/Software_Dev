import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BriefcaseBusiness, ChartNoAxesColumn, Code2, FlaskConical, Palette, ServerCog, Smartphone } from 'lucide-react';
import MatchCircle from './charts/MatchCircle';
import { getCompanyLogo, getJobIcon, getSkillIcon } from '../utils/imageHelpers';

const roleIconMap = {
  palette: Palette,
  chart: ChartNoAxesColumn,
  server: ServerCog,
  code: Code2,
  smartphone: Smartphone,
  flask: FlaskConical,
  briefcase: BriefcaseBusiness,
};

export default function JobCard({ job, isSelected = false }) {
  const [logoError, setLogoError] = useState(false);

  const getSkillTagClass = (skill) => {
    const key = String(skill || '').toLowerCase();
    if (key.includes('react')) return 'bg-blue-500/20 text-blue-300 border-blue-500/35';
    if (key.includes('python')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/35';
    if (key.includes('node')) return 'bg-green-500/20 text-green-300 border-green-500/35';
    if (key.includes('mongo')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
    if (key.includes('figma')) return 'bg-purple-500/20 text-purple-300 border-purple-500/35';
    if (key.includes('express')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35';
    if (key.includes('sql')) return 'bg-orange-500/20 text-orange-300 border-orange-500/35';
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/35';
  };

  const roleKey = getJobIcon(job?.title || '');
  const RoleIcon = roleIconMap[roleKey] || BriefcaseBusiness;
  const logoUrl = getCompanyLogo(job?.company || '');

  return (
    <Link
      to={`/jobs/${job._id}`}
      className={`group block bg-white/[0.04] backdrop-blur-xl rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isSelected
          ? 'border-cyan-500/60 shadow-xl shadow-cyan-500/15 bg-gradient-to-r from-cyan-500/[0.08] to-blue-500/[0.08] ring-1 ring-cyan-500/30'
          : 'border-white/[0.08] hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10 bg-slate-800/70">
            {!logoError ? (
              <img
                src={logoUrl}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {job.company?.slice(0, 2)?.toUpperCase() || 'CO'}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-white text-lg group-hover:text-cyan-300 transition-colors flex items-center gap-2 truncate">
              <RoleIcon className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="truncate">{job.title}</span>
            </h4>
            <p className="text-gray-400 mt-1 truncate">{job.company}</p>
          </div>
        </div>
        {job.matchScore ? (
          <div className="shrink-0">
            <MatchCircle score={job.matchScore} size={78} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
        <span>{job.location}</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>{job.jobType}</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>{job.experienceLevel}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(job.requiredSkills || []).slice(0, 4).map((s) => (
          <span key={s} className={`text-sm px-3 py-1 rounded-lg font-medium border inline-flex items-center gap-1.5 ${getSkillTagClass(s)}`}>
            {getSkillIcon(s) ? (
              <img
                src={getSkillIcon(s)}
                alt=""
                aria-hidden="true"
                className="w-3.5 h-3.5 object-contain"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            {s}
          </span>
        ))}
        {(job.requiredSkills || []).length > 4 && (
          <span className="text-sm text-gray-500 px-2 py-1">+{job.requiredSkills.length - 4} more</span>
        )}
      </div>
    </Link>
  );
}