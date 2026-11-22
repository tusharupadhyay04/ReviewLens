import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Loader2, Star } from 'lucide-react';
import { generateReply } from '../utils/api.js';

const SentimentDot = ({ s }) => {
  const map = { positive: 'bg-emerald-400', negative: 'bg-red-400', neutral: 'bg-amber-400' };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[s] || 'bg-gray-300'} mr-1.5`} />;
};

export default function ReplyModal({ review, onClose }) {
  const [reply,   setReply]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [error,   setError]   = useState(null);

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      setReply(await generateReply(review._id));
    } catch {
      setError('Failed to generate reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">Generate Reply</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Review preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-600">{review.id}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-600">{review.product}</span>
              {review.rating && (
                <span className="flex items-center gap-0.5 text-xs text-amber-600 ml-auto">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{review.rating}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{review.text}"</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`badge-${review.sentiment}`}>
                <SentimentDot s={review.sentiment} />{review.sentiment}
              </span>
              {review.topics?.map(t => (
                <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  {t.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Reply area */}
          {!reply ? (
            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Generating reply…</>
                : <><MessageCircle className="w-4 h-4" />Generate AI Reply</>}
            </button>
          ) : (
            <div>
              <div className="relative bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                <p className="text-sm text-gray-800 leading-relaxed pr-6">{reply}</p>
                <button onClick={handleCopy} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleGenerate} className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
                  Regenerate
                </button>
                {copied && <span className="text-sm text-emerald-600 font-medium">Copied!</span>}
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mt-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
