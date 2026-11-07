import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Trash2, 
  Flag,
  Share2,
  Sparkles
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const PostDetailModal = ({ post, isOpen, onClose, onPostDeleted, onUserClick }) => {
  const { currentUser } = useUser();
  const toast = useToast();
  const [liked, setLiked] = useState(post?.has_liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  React.useEffect(() => {
    if (post && isOpen) {
      setLiked(post.has_liked || false);
      setLikesCount(post.likes_count || 0);
      setLoadingComments(true);
      fetch(`/api/posts/${post.id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setComments(data.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingComments(false));
    }
  }, [post?.id, isOpen]);

  if (!isOpen || !post) return null;

  const isOwner = currentUser?.id === post.user_id || currentUser?.role === 'admin';

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          commentText: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onClose();
        if (onPostDeleted) onPostDeleted(post.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-auto max-w-4xl max-h-[92vh] bg-[#121214] border-0 sm:border border-[#262626] sm:rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Left Side: Media (Full aspect or square) */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          <img 
            src={post.image_url} 
            alt={post.caption || 'Post image'} 
            className="w-full h-full max-h-[70vh] md:max-h-[85vh] object-contain"
          />
        </div>

        {/* Right Side: Details & Comments */}
        <div className="w-full md:w-96 flex flex-col bg-[#121214] border-t md:border-t-0 md:border-l border-[#262626]">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-[#262626]">
            <div 
              onClick={() => {
                onClose();
                if (onUserClick) onUserClick(post.username);
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img 
                src={post.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={post.username} 
                className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700 group-hover:ring-rose-500 transition"
              />
              <div>
                <p className="text-xs font-bold text-white group-hover:text-rose-400 transition">@{post.username}</p>
                {post.full_name && <p className="text-[10px] text-zinc-400">{post.full_name}</p>}
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-40 bg-[#1e1e22] border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-20 py-1 text-xs">
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Post</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      setShowOptions(false);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments List & Caption */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] md:max-h-[420px]">
            {/* Author caption as first comment */}
            {post.caption && (
              <div className="flex items-start gap-3 pb-3 border-b border-zinc-800/60">
                <img 
                  src={post.avatar_url} 
                  alt={post.username} 
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-white mr-1.5 cursor-pointer hover:underline">
                    {post.username}
                  </span>
                  <span className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.caption}</span>
                  <span className="block text-[10px] text-zinc-500 mt-1">
                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            )}

            {/* User comments */}
            {loadingComments ? (
              <div className="flex items-center justify-center py-6 text-zinc-500 text-xs">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img 
                    src={c.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={c.username} 
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-white mr-1.5 cursor-pointer hover:underline">
                      {c.username}
                    </span>
                    <span className="text-zinc-300">{c.comment_text}</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Bar */}
          <div className="p-3.5 border-t border-[#262626] bg-[#141416]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike}
                  className="text-white hover:opacity-75 transition active:scale-125"
                >
                  <Heart className={`w-6 h-6 ${liked ? 'text-rose-500 fill-rose-500' : 'text-zinc-200'}`} />
                </button>
                <button className="text-zinc-200 hover:text-white transition">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-zinc-200 hover:text-white transition">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <Bookmark className="w-5 h-5 text-zinc-400" />
            </div>

            <p className="text-xs font-bold text-white mb-2">
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </p>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="text-xs font-bold text-rose-500 disabled:opacity-40 hover:text-rose-400"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;

