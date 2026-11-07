import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Sparkles, Loader2, Image as ImageIcon, Music, Video, Film, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { MusicPickerModal } from './MusicPickerModal';

export const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const { currentUser } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsVideo(file.type.startsWith('video/'));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsVideo(file.type.startsWith('video/'));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo or video for your story');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('media', selectedFile);
    formData.append('userId', currentUser?.id || 1);
    if (selectedMusic) {
      formData.append('musicUrl', selectedMusic.previewUrl);
      formData.append('musicTitle', `${selectedMusic.title} • ${selectedMusic.artist}`);
    }

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (onStoryCreated) onStoryCreated(data.data);
        onClose();
        setSelectedFile(null);
        setPreviewUrl(null);
        setSelectedMusic(null);
      } else {
        setError(data.message || 'Failed to upload story');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-sm bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-500" />
              <h2 className="text-sm font-bold text-white tracking-tight">Add to Story</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
                {error}
              </div>
            )}

            {/* Media Preview / Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`relative aspect-[9/16] max-h-[380px] rounded-2xl overflow-hidden border border-dashed transition flex flex-col items-center justify-center cursor-pointer ${
                previewUrl
                  ? 'border-transparent bg-black'
                  : 'border-zinc-700 bg-zinc-900/60 hover:border-rose-500/50 hover:bg-zinc-900'
              }`}
            >
              {previewUrl ? (
                <>
                  {isVideo ? (
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                    />
                  ) : (
                    <img src={previewUrl} alt="Story preview" className="w-full h-full object-cover" />
                  )}

                  {/* Remove Selected Media Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Music Sticker Overlay */}
                  {selectedMusic && (
                    <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-white drop-shadow-md">
                      <div className="flex items-center gap-2 truncate">
                        <Music className="w-4 h-4 text-rose-400 animate-pulse" />
                        <span className="text-xs font-semibold truncate">
                          {selectedMusic.title} • {selectedMusic.artist}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMusic(null);
                        }}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mx-auto mb-3 text-rose-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-white">Upload Photo or Video</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Photos or 15s clips • 24hr expiry</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Music Selector Button */}
            <button
              type="button"
              onClick={() => setIsMusicPickerOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 border border-white/5 transition text-xs text-white"
            >
              <div className="flex items-center gap-2 text-rose-400">
                <Music className="w-4 h-4" />
                <span className="font-semibold text-white">
                  {selectedMusic ? selectedMusic.title : 'Add Background Music 🎵'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {selectedMusic ? 'Change' : 'Browse'}
              </span>
            </button>

            {/* Footer info & submit button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+20 ClickStars</span>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs disabled:opacity-40 transition shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sharing Story...</span>
                  </>
                ) : (
                  <span>Share Story</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Music Picker Dialog */}
      <MusicPickerModal
        isOpen={isMusicPickerOpen}
        onClose={() => setIsMusicPickerOpen(false)}
        onSelectTrack={(track) => setSelectedMusic(track)}
        selectedTrack={selectedMusic}
      />
    </>
  );
};

