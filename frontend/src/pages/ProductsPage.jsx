import React from 'react';
import { Link } from 'react-router-dom';
import { getReviews } from '../utils/api.js';
import { Package, TrendingUp, TrendingDown, Minus, ExternalLink, BarChart3, Star } from 'lucide-react';

export default function ProductsPage() {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getReviews().then(data => { setReviews(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const analysed = reviews.filter(r => r.status === 'analysed');
  const products = [...new Set(analysed.map(r => r.product).filter(Boolean))];

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-violet-500" /> Products
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            All products from your analysed reviews
          </p>
        </div>
        <span className="bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50 rounded-full px-4 py-1.5 text-sm font-semibold">
          {products.length} Products
        </span>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-20 animate-in">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Package className="w-10 h-10 text-violet-500" />
          </div>
          <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">No products yet</h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mx-auto">
            Upload a CSV from the <Link to="/" className="text-violet-500 underline">Dashboard</Link> to see your products here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => {
            const pR    = analysed.filter(r => r.product === product);
            const pos   = pR.filter(r => r.sentiment === 'positive').length;
            const neg   = pR.filter(r => r.sentiment === 'negative').length;
            const neu   = pR.filter(r => r.sentiment === 'neutral').length;
            const total = pR.length || 1;
            const score = Math.round((pos / total) * 100);
            const avgRating = pR.filter(r => r.rating).reduce((s, r) => s + r.rating, 0) / (pR.filter(r => r.rating).length || 1);
            const needsReply = pR.filter(r => r.needs_reply).length;
            const scoreColor = score >= 60
              ? 'from-emerald-400 to-teal-500'
              : score >= 40 ? 'from-amber-400 to-orange-500'
              : 'from-red-400 to-rose-500';

            return (
              <Link key={product} to={`/product/${encodeURIComponent(product)}`} state={{ reviews: pR }}
                className="group relative overflow-hidden card hover:shadow-2xl hover:shadow-violet-100/60 dark:hover:shadow-violet-900/30 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${i * 80}ms` }}>

                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scoreColor}`} />

                {/* Score ring */}
                <div className="flex items-start justify-between mb-5 mt-1">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight">{product}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{pR.length} reviews analysed</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scoreColor} flex flex-col items-center justify-center shadow-lg flex-shrink-0`}>
                    <span className="text-white font-black text-lg leading-none">{score}%</span>
                    <span className="text-white/70 text-xs">score</span>
                  </div>
                </div>

                {/* Sentiment bar */}
                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
                  {pos > 0 && <div className="bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${(pos/total)*100}%` }} />}
                  {neu > 0 && <div className="bg-amber-400 rounded-full transition-all duration-700"  style={{ width: `${(neu/total)*100}%` }} />}
                  {neg > 0 && <div className="bg-red-400 rounded-full transition-all duration-700"    style={{ width: `${(neg/total)*100}%` }} />}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl py-2">
                    <div className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{pos}</div>
                    <div className="text-xs text-emerald-500 dark:text-emerald-500 flex items-center justify-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Pos
                    </div>
                  </div>
                  <div className="text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl py-2">
                    <div className="text-amber-600 dark:text-amber-400 font-black text-lg">{neu}</div>
                    <div className="text-xs text-amber-500 dark:text-amber-500 flex items-center justify-center gap-0.5">
                      <Minus className="w-3 h-3" /> Neu
                    </div>
                  </div>
                  <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-xl py-2">
                    <div className="text-red-600 dark:text-red-400 font-black text-lg">{neg}</div>
                    <div className="text-xs text-red-500 dark:text-red-500 flex items-center justify-center gap-0.5">
                      <TrendingDown className="w-3 h-3" /> Neg
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    {pR.filter(r=>r.rating).length > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {avgRating.toFixed(1)} avg
                      </span>
                    )}
                    {needsReply > 0 && (
                      <span className="text-blue-500 dark:text-blue-400 font-semibold">
                        {needsReply} need reply
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
