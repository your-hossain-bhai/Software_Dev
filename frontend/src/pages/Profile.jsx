import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProfileAvatar from '../components/ProfileAvatar';
import { updateProfile, extractSkills, extractSkillsFromPDF, mergeSkills } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { parseSkillInput, normalizeExtractedSkills } from '../utils/skillUtils';

const TRACKS = ['Web', 'Data', 'Design', 'Mobile', 'Backend', 'Full Stack'];
const LEVELS = ['Fresher', 'Junior', 'Mid'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    education: '',
    experienceLevel: 'Fresher',
    preferredTrack: 'Web',
    skills: [],
    cvText: '',
    interests: [],
    avatar: null,
  });
  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [cvExtracting, setCvExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [cvUploadMode, setCvUploadMode] = useState('text'); // 'text' or 'pdf'
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const pdfInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        education: user.education || '',
        experienceLevel: user.experienceLevel || 'Fresher',
        preferredTrack: user.preferredTrack || 'Web',
        skills: user.skills || [],
        cvText: user.cvText || '',
        interests: user.interests || [],
        avatar: user.avatar || null,
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = (file) => {
    setAvatarFile(file); // Store the actual file for FormData upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result); // Preview only
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const input = skillInput.trim();
    if (!input) return;
    
    // Parse comma-separated skills with proper capitalization
    const newSkills = parseSkillInput(input);
    if (newSkills.length === 0) return;
    
    // Filter out duplicates
    const existingNames = new Set(form.skills.map(s => s.name.toLowerCase()));
    const uniqueNewSkills = newSkills.filter(s => !existingNames.has(s.name.toLowerCase()));
    
    if (uniqueNewSkills.length > 0) {
      setForm({ ...form, skills: [...form.skills, ...uniqueNewSkills] });
    }
    setSkillInput('');
  };

  const removeSkill = (idx) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) });
  };

  const addInterest = () => {
    const input = interestInput.trim();
    if (!input) return;
    
    // Parse comma-separated interests
    const newInterests = input
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)
      .map(i => {
        // Capitalize first letter of each word
        return i.split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      });
    
    // Filter out duplicates (case insensitive)
    const existingLower = new Set(form.interests.map(i => i.toLowerCase()));
    const uniqueInterests = newInterests.filter(i => !existingLower.has(i.toLowerCase()));
    
    if (uniqueInterests.length > 0) {
      setForm({ ...form, interests: [...form.interests, ...uniqueInterests] });
    }
    setInterestInput('');
  };

  const removeInterest = (idx) => {
    setForm({ ...form, interests: form.interests.filter((_, i) => i !== idx) });
  };

  const handleExtractSkills = async () => {
    if (!form.cvText.trim()) return;
    setCvExtracting(true);
    setExtractedSkills([]);
    try {
      const res = await extractSkills(form.cvText);
      // Normalize extracted skills
      const normalized = normalizeExtractedSkills(res.data.skills || []);
      setExtractedSkills(normalized);
    } catch {
      setExtractedSkills([]);
    } finally {
      setCvExtracting(false);
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    setPdfError('');
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('File size must be less than 5MB');
      return;
    }
    
    setPdfFile(file);
  };

  const handleExtractFromPdf = async () => {
    if (!pdfFile) return;
    setCvExtracting(true);
    setExtractedSkills([]);
    setPdfError('');
    
    try {
      const res = await extractSkillsFromPDF(pdfFile);
      const normalized = normalizeExtractedSkills(res.data.skills || []);
      setExtractedSkills(normalized);
      // Also populate the text area if text was extracted
      if (res.data.extractedText) {
        setForm({ ...form, cvText: res.data.extractedText });
      }
    } catch (err) {
      setPdfError(err.response?.data?.message || 'Failed to extract skills from PDF');
      setExtractedSkills([]);
    } finally {
      setCvExtracting(false);
    }
  };

  const clearPdfFile = () => {
    setPdfFile(null);
    setPdfError('');
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const handleMergeSkills = async () => {
    if (!extractedSkills.length) return;
    try {
      const res = await mergeSkills(extractedSkills);
      refreshUser(res.data);
      setForm({ ...form, skills: res.data.skills || [] });
      setExtractedSkills([]);
      setMessage({ type: 'success', text: 'Skills merged successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Merge failed' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = { ...form, avatarFile };
      const res = await updateProfile(payload);
      refreshUser(res.data);
      setMessage({ type: 'success', text: 'Profile saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient glow effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Profile Settings</h1>
                <p className="text-gray-400 text-lg mt-1">Manage your information and skills for better career recommendations</p>
              </div>
            </div>
              <Link
                to="/cv-assistant"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Open CV Assistant
              </Link>
            </div>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`mb-8 p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* Profile Card with Avatar */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar Section - Compact */}
                <ProfileAvatar
                  src={avatarPreview}
                  name={form.name}
                  onUpload={handleAvatarUpload}
                />

                {/* Basic Info */}
                <div className="flex-1 w-full">
                  <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-3 bg-slate-900/30 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
                      <input
                        type="text"
                        name="education"
                        value={form.education}
                        onChange={handleChange}
                        placeholder="e.g. BSc in Computer Science"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                      <select
                        name="experienceLevel"
                        value={form.experienceLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all
                                   appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l} className="bg-slate-800">{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Track</label>
                      <select
                        name="preferredTrack"
                        value={form.preferredTrack}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all
                                   appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        {TRACKS.map((t) => (
                          <option key={t} value={t} className="bg-slate-800">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Skills
              </h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add skills (e.g. React, Python, Machine Learning)"
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 
                             text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20"
                >
                  Add
                </button>
              </div>
              {form.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 
                                 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium
                                 hover:border-cyan-400/50 transition-all group"
                    >
                      {s.name}
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
                        className="text-cyan-400/60 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No skills added yet. Add skills manually or extract from your CV below.</p>
              )}
            </div>

            {/* CV Extract Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Extract Skills from CV
              </h3>
              <p className="text-gray-400 mb-6">Upload a PDF or paste your resume text to automatically identify skills</p>
              
              {/* Upload Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setCvUploadMode('text')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    cvUploadMode === 'text'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-900/50 text-gray-400 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Paste Text
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCvUploadMode('pdf')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    cvUploadMode === 'pdf'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-900/50 text-gray-400 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload PDF
                  </span>
                </button>
              </div>

              {/* Text Mode */}
              {cvUploadMode === 'text' && (
                <>
                  <textarea
                    name="cvText"
                    value={form.cvText}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Paste your CV or resume text here..."
                    className="w-full px-4 py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleExtractSkills}
                    disabled={cvExtracting || !form.cvText.trim()}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400
                               text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {cvExtracting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Extracting...
                      </span>
                    ) : (
                      'Extract Skills'
                    )}
                  </button>
                </>
              )}

              {/* PDF Mode */}
              {cvUploadMode === 'pdf' && (
                <div className="space-y-4">
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      pdfFile 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-white/20 hover:border-white/30 bg-slate-900/30'
                    }`}
                  >
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {pdfFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-emerald-300 font-medium">{pdfFile.name}</p>
                          <p className="text-gray-500 text-sm">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); clearPdfFile(); }}
                          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-300">Drop your PDF here or click to browse</p>
                          <p className="text-gray-500 text-sm">Maximum file size: 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {pdfError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-300 text-sm">{pdfError}</p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleExtractFromPdf}
                    disabled={cvExtracting || !pdfFile}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400
                               text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {cvExtracting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing PDF...
                      </span>
                    ) : (
                      'Extract Skills from PDF'
                    )}
                  </button>
                </div>
              )}
              {extractedSkills.length > 0 && (
                <div className="mt-6 p-5 bg-slate-900/50 border border-white/10 rounded-xl">
                  <p className="text-sm font-medium text-gray-300 mb-4">Extracted skills:</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {extractedSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 
                                   rounded-full text-emerald-300 text-sm font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleMergeSkills}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400
                               text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
                  >
                    Merge with Profile
                  </button>
                </div>
              )}
            </div>

            {/* Interests Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Career Interests
              </h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  placeholder="Add interests (e.g. AI, Startups, Remote Work)"
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 
                             text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/20"
                >
                  Add
                </button>
              </div>
              {form.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.interests.map((i, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 
                                 border border-pink-500/30 rounded-full text-pink-300 text-sm font-medium
                                 hover:border-pink-400/50 transition-all group"
                    >
                      {i}
                      <button
                        type="button"
                        onClick={() => removeInterest(idx)}
                        className="text-pink-400/60 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No interests added yet</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 
                           hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500
                           text-white font-semibold rounded-full transition-all duration-300 
                           shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                           transform hover:-translate-y-0.5"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
