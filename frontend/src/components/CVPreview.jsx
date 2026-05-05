function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
    .filter(Boolean)
    .map((skill) => String(skill).trim())
    .filter(Boolean);
}

function categorizeSkills(skills) {
  const categories = {
    'Programming Languages': [],
    Frontend: [],
    Backend: [],
    Tools: [],
    'AI/ML': [],
  };

  skills.forEach((skill) => {
    const s = skill.toLowerCase();
    if (['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'dart', 'go', 'php'].some((k) => s.includes(k))) {
      categories['Programming Languages'].push(skill);
      return;
    }
    if (['react', 'vue', 'next', 'tailwind', 'html', 'css', 'flutter', 'react native'].some((k) => s.includes(k))) {
      categories.Frontend.push(skill);
      return;
    }
    if (['node', 'express', 'django', 'fastapi', 'mongodb', 'sql', 'postgres', 'firebase', 'rest'].some((k) => s.includes(k))) {
      categories.Backend.push(skill);
      return;
    }
    if (['git', 'docker', 'figma', 'postman', 'aws', 'linux', 'github'].some((k) => s.includes(k))) {
      categories.Tools.push(skill);
      return;
    }
    if (['ml', 'ai', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp'].some((k) => s.includes(k))) {
      categories['AI/ML'].push(skill);
      return;
    }
    categories.Tools.push(skill);
  });

  return categories;
}

function dedupe(items) {
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-slate-800 border-b border-slate-300 pb-1 mb-3 cv-print-section">
      {children}
    </h2>
  );
}

export default function CVPreview({ profile, summary, resumeData }) {
  const skills = normalizeSkills(profile?.skills);
  const groupedSkills = categorizeSkills(skills);
  const interests = Array.isArray(profile?.interests) ? profile.interests.filter(Boolean) : [];

  const projects = (resumeData?.projects || []).filter((project) => project?.name || project?.techStack || project?.bullets?.length);
  const certifications = (resumeData?.certifications || []).filter((item) => item?.name || item?.organization || item?.duration);
  const achievements = (resumeData?.achievements || []).filter((item) => item?.event || item?.role || item?.outcome);

  const name = profile?.name || 'Your Name';
  const email = profile?.email || 'you@example.com';
  const phone = resumeData?.phone || 'Add phone number';
  const linkedin = resumeData?.linkedin || 'linkedin.com/in/username';
  const github = resumeData?.github || 'github.com/username';
  const title = resumeData?.title || `${profile?.preferredTrack || 'Software'} Developer | Problem Solver`;
  const degree = resumeData?.degree || profile?.education || 'Add degree details';
  const university = resumeData?.university || 'Add university/institution';
  const educationDuration = resumeData?.educationDuration || 'Add duration';

  return (
    <article className="resume-page bg-white text-slate-900 border border-slate-300 shadow-sm px-10 py-9 leading-relaxed">
      <header className="cv-print-section pb-4 border-b border-slate-300">
        <h1 className="text-3xl font-extrabold tracking-tight">{name}</h1>
        <p className="text-sm text-slate-700 mt-1">{title}</p>
        <p className="text-[13px] text-slate-700 mt-2">
          {email} | {phone} | {linkedin} | {github}
        </p>
      </header>

      <section className="mt-5 cv-print-section">
        <SectionTitle>Professional Summary</SectionTitle>
        <p className="text-[13px] text-slate-800 whitespace-pre-wrap">{summary}</p>
      </section>

      <section className="mt-5 cv-print-section">
        <SectionTitle>Education</SectionTitle>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold">{degree}</p>
            <p className="text-[13px] text-slate-700">{university}</p>
          </div>
          <p className="text-[12px] text-slate-600 whitespace-nowrap">{educationDuration}</p>
        </div>
      </section>

      <section className="mt-5 cv-print-section">
        <SectionTitle>Skills</SectionTitle>
        <div className="space-y-2">
          {Object.entries(groupedSkills).map(([category, items]) => {
            const unique = dedupe(items);
            if (unique.length === 0) return null;
            return (
              <p key={category} className="text-[13px] text-slate-800">
                <span className="font-semibold">{category}:</span> {unique.join(', ')}
              </p>
            );
          })}
          {skills.length === 0 && <p className="text-[13px] text-slate-600">Add skills from your profile settings.</p>}
        </div>
      </section>

      <section className="mt-5 cv-print-section">
        <SectionTitle>Projects / Experience</SectionTitle>
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <article key={`${project.name || 'project'}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[13px] font-semibold">{project.name || `Project ${index + 1}`}</h3>
                  <span className="text-[12px] text-slate-600">{project.techStack || 'Tech stack not specified'}</span>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {(project.bullets || []).filter(Boolean).map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="text-[13px] text-slate-800">• {bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {interests.slice(0, 3).map((interest) => (
              <li key={interest} className="text-[13px] text-slate-800">• Built practice projects related to {interest} to strengthen practical implementation skills.</li>
            ))}
            {interests.length === 0 && <li className="text-[13px] text-slate-600">• Add at least one project with tech stack and impact-focused bullet points.</li>}
          </ul>
        )}
      </section>

      {certifications.length > 0 && (
        <section className="mt-5 cv-print-section">
          <SectionTitle>Training / Certifications</SectionTitle>
          <ul className="space-y-1">
            {certifications.map((item, index) => (
              <li key={`${item.name || 'cert'}-${index}`} className="text-[13px] text-slate-800">
                • <span className="font-semibold">{item.name || 'Certification'}</span>
                {item.organization ? `, ${item.organization}` : ''}
                {item.duration ? ` (${item.duration})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="mt-5 cv-print-section">
          <SectionTitle>Achievements / Hackathons</SectionTitle>
          <ul className="space-y-1">
            {achievements.map((item, index) => (
              <li key={`${item.event || 'achievement'}-${index}`} className="text-[13px] text-slate-800">
                • <span className="font-semibold">{item.event || 'Achievement'}</span>
                {item.role ? ` — ${item.role}` : ''}
                {item.outcome ? ` (${item.outcome})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
