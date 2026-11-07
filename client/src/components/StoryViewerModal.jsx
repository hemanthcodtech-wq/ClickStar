import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye, Sparkles, Music, Volume2, VolumeX, Disc3 } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

export const StoryViewerModal = ({ 
  isOpen, 
  onClose, 
  allStoryGroups = [],
  initialGroupIndex = 0,
  onStoryViewed 
}) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const holdStartTimeRef = useRef(0);

  // Sync initial group
  useEffect(() => {
    if (isOpen) {
      setGroupIndex(initialGroupIndex);
      setStoryIndex(0);
      setProgress(0);
    }
  }, [isOpen, initialGroupIndex]);

  const currentGroup = allStoryGroups[groupIndex];
  const stories = currentGroup?.stories || [];
  const currentStory = stories[storyIndex];

  // Mark current story as viewed
  useEffect(() => {
    if (currentStory && currentGroup && onStoryViewed) {
      onStoryViewed(currentStory.id, currentGroup.userId || currentGroup.id);
    }
  }, [currentStory?.id, currentGroup?.userId]);

  // Handle background music
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (currentStory?.music_url && isOpen) {
      const audio = new Audio(currentStory.music_url);
      audio.muted = isMuted;
      audio.play().catch(console.error);
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [storyIndex, groupIndex, currentStory?.id, isOpen]);

  // Mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
    if (videoRef.current) videoRef.current.muted = nextMuted;
  };

  // Next story or advance to next creator's stories
  const handleNext = () => {
    if (storyIndex < stories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (groupIndex < allStoryGroups.length - 1) {
      // Transition to next person's story!
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      // Finished all stories
      if (audioRef.current) audioRef.current.pause();
      onClose();
    }
  };

  // Previous story or go back to previous creator's story
  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      const prevGroupStories = allStoryGroups[groupIndex - 1]?.stories || [];
      setGroupIndex(prev => prev - 1);
      setStoryIndex(Math.max(0, prevGroupStories.length - 1));
      setProgress(0);
    }
  };

  // Touch / Mouse Hold handlers to pause story like Instagram
  const handleHoldStart = () => {
    holdStartTimeRef.current = Date.now();
    setIsHolding(true);
    if (audioRef.current) audioRef.current.pause();
    if (videoRef.current) videoRef.current.pause();
  };

  const handleHoldEnd = (side) => {
    const holdDuration = Date.now() - holdStartTimeRef.current;
    setIsHolding(false);

    if (audioRef.current && !isMuted) audioRef.current.play().catch(() => {});
    if (videoRef.current) videoRef.current.play().catch(() => {});

    // If held for less than 200ms, it was a tap -> navigate!
    if (holdDuration < 200) {
      if (side === 'left') {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  // Automatic progress timer (pauses when isHolding is true)
  useEffect(() => {
    if (!isOpen || !currentStory || isHolding) return;

    const stepTime = 50; // ms
    const totalTime = currentStory.media_type === 'video' ? 12000 : 5000;
    const increment = (stepTime / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [isOpen, storyIndex, groupIndex, currentStory?.id, isHolding]);

  if (!isOpen || !currentGroup || stories.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fadeIn select-none">
      {/* Top right actions (Mute + Close) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="p-2 text-white/80 hover:text-white rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md transition cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.pause();
            onClose();
          }}
          className="p-2 text-white/80 hover:text-white rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Story Container with 3D Instagram Cube Transition */}
      <motion.div 
        key={`group_${groupIndex}_story_${storyIndex}`}
        initial={{ opacity: 0.9, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
      >
        {/* Top Multi-Segment Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
          {stories.map((story, idx) => (
            <div key={story.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Creator Info Header (Hides when holding for clean fullscreen view) */}
        <div className={`absolute top-7 inset-x-4 z-20 flex items-center justify-between text-white drop-shadow transition-opacity duration-200 ${
          isHolding ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <img
              src={currentGroup.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={currentGroup.username}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight">@{currentGroup.username}</span>
              <span className="text-[10px] text-zinc-300">
                {groupIndex + 1} of {allStoryGroups.length} creators
              </span>
            </div>
          </div>

          {/* Music track ticker if story has sound */}
          {currentStory?.music_title && (
            <div className="flex items-center gap-1.5 text-[11px] text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 max-w-[170px] truncate">
              <Disc3 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              <span className="truncate font-medium">{currentStory.music_title}</span>
            </div>
          )}
        </div>

        {/* Fullscreen Media (Photo or Video) */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
          {currentStory?.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={isMuted}
            />
          ) : (
            <img
              src={optimizeCloudinaryUrl(currentStory?.media_url, 900)}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Left / Right Interactive Tap & Long-Press Hold Zones */}
          <div
            onMouseDown={handleHoldStart}
            onMouseUp={() => handleHoldEnd('left')}
            onMouseLeave={() => isHolding && handleHoldEnd('left')}
            onTouchStart={handleHoldStart}
            onTouchEnd={() => handleHoldEnd('left')}
            className="absolute left-0 inset-y-0 w-1/3 cursor-pointer z-10 select-none"
          />
          <div
            onMouseDown={handleHoldStart}
            onMouseUp={() => handleHoldEnd('right')}
            onMouseLeave={() => isHolding && handleHoldEnd('right')}
            onTouchStart={handleHoldStart}
            onTouchEnd={() => handleHoldEnd('right')}
            className="absolute right-0 inset-y-0 w-2/3 cursor-pointer z-10 select-none"
          />
        </div>
      </motion.div>
    </div>
  );
};
