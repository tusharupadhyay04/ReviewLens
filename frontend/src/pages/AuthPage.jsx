import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { login, register } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function FloatingOrb({ className }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />;
}

export default function AuthPage({ mode = 'login' }) {
  const navigate   = useNavigate();
  const { saveAuth } = useAuth();
  const isLogin    = mode === 'login';

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isLogin
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
      saveAuth(data);
      toast.success(isLogin ? `Welcome back, ${data.user.name}! 👋` : `Account created! Welcome ${data.user.name} 🎉`);
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950">
      <Toaster position="top-center" />

      {/* Background orbs */}
      <FloatingOrb className="w-96 h-96 bg-violet-500 -top-20 -left-20" />
      <FloatingOrb className="w-80 h-80 bg-indigo-500 -bottom-20 -right-20" />
      <FloatingOrb className="w-64 h-64 bg-pink-500 top-1/2 left-1/4" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl shadow-2xl shadow-violet-500/40 mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">ReviewLens</h1>
          <p className="text-violet-300 text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Review Insights
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">
            {isLogin ? 'Welcome back 👋' : 'Create your account'}
          </h2>
          <p className="text-white/50 text-sm mb-6">
            {isLogin ? 'Sign in to your ReviewLens dashboard' : 'Start analysing reviews in seconds'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text" value={form.name} onChange={set('name')} placeholder="Your full name" required
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400 focus:bg-white/15 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400 focus:bg-white/15 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder={isLogin ? 'Your password' : 'Min. 6 characters'} required
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-11 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400 focus:bg-white/15 transition-all text-sm"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center text-sm text-white/40">
            {isLogin ? (
              <>Don't have an account?{' '}
                <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign up free</Link>
              </>
            ) : (
              <>Already have an account?{' '}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in</Link>
              </>
            )}
          </div>
        </div>

        {/* Features hint */}
        <div className="mt-6 flex justify-center gap-6 text-xs text-white/30">
          {['AI Analysis', 'Real-time Insights', 'Smart Caching'].map(f => (
            <span key={f} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-violet-400" />{f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
