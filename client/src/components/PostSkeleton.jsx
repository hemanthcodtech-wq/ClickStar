import React from 'react';

export const PostSkeleton = () => {
  return (
    <div className="bg-[#121214] border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="w-24 h-3.5 bg-zinc-800 rounded-md" />
            <div className="w-16 h-2.5 bg-zinc-900 rounded-md" />
          </div>
        </div>
        <div className="w-14 h-6 bg-zinc-800 rounded-full" />
      </div>

      {/* Main Image Aspect Ratio Box */}
      <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-zinc-900/80 mb-3" />

      {/* Actions */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-zinc-800" />
          <div className="w-7 h-7 rounded-full bg-zinc-800" />
          <div className="w-7 h-7 rounded-full bg-zinc-800" />
        </div>
        <div className="w-7 h-7 rounded-full bg-zinc-800" />
      </div>

      {/* Caption lines */}
      <div className="space-y-2">
        <div className="w-3/4 h-3 bg-zinc-800 rounded" />
        <div className="w-1/2 h-3 bg-zinc-900 rounded" />
      </div>
    </div>
  );
};

