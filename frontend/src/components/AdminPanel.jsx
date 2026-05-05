import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminPanel - A reusable component for displaying admin-only features
 * Only renders content when the user has admin or super_admin role
 * 
 * Usage:
 *   <AdminPanel>
 *     <AdminContent />
 *   </AdminPanel>
 * 
 * Or use the built-in admin dashboard:
 *   <AdminPanel showDashboard />
 */
export default function AdminPanel({ children, showDashboard = false, className = '' }) {
  const { user } = useAuth();
  
  // Role-based access check
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isSuperAdmin = user?.role === 'super_admin';

  // Don't render anything for non-admin users
  if (!isAdmin) return null;

  // If children provided, render them wrapped in admin container
  if (children && !showDashboard) {
    return (
      <div className={`admin-panel ${className}`}>
        {children}
      </div>
    );
  }

  // Default admin dashboard UI
  return (
    <div className={`bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] ${className}`}>
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
        <AdminLink
          to="/admin/users"
          icon={<UsersIcon />}
          iconClass="from-blue-500/20 to-indigo-500/20 border-blue-500/30"
          iconColor="text-blue-400"
          title="Manage Users"
          description="View & edit users"
        />
        <AdminLink
          to="/admin/jobs"
          icon={<JobsIcon />}
          iconClass="from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
          iconColor="text-emerald-400"
          title="Manage Jobs"
          description="Add & edit listings"
        />
        <AdminLink
          to="/admin/resources"
          icon={<ResourcesIcon />}
          iconClass="from-purple-500/20 to-pink-500/20 border-purple-500/30"
          iconColor="text-purple-400"
          title="Manage Resources"
          description="Curate learning content"
        />
        {isSuperAdmin && (
          <AdminLink
            to="/admin/settings"
            icon={<SettingsIcon />}
            iconClass="from-red-500/20 to-rose-500/20 border-red-500/30"
            iconColor="text-red-400"
            title="System Settings"
            description="Platform configuration"
          />
        )}
      </div>
    </div>
  );
}

// Reusable admin link component
function AdminLink({ to, icon, iconClass, iconColor, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconClass} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">{title}</span>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

// Icon components
function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ResourcesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// Utility hook for role checking
export function useIsAdmin() {
  const { user } = useAuth();
  return ['admin', 'super_admin'].includes(user?.role);
}

export function useIsSuperAdmin() {
  const { user } = useAuth();
  return user?.role === 'super_admin';
}

// Higher-order component for admin-only routes
export function withAdminAccess(Component) {
  return function AdminProtectedComponent(props) {
    const { user } = useAuth();
    const isAdmin = ['admin', 'super_admin'].includes(user?.role);
    
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033]">
          <div className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-red-500/20">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access this page.</p>
            <Link to="/dashboard" className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium">
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Admin badge component
export function AdminBadge({ className = '' }) {
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isSuperAdmin = user?.role === 'super_admin';
  
  if (!isAdmin) return null;
  
  return (
    <span className={`px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wide ${className}`}>
      {isSuperAdmin ? 'Super Admin' : 'Admin'}
    </span>
  );
}
