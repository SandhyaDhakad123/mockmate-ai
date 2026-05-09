import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data.token, res.data.user);
      navigate('/upload-resume');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-[#050509] transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white dark:bg-[#0b0b14] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-10 md:p-14 shadow-2xl transition-colors duration-300"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold dark:text-white text-slate-900 tracking-tight">Create Account</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-base">Start your interview preparation journey</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8 text-red-500 dark:text-red-400 text-xs flex items-center gap-3">
            <span className="text-lg">❌</span>
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1">
              Full Name
            </label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Enter your full name"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <input 
              className="input-field" 
              type="email" 
              placeholder="Enter your email"
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1">
              Password
            </label>
            <input 
              className="input-field" 
              type="password" 
              placeholder="Enter your password"
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1">
              Confirm Password
            </label>
            <input 
              className="input-field" 
              type="password" 
              placeholder="Confirm your password"
              value={form.confirm} 
              onChange={e => setForm({ ...form, confirm: e.target.value })} 
              required 
            />
          </div>

          <button 
            className="w-full h-[60px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2" 
            type="submit" 
            disabled={loading}
          >
            ✨ {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-10 text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline">
            Sign In →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
