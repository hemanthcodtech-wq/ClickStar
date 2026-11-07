import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Users, Sparkles, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { optimizeAvatarUrl } from '../utils/imageOptimizer';
import { cacheClear } from '../utils/pageCache';

const FollowRequestsView = ({ onUserClick, onBack }) => {
  const { currentUser } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/requests/${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch follow requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.id]);

  const handleAccept = async (request) => {
    if (!currentUser?.id) return;
    setProcessingId(request.request_id);
    try {
      const res = await fetch(`/api/users/requests/${request.request_id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.request_id !== request.request_id));
        // Clear cached profile data so updated followers count shows immediately
        cacheClear(`profile_${currentUser.username}`);
        cacheClear(`profile_${request.username}`);
      }
    } catch (err) {
      console.error('Failed to accept follow request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (request) => {
    if (!currentUser?.id) return;
    setProcessingId(request.request_id);
    try {
      const res = await fetch(`/api/users/requests/${request.request_id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.request_id !== request.request_id));
      }
    } catch (err) {
      console.error('Failed to decline follow request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-zinc-800">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Follow Requests</h1>
            <p className="text-xs text-zinc-400">
              Approve requests to let creators follow your profile and view your updates
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs">Loading follow requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-950/60 border border-zinc-900 rounded-3xl space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900/90 flex items-center justify-center text-zinc-500">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">No pending requests</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            When other creators send you a request to follow, they will appear here for your confirmation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-zinc-500 px-1 font-semibold uppercase tracking-wider">
            Pending Requests ({requests.length})
          </div>

          <div className="space-y-2">
            {requests.map((req) => {
              const isBusy = processingId === req.request_id;
              return (
                <div
                  key={req.request_id}
                  className="flex items-center justify-between p-3.5 bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 rounded-2xl transition"
                >
                  <div
                    onClick={() => onUserClick && onUserClick(req.username)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <img
                      src={optimizeAvatarUrl(req.avatar_url, 100)}
                      alt={req.username}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm hover:underline truncate">
                          @{req.username}
                        </span>
                        {req.role === 'admin' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{req.full_name || 'Creator'}</p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold mt-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>{req.stars_count || 0} Stars</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      disabled={isBusy}
                      onClick={() => handleAccept(req)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs transition shadow-sm shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </>
                      )}
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => handleDecline(req)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs transition border border-zinc-700 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowRequestsView;

