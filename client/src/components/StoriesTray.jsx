import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { optimizeAvatarUrl } from '../utils/imageOptimizer';
import { cacheGet, cacheSet } from '../utils/pageCache';

const DEFAULT_SEED_STORIES = [
  { 
    id: 1, 
    userId: 2,
    username: 'sarah_lens', 
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', 
    hasUnseen: true,
    stories: [
      {
        id: 101,
        media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200',
        media_type: 'image',
        music_title: 'Sunset Lover • Petit Biscuit',
        music_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      }
    ]
  },
  { 
    id: 2, 
    userId: 3,
    username: 'alex_travels', 
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', 
    hasUnseen: true,
    stories: [
      {
        id: 102,
        media_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200',
        media_type: 'image',
        music_title: 'Tropical Summer • Aesthetic Mood',
        music_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-summer-10515.mp3',
      }
    ]
  },
  { 
    id: 3, 
    userId: 4,
    username: 'elena_art', 
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150', 
    hasUnseen: true,
    stories: [
      {
        id: 103,
        media_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200',
        media_type: 'image',
        music_title: 'Synthwave Night • Neon Cyber',
        music_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
      }
    ]
  },
];

const StoriesTray = ({ onOpenCreate, onSelectStoryIndex, storyGroups, setStoryGroups }) => {
  const { currentUser } = useUser();

  return (
    <div className="max-w-[480px] mx-auto mb-6 px-1">
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2">
        {/* Your Story button */}
        <div 
          onClick={onOpenCreate}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="relative">
            <img 
              src={optimizeAvatarUrl(currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 120)} 
              alt="Your Story" 
              className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-white transition"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-0 right-0 p-1 rounded-full bg-rose-500 text-white ring-2 ring-black">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[64px]">Your Story</span>
        </div>

        {/* Other Creators' Stories: Gradient when unseen, Clean Pure White when viewed! */}
        {storyGroups.map((group, index) => {
          const isUnseen = group.hasUnseen;

          return (
            <motion.div
              key={group.userId || group.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectStoryIndex && onSelectStoryIndex(index)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className={`relative p-[2.5px] rounded-full transition-all duration-300 ${
                isUnseen
                  ? 'shadow-md shadow-rose-500/25 ring-1 ring-rose-500/30 overflow-hidden' 
                  : 'bg-white/80 ring-2 ring-white/90 shadow-sm shadow-white/10'
              }`}>
                {/* Gradient ring spinning only when unseen */}
                {isUnseen && (
                  <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 animate-spin-slow rounded-full opacity-90" />
                )}

                <div className="relative p-[2px] rounded-full bg-black">
                  <img 
                    src={optimizeAvatarUrl(group.avatarUrl, 120)} 
                    alt={group.username} 
                    className="w-14 h-14 rounded-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <span className={`text-[11px] font-medium truncate max-w-[64px] transition ${
                isUnseen ? 'text-zinc-200' : 'text-zinc-400'
              }`}>
                {group.username}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StoriesTray;
export { DEFAULT_SEED_STORIES };
