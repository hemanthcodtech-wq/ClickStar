import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Crown, 
  Flame, 
  ExternalLink, 
  UserPlus, 
  Check, 
  ShieldCheck, 
  Heart,
  Compass
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { optimizeAvatarUrl } from '../utils/imageOptimizer';

export const DesktopRightRail = ({ onSelectUser, onNavigateTab, onOpenStarsInfo }) => {
  const { currentUser, allUsers, logout } = useUser();
  const [topCreators, setTopCreators] = useState([]);
  const [followedMap, setFollowedMap] = useState({});

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.topCreators) {
          setTopCreators(d.data.topCreators.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  const handleFollowToggle = async (targetUser) => {
    const currentState = followedMap[targetUser.id];
    try {
      const res = await fetch(`/api/posts/follow/${targetUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowedMap(prev => ({
          ...prev,
          [targetUser.id]: data.status === 'pending' ? 'requested' : data.status === 'followed' ? 'following' : 'none',
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const suggestedUsers = (allUsers || [])
    .filter(u => u.id !== currentUser?.id)
    .slice(0, 4);

  return (
    <aside className="hidden lg:block w-80 xl:w-88 pl-6 pr-4 py-8 space-y-6 shrink-0 h-screen overflow-y-auto select-none border-l border-[#1f1f23]/60 sticky top-0 bg-black">
      
      {/* 1. Logged In User Mini Profile Widget */}
      {currentUser && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141417]/80 border border-white/5 shadow-lg backdrop-blur-md">
          <div 
            onClick={() => onSelectUser && onSelectUser(currentUser.username)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative">
              <img
                src={optimizeAvatarUrl(currentUser.avatar_url, 120)}
                alt={currentUser.username}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-rose-500 transition"
              />
              {currentUser.role === 'admin' && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-black p-0.5 rounded-full ring-2 ring-black">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <span className="font-bold text-sm text-white block truncate group-hover:text-rose-400 transition">
                {currentUser.full_name || currentUser.username}
              </span>
              <span className="text-xs text-zinc-400 block truncate">@{currentUser.username}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-xs font-bold text-zinc-400 hover:text-rose-400 transition px-2.5 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
          >
            Log Out
          </button>
        </div>
      )}

      {/* 2. ClickStar Economy & Reward Stars Banner */}
      <div 
        onClick={onOpenStarsInfo}
        className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-[#18181c] border border-amber-500/30 cursor-pointer group hover:border-amber-400/60 transition shadow-xl shadow-amber-500/5"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-black tracking-wider uppercase text-amber-300">
              Your Stars Balance
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-white transition">
            Learn More →
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-white tracking-tight">
            {currentUser?.stars_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs font-bold text-amber-400">ClickStars ✨</span>
        </div>

        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
          Awarded when your community loves your posts & stories. High engagement crowns you as the monthly leader!
        </p>
      </div>

      {/* 3. Suggested Creators & Follow Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Suggested Creators
          </span>
          <button 
            onClick={() => onNavigateTab && onNavigateTab('search')}
            className="text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="space-y-2.5">
          {suggestedUsers.map((user) => {
            const followedState = followedMap[user.id];

            return (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-900/60 transition"
              >
                <div 
                  onClick={() => onSelectUser && onSelectUser(user.username)}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <img
                    src={optimizeAvatarUrl(user.avatar_url, 90)}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate hover:underline">
                      @{user.username}
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {user.full_name || 'Popular Creator'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollowToggle(user)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    followedState === 'following'
                      ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      : followedState === 'requested'
                      ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm'
                  }`}
                >
                  {followedState === 'following' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : followedState === 'requested' ? (
                    <span>Requested</span>
                  ) : (
                    <span>Follow</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Trending Monthly Stars Podium Teaser */}
      {topCreators.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#141417]/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Crown className="w-4 h-4 fill-amber-400" />
              <span>Monthly Leaderboard</span>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('leaderboard')}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300"
            >
              View Podium
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {topCreators.slice(0, 3).map((c, i) => (
              <div 
                key={c.id} 
                onClick={() => onSelectUser && onSelectUser(c.username)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/40 cursor-pointer transition text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-black text-zinc-500 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                  <img
                    src={optimizeAvatarUrl(c.avatar_url, 70)}
                    alt={c.username}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <span className="font-bold text-white truncate max-w-[110px]">
                    @{c.username}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400 font-extrabold text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  <span>{c.stars_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Desktop Quick Footer Links */}
      <div className="pt-2 text-[11px] text-zinc-600 space-y-2 px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="hover:text-zinc-400 cursor-pointer transition">About</span>
          <span>•</span>
          <span className="hover:text-zinc-400 cursor-pointer transition">Creator Rewards</span>
          <span>•</span>
          <span className="hover:text-zinc-400 cursor-pointer transition">Help</span>
          <span>•</span>
          <span className="hover:text-zinc-400 cursor-pointer transition">API</span>
          <span>•</span>
          <span className="hover:text-zinc-400 cursor-pointer transition">Privacy</span>
        </div>
        <p className="text-[10px] text-zinc-700">
          © {new Date().getFullYear()} ClickStar Interactive, Inc.
        </p>
      </div>

    </aside>
  );
};

