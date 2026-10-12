import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ShoppingBag, Sparkles } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xs">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <div className="text-5xl font-black text-slate-900 tracking-tight">404</div>
          <h1 className="text-xl font-bold text-slate-800">Lost on Campus?</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page you are looking for might have been moved, renamed, or never existed in the campus directory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            to="/catalog"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
