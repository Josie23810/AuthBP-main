import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  adminSignInFailure,
  adminSignInStart,
  adminSignInSuccess,
} from '../redux/admin/adminSlice';
import { apiFetch } from '../utils/api';

export default function AdminSignIn() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    accessCode: '',
  });
  const { loading, error, currentAdmin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (currentAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(adminSignInStart());
      const data = await apiFetch('/api/admin/signin', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (data.success === false) {
        dispatch(adminSignInFailure(data));
        return;
      }
      dispatch(adminSignInSuccess(data));
      navigate('/admin');
    } catch (err) {
      dispatch(adminSignInFailure({ message: err.message || 'Admin sign-in failed' }));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(64,196,255,0.12),_transparent_30%)]" />

      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_0_40px_rgba(255,215,0,0.08)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-gold-accent">
          Staff only
        </p>
        <h1 className="mt-3 text-center text-3xl font-black text-white">Admin portal</h1>
        

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            placeholder="Admin ID"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-gold-accent focus:outline-none"
          />
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-gold-accent focus:outline-none"
          />
          <input
            id="accessCode"
            type="password"
            required
            autoComplete="off"
            placeholder="Access code"
            value={formData.accessCode}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-gold-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 p-3.5 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Enter dashboard'}
          </button>
        </form>

        {error && (
          <p className="mt-5 text-center text-sm text-red-400">
            {error.message || 'Could not sign in as admin'}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Regular users should{' '}
          <Link to="/sign-in" className="font-semibold text-neon-blue hover:underline">
            sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
