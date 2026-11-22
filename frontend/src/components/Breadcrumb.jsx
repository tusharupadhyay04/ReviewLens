import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const crumbMap = {
  '':        'Dashboard',
  'products':'Products',
  'product': 'Product Detail',
  'login':   'Login',
  'register':'Register',
};

export default function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length === 0) return null; // hide on dashboard

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 px-6 pt-4 pb-0">
      <Link to="/" className="flex items-center gap-1 hover:text-violet-500 transition-colors">
        <Home className="w-3 h-3" /> Dashboard
      </Link>
      {parts.map((part, i) => {
        const label = crumbMap[part] || decodeURIComponent(part);
        const path  = '/' + parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            {isLast
              ? <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
              : <Link to={path} className="hover:text-violet-500 transition-colors">{label}</Link>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
