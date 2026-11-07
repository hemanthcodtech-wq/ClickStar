import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserCheck,
  Sparkles, 
  Check, 
  X,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Users
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const NotificationsModal = ({ isOpen, onClose, onUserClick, onSelectPost, onOpenRequests }) => {
  const { currentUser } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState({});

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const [resNotif, resReq] = await Promise.all([
        fetch(`/api/notifications/${currentUser.id}`),
        fetch(`/api/users/requests/${currentUser.id}`),
      ]);
      const dataNotif = await resNotif.json();
      const dataReq = await resReq.json();
      if (dataNotif.success) {
        setNotifications(dataNotif.data || []);
      }
      if (dataReq.success && Array.isArray(dataReq.data)) {
        setPendingRequestsCount(dataReq.data.length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchNotifications();
      // Mark as read on open
      fetch(`/api/notifications/${currentUser.id}/read`, { method: 'PATCH' }).catch(console.error);
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  // Handle follow back button inside notifications
  const handleFollowBack = async (senderId) => {
    try {
      const res = await fetch(`/api/posts/follow/${senderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowingStates(prev => ({
          ...prev,
          [senderId]: data.following,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format time relative
  const formatTime = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#101012]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Notifications</h2>
              <p className="text-[10px] text-zinc-500">Live activity on your posts & profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Follow Requests Banner (Instagram Native Pattern) */}
        {pendingRequestsCount > 0 && (
          <div 
            onClick={() => {
              onClose();
              if (onOpenRequests) onOpenRequests();
            }}
            className="flex items-center justify-between p-3.5 mx-3 mt-3 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 rounded-2xl cursor-pointer hover:border-amber-400/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                  Follow Requests
                </p>
                <p className="text-[11px] text-zinc-400">
                  {pendingRequestsCount} pending approval{pendingRequestsCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-2">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span className="text-xs">Loading activity...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs space-y-1">
              <Bell className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-400">No activity yet</p>
              <p className="text-[11px] text-zinc-600">When someone likes or comments on your posts, it will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const isFollowType = item.type === 'follow' || item.type === 'follow_accept';
              const isFollowingBack = followingStates[item.sender_id] ?? item.is_following_sender;

              return (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl transition cursor-pointer ${
                    !item.is_read ? 'bg-zinc-900/60 hover:bg-zinc-900' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div 
                    onClick={() => {
                      onClose();
                      if (onUserClick) onUserClick(item.sender_username);
                    }}
                    className="flex items-center gap-3 flex-1 overflow-hidden"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={item.sender_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={item.sender_username}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-black ring-1 ring-zinc-800 text-white">
                        {item.type === 'like' && <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />}
                        {item.type === 'comment' && <MessageCircle className="w-2.5 h-2.5 text-blue-400" />}
                        {item.type === 'follow' && <UserPlus className="w-2.5 h-2.5 text-emerald-400" />}
                        {item.type === 'follow_accept' && <Check className="w-2.5 h-2.5 text-amber-400" />}
                        {item.type === 'award' && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                        {item.type === 'moderation_flag' && <AlertTriangle className="w-2.5 h-2.5 text-red-500" />}
                      </div>
                    </div>

                    <div className="text-xs truncate pr-2">
                      <p className="text-zinc-300 truncate">
                        <span className="font-bold text-white mr-1">@{item.sender_username}</span>
                        {item.message}
                      </p>
                      <span className="text-[10px] text-zinc-500">{formatTime(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Right side: Post thumbnail if like/comment, or Follow Back button if follow */}
                  {item.post_image ? (
                    <img
                      src={item.post_image}
                      alt="Post thumbnail"
                      onClick={() => {
                        onClose();
                        if (onSelectPost) onSelectPost({ id: item.post_id, image_url: item.post_image });
                      }}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-800 shrink-0 hover:opacity-80 transition"
                    />
                  ) : isFollowType ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowBack(item.sender_id);
                      }}
                      className={`text-xs px-3 py-1 rounded-xl font-semibold transition shrink-0 cursor-pointer active:scale-95 ${
                        isFollowingBack
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm shadow-rose-500/20'
                      }`}
                    >
                      {isFollowingBack ? 'Following' : 'Follow back'}
                    </button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
