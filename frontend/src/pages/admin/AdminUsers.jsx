import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAdminUsers, updateUserRole, deleteAdminUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      
      const res = await getAdminUsers(params);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await updateUserRole(userId, newRole);
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setShowRoleModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      await deleteAdminUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setShowDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'admin':
        return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      default:
        return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#1a1033] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
                <h1 className="text-2xl font-bold text-white">Manage Users</h1>
                <p className="text-gray-400 text-sm">{pagination.total} users registered</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold uppercase">
              Admin
            </span>
          </div>

          {/* Users Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">All Users</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search users..."
                      className="flex-1 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400">No users found.</p>
              </div>
            ) : (
              <>
                {/* Users List */}
                <div className="divide-y divide-white/5">
                  {users.map((user) => (
                    <div key={user._id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-cyan-400 font-semibold text-lg">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{user.name}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                                {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                              {user._id === currentUser?._id && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>Track: {user.preferredTrack || 'Not set'}</span>
                              <span>Level: {user.experienceLevel || 'Not set'}</span>
                              <span>Skills: {user.skills?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                        {/* Actions */}
                        {user._id !== currentUser?._id && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowRoleModal(user)}
                              disabled={actionLoading === user._id || (user.role === 'super_admin' && !isSuperAdmin)}
                              className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(user)}
                              disabled={actionLoading === user._id || (user.role === 'super_admin' && !isSuperAdmin)}
                              className="px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="p-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchUsers(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchUsers(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Role Change Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] max-w-sm w-full p-6">
              <h3 className="font-semibold text-white text-lg mb-2">Change Role</h3>
              <p className="text-gray-400 text-sm mb-4">
                Select a new role for <span className="text-white font-medium">{showRoleModal.name}</span>
              </p>
              <div className="space-y-2 mb-6">
                {['user', 'admin', ...(isSuperAdmin ? ['super_admin'] : [])].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(showRoleModal._id, role)}
                    disabled={actionLoading === showRoleModal._id || showRoleModal.role === role}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      showRoleModal.role === role
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                        : 'bg-slate-900/40 border-white/10 text-gray-300 hover:border-white/20'
                    } disabled:opacity-50`}
                  >
                    <span className="font-medium capitalize">
                      {role === 'super_admin' ? 'Super Admin' : role}
                    </span>
                    {showRoleModal.role === role && (
                      <span className="text-xs ml-2">(Current)</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowRoleModal(null)}
                className="w-full py-2 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] max-w-sm w-full p-6">
              <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30 mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-lg text-center mb-2">Delete User</h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                Are you sure you want to delete <span className="text-white font-medium">{showDeleteModal.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-2 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal._id)}
                  disabled={actionLoading === showDeleteModal._id}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {actionLoading === showDeleteModal._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
