import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatValue = (value, decimals) => Number(value).toFixed(decimals);

export default function AnimatedStat({
  value,
  suffix = '',
  label,
  decimals = 0,
  accent = 'text-cyan-300',
}) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const end = toNumber(value);
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(end * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-slate-900/35 p-5 hover:border-purple-400/30 transition-all duration-300"
    >
      <p className={`text-3xl font-bold ${accent}`}>
        {formatValue(count, decimals)}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-300 leading-relaxed">{label}</p>
    </motion.div>
  );
}
