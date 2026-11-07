import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Radio, 
  Settings, 
  ArrowLeft,
  Sparkles,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { AdminDashboardOverview } from './admin/AdminDashboardOverview';
import { AdminPostsManager } from './admin/AdminPostsManager';
import { AdminUsersManager } from './admin/AdminUsersManager';
import { AdminStoriesManager } from './admin/AdminStoriesManager';
import { AdminSystemSettings } from './admin/AdminSystemSettings';
import { AdminMonthlyLeaderboard } from './admin/AdminMonthlyLeaderboard';
import { Trophy } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const AdminPanel = ({ onExitToFeed }) => {
  const { currentUser, logout } = useUser();
  const [activeAdminTab, setActiveAdminTab] = useState(() => {
    return localStorage.getItem('clickstar_admin_active_tab') || 'overview';
  }); // 'overview' | 'leaderboard' | 'posts' | 'users' | 'stories' | 'settings'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleAdminTabChange = (tab) => {
    setActiveAdminTab(tab);
    localStorage.setItem('clickstar_admin_active_tab', tab);
  };

  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      const [resStats, resPosts, resUsers] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/posts').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
      ]);

      if (resStats.success) setStats(resStats.data);
      if (resPosts.success) setPosts(resPosts.data);
      if (resUsers.success) setUsers(resUsers.data);
    } catch (err) {
      console.error('Error fetching admin telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleFlag = async (postId) => {
    try {
      const res = await fetch(`/api/admin/posts/${postId}/flag`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser?.id })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => p.id === postId ? { ...p, is_flagged: data.data.is_flagged } : p));
        if (stats) {
          const delta = data.data.is_flagged ? 1 : -1;
          setStats({ ...stats, flaggedPosts: Math.max(0, stats.flaggedPosts + delta) });
        }
      }
    } catch (err) {
      console.error('Toggle flag error:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to permanently delete this post and its Cloudinary media?')) return;

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p.id !== postId));
        if (stats) setStats({ ...stats, totalPosts: Math.max(0, stats.totalPosts - 1) });
      }
    } catch (err) {
      console.error('Admin delete post error:', err);
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user role to ${nextRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleAdjustStars = async (userId, amount) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starsAdjustment: amount }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, stars_count: Math.max(0, (u.stars_count || 0) + amount) } : u));
        if (stats) {
          setStats({ ...stats, totalStars: Math.max(0, (stats.totalStars || 0) + amount) });
        }
      }
    } catch (err) {
      console.error('Stars adjustment error:', err);
    }
  };

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: LayoutDashboard,
      desc: 'System health & telemetry'
    },
    { 
      id: 'leaderboard', 
      label: 'Monthly Leaderboard', 
      icon: Trophy, 
      badge: 'Monthly Reset',
      desc: 'Top likes winner per month'
    },
    { 
      id: 'posts', 
      label: 'Content Moderation', 
      icon: FileText, 
      badge: stats?.flaggedPosts ? `${stats.flaggedPosts} Flagged` : null,
      desc: 'Review, flag & delete media'
    },
    { 
      id: 'users', 
      label: 'Users Directory', 
      icon: Users, 
      badge: stats?.totalUsers ? `${stats.totalUsers}` : null,
      desc: 'Permissions & star balance'
    },
    { 
      id: 'stories', 
      label: 'Active 24h Stories', 
      icon: Radio, 
      badge: stats?.activeStories ? `${stats.activeStories}` : null,
      desc: 'Expiring live media monitor'
    },
    { 
      id: 'settings', 
      label: 'Cloud Systems', 
      icon: Settings,
      desc: 'Neon DB, Cloudinary & SMTP'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeAdminTab) {
      case 'overview':
        return (
          <AdminDashboardOverview 
            stats={stats} 
            onNavigateTab={(tab) => handleAdminTabChange(tab)} 
          />
        );
      case 'leaderboard':
        return <AdminMonthlyLeaderboard />;
      case 'posts':
        return (
          <AdminPostsManager
            posts={posts}
            onToggleFlag={handleToggleFlag}
            onDeletePost={handleDeletePost}
          />
        );
      case 'users':
        return (
          <AdminUsersManager
            users={users}
            onUpdateRole={handleUpdateRole}
            onAdjustStars={handleAdjustStars}
          />
        );
      case 'stories':
        return <AdminStoriesManager />;
      case 'settings':
        return <AdminSystemSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row">
      
      {/* Dedicated Desktop Admin Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#0d0d10] border-r border-white/10 flex-col justify-between p-5 sticky top-0 h-screen shrink-0 z-30 select-none shadow-[20px_0_50px_rgba(0,0,0,0.85)]">
        <div>
          {/* Admin Header with Brand Logo & Glow */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/10 pb-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl blur-xs opacity-75" />
              <img src={logoImg} alt="ClickStar" className="relative w-8 h-8 rounded-xl object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">ClickStar</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Master Control Console</p>
            </div>
          </div>

          {/* Admin Navigation Menu */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-3 mb-2 block">
              Admin Sections
            </span>

            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleAdminTabChange(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-rose-500 text-black shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/50'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-amber-400'}`} />
                    <div className="text-left">
                      <span className="block leading-tight font-extrabold">{item.label}</span>
                      <span className={`text-[10px] font-normal leading-tight block mt-0.5 ${isActive ? 'text-black/80 font-medium' : 'text-zinc-500'}`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer (Live Sync, Exit & Logout) */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {/* Current Admin Account Card with Logout button */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 mb-1 group">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'} 
                alt="Admin" 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/50" 
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">@{currentUser?.username}</span>
                <span className="text-[10px] text-amber-400 block truncate font-medium">Administrator</span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Logout Administrator"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-semibold text-zinc-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Telemetry</span>
          </button>

          {onExitToFeed && (
            <button
              onClick={onExitToFeed}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-xs font-bold text-white transition shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to ClickStar Feed</span>
            </button>
          )}

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header & Dropdown Drawer */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0e0e11] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="ClickStar" className="w-7 h-7 rounded-lg object-contain" />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white">ClickStar</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExitToFeed && (
            <button
              onClick={onExitToFeed}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Exit
            </button>
          )}
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg bg-red-500/20 text-rose-400 border border-red-500/30"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-zinc-800 text-white"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#141416] border-b border-white/10 p-3 space-y-1 z-30"
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleAdminTabChange(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition ${
                    isActive ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 w-full p-4 sm:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAdminTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPanel;
