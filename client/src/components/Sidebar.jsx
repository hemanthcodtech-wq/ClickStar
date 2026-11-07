import React from 'react';
import logoImg from '../assets/logo.png';
import { 
  Home, 
  Search, 
  Compass, 
  Trophy, 
  PlusSquare, 
  User, 
  ShieldCheck, 
  Sparkles,
  Users,
  LogIn,
  LogOut
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const Sidebar = ({ activeTab, setActiveTab, onOpenCreate, onOpenAuth }) => {
  const { currentUser, allUsers, switchUser, logout } = useUser();

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, badge: 'Hot' },
    { id: 'create', label: 'Create Post', icon: PlusSquare, action: onOpenCreate },
    { id: 'profile', label: 'Profile', icon: User },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck, badge: 'Mod' }] : []),
  ];

  return (
    <aside className="hidden md:flex md:w-64 border-r border-[#262626] h-screen bg-black flex-col justify-between p-5 z-40 select-none shrink-0 sticky top-0 overflow-hidden">
      <div>
        {/* Logo from src/assets/logo.png */}
        <div 
          onClick={() => setActiveTab('feed')} 
          className="cursor-pointer mb-8 flex items-center gap-3 px-2 py-1 text-white hover:opacity-90"
        >
          <img 
            src={logoImg} 
            alt="ClickStar Logo" 
            className="w-8 h-8 rounded-lg object-contain shadow-md shadow-rose-500/20" 
          />
          <span className="hidden md:inline font-bold tracking-tight text-xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ClickStar
          </span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition font-medium text-sm md:text-base ${
                  isActive 
                    ? 'bg-zinc-900 text-white font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'text-rose-500' : ''}`} />
                </div>
                <span className="hidden md:inline flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Switcher / Profile Footer */}
      <div className="pt-4 border-t border-[#262626]">
        {currentUser ? (
          <div>
            <div className="flex items-center justify-between px-1">
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 cursor-pointer group flex-1 overflow-hidden"
              >
                <img 
                  src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                  alt={currentUser?.username} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-rose-500 transition shrink-0"
                />
                <div className="hidden md:block text-left overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{currentUser?.full_name || currentUser?.username}</p>
                  <p className="text-xs text-zinc-400 truncate">@{currentUser?.username}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="hidden md:flex p-1.5 text-zinc-500 hover:text-rose-400 transition rounded-lg hover:bg-zinc-900"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-500/20"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden md:inline">Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
