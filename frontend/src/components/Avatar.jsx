import { Link } from 'react-router-dom';

/**
 * Avatar - Reusable display avatar component
 * For navbar, cards, comments, etc.
 */
export default function Avatar({ 
  src, 
  name = '', 
  size = 'md',
  linkTo = null,
  onClick = null,
  showBorder = true,
  className = ''
}) {
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-2xl',
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const avatarContent = (
    <div
      className={`
        relative group rounded-full overflow-hidden
        ${sizeMap[size] || sizeMap.md}
        ${onClick || linkTo ? 'cursor-pointer' : ''}
        transition-all duration-200 ease-out
        ${onClick || linkTo ? 'hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Avatar Image or Initial */}
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
          {getInitial(name)}
        </div>
      )}

      {/* Gradient border ring */}
      {showBorder && (
        <div className="absolute inset-0 rounded-full ring-[1.5px] ring-transparent bg-gradient-to-br from-cyan-400 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity duration-200" style={{ padding: '1.5px', background: 'linear-gradient(135deg, #22d3ee, #a855f7)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', borderRadius: '9999px' }} />
      )}

      {/* Hover glow effect */}
      {(onClick || linkTo) && (
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-full">
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
}
