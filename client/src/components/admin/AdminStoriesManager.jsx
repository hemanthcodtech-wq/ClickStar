import React, { useState, useEffect } from 'react';
import { Radio, Trash2, Clock, Music, Eye, User, Sparkles } from 'lucide-react';
import { optimizeCloudinaryUrl, optimizeAvatarUrl } from '../../utils/imageOptimizer';

export const AdminStoriesManager = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Flatten grouped stories
        const all = [];
        data.data.forEach(group => {
          (group.stories || []).forEach(st => {
            all.push({
              ...st,
              username: group.username,
              avatarUrl: group.avatarUrl,
            });
          });
        });
        setStories(all);
      }
    } catch (err) {
      console.error('Error fetching admin stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStories();
  }, []);

  const handleDeleteStory = async (storyId) => {
    if (!confirm('Are you sure you want to remove this story?')) return;
    try {
      // Stories purge
      setStories(stories.filter(s => s.id !== storyId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-[#141416] p-5 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Live 24-Hour Active Stories</h3>
            <p className="text-xs text-zinc-400">Expiring media feed currently accessible by community members</p>
          </div>
        </div>

        <button
          onClick={fetchActiveStories}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-semibold transition"
        >
          Refresh Feed
        </button>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-24 bg-[#141416] rounded-3xl border border-white/10 text-zinc-500">
          <p className="text-sm">No active stories in the 24-hour cycle right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group relative aspect-[9/16] bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 shadow-md flex flex-col justify-between p-3"
            >
              {story.media_type === 'video' ? (
                <video
                  src={story.media_url}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={optimizeCloudinaryUrl(story.media_url, 400)}
                  alt="Story"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              )}

              {/* Gradient Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />

              {/* Top Creator Badge */}
              <div className="relative z-10 flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5 truncate">
                  <img
                    src={optimizeAvatarUrl(story.avatarUrl, 60)}
                    alt={story.username}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/50"
                  />
                  <span className="text-[11px] font-bold truncate">@{story.username}</span>
                </div>
              </div>

              {/* Bottom Info & Action */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex flex-col text-[10px] text-zinc-300">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Clock className="w-3 h-3" />
                    24h Expiry
                  </span>
                  {story.music_title && (
                    <span className="truncate max-w-[90px] text-zinc-400">
                      🎵 {story.music_title}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteStory(story.id)}
                  title="Purge Story"
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-500 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

