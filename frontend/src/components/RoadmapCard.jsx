import { Link } from 'react-router-dom';

export default function RoadmapCard({ roadmap }) {
  return (
    <Link
      to={`/roadmap/${roadmap._id}`}
      className="group block bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{roadmap.targetRole}</h4>
          <p className="text-sm text-gray-400 mt-1">{roadmap.duration} months</p>
        </div>
        <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-medium">
          {roadmap.steps?.length || 0} steps
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Created {new Date(roadmap.createdAt).toLocaleDateString()}
        </p>
        <svg className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
