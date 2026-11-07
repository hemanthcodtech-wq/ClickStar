import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music, Play, Pause, Check, X, Disc3 } from 'lucide-react';

const PRESET_TRACKS = [
  {
    id: 'preset-1',
    title: 'Sunset Chill & Ambient',
    artist: 'Lofi Dreamer',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'preset-2',
    title: 'Summer Breeze & Pop',
    artist: 'Aesthetic Mood',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-summer-10515.mp3',
  },
  {
    id: 'preset-3',
    title: 'Synthwave Night Ride',
    artist: 'Neon Cyber',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
  },
  {
    id: 'preset-4',
    title: 'Acoustic Morning Vibes',
    artist: 'Sunny Acoustic',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_7306bb8972.mp3?filename=acoustic-guitar-loop-f-91bpm-10705.mp3',
  },
];

export const MusicPickerModal = ({ isOpen, onClose, onSelectTrack, selectedTrack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [itunesResults, setItunesResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  if (!isOpen) return null;

  const togglePreview = (id, url) => {
    if (audioObj) {
      audioObj.pause();
    }

    if (playingId === id) {
      setPlayingId(null);
      setAudioObj(null);
      return;
    }

    const audio = new Audio(url);
    audio.play().catch(console.error);
    audio.onended = () => {
      setPlayingId(null);
    };
    setAudioObj(audio);
    setPlayingId(id);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=15`);
      const data = await res.json();
      if (data.results) {
        setItunesResults(data.results.map(r => ({
          id: String(r.trackId),
          title: r.trackName,
          artist: r.artistName,
          previewUrl: r.previewUrl,
          artwork: r.artworkUrl100,
        })));
      }
    } catch (err) {
      console.error('iTunes search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => {
    if (audioObj) audioObj.pause();
    setPlayingId(null);
    onClose();
  };

  const handlePick = (track) => {
    if (audioObj) audioObj.pause();
    onSelectTrack(track);
    handleClose();
  };

  const listToShow = searchQuery.trim() && itunesResults.length > 0 ? itunesResults : PRESET_TRACKS;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#161618] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-white">
            <Music className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold tracking-tight">Add Music to Story</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-3 border-b border-zinc-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search any artist, song, or vibe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e24] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 transition"
            />
          </div>
        </form>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/5">
          {listToShow.map((track) => {
            const isPlaying = playingId === track.id;
            const isSelected = selectedTrack?.id === track.id;

            return (
              <div
                key={track.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/50 transition group cursor-pointer"
                onClick={() => handlePick(track)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  {/* Play preview button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview(track.id, track.previewUrl);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition active:scale-90 ${
                      isPlaying 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{track.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Check className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-[11px] text-rose-400 font-semibold opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded-lg bg-rose-500/10">
                    Use
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

