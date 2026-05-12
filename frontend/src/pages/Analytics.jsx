import { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '../services/api';
import { Trophy, Code, FileText, Activity, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAnalyticsSummary()
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const stats = [
    { label: 'Avg Interview Score', value: `${data.summary.avgInterviewScore}%`, icon: Trophy, color: 'text-indigo-400' },
    { label: 'Avg Coding Score', value: `${data.summary.avgCodingScore}%`, icon: Code, color: 'text-purple-400' },
    { label: 'ATS Score', value: `${data.summary.atsScore}%`, icon: FileText, color: 'text-emerald-400' },
    { label: 'Total Interviews', value: data.summary.totalInterviews, icon: Activity, color: 'text-amber-400' }
  ];

  return (
    <div className="min-h-screen pt-12 pb-20 px-6 bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Your Performance Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="glass p-6 border-black/5 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-4 ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="glass overflow-hidden border-black/5 dark:border-white/10 bg-white dark:bg-[#0b0b14]">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <History size={20} className="text-slate-400 dark:text-slate-500" /> Interview History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Score</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.history?.interviews?.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{i.role}</div>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date(i.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${i.totalScore >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'}`}>
                        {Math.round((i.totalScore / i.maxScore) * 100)}%
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => navigate(`/feedback/${i._id}`)} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
