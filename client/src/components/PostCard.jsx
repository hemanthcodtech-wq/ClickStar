import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  UserPlus,
  UserCheck,
  Trash2,
  Flag,
  Copy,
  ExternalLink,
  UserX,
  X,
  Sparkles
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { FormattedCaption } from './FormattedCaption';
import { optimizeCloudinaryUrl, optimizeAvatarUrl } from '../utils/imageOptimizer';

const PostCard = ({ post, onUserClick, onPostUpdated, onHashtagClick }) => {
  const { currentUser } = useUser();
  const toast = useToast();
  const [liked, setLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [saved, setSaved] = useState(post.has_saved || false);
  const [followStatus, setFollowStatus] = useState(
    post.is_following ? 'following' : post.has_pending_request ? 'requested' : 'none'
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // More options menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin';

  // 1. Like Handler
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
      console.error('Like error:', err);
    }
  };

  const handleDoubleTap = () => {
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
    if (!liked) {
      handleLike();
    }
  };

  // 2. Save / Bookmark Handler
  const handleToggleSave = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const res = await fetch(`/api/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.saved);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // 3. Follow / Unfollow / Request Handler
  const handleToggleFollow = async () => {
    try {
      const res = await fetch(`/api/posts/follow/${post.user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.status === 'pending') {
          setFollowStatus('requested');
        } else if (data.status === 'followed') {
          setFollowStatus('following');
        } else {
          setFollowStatus('none');
        }
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  // 4. Share Post Link
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.username} on ClickStar`,
          text: post.caption || 'Check out this post on ClickStar ✨',
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Post link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      toast.info('Link: ' + shareUrl);
    }
  };

  // 5. Delete Post (Author or Admin)
  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Post deleted successfully');
        setIsMenuOpen(false);
        if (onPostUpdated) onPostUpdated();
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (err) {
      toast.error('Delete error');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. Report / Flag Post
  const handleReportPost = async () => {
    try {
      await fetch(`/api/admin/posts/${post.id}/flag`, { method: 'PATCH' });
      toast.success('Thank you! This post has been reported for review.');
      setIsMenuOpen(false);
    } catch (err) {
      toast.error('Failed to report post');
      console.error('Report error:', err);
    }
  };

  // 7. Comments Drawer
  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const data = await res.json();
        if (data.success) {
          setComments(data.data);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
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
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 24, 
        mass: 0.7 
      }}
      className="relative bg-[#121214] border border-[#262626] rounded-2xl overflow-hidden mb-6 max-w-[480px] mx-auto shadow-sm hover:border-zinc-700/80 transition-colors duration-300"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 sm:p-3.5 relative">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onUserClick && onUserClick(post.username)}
            className="cursor-pointer group flex items-center gap-3"
          >
            <img 
              src={optimizeAvatarUrl(post.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 90)} 
              alt={post.username} 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-rose-500 transition"
              loading="lazy"
              decoding="async"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white group-hover:text-rose-400 transition">
                  {post.username}
                </span>
              </div>
              {post.full_name && (
                <span className="text-[11px] text-zinc-400 block -mt-0.5">{post.full_name}</span>
              )}
            </div>
          </div>

          {/* Follow Button */}
          {!isOwnPost && (
            <button
              onClick={handleToggleFollow}
              className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 active:scale-95 cursor-pointer ${
                followStatus === 'following'
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                  : followStatus === 'requested'
                  ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 hover:bg-zinc-700'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
              }`}
            >
              {followStatus === 'following' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : followStatus === 'requested' ? (
                <span>Requested</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Three Dots Menu Button */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="More options"
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition active:scale-90 cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image with Double-Tap Like animation */}
      <div 
        onDoubleClick={handleDoubleTap}
        className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden cursor-pointer select-none"
      >
        <img 
          src={optimizeCloudinaryUrl(post.image_url, 800)} 
          alt={post.caption || 'ClickStar Post'} 
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {/* Floating Heart Popup with Spring & Scale */}
        <AnimatePresence>
          {heartAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -15 }}
              animate={{ scale: [0, 1.25, 1], opacity: 1, rotate: 0 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_10px_25px_rgba(244,63,94,0.65)]"
            >
              <Heart className="w-28 h-28 text-rose-500 fill-rose-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar (Like, Comment, Share, Save) */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-4">
            {/* 1. Like */}
            <motion.button 
              whileTap={{ scale: 0.78 }}
              onClick={handleLike}
              className="text-white hover:opacity-75 transition cursor-pointer"
            >
              <Heart 
                className={`w-6 h-6 transition-transform duration-200 ${
                  liked ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)]' : 'text-zinc-200'
                }`} 
              />
            </motion.button>

            {/* 2. Comment */}
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={toggleComments}
              className="text-zinc-200 hover:text-white transition cursor-pointer"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>

            {/* 3. Share */}
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleShare}
              className="text-zinc-200 hover:text-white transition relative cursor-pointer"
              title="Share Post"
            >
              <Share2 className="w-6 h-6" />
              {copiedLink && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap animate-bounce">
                  Copied!
                </span>
              )}
            </motion.button>
          </div>

          {/* 4. Save / Bookmark */}
          <motion.button 
            whileTap={{ scale: 0.78 }}
            onClick={handleToggleSave}
            className="text-zinc-200 hover:text-white transition cursor-pointer"
            title={saved ? 'Remove Bookmark' : 'Save Post'}
          >
            <Bookmark 
              className={`w-6 h-6 transition-transform duration-200 ${
                saved ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]' : 'text-zinc-200'
              }`} 
            />
          </motion.button>
        </div>

        {/* Likes Count */}
        <p className="text-sm font-semibold text-white mb-1.5">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption with Clickable Hashtags */}
        {post.caption && (
          <p className="text-sm text-zinc-300 leading-snug mb-2">
            <span 
              onClick={() => onUserClick && onUserClick(post.username)}
              className="font-semibold text-white mr-2 cursor-pointer hover:underline"
            >
              {post.username}
            </span>
            <FormattedCaption 
              caption={post.caption}
              onUserClick={onUserClick}
              onHashtagClick={(tag) => {
                if (onHashtagClick) {
                  onHashtagClick(tag);
                } else {
                  window.location.hash = `#${tag}`;
                }
              }}
            />
          </p>
        )}

        {/* Comments Toggle */}
        <button 
          onClick={toggleComments}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-400 mb-2 block cursor-pointer"
        >
          {showComments ? 'Hide comments' : `View all ${post.comments_count || comments.length || 0} comments`}
        </button>

        {/* Expanded Comments Section */}
        {showComments && (
          <div className="border-t border-[#262626] pt-2 mt-2 space-y-2">
            {loadingComments ? (
              <p className="text-xs text-zinc-500 py-1">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-zinc-500 py-1">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-white cursor-pointer hover:underline">
                    {c.username}
                  </span>
                  <span className="text-zinc-300 flex-1">{c.comment_text}</span>
                </div>
              ))
            )}

            {/* Post a comment form */}
            <form onSubmit={submitComment} className="flex items-center gap-2 pt-2 border-t border-[#222]">
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
                className="text-xs font-semibold text-rose-500 disabled:opacity-40 hover:text-rose-400 cursor-pointer"
              >
                Post
              </button>
            </form>
          </div>
        )}

        <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mt-2">
          {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Instagram-style Bottom Sheet / Action Modal for the Three Dots */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)} />

            {/* Menu Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-sm bg-[#18181c] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl divide-y divide-zinc-800 text-center text-sm z-10"
            >
              {/* Header Indicator on mobile */}
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto my-3 sm:hidden" />

              {/* 1. Delete Option (If post author or admin) */}
              {(isOwnPost || isAdmin) && (
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="w-full py-3.5 px-4 font-bold text-rose-500 hover:bg-rose-500/10 transition flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
                </button>
              )}

              {/* 2. Report / Flag Option */}
              {!isOwnPost && (
                <button
                  onClick={handleReportPost}
                  className="w-full py-3.5 px-4 font-bold text-rose-500 hover:bg-rose-500/10 transition flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-800"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report Inappropriate</span>
                </button>
              )}

              {/* 3. Follow / Unfollow */}
              {!isOwnPost && (
                <button
                  onClick={() => {
                    handleToggleFollow();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 font-semibold text-zinc-200 hover:bg-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-800"
                >
                  {following ? (
                    <>
                      <UserX className="w-4 h-4 text-zinc-400" />
                      <span>Unfollow @{post.username}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-rose-400" />
                      <span>Follow @{post.username}</span>
                    </>
                  )}
                </button>
              )}

              {/* 4. Copy Link */}
              <button
                onClick={() => {
                  handleShare();
                  setIsMenuOpen(false);
                }}
                className="w-full py-3.5 px-4 font-semibold text-zinc-200 hover:bg-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-800"
              >
                <Copy className="w-4 h-4 text-zinc-400" />
                <span>Copy Post Link</span>
              </button>

              {/* 5. View Creator Profile */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onUserClick) onUserClick(post.username);
                }}
                className="w-full py-3.5 px-4 font-semibold text-zinc-200 hover:bg-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-800"
              >
                <ExternalLink className="w-4 h-4 text-zinc-400" />
                <span>About this account</span>
              </button>

              {/* 6. Cancel */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3.5 px-4 text-zinc-400 font-medium hover:bg-zinc-800 transition cursor-pointer active:bg-zinc-800"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default PostCard;
