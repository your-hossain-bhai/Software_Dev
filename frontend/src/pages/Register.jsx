import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const TRACKS = ['Web', 'Data', 'Design', 'Mobile', 'Backend', 'Full Stack'];
const LEVELS = ['Fresher', 'Junior', 'Mid'];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    education: '',
    experienceLevel: 'Fresher',
    preferredTrack: 'Web',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      authLogin(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        const apiBase = err.apiBaseURL || 'configured API server';
        setError(`Cannot reach server (${apiBase}). Check VITE_API_URL and backend CORS_ORIGINS.`);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Start building your career path today"
    >
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="auth-label">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="auth-input"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="auth-label">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="auth-input"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="auth-label">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="auth-input"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="auth-label">Experience</label>
            <select
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              className="auth-select"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="auth-label">Track</label>
            <select
              name="preferredTrack"
              value={form.preferredTrack}
              onChange={handleChange}
              className="auth-select"
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      <p className="mt-6 text-sm text-gray-400 text-center">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
