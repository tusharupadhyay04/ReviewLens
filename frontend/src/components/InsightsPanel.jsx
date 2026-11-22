import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TOPIC_LABELS = {
  quality:          'Product Quality',
  price:            'Price / Value',
  shipping:         'Shipping Speed',
  customer_service: 'Customer Service',
  packaging:        'Packaging',
  other:            'Other',
};

function TopicBar({ topic, count, total, colorCls, trackCls, barCls }) {
  const pct = total > 0 ? Math.min(Math.round((count / total) * 100 * 2.5), 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colorCls} text-white text-xs font-black flex-shrink-0 shadow-sm`}>
        {count}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{TOPIC_LABELS[topic] || topic}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">{pct}%</span>
        </div>
        <div className={`${trackCls} rounded-full h-1.5`}>
          <div className={`${barCls} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function InsightsPanel({ reviews }) {
  const neg = {}, pos = {};
  reviews.forEach(r => {
    (r.topics || []).forEach(t => {
      if (r.sentiment === 'negative') neg[t] = (neg[t] || 0) + 1;
      if (r.sentiment === 'positive') pos[t] = (pos[t] || 0) + 1;
    });
  });

  const top3 = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topComplaints = top3(neg);
  const topPraises    = top3(pos);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Complaints */}
      <div className="card border-l-4 border-red-400 dark:border-red-600 animate-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-none">Top Complaints</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">From negative reviews</p>
          </div>
        </div>
        {topComplaints.length === 0
          ? <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">No complaints detected 🎉</p>
          : <div className="space-y-4">
              {topComplaints.map(([topic, count]) => (
                <TopicBar key={topic} topic={topic} count={count} total={reviews.length}
                  colorCls="bg-gradient-to-br from-red-500 to-rose-500"
                  trackCls="bg-red-100 dark:bg-red-900/30"
                  barCls="bg-gradient-to-r from-red-500 to-rose-400" />
              ))}
            </div>}
      </div>

      {/* Praises */}
      <div className="card border-l-4 border-emerald-400 dark:border-emerald-600 animate-in" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-none">Top Praises</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">From positive reviews</p>
          </div>
        </div>
        {topPraises.length === 0
          ? <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">No praises detected yet</p>
          : <div className="space-y-4">
              {topPraises.map(([topic, count]) => (
                <TopicBar key={topic} topic={topic} count={count} total={reviews.length}
                  colorCls="bg-gradient-to-br from-emerald-500 to-teal-500"
                  trackCls="bg-emerald-100 dark:bg-emerald-900/30"
                  barCls="bg-gradient-to-r from-emerald-500 to-teal-400" />
              ))}
            </div>}
      </div>
    </div>
  );
}
