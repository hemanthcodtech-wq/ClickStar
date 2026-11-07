import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Heart, UserPlus, Image, MessageSquare, X, Flame } from 'lucide-react';
import { useUser } from '../context/UserContext';

const StarsInfoModal = ({ isOpen, onClose, onGoToLeaderboard }) => {
  const { currentUser } = useUser();

  if (!isOpen) return null;

  const waysToEarn = [
    {
      icon: Image,
      title: 'Publish a Post',
      reward: '+100 Stars',
      desc: 'Earned every time you upload and share high-quality content.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      icon: Sparkles,
      title: 'Welcome Bonus',
      reward: '+100 Stars',
      desc: 'One-time bonus granted immediately upon email or Google verification.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Heart,
      title: 'Receive Likes',
      reward: '+10 Stars',
      desc: 'Awarded to the creator whenever another user likes your post.',
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      icon: MessageSquare,
      title: 'Receive Comments',
      reward: '+5 Stars',
      desc: 'Earned when creators comment and discuss on your posts.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: UserPlus,
      title: 'Gain Followers',
      reward: '+5 Stars',
      desc: 'Earned each time a creator follows your account.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header with Glowing Stars Badge */}
        <div className="p-6 text-center border-b border-zinc-800/80 bg-gradient-to-b from-[#1c1c22] to-[#141416] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/30 mb-3 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">ClickStars Reward System</h2>
          <p className="text-xs text-zinc-400 mt-1">Your creator score & ranking currency</p>

          {/* Current User Balance Banner */}
          <div className="mt-4 p-3 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-between px-4">
            <span className="text-xs text-zinc-400 font-medium">Your Balance</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{currentUser?.stars_count || 0} ClickStars</span>
            </div>
          </div>
        </div>

        {/* How to Earn List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>How to earn more stars</span>
          </div>

          {waysToEarn.map((w, idx) => {
            const Icon = w.icon;
            return (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:bg-zinc-800/40 transition"
              >
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${w.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white truncate">{w.title}</p>
                    <span className="text-xs font-extrabold text-amber-400 shrink-0">{w.reward}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{w.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-[#101012] flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              if (onGoToLeaderboard) onGoToLeaderboard();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>View Hall of Stars</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarsInfoModal;
