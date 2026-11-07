import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Heart, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Award, 
  Flame, 
  TrendingUp, 
  Image as ImageIcon,
  MessageCircle,
  Medal,
  X,
  ExternalLink,
  Eye,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { optimizeAvatarUrl, optimizeCloudinaryUrl } from '../../utils/imageOptimizer';

export const AdminMonthlyLeaderboard = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expanded row or creator posts modal
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);

  const fetchMonthlyLeaderboard = async (m, y) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leaderboard/monthly?month=${m}&year=${y}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboardData(data.data);
      }
    } catch (err) {
      console.error('Failed to load monthly leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyLeaderboard(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const leader = leaderboardData?.leader;
  const rankings = leaderboardData?.rankings || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18181b] via-[#151518] to-[#121214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Monthly Hall of Fame & Leader Evaluation</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Monthly Reset
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Evaluates all posts within a calendar month. The creator with the highest sum of likes is crowned that month's Leader!
            </p>
          </div>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#1c1c20] p-1.5 rounded-2xl border border-white/5">
          <Calendar className="w-4 h-4 text-zinc-400 ml-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-transparent text-xs font-bold text-white px-2 py-1 outline-none cursor-pointer"
          >
            {monthNames.map((name, i) => (
              <option key={i + 1} value={i + 1} className="bg-zinc-900 text-white">
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent text-xs font-bold text-white px-2 py-1 outline-none cursor-pointer border-l border-zinc-700"
          >
            {[2026, 2025, 2024].map((yr) => (
              <option key={yr} value={yr} className="bg-zinc-900 text-white">
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-20 bg-[#141416] rounded-3xl border border-white/10 text-zinc-500">
          <Trophy className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-400">No post engagement recorded for {monthNames[selectedMonth - 1]} {selectedYear}</p>
          <p className="text-xs text-zinc-600 mt-1">Creators will appear here as soon as posts receive likes in this month.</p>
        </div>
      ) : (
        <>
          {/* Crowned Leader Spotlight Card */}
          {leader && (
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-amber-300 rounded-full blur-xs opacity-90 animate-pulse" />
                    <img 
                      src={optimizeAvatarUrl(leader.avatar_url, 160)} 
                      alt={leader.username} 
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-black"
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-amber-400 text-black shadow-lg">
                      <Crown className="w-5 h-5 fill-black" />
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                      <Crown className="w-3 h-3" />
                      Leader of {monthNames[selectedMonth - 1]} {selectedYear}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">@{leader.username}</h3>
                    <p className="text-xs text-zinc-300 mt-0.5">{leader.full_name || 'Official Creator'}</p>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      {leader.monthly_posts_count} posts published this month
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-center gap-2 bg-black/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-white/5 sm:border-0 w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Monthly Likes Score</span>
                  <div className="flex items-center gap-2 text-rose-400 text-2xl sm:text-3xl font-black">
                    <Heart className="w-7 h-7 fill-rose-500 text-rose-500 animate-bounce" />
                    <span>{leader.monthly_likes_received}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Highest engagement in {monthNames[selectedMonth - 1]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Full Monthly Leaderboard Rankings Table */}
          <div className="bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Full Rankings for {monthNames[selectedMonth - 1]} {selectedYear}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Click on any creator row to inspect their posts, like breakdown, and individual post telemetry
                </p>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {rankings.length} Active Contenders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1c1c20] text-zinc-400 font-bold border-b border-white/5 uppercase text-[10px]">
                  <tr>
                    <th className="p-4 text-center w-16">Rank</th>
                    <th className="p-4">Creator</th>
                    <th className="p-4">Monthly Likes</th>
                    <th className="p-4">Posts This Month</th>
                    <th className="p-4">Comments Received</th>
                    <th className="p-4">Posts Inspection</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rankings.map((user, idx) => {
                    const isRank1 = idx === 0;
                    const isRank2 = idx === 1;
                    const isRank3 = idx === 2;
                    const isExpanded = expandedUserId === user.user_id;
                    const userPosts = Array.isArray(user.monthly_posts) ? user.monthly_posts : [];

                    return (
                      <React.Fragment key={user.user_id}>
                        <tr 
                          onClick={() => setExpandedUserId(isExpanded ? null : user.user_id)}
                          className={`transition cursor-pointer ${
                            isRank1 
                              ? 'bg-amber-500/5 hover:bg-amber-500/10' 
                              : 'hover:bg-zinc-800/40'
                          } ${isExpanded ? 'bg-zinc-800/60' : ''}`}
                        >
                          <td className="p-4 text-center">
                            {isRank1 ? (
                              <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-extrabold text-xs inline-flex items-center justify-center shadow-lg shadow-amber-400/20">
                                🥇 1
                              </span>
                            ) : isRank2 ? (
                              <span className="w-7 h-7 rounded-full bg-zinc-300 text-black font-extrabold text-xs inline-flex items-center justify-center">
                                🥈 2
                              </span>
                            ) : isRank3 ? (
                              <span className="w-7 h-7 rounded-full bg-amber-800 text-white font-extrabold text-xs inline-flex items-center justify-center">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-zinc-500 font-bold">
                                #{idx + 1}
                              </span>
                            )}
                          </td>

                          <td className="p-4 flex items-center gap-3">
                            <img 
                              src={optimizeAvatarUrl(user.avatar_url, 90)} 
                              alt={user.username} 
                              className={`w-9 h-9 rounded-full object-cover ${
                                isRank1 ? 'ring-2 ring-amber-400' : 'ring-1 ring-zinc-700'
                              }`} 
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-sm">@{user.username}</span>
                                {isRank1 && (
                                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400">{user.full_name || 'Creator'}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-sm">
                              <Heart className="w-4 h-4 fill-rose-500/30" />
                              <span>{user.monthly_likes_received} likes</span>
                            </div>
                          </td>

                          <td className="p-4 text-zinc-300 font-medium">
                            <div className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{user.monthly_posts_count} posts</span>
                            </div>
                          </td>

                          <td className="p-4 text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                              <span>{user.monthly_comments_received} comments</span>
                            </div>
                          </td>

                          <td className="p-4">
                            {user.monthly_posts_count > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedUserId(isExpanded ? null : user.user_id);
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                  isExpanded 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                }`}
                              >
                                <span>{isExpanded ? 'Hide Posts' : `View ${userPosts.length} Posts`}</span>
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            ) : (
                              <span className="text-[11px] text-zinc-600 italic">No posts this month</span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {isRank1 && user.monthly_likes_received > 0 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                CROWNED LEADER
                              </span>
                            ) : user.monthly_posts_count > 0 ? (
                              <span className="text-[11px] text-zinc-400 font-medium">
                                Ranked #{idx + 1}
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-600">
                                No activity
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Expandable Accordion: View all user posts with likes details */}
                        {isExpanded && (
                          <tr className="bg-[#0e0e11]/90">
                            <td colSpan="7" className="p-5 border-t border-b border-white/5">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-extrabold text-white">
                                      All {userPosts.length} Posts by @{user.username} in {monthNames[selectedMonth - 1]} {selectedYear}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-zinc-400">
                                    Total: {user.monthly_likes_received} likes across {user.monthly_posts_count} posts
                                  </span>
                                </div>

                                {userPosts.length === 0 ? (
                                  <p className="text-xs text-zinc-500 py-3">No individual posts available for this period.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
                                    {userPosts.map((post) => (
                                      <div
                                        key={post.id}
                                        onClick={() => setPreviewPost({ ...post, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url })}
                                        className="group relative bg-[#18181c] border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-xl"
                                      >
                                        <div className="aspect-square bg-black relative overflow-hidden">
                                          <img
                                            src={optimizeCloudinaryUrl(post.image_url, 400)}
                                            alt={post.caption || 'Post image'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-90" />

                                          {/* Post like & comment badge overlay */}
                                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md font-bold text-rose-400 border border-white/10">
                                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                              <span>{post.likes_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md font-bold text-blue-400 border border-white/10">
                                              <MessageCircle className="w-3.5 h-3.5" />
                                              <span>{post.comments_count || 0}</span>
                                            </div>
                                          </div>

                                          {/* Flag badge if flagged */}
                                          {post.is_flagged && (
                                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[9px] font-bold">
                                              Flagged
                                            </div>
                                          )}
                                        </div>

                                        <div className="p-3">
                                          <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                                            {post.caption || <span className="text-zinc-500 italic">No caption provided</span>}
                                          </p>
                                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-zinc-500">
                                            <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-amber-400/90 font-semibold group-hover:underline flex items-center gap-0.5">
                                              Inspect <Eye className="w-3 h-3" />
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Post Detailed Inspection Modal */}
          {previewPost && (
            <div 
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setPreviewPost(null)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-[#141416] border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1c1c20]">
                  <div className="flex items-center gap-3">
                    <img 
                      src={optimizeAvatarUrl(previewPost.avatar_url, 90)} 
                      alt={previewPost.username} 
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">@{previewPost.username}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          Contender Post
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">{previewPost.full_name}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setPreviewPost(null)}
                    className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="w-full bg-black rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center max-h-[420px]">
                    <img 
                      src={previewPost.image_url} 
                      alt={previewPost.caption} 
                      className="w-full h-full object-contain max-h-[420px]" 
                    />
                  </div>

                  {/* Likes & Engagement Statistics in Admin Panel */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#1c1c20] p-3.5 rounded-2xl border border-white/5 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Post Likes</span>
                      <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xl font-black">
                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                        <span>{previewPost.likes_count || 0}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">Contributed to monthly score</span>
                    </div>

                    <div className="bg-[#1c1c20] p-3.5 rounded-2xl border border-white/5 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Comments</span>
                      <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xl font-black">
                        <MessageCircle className="w-5 h-5" />
                        <span>{previewPost.comments_count || 0}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">Community interactions</span>
                    </div>

                    <div className="bg-[#1c1c20] p-3.5 rounded-2xl border border-white/5 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Published</span>
                      <div className="flex items-center justify-center gap-1 text-zinc-200 text-xs font-bold pt-1">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>{new Date(previewPost.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        {new Date(previewPost.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Caption & Post ID */}
                  <div className="bg-[#18181c] p-4 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Post Caption:</span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {previewPost.caption || <span className="text-zinc-500 italic">No caption provided.</span>}
                    </p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Post ID: {previewPost.id}</span>
                      <span className={previewPost.is_flagged ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                        {previewPost.is_flagged ? "Flagged for Moderation" : "Status: Clean"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#1c1c20] flex items-center justify-end">
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

