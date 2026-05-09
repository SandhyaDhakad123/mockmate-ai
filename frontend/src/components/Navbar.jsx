import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, PlayCircle, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Synchronous initialization to prevent flicker
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navLinks = [
    { path: '/upload-resume', label: 'Resume', icon: FileText },
    { path: '/select-role', label: 'Interview', icon: PlayCircle },
    { path: '/analytics', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-white dark:bg-[#050509]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 sticky top-0 z-50 py-4 px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 no-underline group ml-4">
          <span className="text-2xl font-black tracking-tighter dark:text-white text-slate-900">
            <span className="text-indigo-500">MockMate</span> AI
          </span>
        </Link>
        
        <div className="flex items-center gap-8">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`text-sm font-bold transition-colors ${location.pathname === link.path ? 'text-indigo-400' : 'dark:text-slate-400 text-slate-500 hover:text-indigo-500 dark:hover:text-white'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4 border-l dark:border-white/10 border-black/10 pl-6">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold dark:text-white text-slate-900">{user.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Member</div>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <button 
                onClick={toggleTheme}
                className="p-2 dark:text-slate-400 text-slate-600 hover:text-indigo-500 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="text-sm font-bold dark:text-white text-slate-900 hover:text-indigo-500 transition-colors">Sign In</Link>
              <Link to="/register" className="btn-primary !py-2.5 !px-6 !text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
