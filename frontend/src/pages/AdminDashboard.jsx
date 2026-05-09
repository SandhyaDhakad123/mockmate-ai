import { useState, useEffect } from 'react';
import { getAdminStats } from '../services/api';
import MotionPage from '../components/UI/MotionPage';
import { Users, Activity, BarChart3, Shield, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(res => setStats(res.data))
      .catch(err => toast.error("Admin access denied or error fetching stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510]">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const adminStats = [
    { label: 'Total Platform Users', value: stats?.counts?.[0] || 0, icon: Users, color: 'text-indigo-400' },
    { label: 'Interviews Conducted', value: stats?.counts?.[1] || 0, icon: Activity, color: 'text-purple-400' },
    { label: 'Resumes Analyzed', value: stats?.counts?.[2] || 0, icon: BarChart3, color: 'text-emerald-400' },
    { label: 'System Health', value: '99.9%', icon: Shield, color: 'text-cyan-400' }
  ];

  return (
    <MotionPage className="min-h-screen pt-24 pb-12 px-6 bg-[#050510]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
           <h1 className="text-4xl font-black text-white mb-2">Admin <span className="gradient-text">Command Center</span></h1>
           <p className="text-slate-400 font-medium">Platform-wide monitoring and user management.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {adminStats.map((s, i) => (
            <div key={i} className="glass p-6 border-white/5">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}><s.icon size={20} /></div>
                 <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+12%</div>
              </div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* User Management Table (Mockup) */}
        <div className="glass overflow-hidden border-white/5">
           <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent User Activity</h3>
              <div className="flex gap-2 w-full md:w-auto">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="Search users..." className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-indigo-500 w-full" />
                 </div>
                 <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400"><Filter size={16} /></button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[1,2,3,4,5].map((u) => (
                       <tr key={u} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                             <div>
                                <div className="text-sm font-black text-white">User {u}</div>
                                <div className="text-[10px] text-slate-500">user{u}@example.com</div>
                             </div>
                          </td>
                          <td className="px-8 py-5"><span className="text-xs font-bold text-slate-400">Student</span></td>
                          <td className="px-8 py-5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></td>
                          <td className="px-8 py-5 text-xs text-slate-400 font-medium">May 0{u}, 2026</td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </MotionPage>
  );
}
