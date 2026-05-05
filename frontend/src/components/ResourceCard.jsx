import { useState } from 'react';
import {
  Atom,
  Book,
  BookOpen,
  ChartNoAxesColumn,
  Circle,
  Cloud,
  ExternalLink,
  FlaskConical,
  Globe,
  GraduationCap,
  Leaf,
  Link,
  Palette,
  Play,
  School,
  Ship,
  Square,
  Zap,
  Monitor,
} from 'lucide-react';
import { getPlatformInfo } from '../utils/imageHelpers';

const platformIconMap = {
  atom: Atom,
  book: Book,
  'book-open': BookOpen,
  chart: ChartNoAxesColumn,
  circle: Circle,
  cloud: Cloud,
  flask: FlaskConical,
  globe: Globe,
  graduation: GraduationCap,
  leaf: Leaf,
  link: Link,
  monitor: Monitor,
  palette: Palette,
  play: Play,
  school: School,
  ship: Ship,
  square: Square,
  zap: Zap,
};

export default function ResourceCard({ resource }) {
  const [imgError, setImgError] = useState(false);
  const platformInfo = getPlatformInfo(resource.platform);
  const FallbackIcon = platformIconMap[platformInfo.icon] || BookOpen;

  return (
    <article className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-md bg-gradient-to-br ${platformInfo.color} flex items-center justify-center`}>
          {platformInfo.logo && !imgError ? (
            <img
              src={platformInfo.logo}
              alt=""
              aria-hidden="true"
              className="w-8 h-8 object-contain"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <FallbackIcon className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{resource.title}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{resource.platform}</p>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
            resource.cost === 'Free'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {resource.cost === 'Free' ? 'Free' : 'Paid'}
        </span>
      </div>

      {resource.description ? <p className="text-gray-400 text-xs leading-relaxed">{resource.description}</p> : null}

      <div className="flex flex-wrap gap-1.5">
        {(resource.skills || []).map((skill) => (
          <span
            key={`${resource._id}-${skill}`}
            className="text-xs px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          >
            {skill}
          </span>
        ))}
      </div>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between text-purple-400 hover:text-purple-300 text-sm font-medium group pt-3 border-t border-white/10 transition-colors duration-200"
      >
        <span>View Resource</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
      </a>
    </article>
  );
}
