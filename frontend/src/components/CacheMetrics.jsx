import React from 'react';
import { Zap, Database, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CacheMetrics({ stats }) {
  if (!stats) return null;

  const cacheHitRate = stats.total > 0 ? Math.round((stats.fromCache / stats.total) * 100) : 0;

  const metrics = [
    { icon: <Zap className="w-4 h-4" />,         label: 'AI Calls Made',    value: stats.aiCallsMade,                   color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { icon: <Database className="w-4 h-4" />,    label: 'Served from Cache', value: `${stats.fromCache} (${cacheHitRate}%)`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: <Clock className="w-4 h-4" />,       label: 'Processing Time',   value: stats.processingTimeFormatted,       color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: <AlertCircle className="w-4 h-4" />, label: 'Errors',            value: stats.errors,                        color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div className="rounded-2xl bg-gray-900 dark:bg-gray-950 border border-gray-800 p-5 animate-in shadow-lg">
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Processing Metrics</span>
        <div className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Analysis Complete</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={`flex items-center gap-3 rounded-xl border p-3 ${m.bg}`}>
            <div className={`${m.color} flex-shrink-0`}>{m.icon}</div>
            <div>
              <div className="text-white font-black text-xl tabular-nums leading-tight">{m.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{m.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
