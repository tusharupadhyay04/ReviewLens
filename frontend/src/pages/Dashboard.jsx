import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, AlertTriangle, ExternalLink, TrendingUp, TrendingDown, Minus, Upload, Sparkles } from 'lucide-react';
import UploadZone    from '../components/UploadZone.jsx';
import SummaryCards  from '../components/SummaryCards.jsx';
import ReviewsTable  from '../components/ReviewsTable.jsx';
import InsightsPanel from '../components/InsightsPanel.jsx';
import CacheMetrics  from '../components/CacheMetrics.jsx';
import { useAuth }   from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user }   = useAuth();
  const [result,    setResult]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState(null);

  const onStart    = useCallback(() => { setUploading(true); setError(null); setProgress(0); }, []);
  const onComplete = useCallback(r  => { setResult(r); setUploading(false); }, []);
  const onError    = useCallback(e  => { setError(e);  setUploading(false); }, []);

  const analysed = result?.reviews?.filter(r => r.status === 'analysed') || [];
  const products = [...new Set(analysed.map(r => r.product))];

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Welcome banner */}
      {!result && !uploading && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-7 text-white shadow-2xl shadow-violet-500/30">
          {/* Animated blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-pink-500/15 rounded-full translate-y-1/2 blur-xl" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-300" />
                <span className="text-violet-200 text-sm font-medium">AI-Powered Dashboard</span>
              </div>
              <h1 className="text-3xl font-black mb-2 tracking-tight">
                Welcome, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-violet-200 text-sm max-w-lg leading-relaxed">
                Upload your product reviews CSV and ReviewLens will instantly analyse sentiment,
                detect topics, flag mismatches, and surface actionable insights using AI.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Sentiment Analysis', 'Topic Detection', 'Smart Caching', 'Prompt-safe AI', 'Hinglish Support'].map(tag => (
                  <span key={tag} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center w-32 h-32 bg-white/10 rounded-2xl border border-white/20 flex-shrink-0">
              <Zap className="w-10 h-10 text-yellow-300 mb-1" />
              <span className="text-xs text-white/70 text-center leading-tight">AI Analysis<br/>Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload */}
      <UploadZone onUploadStart={onStart} onUploadComplete={onComplete} onError={onError} isUploading={uploading} onProgressChange={setProgress} />

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl px-5 py-4 flex gap-3 animate-in">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Upload Error</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Processing */}
      {uploading && (
        <div className="card py-16 text-center animate-in">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/40 rounded-full" />
            <div className="absolute inset-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-violet-500/40">
              <Zap className="w-9 h-9 text-white animate-pulse" />
            </div>
            <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill="none" stroke="#e0e7ff" strokeWidth="4" className="dark:stroke-indigo-900" />
              <circle cx="48" cy="48" r="44" fill="none" stroke="#6366f1" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                strokeLinecap="round" className="transition-all duration-500" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Analysing with AI…</h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">Batching reviews · rate-limit aware · caching results</p>
          <p className="text-violet-500 dark:text-violet-400 font-bold">{progress}% uploaded</p>
        </div>
      )}

      {/* Results */}
      {result && !uploading && (
        <>
          <CacheMetrics stats={result.stats} />
          <SummaryCards reviews={analysed} stats={result.stats} />
          <InsightsPanel reviews={analysed} />

          {/* Product breakdown */}
          {products.length > 0 && (
            <div className="card animate-in" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-xl">📦 Product Breakdown</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Click a product card for detailed analysis</p>
                </div>
                <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 rounded-full px-3 py-1 font-semibold">
                  {products.length} product{products.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => {
                  const pR    = analysed.filter(r => r.product === product);
                  const pos   = pR.filter(r => r.sentiment === 'positive').length;
                  const neg   = pR.filter(r => r.sentiment === 'negative').length;
                  const neu   = pR.filter(r => r.sentiment === 'neutral').length;
                  const total = pR.length || 1;
                  const score = Math.round((pos / total) * 100);
                  const scoreColor = score >= 60 ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40' : score >= 40 ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40' : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40';
                  return (
                    <Link key={product} to={`/product/${encodeURIComponent(product)}`} state={{ reviews: pR }}
                      className="group relative overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-violet-200 dark:hover:border-violet-700/50 hover:shadow-xl hover:shadow-violet-100/60 dark:hover:shadow-violet-900/30 transition-all duration-300 bg-white dark:bg-gray-900 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white text-sm leading-tight">{product}</h4>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{pR.length} reviews</p>
                          </div>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${scoreColor}`}>
                            {score}% 👍
                          </span>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-4">
                          {pos > 0 && <div className="bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${(pos/total)*100}%` }} />}
                          {neu > 0 && <div className="bg-amber-400 rounded-full transition-all duration-700"  style={{ width: `${(neu/total)*100}%` }} />}
                          {neg > 0 && <div className="bg-red-400 rounded-full transition-all duration-700"    style={{ width: `${(neg/total)*100}%` }} />}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-3 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-3 h-3" />{pos}</span>
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Minus className="w-3 h-3" />{neu}</span>
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><TrendingDown className="w-3 h-3" />{neg}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <ReviewsTable reviews={result.reviews || []} />
        </>
      )}

      {/* Empty state */}
      {!result && !uploading && !error && (
        <div className="card text-center py-20 animate-in">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 rounded-3xl rotate-12 group-hover:rotate-6 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-3xl -rotate-6 transition-transform" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center">
              <Upload className="w-10 h-10 text-violet-500 dark:text-violet-400" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Ready to analyse!</h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Drop your <code className="bg-gray-100 dark:bg-gray-800 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded text-xs font-mono">reviews.csv</code> file above.
            Handles messy data, duplicates, Hindi/Hinglish, and prompt injection attacks.
          </p>
        </div>
      )}
    </div>
  );
}
