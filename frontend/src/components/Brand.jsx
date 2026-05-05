import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Brand - Reusable text-based brand component for navbar
 * Stylish gradient text with glow effect
 * Links to "/" for guests, "/dashboard" for logged-in users
 */
export default function Brand({ className = '', size = 'default' }) {
  const { user } = useAuth();
  const linkTo = user ? '/dashboard' : '/';
  
  const sizeClasses = {
    small: 'text-xl md:text-2xl',
    default: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl',
  };

  return (
    <Link 
      to={linkTo} 
      className={`cursor-pointer select-none transition-all duration-300 hover:scale-105 ${className}`}
    >
      <span 
        className={`font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent
                    drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]
                    ${sizeClasses[size] || sizeClasses.default}`}
      >
        NextCareer
      </span>
    </Link>
  );
}
