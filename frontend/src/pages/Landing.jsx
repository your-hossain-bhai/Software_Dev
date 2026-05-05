import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Clock3, Rocket } from 'lucide-react';
import Brand from '../components/Brand';
import Footer from '../components/Footer';

const HeroAnimation = lazy(() => import('../components/HeroAnimation'));

const highlights = [
  {
    title: 'Learning DNA Engine',
    desc: 'Understands how each learner improves fastest and adapts plans weekly.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'AI Job Matching',
    desc: 'Transparent matching with clear reasoning, strengths, and gaps for every role.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    ),
  },
  {
    title: 'Personalized Upskilling',
    desc: 'Roadmaps, resources, and micro-feedback tailored to your target career.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253" />
    ),
  },
];

const steps = [
  {
    title: 'Analyze student behavior',
    text: 'We observe skills, CV signals, interests, and career goals to understand each learner.',
  },
  {
    title: 'Generate Learning DNA',
    text: 'The system converts signals into a personalized learner profile with strengths and weak areas.',
  },
  {
    title: 'Deliver a personalized path',
    text: 'Learners receive jobs, resources, and guidance that match their current growth stage.',
  },
];

const studentStories = [
  {
    title: 'Software Engineering track',
    metric: '85% similar learners became Software Engineers',
    detail: 'Strong problem-solving + project-based learning + weekly job matching.',
  },
  {
    title: 'Data / Analytics track',
    metric: '78% improved their job match score in 30 days',
    detail: 'Focused on SQL, dashboards, and skill-gap closure with guided practice.',
  },
  {
    title: 'Design / Product track',
    metric: 'Students reported higher confidence in portfolio reviews',
    detail: 'Visual learners benefited from structured feedback and resource sequencing.',
  },
];

const heroStats = [
  { value: '92%', label: 'Relevance score', icon: Gauge },
  { value: '7d', label: 'Insight cycle', icon: Clock3 },
  { value: '3x', label: 'Faster planning', icon: Rocket },
];

const heroTextContainer = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
    },
  },
};

const heroTextItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-[#060c18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(58,190,249,0.20),transparent_40%),radial-gradient(circle_at_80%_65%,rgba(99,102,241,0.14),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
      <div className="absolute -top-28 left-12 w-80 h-80 rounded-full bg-cyan-400/15 blur-[130px]" />
      <div className="absolute top-24 right-20 w-72 h-72 rounded-full bg-blue-500/12 blur-[120px]" />
      <div className="absolute -bottom-16 right-1/3 w-64 h-64 rounded-full bg-indigo-500/10 blur-[110px]" />

      <nav className="relative z-20 px-6 lg:px-12 py-6 flex items-center justify-between">
        <Brand />
      </nav>

      <main className="relative z-10 px-6 lg:px-12 xl:px-24 pb-16 pt-8 lg:pt-10">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div variants={heroTextContainer} initial="hidden" animate="visible">
            <motion.p variants={heroTextItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 mb-5">
              AI Career Intelligence
            </motion.p>
            <motion.h1 variants={heroTextItem} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-[-0.02em] text-slate-50">
              AI-Powered{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                Learning DNA
              </span>{' '}
              Platform
            </motion.h1>
            <motion.p variants={heroTextItem} className="mt-5 text-lg text-slate-200/95 leading-relaxed max-w-xl">
              Every student learns differently. We personalize education using AI.
            </motion.p>

            <motion.div variants={heroTextItem} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:border-cyan-300/35 text-slate-100 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:via-sky-400 hover:to-blue-500 text-white shadow-[0_18px_55px_rgba(56,189,248,0.4)] hover:shadow-[0_24px_70px_rgba(56,189,248,0.52)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105"
              >
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300 ease-out" />
              </Link>
            </motion.div>

            <motion.div variants={heroTextItem} className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {heroStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="group rounded-xl bg-white/[0.06] border border-cyan-300/15 hover:border-cyan-300/35 p-3.5 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(34,211,238,0.12)]"
                  >
                    <div className="w-8 h-8 rounded-lg mb-3 bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center text-cyan-200 group-hover:text-cyan-100 transition-colors duration-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-cyan-200 leading-none">{item.value}</p>
                    <p className="mt-1.5 text-xs text-slate-300/80">{item.label}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-cyan-400/18 via-blue-500/14 to-indigo-500/16 blur-3xl" />
            <motion.div
              className="relative rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl p-6 shadow-[0_30px_80px_rgba(8,47,73,0.45)]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Suspense fallback={<div className="w-full h-[320px] rounded-2xl bg-white/5 border border-white/10 animate-pulse" />}>
                <HeroAnimation />
              </Suspense>
            </motion.div>
          </motion.div>
        </section>

        <section className="mt-16 grid md:grid-cols-3 gap-5">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/12 bg-white/[0.05] backdrop-blur-xl p-6 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">How it works</p>
              <h2 className="text-2xl font-semibold text-white">Three steps to a personalized learning journey</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-200 font-semibold mb-4">
                  0{index + 1}
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Students like you</p>
            <h2 className="text-2xl font-semibold text-white">See how similar learners progressed</h2>
            <div className="mt-6 space-y-4">
              {studentStories.map((story) => (
                <article key={story.title} className="rounded-2xl bg-slate-950/30 border border-white/10 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{story.title}</h3>
                      <p className="mt-2 text-sm text-slate-400 leading-relaxed">{story.detail}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 whitespace-nowrap">
                      {story.metric}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
