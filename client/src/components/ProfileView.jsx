import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Heart, 
  MessageCircle, 
  Settings, 
  Sparkles, 
  Bookmark, 
  Menu, 
  ShieldCheck, 
  LogOut, 
  Share2, 
  QrCode, 
  Lock, 
  FileText,
  Clock, 
  HelpCircle,
  ChevronRight,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import EditProfileModal from './EditProfileModal';
import PolicyModal from './PolicyModal';
import { optimizeCloudinaryUrl, optimizeAvatarUrl } from '../utils/imageOptimizer';
import { cacheGet, cacheSet, cacheClear } from '../utils/pageCache';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ProfileView = ({ username, onSelectPost, onNavigateAdmin }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, logout, switchUser, allUsers } = useUser();
  const targetUsername = username || currentUser?.username;

  const cacheKey = `profile_${targetUsername}`;
  const [profile, setProfile] = useState(() => cacheGet(cacheKey));
  const [loading, setLoading] = useState(() => !cacheGet(cacheKey));
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('privacy');
  const [activeDetailModal, setActiveDetailModal] = useState(null); // null | 'followers' | 'following' | 'stars' | 'posts'
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    fetch(`/api/users/${targetUsername}?currentUserId=${currentUser?.id || ''}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setProfile(data.data);
          cacheSet(cacheKey, data.data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    // Always revalidate fresh state from server so followers/following are up-to-date
    fetchProfileData(!!profile);
  }, [targetUsername, currentUser?.id]);

  const handleToggleFollow = async () => {
    if (!currentUser?.id || !profile?.id || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/posts/follow/${profile.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state smoothly
        setProfile(prev => {
          if (!prev) return prev;
          if (data.status === 'pending') {
            return {
              ...prev,
              hasPendingRequest: true,
              isFollowing: false,
            };
          } else if (data.status === 'cancelled') {
            return {
              ...prev,
              hasPendingRequest: false,
              isFollowing: false,
            };
          } else if (data.status === 'unfollowed') {
            return {
              ...prev,
              isFollowing: false,
              hasPendingRequest: false,
              followersCount: Math.max(0, (prev.followersCount || 1) - 1),
              followers: (prev.followers || []).filter(u => u.id !== currentUser.id),
            };
          }
          return prev;
        });
        cacheClear(cacheKey);
      }
    } catch (err) {
      console.error('Toggle follow failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p className="text-lg">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 pb-28 relative">
      {/* Top Profile Header Bar on Mobile (Instagram Style) */}
      <div className="flex items-center justify-between pb-4 sm:hidden">
        <div className="flex items-center gap-1.5 font-bold text-lg text-white">
          <span>@{profile.username}</span>
          {profile.role === 'admin' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin
            </span>
          )}
        </div>

        {isOwnProfile && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg active:scale-95 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8 pb-8 sm:pb-10 border-b border-[#262626]">
        {/* Avatar with gradient glow */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full blur opacity-40 group-hover:opacity-75 transition" />
          <img
            src={optimizeAvatarUrl(profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 250)}
            alt={profile.username}
            className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-black"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4 w-full">
          <div className="hidden sm:flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">@{profile.username}</h2>
              {profile.role === 'admin' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN
                </span>
              )}
            </div>

            {isOwnProfile && (
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action Buttons (Edit Profile / Share / Follow) */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => setIsEditOpen(true)}
                  className="flex-1 sm:flex-none px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition"
                >
                  Edit profile
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Profile link copied to clipboard!');
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition"
                >
                  Share profile
                </button>
              </>
            ) : (
              <button 
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`w-full sm:w-auto px-6 py-2 text-xs font-semibold rounded-xl transition cursor-pointer active:scale-95 ${
                  profile.isFollowing
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                    : profile.hasPendingRequest
                    ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 hover:bg-zinc-700'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-500/20'
                }`}
              >
                {followLoading ? (
                  'Updating...'
                ) : profile.isFollowing ? (
                  'Following'
                ) : profile.hasPendingRequest ? (
                  'Requested'
                ) : (
                  'Follow'
                )}
              </button>
            )}
          </div>

          {/* Interactive Stats Bar (Clickable to see all followers, following, stars & posts) */}
          <div className="flex items-center justify-around sm:justify-start sm:gap-8 py-2.5 sm:py-0 border-y sm:border-y-0 border-zinc-900 text-xs sm:text-sm">
            <button 
              onClick={() => setActiveDetailModal('posts')}
              className="text-center sm:text-left cursor-pointer group"
            >
              <span className="font-extrabold text-white block sm:inline group-hover:underline">{profile.postsCount || 0}</span>{' '}
              <span className="text-zinc-500 sm:text-zinc-400 group-hover:text-zinc-300">posts</span>
            </button>

            <button 
              onClick={() => setActiveDetailModal('stars')}
              className="text-center sm:text-left cursor-pointer group"
            >
              <span className="font-extrabold text-amber-400 block sm:inline group-hover:underline">{profile.stars_count || 0}</span>{' '}
              <span className="text-zinc-500 sm:text-zinc-400 group-hover:text-amber-300">Stars ✨</span>
            </button>

            <button 
              onClick={() => setActiveDetailModal('followers')}
              className="text-center sm:text-left cursor-pointer group"
            >
              <span className="font-extrabold text-white block sm:inline group-hover:underline">{profile.followersCount || 0}</span>{' '}
              <span className="text-zinc-500 sm:text-zinc-400 group-hover:text-zinc-300">followers</span>
            </button>

            <button 
              onClick={() => setActiveDetailModal('following')}
              className="text-center sm:text-left cursor-pointer group"
            >
              <span className="font-extrabold text-white block sm:inline group-hover:underline">{profile.followingCount || 0}</span>{' '}
              <span className="text-zinc-500 sm:text-zinc-400 group-hover:text-zinc-300">following</span>
            </button>
          </div>

          {/* Bio */}
          <div className="px-2 sm:px-0 text-left">
            <p className="font-semibold text-xs sm:text-sm text-zinc-100">{profile.full_name}</p>
            <p className="text-xs sm:text-sm text-zinc-400 whitespace-pre-line mt-1">{profile.bio || 'Creator on ClickStar ✨'}</p>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex justify-center border-b border-[#262626]">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 px-6 text-xs font-semibold uppercase tracking-wider transition border-t-2 -mt-[2px] cursor-pointer ${
            activeTab === 'posts'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({profile.postsCount || 0})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 px-6 text-xs font-semibold uppercase tracking-wider transition border-t-2 -mt-[2px] cursor-pointer ${
              activeTab === 'saved'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({profile.savedPosts?.length || 0})</span>
          </button>
        )}
      </div>

      {/* Instagram 3-Column Posts / Saved Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 pt-4">
        {activeTab === 'posts' ? (
          profile.posts?.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-zinc-500">
              <p className="text-base">No posts shared yet</p>
            </div>
          ) : (
            profile.posts?.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost && onSelectPost(post)}
                className="relative aspect-square group bg-zinc-900 cursor-pointer overflow-hidden rounded-md md:rounded-xl"
              >
                <img
                  src={optimizeCloudinaryUrl(post.image_url, 400)}
                  alt={post.caption || 'Post thumbnail'}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-semibold text-sm">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{post.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{post.comments_count || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          profile.savedPosts?.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-zinc-500">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-base">No saved posts yet</p>
              <p className="text-xs text-zinc-600 mt-1">Tap the bookmark icon on any post in your feed to save it here.</p>
            </div>
          ) : (
            profile.savedPosts?.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost && onSelectPost(post)}
                className="relative aspect-square group bg-zinc-900 cursor-pointer overflow-hidden rounded-md md:rounded-xl"
              >
                <img
                  src={optimizeCloudinaryUrl(post.image_url, 400)}
                  alt={post.caption || 'Saved post'}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-semibold text-sm">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{post.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{post.comments_count || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onProfileUpdated={(updatedUser) => {
          setProfile(prev => ({ ...prev, ...updatedUser }));
        }}
      />

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        initialTab={policyTab}
      />

      {/* INSTAGRAM-STYLE PROFILE SETTINGS & MENU BOTTOM SHEET */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 150 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 150 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-sm bg-[#161619] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl divide-y divide-zinc-800/80 text-xs z-20 max-h-[85vh] flex flex-col mb-0 pb-6 sm:pb-0"
            >
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto my-3 sm:hidden" />

              <div className="p-4 flex items-center justify-between shrink-0">
                <span className="font-bold text-sm text-white">Settings and activity</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Menu Items */}
              <div className="py-2 overflow-y-auto flex-1 divide-y divide-zinc-800/50">
                {/* How you use ClickStar */}
                <div className="px-4 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Your Activity & Media
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Edit Profile & Avatar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('saved');
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                    <span>Saved Posts ({profile.savedPosts?.length || 0})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setIsMenuOpen(false);
                    toast.success('Profile link copied to clipboard!');
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-zinc-400" />
                    <span>QR Code & Share Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                {/* More Info and Support */}
                <div className="px-4 py-2 pt-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Admin & Management
                </div>

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Navigate to Admin Dashboard
                      if (onNavigateAdmin) {
                        onNavigateAdmin();
                      }
                    }}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-amber-400 font-bold cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Admin Command Center</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500/50" />
                  </button>
                )}

                <div className="px-4 py-2 pt-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  More Info & Support
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setPolicyTab('privacy');
                    setIsPolicyOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-zinc-400" />
                    <span>Privacy Policy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setPolicyTab('terms');
                    setIsPolicyOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>Terms of Service</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setPolicyTab('guidelines');
                    setIsPolicyOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-zinc-400" />
                    <span>Community Guidelines</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                <button
                  onClick={() => {
                    toast.info('ClickStar v1.0.0 by ZEWOTECH\nAll systems operational.');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-zinc-400" />
                    <span>Help & About</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>
              </div>

              {/* Logout Option */}
              <div className="p-3 bg-[#131315] shrink-0">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Detail Inspection Modal for Followers / Following / Stars / Posts */}
        {activeDetailModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setActiveDetailModal(null)}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141416] border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1c1c20]">
                <div className="flex items-center gap-2">
                  {activeDetailModal === 'stars' ? (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  ) : activeDetailModal === 'followers' ? (
                    <Users className="w-5 h-5 text-blue-400" />
                  ) : activeDetailModal === 'following' ? (
                    <Users className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Grid className="w-5 h-5 text-purple-400" />
                  )}
                  <h3 className="text-sm font-bold text-white capitalize">
                    {activeDetailModal === 'stars' 
                      ? 'ClickStar Stars Economy' 
                      : activeDetailModal === 'followers' 
                      ? `Followers (${profile.followersCount || 0})` 
                      : activeDetailModal === 'following' 
                      ? `Following (${profile.followingCount || 0})` 
                      : `Published Media (${profile.postsCount || 0})`}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveDetailModal(null)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                {/* 1. Stars Breakdown */}
                {activeDetailModal === 'stars' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/10 to-transparent border border-amber-500/30 text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Total Stars Balance</span>
                      <div className="flex items-center justify-center gap-2 text-3xl font-black text-amber-400 mt-1">
                        <Sparkles className="w-7 h-7" />
                        <span>{profile.stars_count || 0}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Ranked among top platform creators
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1c1c20] text-xs">
                        <span className="text-zinc-400">Total Post Likes Received:</span>
                        <span className="font-bold text-rose-400 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500/40" />
                          {profile.starsBreakdown?.totalLikesReceived || 0} likes
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1c1c20] text-xs">
                        <span className="text-zinc-400">Community Comments:</span>
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {profile.starsBreakdown?.totalCommentsReceived || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1c1c20] text-xs">
                        <span className="text-zinc-400">Star Earning Rate:</span>
                        <span className="font-bold text-amber-300">+100 Stars / Post</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Followers List */}
                {activeDetailModal === 'followers' && (
                  (!profile.followers || profile.followers.length === 0) ? (
                    <div className="text-center py-10 text-zinc-500 text-xs">
                      No followers yet. Share your profile to connect with creators!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.followers.map((f) => (
                        <div 
                          key={f.id} 
                          onClick={() => {
                            setActiveDetailModal(null);
                            navigate(`/profile/${f.username}`);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181c] hover:bg-[#202025] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={optimizeAvatarUrl(f.avatar_url, 80)} 
                              alt={f.username} 
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs">@{f.username}</span>
                                {f.role === 'admin' && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">Admin</span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400">{f.full_name || 'Creator'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-lg">
                            <Sparkles className="w-3 h-3" />
                            <span>{f.stars_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* 3. Following List */}
                {activeDetailModal === 'following' && (
                  (!profile.following || profile.following.length === 0) ? (
                    <div className="text-center py-10 text-zinc-500 text-xs">
                      Not following any creators yet. Explore the feed to discover inspiring accounts!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.following.map((f) => (
                        <div 
                          key={f.id} 
                          onClick={() => {
                            setActiveDetailModal(null);
                            navigate(`/profile/${f.username}`);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181c] hover:bg-[#202025] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={optimizeAvatarUrl(f.avatar_url, 80)} 
                              alt={f.username} 
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs">@{f.username}</span>
                                {f.role === 'admin' && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">Admin</span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400">{f.full_name || 'Creator'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-lg">
                            <Sparkles className="w-3 h-3" />
                            <span>{f.stars_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* 4. Posts Summary */}
                {activeDetailModal === 'posts' && (
                  (!profile.posts || profile.posts.length === 0) ? (
                    <div className="text-center py-10 text-zinc-500 text-xs">
                      No posts published yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {profile.posts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveDetailModal(null);
                            if (onSelectPost) onSelectPost(p);
                          }}
                          className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-zinc-900 border border-white/5"
                        >
                          <img 
                            src={optimizeCloudinaryUrl(p.image_url, 300)} 
                            alt={p.caption} 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 text-white text-xs font-bold">
                            <span className="flex items-center gap-1 text-rose-400">
                              <Heart className="w-3.5 h-3.5 fill-rose-500" />
                              {p.likes_count}
                            </span>
                            <span className="flex items-center gap-1 text-blue-400">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {p.comments_count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
