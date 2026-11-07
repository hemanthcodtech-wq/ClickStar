import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Flag, 
  Heart, 
  MessageCircle, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { optimizeCloudinaryUrl } from '../../utils/imageOptimizer';

export const AdminPostsManager = ({ posts, onToggleFlag, onDeletePost }) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'flagged' | 'clean'

  const filtered = posts.filter(post => {
    const matchesSearch = 
      !search || 
      post.username.toLowerCase().includes(search.toLowerCase()) ||
      (post.caption && post.caption.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterMode === 'flagged') return post.is_flagged;
    if (filterMode === 'clean') return !post.is_flagged;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141416] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search posts by creator @username or caption keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1c1c20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {['all', 'flagged', 'clean'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                filterMode === mode
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {mode} {mode === 'flagged' && `(${posts.filter(p => p.is_flagged).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1c1c20] text-zinc-400 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Post Media</th>
                <th className="p-4">Creator</th>
                <th className="p-4">Caption</th>
                <th className="p-4">Engagement</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500">
                    No posts matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-800/40 transition">
                    <td className="p-4">
                      <img 
                        src={optimizeCloudinaryUrl(post.image_url, 150)} 
                        alt="Media" 
                        className="w-14 h-14 object-cover rounded-2xl border border-zinc-700/60 shadow-sm"
                        loading="lazy"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white text-sm block">@{post.username}</span>
                      <span className="text-[11px] text-zinc-500">{post.email}</span>
                    </td>
                    <td className="p-4 max-w-[260px] text-zinc-300">
                      <p className="line-clamp-2 text-xs">
                        {post.caption || <span className="italic text-zinc-600">No caption provided</span>}
                      </p>
                    </td>
                    <td className="p-4 text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-rose-400">
                          <Heart className="w-3.5 h-3.5 fill-rose-400/20" />
                          {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-blue-400">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {post.is_flagged ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleFlag(post.id)}
                          title={post.is_flagged ? 'Unflag post' : 'Flag post'}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            post.is_flagged 
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          title="Permanently Delete Post & Cloudinary Media"
                          className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

