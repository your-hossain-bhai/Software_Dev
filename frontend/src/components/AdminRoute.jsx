import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute - Protects routes that require admin or super_admin role
 * 
 * Usage:
 *   <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
 * 
 * Behavior:
 * - Loading: shows loading spinner
 * - Not logged in: redirects to /login
 * - Logged in but not admin: redirects to /dashboard
 * - Admin or super_admin: renders children
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin privileges (admin OR super_admin)
  const isAdmin = ['admin', 'super_admin'].includes(user.role);

  // Not admin - redirect to dashboard with access denied
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
  }

  // User is admin or super_admin - render the protected content
  return children;
}

/**
 * SuperAdminRoute - Protects routes that require super_admin role only
 * 
 * Usage:
 *   <Route path="/admin/settings" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />
 */
export function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only super_admin can access
  if (user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
  }

  return children;
}
