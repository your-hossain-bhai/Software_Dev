import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Printer, WandSparkles } from 'lucide-react';
import Layout from '../components/Layout';
import CVPreview from '../components/CVPreview';
import { getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

function buildSummary(user) {
  const skills = (user?.skills || [])
    .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
    .filter(Boolean);

  const topSkills = skills.slice(0, 4).join(', ');
  const level = user?.experienceLevel ? user.experienceLevel.toLowerCase() : 'entry-level';
  const track = user?.preferredTrack || 'technology';

  if (!skills.length) {
    return `Motivated ${level} candidate focused on ${track.toLowerCase()}, actively building practical skills and projects to contribute to modern teams.`;
  }

  return `Motivated ${level} ${track.toLowerCase()} professional with hands-on experience in ${topSkills}, focused on building practical, user-centered solutions and growing in high-impact product teams.`;
}

function buildTips(user) {
  const tips = [];
  const skillsCount = (user?.skills || []).length;

  if (!user?.education) {
    tips.push('Add your education details clearly to improve recruiter trust and ATS completeness.');
  }
  if (skillsCount < 5) {
    tips.push('Add 3-5 more job-relevant skills to improve match quality and CV strength.');
  }
  if (!(user?.interests || []).length) {
    tips.push('Add interests to highlight direction and motivation for your target track.');
  }

  tips.push('Highlight measurable outcomes in project descriptions, such as performance, users, or completion rate.');
  tips.push('Add your GitHub or portfolio projects and keep screenshots or demos ready for interviews.');

  return tips;
}

function createEmptyProject() {
  return {
    name: '',
    techStack: '',
    bullets: [
      'Built a practical solution that addresses a real user problem.',
      'Implemented core features and optimized for usability/performance.',
      'Documented outcomes and technical decisions for recruiter review.',
    ],
  };
}

function createEmptyCertification() {
  return { name: '', organization: '', duration: '' };
}

function createEmptyAchievement() {
  return { event: '', role: '', outcome: '' };
}

export default function CVAssistant() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState('');
  const [resumeData, setResumeData] = useState({
    phone: '',
    linkedin: '',
    github: '',
    title: '',
    degree: '',
    university: '',
    educationDuration: '',
    projects: [createEmptyProject()],
    certifications: [createEmptyCertification()],
    achievements: [createEmptyAchievement()],
  });
  const printAreaRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((res) => {
        if (!mounted) return;
        setProfile(res.data || user || null);
      })
      .catch(() => {
        if (!mounted) return;
        setProfile(user || null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    setSummary(buildSummary(profile));

    setResumeData((prev) => ({
      ...prev,
      title: prev.title || `${profile?.preferredTrack || 'Software'} Developer | ${profile?.experienceLevel || 'Entry-level'} Candidate`,
      degree: prev.degree || profile?.education || '',
    }));
  }, [profile]);

  const tips = useMemo(() => buildTips(profile), [profile]);

  const handlePrint = () => {
    window.print();
  };

  const updateResumeField = (field, value) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const updateProject = (index, field, value) => {
    setResumeData((prev) => {
      const nextProjects = [...prev.projects];
      nextProjects[index] = { ...nextProjects[index], [field]: value };
      return { ...prev, projects: nextProjects };
    });
  };

  const updateProjectBullets = (index, rawText) => {
    const bullets = rawText
      .split('\n')
      .map((line) => line.replace(/^[-*•\s]+/, '').trim())
      .filter(Boolean);

    setResumeData((prev) => {
      const nextProjects = [...prev.projects];
      nextProjects[index] = { ...nextProjects[index], bullets };
      return { ...prev, projects: nextProjects };
    });
  };

  const addProject = () => {
    setResumeData((prev) => ({ ...prev, projects: [...prev.projects, createEmptyProject()] }));
  };

  const removeProject = (index) => {
    setResumeData((prev) => {
      const nextProjects = prev.projects.filter((_, projectIndex) => projectIndex !== index);
      return { ...prev, projects: nextProjects.length ? nextProjects : [createEmptyProject()] };
    });
  };

  const updateCertification = (index, field, value) => {
    setResumeData((prev) => {
      const nextItems = [...prev.certifications];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, certifications: nextItems };
    });
  };

  const addCertification = () => {
    setResumeData((prev) => ({ ...prev, certifications: [...prev.certifications, createEmptyCertification()] }));
  };

  const removeCertification = (index) => {
    setResumeData((prev) => {
      const nextItems = prev.certifications.filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, certifications: nextItems.length ? nextItems : [createEmptyCertification()] };
    });
  };

  const updateAchievement = (index, field, value) => {
    setResumeData((prev) => {
      const nextItems = [...prev.achievements];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, achievements: nextItems };
    });
  };

  const addAchievement = () => {
    setResumeData((prev) => ({ ...prev, achievements: [...prev.achievements, createEmptyAchievement()] }));
  };

  const removeAchievement = (index) => {
    setResumeData((prev) => {
      const nextItems = prev.achievements.filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, achievements: nextItems.length ? nextItems : [createEmptyAchievement()] };
    });
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setExporting(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      await html2pdf()
        .set({
          margin: [0.4, 0.4, 0.4, 0.4],
          filename: `${(profile?.name || 'nextcareer-cv').replace(/\s+/g, '-').toLowerCase()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(printAreaRef.current)
        .save();
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="h-10 w-52 bg-white/10 rounded-lg animate-pulse mb-6" />
            <div className="h-[600px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8 print:bg-white print:p-0">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6 print:hidden">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 print:hidden">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">CV / Profile Assistant</h1>
              <p className="text-gray-400 mt-1">Generate a clean, job-ready CV from your profile and export instantly.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <Printer className="w-4 h-4" />
                Print CV
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Generating PDF...' : 'Download as PDF'}
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1fr_320px] gap-6 print:block">
            <div ref={printAreaRef} className="print:shadow-none print:border-none print:rounded-none">
              <CVPreview
                profile={profile || {}}
                summary={summary}
                resumeData={resumeData}
              />
            </div>

            <aside className="print:hidden space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                <h2 className="text-white font-semibold mb-3">Summary Editor</h2>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <h2 className="text-white font-semibold">Contact & Title</h2>
                <input
                  value={resumeData.phone}
                  onChange={(e) => updateResumeField('phone', e.target.value)}
                  placeholder="Phone"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
                <input
                  value={resumeData.linkedin}
                  onChange={(e) => updateResumeField('linkedin', e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
                <input
                  value={resumeData.github}
                  onChange={(e) => updateResumeField('github', e.target.value)}
                  placeholder="GitHub URL"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
                <input
                  value={resumeData.title}
                  onChange={(e) => updateResumeField('title', e.target.value)}
                  placeholder="Professional title"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <h2 className="text-white font-semibold">Education Details</h2>
                <input
                  value={resumeData.degree}
                  onChange={(e) => updateResumeField('degree', e.target.value)}
                  placeholder="Degree"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
                <input
                  value={resumeData.university}
                  onChange={(e) => updateResumeField('university', e.target.value)}
                  placeholder="University"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
                <input
                  value={resumeData.educationDuration}
                  onChange={(e) => updateResumeField('educationDuration', e.target.value)}
                  placeholder="Duration (e.g. 2021 - 2025)"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/40 text-slate-100 px-3 py-2 text-sm"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">Projects</h2>
                  <button onClick={addProject} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">+ Add</button>
                </div>
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="rounded-xl border border-white/10 p-3 space-y-2 bg-slate-900/40">
                    <input
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      placeholder="Project name"
                      className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs"
                    />
                    <input
                      value={project.techStack}
                      onChange={(e) => updateProject(index, 'techStack', e.target.value)}
                      placeholder="Tech stack"
                      className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs"
                    />
                    <textarea
                      value={(project.bullets || []).join('\n')}
                      onChange={(e) => updateProjectBullets(index, e.target.value)}
                      rows={4}
                      placeholder="One bullet per line"
                      className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs"
                    />
                    <button onClick={() => removeProject(index)} className="text-[11px] text-red-300 hover:text-red-200">Remove</button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">Certifications</h2>
                  <button onClick={addCertification} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">+ Add</button>
                </div>
                {resumeData.certifications.map((item, index) => (
                  <div key={index} className="rounded-xl border border-white/10 p-3 space-y-2 bg-slate-900/40">
                    <input value={item.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} placeholder="Course name" className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs" />
                    <input value={item.organization} onChange={(e) => updateCertification(index, 'organization', e.target.value)} placeholder="Organization" className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs" />
                    <input value={item.duration} onChange={(e) => updateCertification(index, 'duration', e.target.value)} placeholder="Duration" className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs" />
                    <button onClick={() => removeCertification(index)} className="text-[11px] text-red-300 hover:text-red-200">Remove</button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">Achievements / Hackathons</h2>
                  <button onClick={addAchievement} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">+ Add</button>
                </div>
                {resumeData.achievements.map((item, index) => (
                  <div key={index} className="rounded-xl border border-white/10 p-3 space-y-2 bg-slate-900/40">
                    <input value={item.event} onChange={(e) => updateAchievement(index, 'event', e.target.value)} placeholder="Event name" className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs" />
                    <input value={item.role} onChange={(e) => updateAchievement(index, 'role', e.target.value)} placeholder="Role" className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs" />
                    <input value={item.outcome} onChange={(e) => updateAchievement(index, 'outcome', e.target.value)} placeholder="Outcome" className="w-full rounded-lg border border-white/15 bg-slate-950/50 text-slate-100 px-3 py-2 text-xs" />
                    <button onClick={() => removeAchievement(index)} className="text-[11px] text-red-300 hover:text-red-200">Remove</button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <WandSparkles className="w-5 h-5 text-cyan-300" />
                  <h2 className="text-white font-semibold">Profile Improvement Tips</h2>
                </div>
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 border border-white/10 rounded-xl p-3">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
