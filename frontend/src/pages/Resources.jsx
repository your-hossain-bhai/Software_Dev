import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ResourceCard from '../components/ResourceCard';
import { getResources } from '../services/api';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({ skill: '', cost: '', platform: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources(filters)
      .then((res) => setResources(res.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient glow effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Learning Resources</h1>
                <p className="text-gray-400 mt-1">Curated courses and tutorials to accelerate your career growth</p>
              </div>
            </div>
          </div>

          {/* Filters - Glassmorphism Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 mb-8 shadow-xl">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px]">
                <input
                  type="text"
                  placeholder="Search by skill..."
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
              <select
                value={filters.cost}
                onChange={(e) => setFilters({ ...filters, cost: e.target.value })}
                className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all min-w-[140px] appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="" className="bg-slate-800">All pricing</option>
                <option value="Free" className="bg-slate-800">Free</option>
                <option value="Paid" className="bg-slate-800">Paid</option>
              </select>
              <div className="flex-1 min-w-[180px]">
                <input
                  type="text"
                  placeholder="Platform..."
                  value={filters.platform}
                  onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <svg className="animate-spin h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-400 text-lg">Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/10 mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg font-medium">No resources match your filters</p>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <ResourceCard key={r._id} resource={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
