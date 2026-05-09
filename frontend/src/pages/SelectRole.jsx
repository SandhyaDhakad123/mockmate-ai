import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../services/api';
import MotionPage from '../components/UI/MotionPage';
import { toast } from 'react-hot-toast';
import { Search, Building2, Briefcase, Zap, Star, ShieldCheck, ChevronRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SelectRole() {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const companies = [
    { name: 'Google', logo: 'G', color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Amazon', logo: 'A', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Microsoft', logo: 'M', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'TCS', logo: 'T', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Infosys', logo: 'I', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Accenture', logo: 'A', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const handleStart = async () => {
    if (!role) return toast.error("Please specify a target role");
    setLoading(true);
    try {
      const res = await startInterview({ 
        role, 
        difficulty, 
        company: company?.name || 'General' 
      });
      toast.success(`Interview for ${company?.name || 'General'} started!`);
      navigate(`/interview/${res.data.data.interviewId}`);
    } catch (err) {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionPage className="min-h-screen pt-24 pb-12 px-6 bg-white dark:bg-[#050510] transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
           <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Configure Your <span className="gradient-text">Session</span></h1>
           <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">Select your target role and company to generate a personalized AI interview track.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-12">
          <div className="space-y-12">
            {/* Step 1: Role */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-xs font-black">01</div>
                 <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Select Target Role</h3>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold"
                  placeholder="e.g. Senior Frontend Developer, Data Scientist..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </section>

            {/* Step 2: Company (NEW FEATURE) */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">02</div>
                 <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Company Specific Track</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {companies.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setCompany(company?.name === c.name ? null : c)}
                    className={`p-6 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden ${company?.name === c.name ? 'bg-slate-100 dark:bg-white/10 border-indigo-500 shadow-[0_10px_30px_rgba(99,102,241,0.1)] dark:shadow-[0_10px_30px_rgba(99,102,241,0.2)]' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/20'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center font-black text-lg mb-3 transition-transform group-hover:scale-110`}>
                      {c.logo}
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">{c.name}</div>
                    {company?.name === c.name && <div className="absolute top-2 right-2 text-indigo-500"><ShieldCheck size={16} /></div>}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar: Config & Start */}
          <div className="space-y-6">
            <div className="glass p-8 dark:border-white/10 border-black/5 bg-white dark:bg-[#0b0b14]">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Session Difficulty</h4>
               <div className="space-y-3">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`w-full py-3 rounded-xl border font-bold text-sm uppercase tracking-widest transition-all ${difficulty === d ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                      {d}
                    </button>
                  ))}
               </div>

               <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-xs font-bold text-slate-500">Selected Track</span>
                     <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{company?.name || 'General'}</span>
                  </div>
                  <button 
                    onClick={handleStart}
                    disabled={loading || !role}
                    className="btn-primary w-full flex items-center justify-center gap-2 group"
                  >
                    {loading ? 'Initializing AI...' : 'Begin Session'}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            <div className="p-6 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 rounded-2xl">
               <div className="flex gap-3 text-amber-700 dark:text-amber-200/60">
                  <Zap size={20} className="shrink-0 text-amber-500 dark:text-amber-400" />
                  <div>
                     <p className="text-xs font-bold mb-1 uppercase tracking-tight">AI Readiness Tip</p>
                     <p className="text-[10px] leading-relaxed opacity-80">
                        Selecting a company track adapts the AI to that company's specific culture and technical bar. Be prepared for high-intensity behavioral questions.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </MotionPage>
  );
}
