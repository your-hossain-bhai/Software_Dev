import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import Footer from './Footer';
import Avatar from './Avatar';
import { AdminBadge } from './AdminPanel';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const chatbotIconUrl = 'https://img.icons8.com/?size=100&id=LShLF30xSbPP&format=png&color=00d4ff';
  const dashboardIconUrl = 'https://img.icons8.com/?size=100&id=63915&format=png&color=9ca3af';
  const jobsIconUrl = 'https://img.icons8.com/?size=100&id=WbwGa2LgO2kI&format=png&color=9ca3af';
  const resourcesIconUrl = 'https://img.icons8.com/?size=100&id=z8bGQ63gOKRg&format=png&color=9ca3af';
  const profileIconUrl = 'https://img.icons8.com/?size=100&id=23280&format=png&color=9ca3af';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: (
      <img src={dashboardIconUrl} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
    )},
    { path: '/jobs', label: 'Jobs', icon: (
      <img src={jobsIconUrl} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
    )},
    { path: '/careerbot', label: 'CareerBot', icon: (
      <img src={chatbotIconUrl} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
    )},
    { path: '/resources', label: 'Resources', icon: (
      <img src={resourcesIconUrl} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
    )},
    { path: '/profile', label: 'Profile', icon: (
      <img src={profileIconUrl} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
    )},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a1033] font-sans">
      {/* Glassmorphism Navigation */}
      <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Brand size="small" />
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* User Profile Avatar */}
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="sm"
              linkTo="/profile"
            />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">{user?.name}</span>
              <AdminBadge />
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-xl transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
