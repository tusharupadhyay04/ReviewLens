import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, LogOut, Menu, X,
  BarChart3, Sparkles, ChevronRight, Sun, Moon, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import toast from 'react-hot-toast';

const navItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/' },
  { icon: <Package className="w-5 h-5" />,         label: 'Products',  path: '/products' },
];

export default function AppLayout({ children }) {
  const { user, logout }     = useAuth();
  const { dark, toggle }     = useTheme();
  const location             = useLocation();
  const navigate             = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'RL';

  const SideContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40 animate-float">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none tracking-tight">ReviewLens</p>
            <p className="text-violet-400 text-xs flex items-center gap-1 mt-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI Insights
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-white/25 text-xs uppercase tracking-widest px-3 mb-4 font-medium">Navigation</p>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${active
                  ? 'bg-gradient-to-r from-violet-500/30 to-indigo-500/20 text-white border border-violet-500/40 shadow-lg shadow-violet-500/10'
                  : 'text-white/50 hover:text-white hover:bg-white/8'}`}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-violet-400 rounded-full" />}
              <span className={`${active ? 'text-violet-300' : 'group-hover:text-violet-300'} transition-colors`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400" />}
            </Link>
          );
        })}
      </nav>

      {/* AI Status pill */}
      <div className="px-4 pb-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-xs text-emerald-300 font-medium">AI Engine Active</span>
        </div>
      </div>

      {/* User card */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900 flex-shrink-0 shadow-xl shadow-violet-900/20">
        <SideContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSideOpen(false)} />
          <aside className="relative w-64 h-full bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900 shadow-2xl">
            <button onClick={() => setSideOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SideContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3.5 flex items-center gap-4 flex-shrink-0 shadow-sm transition-colors duration-300">
          <button onClick={() => setSideOpen(true)} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">ReviewLens · AI-powered insights</p>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Active pill */}
            <div className="hidden sm:flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-violet-700 dark:text-violet-300">AI Active</span>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              title={dark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 shadow-sm"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/30">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
