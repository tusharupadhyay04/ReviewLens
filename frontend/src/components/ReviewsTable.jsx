import React, { useState, useMemo } from 'react';
import { Filter, MessageCircle, AlertTriangle, Star, ChevronDown, ChevronUp, Database, Search } from 'lucide-react';
import ReplyModal from './ReplyModal.jsx';

const TOPICS = ['quality', 'price', 'shipping', 'customer_service', 'packaging', 'other'];

function SentimentBadge({ s }) {
  const map = {
    positive: { cls: 'badge-positive', emoji: '😊', label: 'Positive' },
    negative: { cls: 'badge-negative', emoji: '😟', label: 'Negative' },
    neutral:  { cls: 'badge-neutral',  emoji: '😐', label: 'Neutral'  },
  };
  const m = map[s] || { cls: 'badge-error', emoji: '⚠️', label: 'Error' };
  return <span className={m.cls}>{m.emoji} {m.label}</span>;
}

function Stars({ rating }) {
  if (!rating) return <span className="text-gray-300 dark:text-gray-600 text-xs font-mono">N/A</span>;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700 fill-gray-100 dark:fill-gray-800'}`} />
      ))}
    </div>
  );
}

export default function ReviewsTable({ reviews }) {
  const [filterProduct,   setFP] = useState('');
  const [filterSentiment, setFS] = useState('');
  const [filterTopic,     setFT] = useState('');
  const [search, setSearch]      = useState('');
  const [expandedId, setExpandedId]   = useState(null);
  const [replyReview, setReplyReview] = useState(null);

  const products = useMemo(() => [...new Set(reviews.map(r => r.product).filter(Boolean))], [reviews]);

  const filtered = useMemo(() => reviews.filter(r => {
    if (filterProduct   && r.product !== filterProduct) return false;
    if (filterSentiment && r.sentiment !== filterSentiment) return false;
    if (filterTopic     && !r.topics?.includes(filterTopic)) return false;
    if (search && !((r.text||'') + (r.product||'') + (r.id||'')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [reviews, filterProduct, filterSentiment, filterTopic, search]);

  const rowKey = r => r._id || r.id || r.textHash;

  return (
    <div className="card animate-in" style={{ animationDelay: '300ms' }}>
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
          <Filter className="w-5 h-5 text-violet-500" />
          All Reviews
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5">{filtered.length}</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="filter-select pl-8 w-36"
            />
          </div>
          <select value={filterProduct} onChange={e => setFP(e.target.value)} className="filter-select">
            <option value="">All Products</option>
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterSentiment} onChange={e => setFS(e.target.value)} className="filter-select">
            <option value="">All Sentiments</option>
            <option value="positive">😊 Positive</option>
            <option value="neutral">😐 Neutral</option>
            <option value="negative">😟 Negative</option>
          </select>
          <select value={filterTopic} onChange={e => setFT(e.target.value)} className="filter-select">
            <option value="">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full reviews-table">
          <thead>
            <tr>
              <th>ID</th><th>Product</th><th>Rating</th>
              <th>Sentiment</th><th>Topics</th><th>AI Summary</th>
              <th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const key = rowKey(r);
              const isExpanded = expandedId === key;
              return (
                <React.Fragment key={key}>
                  <tr
                    className={`cursor-pointer transition-colors ${r.ratingMismatch ? 'bg-orange-50/70 dark:bg-orange-900/10' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                  >
                    {/* ID */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold">{r.id}</span>
                        {r.fromCache && (
                          <span title="Served from cache" className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded px-1 flex items-center gap-0.5">
                            <Database className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {r.ratingMismatch && (
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" title="Rating vs sentiment mismatch" />
                        )}
                      </div>
                    </td>
                    {/* Product */}
                    <td><span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{r.product}</span></td>
                    {/* Rating */}
                    <td><Stars rating={r.rating} /></td>
                    {/* Sentiment */}
                    <td><SentimentBadge s={r.sentiment} /></td>
                    {/* Topics */}
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {r.topics?.map(t => (
                          <span key={t} className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Summary */}
                    <td>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={r.summary}>
                        {r.summary || '—'}
                      </p>
                    </td>
                    {/* Status */}
                    <td><span className={`badge-${r.status || 'analysed'}`}>{r.status}</span></td>
                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-2">
                        {r.needs_reply && (
                          <button
                            onClick={e => { e.stopPropagation(); setReplyReview(r); }}
                            className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-2 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors whitespace-nowrap"
                          >
                            <MessageCircle className="w-3 h-3" /> Reply
                          </button>
                        )}
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="bg-violet-50/50 dark:bg-violet-900/10 px-6 py-4 border-t border-violet-100 dark:border-violet-900/30">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Original Review Text</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{r.text}"</p>
                        {r.ratingMismatch && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-lg px-3 py-1.5 w-fit">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Rating/Sentiment mismatch — {r.rating}⭐ stars but AI detected <strong>{r.sentiment}</strong> sentiment
                          </div>
                        )}
                        {r.isDuplicate && (
                          <div className="mt-2 text-xs text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-1.5 w-fit">
                            Duplicate of <strong>{r.duplicateOf}</strong> — not re-analysed
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm font-medium">No reviews match the current filters</p>
          </div>
        )}
      </div>

      {replyReview && <ReplyModal review={replyReview} onClose={() => setReplyReview(null)} />}
    </div>
  );
}
