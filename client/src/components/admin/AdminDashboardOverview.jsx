import React from 'react';
import { 
  Users, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Radio, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Activity
} from 'lucide-react';

export const AdminDashboardOverview = ({ stats, onNavigateTab }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Creators',
      value: stats.totalUsers,
      subtext: 'Registered accounts',
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
      tab: 'users'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      subtext: 'Published community media',
      icon: ImageIcon,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      tab: 'posts'
    },
    {
      title: 'ClickStars Economy',
      value: stats.totalStars?.toLocaleString() || 0,
      subtext: 'Stars awarded across platform',
      icon: Sparkles,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      tab: 'users'
    },
    {
      title: 'Active 24h Stories',
      value: stats.activeStories,
      subtext: 'Live expiring stories',
      icon: Radio,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
      tab: 'stories'
    },
    {
      title: 'Flagged Content',
      value: stats.flaggedPosts,
      subtext: 'Requires immediate review',
      icon: AlertTriangle,
      color: stats.flaggedPosts > 0 
        ? 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/40' 
        : 'from-zinc-800 to-zinc-900 text-zinc-400 border-zinc-700',
      tab: 'posts'
    },
    {
      title: 'Total Interactions',
      value: ((stats.totalLikes || 0) + (stats.totalComments || 0)).toLocaleString(),
      subtext: `${stats.totalLikes} likes • ${stats.totalComments} comments`,
      icon: Activity,
      color: 'from-pink-500/20 to-pink-600/10 text-pink-400 border-pink-500/30',
      tab: 'posts'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Health Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18181b] via-[#151518] to-[#121214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live & Fully Operational
          </div>
          <h2 className="text-xl font-extrabold text-white">Platform Health & Global Telemetry</h2>
          <p className="text-xs text-zinc-400 mt-1">Real-time metrics connected directly to Neon PostgreSQL & Cloudinary CDN</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('moderation')}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition cursor-pointer"
          >
            Review Flagged ({stats.flaggedPosts})
          </button>
          <button
            onClick={() => onNavigateTab('users')}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition cursor-pointer"
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="bg-[#141416] border border-white/10 hover:border-zinc-700 rounded-3xl p-5 transition-all duration-200 cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${card.color} border shadow-inner`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
              </div>

              <div>
                <span className="text-xs font-semibold text-zinc-400 block">{card.title}</span>
                <p className="text-3xl font-extrabold text-white tracking-tight mt-1">{card.value}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

