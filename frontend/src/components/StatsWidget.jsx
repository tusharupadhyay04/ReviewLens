import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getReviews, getInsights } from '../utils/api.js';
import { BarChart2, TrendingUp, TrendingDown, Minus, Star, MessageCircle } from 'lucide-react';

export default function StatsWidget() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    getInsights().then(setInsights).catch(() => {});
  }, []);

  if (!insights || insights.total === 0) return null;

  const { total, sentimentCounts, needsReply, mismatches } = insights;

  return (
    <div className="card animate-in mb-0">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-violet-500" />
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">Historical Stats</h3>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
          All time · {total} reviews
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Positive', value: sentimentCounts.positive, icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Neutral',  value: sentimentCounts.neutral,  icon: <Minus className="w-3.5 h-3.5" />,       color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Negative', value: sentimentCounts.negative, icon: <TrendingDown className="w-3.5 h-3.5" />, color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Need Reply', value: needsReply,             icon: <MessageCircle className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2.5 flex items-center gap-2`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <div className={`font-black text-lg leading-none ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
