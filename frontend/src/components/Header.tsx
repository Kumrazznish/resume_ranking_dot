import { Target, Menu, X, LogOut, ShieldCheck, Briefcase, FileSearch, Trophy, BarChart2, Sparkles, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const isLandingPage = location.pathname === '/' && !isAuthenticated && !isAdmin;

  // Don't render the app header on the public landing page (it has its own inline nav)
  if (isLandingPage) return null;

  return (
    <header className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <Link 
            to={isAdmin ? "/admin" : isAuthenticated ? "/upload" : "/"} 
            className="flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Target className="h-5 w-5" />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">ResumeRanker Pro</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  {isAdmin ? 'ADMIN CONSOLE' : 'ENTERPRISE ATS'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isAdmin ? 'System Governance & Telemetry' : 'AI-Powered Talent Intelligence'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {isAdmin ? (
              /* Admin Navigation */
              <div className="flex items-center space-x-2">
                <Link 
                  to="/admin" 
                  className="font-semibold transition-all px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Executive Admin Console</span>
                </Link>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>System Nominal</span>
                </div>
              </div>
            ) : (
              /* Recruiter Navigation */
              <div className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Link 
                  to="/upload" 
                  id="nav-screen-resumes"
                  className={`font-semibold transition-all px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 ${
                    isActive('/upload') 
                      ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileSearch className="h-3.5 w-3.5" />
                  <span>Screen Resumes</span>
                </Link>

                <Link 
                  to="/results" 
                  id="nav-leaderboard"
                  className={`font-semibold transition-all px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 ${
                    isActive('/results') 
                      ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Leaderboard</span>
                </Link>

                <Link 
                  to="/analytics" 
                  id="nav-analytics"
                  className={`font-semibold transition-all px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 ${
                    isActive('/analytics') 
                      ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Analytics</span>
                </Link>

                <Link 
                  to="/archives" 
                  id="nav-archives"
                  className={`font-semibold transition-all px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 ${
                    isActive('/archives') 
                      ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Screening Archives</span>
                </Link>
              </div>
            )}
            
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

            <ThemeToggle />

            {/* Auth Buttons / Profile Badge */}
            {isAuthenticated && currentUser ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  id="user-profile-btn"
                  className="flex items-center space-x-2.5 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold ${
                    currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-indigo-600'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="leading-tight truncate max-w-[110px] font-semibold">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {currentUser.role === 'admin' ? 'Master Admin' : 'Recruiting Lead'}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-scale-in">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-2 flex items-center space-x-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        <Building2 className="h-3 w-3 text-indigo-500" />
                        <span>{currentUser.company || (currentUser.role === 'admin' ? 'Headquarters' : 'Global Recruitment')}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      {currentUser.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>Admin Control Console</span>
                        </Link>
                      ) : (
                        <Link
                          to="/upload"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                        >
                          <Briefcase className="h-4 w-4 text-indigo-500" />
                          <span>Screen Resumes Workspace</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        id="header-signout-btn"
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2">
            <div className="p-3 space-y-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
              {isAdmin ? (
                /* Mobile Admin Navigation */
                <Link
                  to="/admin"
                  className="block px-3.5 py-2.5 font-bold rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 text-xs flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Executive Admin Console</span>
                </Link>
              ) : (
                /* Mobile HR Recruiter Navigation */
                <>
                  <Link
                    to="/upload"
                    className={`block px-3.5 py-2.5 font-semibold rounded-xl text-xs flex items-center space-x-2 ${
                      isActive('/upload') ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileSearch className="h-4 w-4" />
                    <span>Screen Resumes</span>
                  </Link>
                  <Link
                    to="/results"
                    className={`block px-3.5 py-2.5 font-semibold rounded-xl text-xs flex items-center space-x-2 ${
                      isActive('/results') ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Leaderboard</span>
                  </Link>
                  <Link
                    to="/analytics"
                    className={`block px-3.5 py-2.5 font-semibold rounded-xl text-xs flex items-center space-x-2 ${
                      isActive('/analytics') ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    to="/archives"
                    className={`block px-3.5 py-2.5 font-semibold rounded-xl text-xs flex items-center space-x-2 ${
                      isActive('/archives') ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Screening Archives</span>
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {isAuthenticated && currentUser ? (
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-indigo-600 text-white rounded-xl"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}