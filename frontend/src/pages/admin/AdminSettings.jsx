import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">System Settings</h1>
                <p className="text-gray-400 text-sm">Platform configuration (Super Admin only)</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 rounded-full text-red-400 text-xs font-semibold uppercase">
              Super Admin
            </span>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="NextCareer"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@nextcareer.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">AI Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
                  <select className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option>llama-3.3-70b-versatile (Groq)</option>
                    <option>GPT-4 (OpenAI)</option>
                    <option>Claude 3 (Anthropic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens per Response</label>
                  <input
                    type="number"
                    defaultValue="2048"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Feature Flags</h2>
              <div className="space-y-4">
                {[
                  { name: 'CareerBot', description: 'AI-powered career assistant', enabled: true },
                  { name: 'Roadmap Generator', description: 'AI career roadmap creation', enabled: true },
                  { name: 'CV Parsing', description: 'Automatic skill extraction from CVs', enabled: true },
                  { name: 'Job Matching', description: 'AI-based job recommendations', enabled: true },
                ].map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5">
                    <div>
                      <span className="text-white font-medium">{feature.name}</span>
                      <p className="text-gray-500 text-sm">{feature.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={feature.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-br from-red-500/5 to-rose-500/5 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6">
              <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-red-500/20">
                  <div>
                    <span className="text-white font-medium">Reset All User Data</span>
                    <p className="text-gray-500 text-sm">This will delete all user accounts and data. Irreversible.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/30 transition-colors">
                    Reset Data
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-red-500/20">
                  <div>
                    <span className="text-white font-medium">Clear AI Chat History</span>
                    <p className="text-gray-500 text-sm">Delete all CareerBot conversations for all users.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/30 transition-colors">
                    Clear History
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
