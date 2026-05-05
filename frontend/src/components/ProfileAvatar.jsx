import { useRef, useState } from 'react';

/**
 * ProfileAvatar - Compact avatar with upload functionality
 * Designed for profile settings page (secondary visual)
 */
export default function ProfileAvatar({ 
  src, 
  name = '', 
  onUpload,
  editable = true 
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, WEBP allowed');
      return false;
    }
    if (file.size > maxSize) {
      setError('Max file size is 10MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file) && onUpload) {
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file) && onUpload) {
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Container - 80px */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        tabIndex={editable ? 0 : -1}
        role={editable ? 'button' : undefined}
        aria-label={editable ? 'Upload profile picture' : undefined}
        className={`
          relative group w-20 h-20 rounded-full overflow-hidden
          ${editable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900' : ''}
          ${isDragging ? 'ring-2 ring-cyan-400 scale-105' : ''}
          transition-all duration-200
          ${editable ? 'hover:scale-[1.03]' : ''}
        `}
      >
        {/* Gradient border using pseudo-element trick */}
        <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Inner container */}
        <div className="absolute inset-[2px] rounded-full overflow-hidden bg-slate-900">
          {/* Avatar Image or Initial */}
          {src ? (
            <img
              src={src}
              alt={name || 'Profile'}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {getInitial(name)}
            </div>
          )}

          {/* Hover Overlay */}
          {editable && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          )}
        </div>
      </div>

      {/* Minimal upload hint */}
      {editable && (
        <p className="text-gray-500 text-xs mt-3">
          JPG, PNG, WEBP • 10MB max
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile image"
      />

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-xs mt-2 px-2 py-1 bg-red-500/10 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
