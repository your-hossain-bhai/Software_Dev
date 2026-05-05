import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CardSkeleton, ChartSkeleton, GridCardSkeleton } from '../components/Skeletons';
import {
  getRecommendedJobs,
  getResources,
  getUserRoadmaps,
  generateRoadmap,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const RoadmapCard = lazy(() => import('../components/RoadmapCard'));
const JobCard = lazy(() => import('../components/JobCard'));
const Chatbot = lazy(() => import('../components/Chatbot'));
const SkillBubble = lazy(() => import('../components/charts/SkillBubble'));
const LearningDNAChart = lazy(() => import('../components/charts/LearningDNAChart'));
const ProgressChart = lazy(() => import('../components/charts/ProgressChart'));
const MatchCircle = lazy(() => import('../components/charts/MatchCircle'));
const AnimatedStat = lazy(() => import('../components/charts/AnimatedStat'));

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [resources, setResources] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [duration, setDuration] = useState(3);
  const [roadmapCreating, setRoadmapCreating] = useState(false);

  // Role-based access control
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getRecommendedJobs(),
      getResources(),
      getUserRoadmaps(),
    ])
      .then(([jr, rr, rm]) => {
        if (!mounted) return;
        setJobs(jr.data || []);
        setResources(rr.data?.slice(0, 6) || []);
        setRoadmaps(rm.data || []);
        setLoadError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setLoadError(err?.response?.data?.message || 'Could not load complete dashboard data. Showing available data.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setRoadmapCreating(true);
    try {
      const res = await generateRoadmap(targetRole.trim(), duration);
      setRoadmaps([res.data, ...roadmaps]);
      setShowRoadmapModal(false);
      setTargetRole('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create roadmap');
    } finally {
      setRoadmapCreating(false);
    }
  };

  const userSkills = (user?.skills || []).map((s) => s.name);
  const allMissing = [...new Set(jobs.flatMap((j) => j.missingSkills || []))].slice(0, 6);
  const todayInsight = userSkills.length === 0
    ? 'Add your first skills to unlock personalized job matching and Learning DNA insights.'
    : allMissing.length
    ? `Focus on ${allMissing[0]} today. Learners who close one targeted gap per week improve job-match quality significantly.`
    : 'Your core profile is strong. Improve interview narratives and ship one portfolio project this week.';

  const profileCompletion = useMemo(() => {
    const checkpoints = [
      Boolean(user?.name),
      Boolean(user?.education),
      Boolean(user?.experienceLevel),
      Boolean(user?.preferredTrack),
      userSkills.length > 0,
      (user?.interests || []).length > 0,
    ];

    const completed = checkpoints.filter(Boolean).length;
    return Math.round((completed / checkpoints.length) * 100);
  }, [user, userSkills.length]);

  const jobMatchScores = jobs
    .map((job) => Number(job?.matchScore))
    .filter((value) => Number.isFinite(value));
  const averageMatchScore = jobMatchScores.length
    ? Math.round(jobMatchScores.reduce((sum, value) => sum + value, 0) / jobMatchScores.length)
    : 0;

  const progressTrend = useMemo(() => {
    if (userSkills.length === 0) return [];

    const weightedStart = Math.max(18, Math.round((profileCompletion * 0.45) + (averageMatchScore * 0.35)));
    const gain = allMissing.length > 0 ? 28 : 18;

    return [
      { week: 'Week 1', score: Math.min(100, weightedStart) },
      { week: 'Week 2', score: Math.min(100, weightedStart + Math.round(gain * 0.22)) },
      { week: 'Week 3', score: Math.min(100, weightedStart + Math.round(gain * 0.4)) },
      { week: 'Week 4', score: Math.min(100, weightedStart + Math.round(gain * 0.62)) },
      { week: 'Week 5', score: Math.min(100, weightedStart + Math.round(gain * 0.82)) },
      { week: 'Week 6', score: Math.min(100, weightedStart + gain) },
    ];
  }, [userSkills.length, profileCompletion, averageMatchScore, allMissing.length]);

  const studentsLikeYouBars = [
    { role: 'Software Engineer', value: 85 },
    { role: 'Data Analyst', value: 70 },
    { role: 'UI/UX Designer', value: 50 },
  ];

  const improvementPotential = useMemo(() => {
    if (userSkills.length === 0) return 0;
    if (!allMissing.length) return 11;
    const estimate = Math.min(35, 8 + (allMissing.length * 3));
    return estimate;
  }, [userSkills.length, allMissing.length]);

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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient glow effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {loadError ? (
            <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {loadError}
            </div>
          ) : null}

          {/* Welcome Header Card */}
          <div className="mb-10 bg-gradient-to-r from-white/5 via-purple-500/[0.06] to-cyan-500/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden p-1">
                <img
                  src="/icons/welcome-badge.png"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover scale-125"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {user?.name}</h1>
                  {isAdmin && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wide">
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mt-1">Your personalized AI-powered career dashboard</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Profile Snapshot */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.1)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-lg">Profile Snapshot</h3>
                </div>
                <Link to="/profile" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center gap-1">
                  Edit
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="w-20 text-sm text-gray-400">Track</span>
                  <span className="text-sm font-medium text-white">{user?.preferredTrack || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="w-20 text-sm text-gray-400">Level</span>
                  <span className="text-sm font-medium text-white">{user?.experienceLevel || 'Not set'}</span>
                </div>
                <div className="flex items-start gap-4 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="w-20 text-sm text-gray-400 shrink-0">Skills</span>
                  <span className="text-sm text-gray-300">{userSkills.length ? userSkills.slice(0, 5).join(', ') : 'None added yet'}</span>
                </div>
              </div>
            </div>

            {/* Skills Gap */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.1)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg">Skills to Develop</h3>
              </div>
              {loading ? (
                <div className="flex items-center gap-3 p-4">
                  <svg className="animate-spin h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Analyzing skill gaps...</span>
                </div>
              ) : allMissing.length ? (
                <div className="flex flex-wrap gap-2">
                  {allMissing.map((s) => (
                    <span key={s} className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-[1.02] ${getSkillTagClass(s)}`}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm p-4 bg-slate-900/40 rounded-xl border border-white/5">Add skills and browse jobs to identify gaps.</p>
              )}
            </div>
          </div>

          {/* Visual analytics */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Suspense fallback={<ChartSkeleton />}>
              <LearningDNAChart user={user} />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <SkillBubble skills={user?.skills} />
            </Suspense>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/35 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <p className="text-sm text-cyan-200 font-medium">Today&apos;s Insight</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{todayInsight}</p>
            <p className="text-xs text-gray-500 mt-2">
              Improvement potential: {improvementPotential}% this week by focusing on one narrow gap.
            </p>
          </div>

          <div className="mb-8">
            <Suspense fallback={<ChartSkeleton />}>
              <ProgressChart data={progressTrend} />
            </Suspense>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Students like you</p>
                  <h3 className="text-xl font-semibold text-white">Social proof with motion and visual comparison</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">Live benchmarks</span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Suspense fallback={<CardSkeleton />}>
                  <AnimatedStat
                    value={85}
                    suffix="%"
                    label="similar learners became Software Engineers"
                    accent="text-cyan-300"
                  />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                  <AnimatedStat
                    value={78}
                    suffix="%"
                    label="improved job match score in 30 days"
                    accent="text-purple-300"
                  />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                  <AnimatedStat
                    value={4.8}
                    suffix="/5"
                    decimals={1}
                    label="average confidence in portfolio reviews"
                    accent="text-emerald-300"
                  />
                </Suspense>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-900/35 p-4">
                {studentsLikeYouBars.map((item) => (
                  <div key={item.role}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.role}</span>
                      <span className="font-semibold text-cyan-200">{item.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full border border-white/10 bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Career match</p>
              <p className="text-lg font-semibold text-white">Your profile is trending toward high-fit roles</p>
              <div className="my-5 flex justify-center">
                <Suspense fallback={<div className="w-[124px] h-[124px] rounded-full border border-white/10 bg-white/5 animate-pulse" />}>
                  <MatchCircle score={averageMatchScore} />
                </Suspense>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">The more complete your Learning DNA becomes, the sharper your recommendations become across jobs, resources, and chatbot guidance.</p>
            </div>
          </div>

          {/* Admin Panel - Only visible to admins */}
          {isAdmin && (
            <div className="mb-8 bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Admin Dashboard</h3>
                  <p className="text-sm text-gray-400">Manage platform content and users</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/admin/users"
                  className="group flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">Manage Users</span>
                    <p className="text-xs text-gray-500">View & edit users</p>
                  </div>
                </Link>
                <Link
                  to="/admin/jobs"
                  className="group flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">Manage Jobs</span>
                    <p className="text-xs text-gray-500">Add & edit listings</p>
                  </div>
                </Link>
                <Link
                  to="/admin/resources"
                  className="group flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">Manage Resources</span>
                    <p className="text-xs text-gray-500">Curate learning content</p>
                  </div>
                </Link>
                {isSuperAdmin && (
                  <Link
                    to="/admin/settings"
                    className="group flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">System Settings</span>
                      <p className="text-xs text-gray-500">Platform configuration</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Learning Resources */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg">Learning Resources</h3>
              </div>
              <Link to="/resources" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center gap-1">
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <a
                  key={r._id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300 hover:-translate-y-1"
                >
                  <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{r.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{r.platform} • {r.cost}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(r.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-medium border border-purple-500/20">{s}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Your Roadmaps Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg">Your Roadmaps</h3>
              </div>
              <button
                onClick={() => setShowRoadmapModal(true)}
                className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:border-cyan-400/50 hover:text-cyan-300 transition-all"
              >
                + Create new
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roadmaps.length ? (
                <Suspense fallback={<GridCardSkeleton count={3} />}>
                  {roadmaps.slice(0, 3).map((r) => <RoadmapCard key={r._id} roadmap={r} />)}
                </Suspense>
              ) : (
                <div className="sm:col-span-2 lg:col-span-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl flex items-center justify-center border border-white/10 mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">No roadmaps yet. Create one to track your progress.</p>
                  <button
                    onClick={() => setShowRoadmapModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20"
                  >
                    Create your first roadmap
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg">Recommended Jobs</h3>
              </div>
              <Link to="/jobs" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center gap-1">
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center gap-3 p-6 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/10">
                <svg className="animate-spin h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-400">Loading recommendations...</span>
              </div>
            ) : (
              <Suspense fallback={<GridCardSkeleton count={6} />}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {jobs.slice(0, 6).map((job) => <JobCard key={job._id} job={job} />)}
                </div>
              </Suspense>
            )}
          </div>

          {/* Career Assistant */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center border border-cyan-500/30">
                  <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">AI Career Assistant</h3>
                  <p className="text-sm text-gray-400">Use quick actions to get focused next steps</p>
                </div>
              </div>
              <Link to="/careerbot" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">
                Open full chat
              </Link>
            </div>
            <Suspense fallback={<ChartSkeleton />}>
              <Chatbot compact />
            </Suspense>
          </div>

          {/* Roadmap Modal */}
          {showRoadmapModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] max-w-md w-full p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-xl">Create Career Roadmap</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6 ml-13">Generate a personalized AI-powered learning path for your target role.</p>
                <form onSubmit={handleCreateRoadmap} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                      <option value={3} className="bg-slate-800">3 months</option>
                      <option value={6} className="bg-slate-800">6 months</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowRoadmapModal(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/5 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={roadmapCreating}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {roadmapCreating ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        'Create Roadmap'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
