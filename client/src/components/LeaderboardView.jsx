import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Sparkles, Heart, Crown, Award, ChevronRight, Calendar } from 'lucide-react';
import { cacheGet, cacheSet } from '../utils/pageCache';
import { optimizeAvatarUrl, optimizeCloudinaryUrl } from '../utils/imageOptimizer';

const LeaderboardView = ({ onSelectUser }) => {
  const [data, setData] = useState(() => cacheGet('leaderboard') || { topCreators: [], trendingPosts: [], monthlyCreators: [] });
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' | 'creators' | 'trending'
  const [loading, setLoading] = useState(() => !cacheGet('leaderboard'));

  useEffect(() => {
    // If already cached, don't show loading spinner or re-fetch on navigation
    if (cacheGet('leaderboard')) {
      setLoading(false);
      return;
    }

    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData.data);
          cacheSet('leaderboard', resData.data);
        }
      })
      .catch(err => console.error('Error fetching leaderboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const top3 = data.topCreators.slice(0, 3);
  const remaining = data.topCreators.slice(3);

  const monthlyList = Array.isArray(data.monthlyCreators) ? data.monthlyCreators : [];
  const monthlyLeader = monthlyList[0];
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Crown className="w-3.5 h-3.5" />
          ClickStar Rankings
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Hall of Stars</h1>
        <p className="text-zinc-400 text-sm mt-1">Recognizing monthly leaders, top creators and most engaged content</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#1a1a1a] p-1 rounded-xl border border-[#2e2e2e] flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'monthly'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            Monthly Leader
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'creators'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            All-Time Creators
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            Trending Posts
          </button>
        </div>
      </div>

      {/* 1. Monthly Leader Tab */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Spotlight Card */}
          {monthlyLeader ? (
            <div 
              onClick={() => onSelectUser && onSelectUser(monthlyLeader.username)}
              className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-transparent border-2 border-amber-500/50 cursor-pointer hover:border-amber-400 transition shadow-2xl shadow-amber-500/10"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-rose-500 rounded-full blur-xs opacity-90 animate-pulse" />
                    <img
                      src={optimizeAvatarUrl(monthlyLeader.avatar_url, 150)}
                      alt={monthlyLeader.username}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-black"
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-amber-400 text-black shadow-lg">
                      <Crown className="w-4 h-4 fill-black" />
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      🥇 Leader for {currentMonthName}
                    </div>
                    <h3 className="text-2xl font-black text-white">@{monthlyLeader.username}</h3>
                    <p className="text-xs text-zinc-300">{monthlyLeader.full_name || 'Top Creator'}</p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {monthlyLeader.monthly_posts_count} posts published this month
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end justify-center bg-black/40 sm:bg-transparent p-3 rounded-2xl w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Monthly Likes</span>
                  <div className="flex items-center gap-1.5 text-rose-400 text-2xl font-black">
                    <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                    <span>{monthlyLeader.monthly_likes_received}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold mt-0.5">Highest in community</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#141414] rounded-2xl border border-zinc-800 text-zinc-400">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
              <p className="text-sm font-semibold">No monthly contenders recorded yet for {currentMonthName}</p>
            </div>
          )}

          {/* Monthly Rankings List */}
          {monthlyList.length > 0 && (
            <div className="bg-[#121212] border border-[#262626] rounded-2xl divide-y divide-[#262626] overflow-hidden">
              <div className="p-3.5 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
                <span>Rank & Creator</span>
                <span>Likes This Month</span>
              </div>
              {monthlyList.map((user, idx) => (
                <div
                  key={user.id}
                  onClick={() => onSelectUser && onSelectUser(user.username)}
                  className={`flex items-center justify-between p-4 hover:bg-zinc-900/60 transition cursor-pointer ${
                    idx === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 text-center text-xs font-extrabold text-zinc-400">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </span>
                    <img
                      src={optimizeAvatarUrl(user.avatar_url, 90)}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">@{user.username}</span>
                        {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                      </div>
                      <span className="text-xs text-zinc-400">{user.full_name || 'Creator'} · {user.monthly_posts_count} posts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-rose-400 text-sm font-extrabold">
                      <Heart className="w-4 h-4 fill-rose-500/30" />
                      <span>{user.monthly_likes_received}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. All-Time Creators Tab */}
      {activeTab === 'creators' && (
        <div>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-10 pt-6">
              {/* Silver - 2nd place */}
              {top3[1] && (
                <div 
                  onClick={() => onSelectUser && onSelectUser(top3[1].username)}
                  className="bg-[#141414] border border-[#262626] rounded-2xl p-4 text-center cursor-pointer hover:border-zinc-500 transition relative flex flex-col items-center"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-400 text-black font-extrabold text-xs flex items-center justify-center mb-2">
                    2
                  </div>
                  <img
                    src={optimizeAvatarUrl(top3[1].avatar_url, 150)}
                    alt={top3[1].username}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-zinc-400 mb-2"
                    loading="lazy"
                  />
                  <p className="font-semibold text-white text-xs sm:text-sm truncate w-full">@{top3[1].username}</p>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{top3[1].stars_count}</span>
                  </div>
                </div>
              )}

              {/* Gold - 1st place */}
              {top3[0] && (
                <div 
                  onClick={() => onSelectUser && onSelectUser(top3[0].username)}
                  className="bg-gradient-to-b from-amber-500/10 to-[#141414] border-2 border-amber-500/40 rounded-2xl p-5 text-center cursor-pointer hover:border-amber-400 transition relative flex flex-col items-center -translate-y-4 shadow-xl shadow-amber-500/10"
                >
                  <Crown className="w-7 h-7 text-amber-400 -mb-1 animate-bounce" />
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center mb-2 shadow-lg">
                    1
                  </div>
                  <img
                    src={optimizeAvatarUrl(top3[0].avatar_url, 180)}
                    alt={top3[0].username}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-amber-400 mb-2"
                    loading="lazy"
                  />
                  <p className="font-bold text-white text-sm sm:text-base truncate w-full">@{top3[0].username}</p>
                  <div className="flex items-center gap-1 text-amber-400 text-sm font-extrabold mt-1">
                    <Sparkles className="w-4 h-4" />
                    <span>{top3[0].stars_count} Stars</span>
                  </div>
                </div>
              )}

              {/* Bronze - 3rd place */}
              {top3[2] && (
                <div 
                  onClick={() => onSelectUser && onSelectUser(top3[2].username)}
                  className="bg-[#141414] border border-[#262626] rounded-2xl p-4 text-center cursor-pointer hover:border-zinc-500 transition relative flex flex-col items-center"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center mb-2">
                    3
                  </div>
                  <img
                    src={optimizeAvatarUrl(top3[2].avatar_url, 150)}
                    alt={top3[2].username}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-700 mb-2"
                    loading="lazy"
                  />
                  <p className="font-semibold text-white text-xs sm:text-sm truncate w-full">@{top3[2].username}</p>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{top3[2].stars_count}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remaining Rankings List */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl divide-y divide-[#262626] overflow-hidden">
            {remaining.map((user, idx) => (
              <div
                key={user.id}
                onClick={() => onSelectUser && onSelectUser(user.username)}
                className="flex items-center justify-between p-4 hover:bg-zinc-900/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center text-sm font-bold text-zinc-500">
                    {idx + 4}
                  </span>
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">@{user.username}</p>
                    <p className="text-xs text-zinc-400">{user.full_name || 'Creator'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold justify-end">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{user.stars_count}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">{user.total_posts} posts</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Trending Posts Grid */}
      {activeTab === 'trending' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {data.trendingPosts.map((post, idx) => (
            <div
              key={post.id}
              className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden group cursor-pointer"
            >
              <img
                src={post.image_url}
                alt={post.caption || 'Trending Post'}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-white flex items-center gap-1">
                <span>#{idx + 1}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                <p className="text-xs text-white font-semibold line-clamp-1">@{post.username}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
                  <span className="flex items-center gap-1 font-bold text-rose-400">
                    <Heart className="w-3.5 h-3.5 fill-rose-400" />
                    {post.likes_count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;

