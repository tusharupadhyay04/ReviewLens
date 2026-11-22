import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ReviewsTable from '../components/ReviewsTable.jsx';

const TOPIC_LABELS = {
  quality: 'Quality', price: 'Price', shipping: 'Shipping',
  customer_service: 'Support', packaging: 'Packaging', other: 'Other',
};

export default function ProductDetail() {
  const { productName } = useParams();
  const { state }       = useLocation();
  const reviews = state?.reviews || [];
  const product = decodeURIComponent(productName);

  const pos = reviews.filter(r => r.sentiment === 'positive').length;
  const neu = reviews.filter(r => r.sentiment === 'neutral').length;
  const neg = reviews.filter(r => r.sentiment === 'negative').length;

  const sentimentData = [
    { name: 'Positive', value: pos, color: '#10b981' },
    { name: 'Neutral',  value: neu, color: '#f59e0b' },
    { name: 'Negative', value: neg, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const topicMap = {};
  reviews.forEach(r => r.topics?.forEach(t => { topicMap[t] = (topicMap[t] || 0) + 1; }));
  const topicData = Object.entries(topicMap)
    .map(([t, count]) => ({ topic: TOPIC_LABELS[t] || t, count }))
    .sort((a, b) => b.count - a.count);

  const score = reviews.length > 0 ? Math.round((pos / reviews.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-indigo-300 hover:bg-indigo-50 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{product}</h1>
          <p className="text-sm text-gray-400">{reviews.length} reviews analysed</p>
        </div>
        <span className={`ml-auto text-sm font-bold px-4 py-1.5 rounded-xl ${score >= 60 ? 'bg-emerald-100 text-emerald-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
          {score}% Satisfaction
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card animate-in">
          <h3 className="font-bold text-gray-800 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {sentimentData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-in" style={{ animationDelay: '80ms' }}>
          <h3 className="font-bold text-gray-800 mb-4">Topics Mentioned</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topicData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis dataKey="topic" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={60} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e0e7ff' }} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Top Complaints', icon: <TrendingDown className="w-4 h-4 text-red-500" />, border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-400', items: reviews.filter(r => r.sentiment === 'negative') },
          { label: 'Top Praises',   icon: <TrendingUp   className="w-4 h-4 text-emerald-500" />, border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-400', items: reviews.filter(r => r.sentiment === 'positive') },
        ].map(({ label, icon, border, bg, text, items }) => (
          <div key={label} className={`card border-l-4 ${border} animate-in`}>
            <div className="flex items-center gap-2 mb-4">{icon}<h3 className="font-bold text-gray-800">{label}</h3></div>
            {items.length === 0
              ? <p className="text-sm text-gray-400 italic">{label === 'Top Complaints' ? 'No complaints 🎉' : 'No praises yet'}</p>
              : items.slice(0, 3).map(r => (
                  <div key={r.id} className={`mb-2 text-sm text-gray-700 ${bg} rounded-xl px-4 py-2.5`}>
                    <span className={`font-mono text-xs ${text} mr-2 font-bold`}>{r.id}</span>{r.summary}
                  </div>
                ))}
          </div>
        ))}
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
