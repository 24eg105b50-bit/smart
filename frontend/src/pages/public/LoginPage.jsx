import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500 mt-1">Sign in to your ShopSphere Campus student account</p>
      </div>

      {/* Quick Demo Credentials Autofill Helper */}
      <div className="mb-6 p-3.5 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
          <span>⚡ Quick Evaluation Autofill:</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo('student@shopsphere.edu', 'Student@123')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-blue-100/60 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Student Account
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('admin@shopsphere.edu', 'Admin@123')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-blue-100/60 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Account
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Campus Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="e.g. student@shopsphere.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {loading ? (
            'Signing In...'
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        Don't have a student account yet?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
