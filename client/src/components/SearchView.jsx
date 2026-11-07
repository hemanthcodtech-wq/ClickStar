import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  UserPlus, 
  Heart, 
  MessageCircle, 
  X, 
  Hash, 
  Flame, 
  TrendingUp, 
  Users,
  Grid,
  Filter
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { optimizeCloudinaryUrl, optimizeAvatarUrl } from '../utils/imageOptimizer';
import { cacheGet, cacheSet } from '../utils/pageCache';

export const SearchView = ({ onSelectUser, onSelectPost, onSelectHashtag }) => {
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // 'all' | 'accounts' | 'tags' | 'posts'
  
  const [data, setData] = useState(() => cacheGet('explore_data') || { users: [], posts: [], hashtags: [] });
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData.data);
            if (!searchTerm) {
              cacheSet('explore_data', resData.data);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const users = data?.users || [];
  const posts = data?.posts || [];
  const hashtags = data?.hashtags || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Search Header Bar */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl pt-1 pb-3 space-y-3 border-b border-white/5">
        <div className="relative group">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5 group-focus-within:text-rose-500 transition" />
          <input
            type="text"
            placeholder="Search creators by @name, hashtags #style, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18181b] border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'accounts', label: `Creators (${users.length})` },
            { id: 'tags', label: `Hashtags (${hashtags.length})` },
            { id: 'posts', label: `Posts (${posts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                searchFilter === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                  : 'bg-[#18181b] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 1. Accounts Section */}
      {(searchFilter === 'all' || searchFilter === 'accounts') && users.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Creators & People</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">{users.length} found</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelectUser && onSelectUser(u.username)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#141417] hover:bg-[#1c1c20] border border-white/5 hover:border-zinc-700 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={optimizeAvatarUrl(u.avatar_url, 100)} 
                    alt={u.username} 
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-700 group-hover:ring-rose-500 transition shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-rose-400 transition truncate">
                        @{u.username}
                      </p>
                      {u.role === 'admin' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{u.full_name || 'Creator'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs font-black bg-amber-500/10 px-2 py-1 rounded-xl border border-amber-500/20 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{u.stars_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Hashtags Section */}
      {(searchFilter === 'all' || searchFilter === 'tags') && hashtags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Hash className="w-4 h-4 text-rose-400" />
              <span>Trending Hashtags</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">{hashtags.length} tags</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <button
                key={h.id}
                onClick={() => onSelectHashtag && onSelectHashtag(h.tag)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#141417] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/40 text-xs text-white transition cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  #
                </div>
                <span className="font-bold text-zinc-200 group-hover:text-rose-300">#{h.tag}</span>
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 font-medium">
                  {h.posts_count} posts
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Explore Posts Grid */}
      {(searchFilter === 'all' || searchFilter === 'posts') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Grid className="w-4 h-4 text-emerald-400" />
              <span>{searchTerm ? 'Matching Posts' : 'Explore Community Media'}</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">{posts.length} posts</span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-[#121214] rounded-2xl border border-zinc-800 text-zinc-500">
              <p className="text-sm font-semibold">No posts found</p>
              <p className="text-xs mt-1">Try another keyword or search by #hashtag</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: (idx % 6) * 0.03 }}
                  onClick={() => onSelectPost && onSelectPost(post)}
                  className="relative aspect-square bg-[#141417] rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-amber-500/40 transition shadow-sm"
                >
                  <img
                    src={optimizeCloudinaryUrl(post.image_url, 450)}
                    alt={post.caption || 'Explore post'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />

                  {/* Gradient Overlay & Hover Stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-between p-3">
                    <div className="flex items-center gap-1.5">
                      <img 
                        src={optimizeAvatarUrl(post.avatar_url, 60)} 
                        alt={post.username} 
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-white/50" 
                      />
                      <span className="text-[11px] font-bold text-white truncate drop-shadow">
                        @{post.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1 text-rose-400 font-black">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400 font-bold">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
