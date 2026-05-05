import { Link } from 'react-router-dom';

export default function Footer() {
  const quickLinks = [
    { label: 'About', path: '/about' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Resources', path: '/resources' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Contact', path: '/contact' },
  ];

  const siteLinks = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Support', path: '/support' },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-gray-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* BRAND */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm tracking-widest mb-2">
              NEXTCAREER
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              AI-powered career guidance platform helping students and job seekers
              discover opportunities, bridge skill gaps, and grow professionally.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">
              Quick Links
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 text-xs hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SITE LINKS */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">
              Site Links
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {siteLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 text-xs hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
