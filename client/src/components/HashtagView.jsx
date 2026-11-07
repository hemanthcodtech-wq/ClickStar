import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, ArrowLeft, Heart, MessageCircle, Sparkles, Filter } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { cacheGet, cacheSet } from '../utils/pageCache';

export const HashtagView = ({ tag, onBack, onSelectPost }) => {
  const cleanTag = tag.replace(/^#/, '');
  const cacheKey = `hashtag_${cleanTag}`;

  const [posts, setPosts] = useState(() => cacheGet(cacheKey) || []);
  const [loading, setLoading] = useState(() => !cacheGet(cacheKey));
  const [sortBy, setSortBy] = useState('top'); // 'top' | 'recent'

  useEffect(() => {
    // If already in cache, skip loading spinner
    if (cacheGet(cacheKey)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/posts?tag=${encodeURIComponent(cleanTag)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setPosts(data.data);
          cacheSet(cacheKey, data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cleanTag]);

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'top') {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6 sticky top-0 bg-black/85 backdrop-blur-md z-20 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-1.5 rounded-full hover:bg-zinc-800 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">#{cleanTag}</h1>
            <p className="text-[11px] text-zinc-400">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setSortBy('top')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sortBy === 'top' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sortBy === 'recent' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-600">
            <Hash className="w-7 h-7" />
          </div>
          <p className="text-base text-zinc-300 font-semibold">No posts found with #{cleanTag}</p>
          <p className="text-xs text-zinc-500 mt-1">Be the first creator to share a post with this hashtag!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-3">
          {sortedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (idx % 6) * 0.04 }}
              onClick={() => onSelectPost && onSelectPost(post)}
              className="relative aspect-square bg-zinc-900 rounded-md md:rounded-xl overflow-hidden group cursor-pointer"
            >
              <img
                src={optimizeCloudinaryUrl(post.image_url, 400)}
                alt={post.caption || `#${cleanTag} post`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
                decoding="async"
              />

              {/* Hover overlay with likes & comments */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-xs font-bold">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.comments_count || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

