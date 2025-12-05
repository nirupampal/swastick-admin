import React from 'react';
import { LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar({ viewLang, setViewLang }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-emerald-200 shadow-md">
          M
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Microace<span className="text-emerald-600">Admin</span>
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        
        {/* View Language Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
            <Globe size={14} />
            <span>View In:</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button
               onClick={() => setViewLang('en')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                 viewLang === 'en' 
                   ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               ENGLISH
             </button>
             <button
               onClick={() => setViewLang('hi')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                 viewLang === 'hi' 
                   ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               HINDI
             </button>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium group"
        >
          <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}