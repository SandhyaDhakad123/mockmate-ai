import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#050509] min-h-screen text-slate-700 dark:text-slate-300 selection:bg-indigo-500/30 flex items-center justify-center transition-colors duration-300">
      {/* Hero Section */}
      <section className="px-6 text-center max-w-5xl mx-auto -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 leading-[1.05] tracking-tighter">
            Prepare for your <br />
            <span className="text-indigo-500">dream job</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12">
            The industry's most advanced AI platform for interview prep. 
            Get real-time feedback, technical analysis, and resume coaching.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="btn-primary !px-12 !py-5 text-xl">
              Get Started Free <ArrowRight size={22} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary !px-12 !py-5 text-xl">
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="fixed bottom-12 left-0 w-full text-center text-slate-700">
        <p className="text-xs font-black uppercase tracking-[0.3em]">&copy; 2026 MockMate AI</p>
      </footer>
    </div>
  );
}
