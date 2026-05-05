import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ExternalLink, Sparkles, Target } from 'lucide-react';
import Layout from '../components/Layout';
import { GridCardSkeleton } from '../components/Skeletons';
import { getJobs, getJobMatchDetail } from '../services/api';
import { getSkillIcon } from '../utils/imageHelpers';

const JobCard = lazy(() => import('../components/JobCard'));

export default function Jobs() {
  const { id } = useParams();
  const [jobs, setJobs] = useState([]);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({ role: '', location: '', type: '', experienceLevel: '' });
  const [loading, setLoading] = useState(true);
  const detailPanelRef = useRef(null);

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

  useEffect(() => {
    getJobs(filters)
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    getJobMatchDetail(id)
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(null));
    
    // Scroll detail panel to top when job changes
    if (detailPanelRef.current) {
      detailPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient glow effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Job Opportunities</h1>
                <p className="text-gray-400 mt-1">Find roles that match your skills and career goals</p>
              </div>
            </div>
          </div>

          {/* Filters - Glassmorphism Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 mb-8 shadow-xl">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[160px]">
                <input
                  type="text"
                  placeholder="Search role..."
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <input
                  type="text"
                  placeholder="Location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all min-w-[140px] appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="" className="bg-slate-800">All types</option>
                <option value="Internship" className="bg-slate-800">Internship</option>
                <option value="Part-time" className="bg-slate-800">Part-time</option>
                <option value="Full-time" className="bg-slate-800">Full-time</option>
                <option value="Freelance" className="bg-slate-800">Freelance</option>
              </select>
              <select
                value={filters.experienceLevel}
                onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all min-w-[140px] appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="" className="bg-slate-800">All levels</option>
                <option value="Fresher" className="bg-slate-800">Fresher</option>
                <option value="Junior" className="bg-slate-800">Junior</option>
                <option value="Mid" className="bg-slate-800">Mid</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Job list */}
            <div>
              {loading ? (
                <GridCardSkeleton count={5} />
              ) : jobs.length === 0 ? (
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/10 mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">No jobs match your filters</p>
                  <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                </div>
              ) : (
                <Suspense fallback={<GridCardSkeleton count={5} />}>
                  <div className="space-y-4">
                    {jobs.map((job) => <JobCard key={job._id} job={job} isSelected={id === job._id} />)}
                  </div>
                </Suspense>
              )}
            </div>

            {/* Job detail + match */}
            <div>
              {detail ? (
                <div 
                  ref={detailPanelRef}
                  className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-xl sticky top-20 overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                  {/* Header with Apply CTA */}
                  <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-slate-800/50 via-blue-900/20 to-slate-800/50 relative overflow-hidden">
                    <Sparkles className="absolute -right-3 -top-3 w-24 h-24 text-cyan-300/10" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-white">{detail.job?.title}</h3>
                        <p className="text-gray-400 mt-2">{detail.job?.company} • {detail.job?.location}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full shadow-lg shadow-cyan-500/20">
                            {detail.matchScore}% match
                          </span>
                          <span className="text-sm text-gray-400 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5">{detail.job?.jobType}</span>
                          <span className="text-sm text-cyan-200 px-3 py-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 inline-flex items-center gap-1.5">
                            <Target className="w-4 h-4" />
                            Fit signal active
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-slate-900/60" style={{ background: `conic-gradient(#22d3ee ${Math.max(0, Math.min(100, detail.matchScore || 0)) * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }}>
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-semibold text-cyan-200">
                          {Math.max(0, Math.min(100, detail.matchScore || 0))}%
                        </div>
                      </div>
                      
                      {/* Primary Apply CTA - Always visible */}
                      {(detail.job?.applyLinks || []).length > 0 && (
                        <div className="shrink-0">
                          <a
                            href={detail.job.applyLinks[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Apply for ${detail.job?.title} on ${detail.job.applyLinks[0].platform}`}
                            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                          >
                            {/* Glow effect */}
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                            <span className="relative flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                              Apply Now
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Analysis */}
                  <div className="p-6 space-y-6">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70 mb-2">Why this match?</p>
                      <p className="text-gray-200 leading-relaxed">{detail.explanation}</p>
                      <div className="mt-4 grid sm:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                          <p className="text-xs text-emerald-300 uppercase tracking-wide">Matched</p>
                          <p className="text-sm text-emerald-100 mt-1">{(detail.matchedSkills || []).length} core skills align with this role</p>
                        </div>
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                          <p className="text-xs text-amber-300 uppercase tracking-wide">Gap</p>
                          <p className="text-sm text-amber-100 mt-1">{(detail.missingSkills || []).length} skills need focused improvement</p>
                        </div>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          Matched skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(detail.matchedSkills || []).length > 0 ? (
                            detail.matchedSkills.map((s) => (
                              <span key={s} className={`text-sm px-3 py-1.5 rounded-full font-medium border inline-flex items-center gap-1.5 ${getSkillTagClass(s)}`}>
                                {getSkillIcon(s) ? (
                                  <img
                                    src={getSkillIcon(s)}
                                    alt={s}
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
                            ))
                          ) : (
                            <div className="w-full rounded-xl border border-white/10 bg-slate-900/40 p-4 text-center">
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                                alt="No matching skills"
                                className="w-14 h-14 mx-auto mb-2 opacity-70"
                                loading="lazy"
                                decoding="async"
                              />
                              <span className="text-gray-400 text-sm">No matched skills yet. Start with one high-impact skill.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                          Missing skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(detail.missingSkills || []).length > 0 ? (
                            detail.missingSkills.map((s) => (
                              <span key={s} className="text-sm px-3 py-1.5 rounded-full font-medium border bg-amber-500/15 text-amber-200 border-amber-500/30 inline-flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-400 font-medium">You have all required skills!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Resources */}
                    {detail.recommendedResources?.length > 0 && (
                      <div>
                        <p className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Resources to help you
                        </p>
                        <ul className="space-y-2">
                          {detail.recommendedResources.map((r) => (
                            <li key={r._id}>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group"
                              >
                                <span className="w-2 h-2 bg-purple-400 rounded-full shrink-0" />
                                <span className="text-gray-300 group-hover:text-purple-300 transition-colors">{r.title}</span>
                                <span className="text-gray-500 text-sm">({r.platform})</span>
                                <ExternalLink className="w-4 h-4 text-purple-300/60 ml-auto" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional Apply Links (if multiple platforms) */}
                    {(detail.job?.applyLinks || []).length > 1 && (
                      <div className="pt-5 border-t border-white/[0.08]">
                        <p className="text-sm text-gray-400 mb-3">Also available on:</p>
                        <div className="flex flex-wrap gap-2">
                          {detail.job.applyLinks.slice(1).map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Apply on ${link.platform}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white text-sm font-medium rounded-full border border-white/10 hover:border-white/20 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {link.platform}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-12 text-center sticky top-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800/80 to-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white text-xl font-semibold">Select a job</p>
                  <p className="text-gray-400 mt-2">Click on a job to see match analysis and skill gaps</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
