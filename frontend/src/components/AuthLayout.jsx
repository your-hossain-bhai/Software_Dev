import Brand from './Brand';

/**
 * AuthLayout - Premium centered glassmorphism authentication layout
 * Full-screen gradient background with centered dark card
 */

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen font-sans flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 via-transparent to-violet-900/30" />
      
      {/* Radial glow accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px]" />
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <Brand size="large" />
        </div>

        {/* Glassmorphism card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="text-gray-400 text-sm mt-2">{subtitle}</p>
          </div>
          
          {children}
        </div>

        {/* SDG Badge */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-cyan-400 text-sm">🎯</span>
            <span className="text-gray-400 text-xs">Supporting UN SDG 8: Decent Work</span>
          </div>
        </div>
      </div>
    </div>
  );
}
