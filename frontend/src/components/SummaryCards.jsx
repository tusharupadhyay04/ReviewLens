import React from 'react';
import { TrendingUp, TrendingDown, Minus, MessageCircle, AlertTriangle, Hash } from 'lucide-react';

export default function SummaryCards({ reviews, stats }) {
  const analysed   = reviews.length;
  const positive   = reviews.filter(r => r.sentiment === 'positive').length;
  const negative   = reviews.filter(r => r.sentiment === 'negative').length;
  const neutral    = reviews.filter(r => r.sentiment === 'neutral').length;
  const needsReply = reviews.filter(r => r.needs_reply).length;
  const mismatches = reviews.filter(r => r.ratingMismatch).length;
  const pct = n => analysed > 0 ? Math.round((n / analysed) * 100) : 0;
  const agreementRate = analysed > 0 ? Math.round(((analysed - mismatches) / analysed) * 100) : 100;

  const cards = [
    {
      label: 'Total Analysed',
      value: analysed,
      sub: stats ? `of ${stats.total} uploaded` : 'reviews',
      icon: <Hash className="w-5 h-5" />,
      gradient: 'from-violet-500 to-indigo-600',
      glow: 'shadow-violet-500/25',
      bar: null,
    },
    {
      label: 'Positive',
      value: positive,
      sub: `${pct(positive)}% of reviews`,
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'shadow-emerald-500/25',
      bar: { pct: pct(positive), color: 'bg-emerald-400' },
    },
    {
      label: 'Neutral',
      value: neutral,
      sub: `${pct(neutral)}% of reviews`,
      icon: <Minus className="w-5 h-5" />,
      gradient: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-500/25',
      bar: { pct: pct(neutral), color: 'bg-amber-400' },
    },
    {
      label: 'Negative',
      value: negative,
      sub: `${pct(negative)}% of reviews`,
      icon: <TrendingDown className="w-5 h-5" />,
      gradient: 'from-red-500 to-rose-500',
      glow: 'shadow-red-500/25',
      bar: { pct: pct(negative), color: 'bg-red-400' },
    },
    {
      label: 'Need Reply',
      value: needsReply,
      sub: 'require attention',
      icon: <MessageCircle className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25',
      bar: null,
    },
    {
      label: 'Rating Mismatch',
      value: mismatches,
      sub: `${agreementRate}% agreement`,
      icon: <AlertTriangle className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/25',
      bar: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <div key={c.label}
          className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-in group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default"
          style={{ animationDelay: `${i * 70}ms` }}>

          {/* Subtle bg glow on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />

          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} shadow-lg ${c.glow} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {c.icon}
          </div>

          {/* Value */}
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-0.5 tabular-nums tracking-tight">
            {c.value}
          </div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{c.label}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{c.sub}</div>

          {/* Mini progress bar */}
          {c.bar && (
            <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${c.bar.color} rounded-full transition-all duration-700`}
                style={{ width: `${c.bar.pct}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
