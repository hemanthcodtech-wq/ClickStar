import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Sparkles, Loader2, Hash, Flame } from 'lucide-react';
import { useUser } from '../context/UserContext';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { currentUser } = useUser();
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Hashtag suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [activeTagQuery, setActiveTagQuery] = useState(null);

  // Monitor typing to detect active hashtag like #ind...
  useEffect(() => {
    if (!caption) {
      setSuggestions([]);
      setActiveTagQuery(null);
      return;
    }

    const cursorPos = textareaRef.current?.selectionStart || caption.length;
    const textBeforeCursor = caption.slice(0, cursorPos);
    const lastWordMatch = textBeforeCursor.match(/#([a-zA-Z0-9_]*)$/);

    if (lastWordMatch) {
      const query = lastWordMatch[1];
      setActiveTagQuery(query);

      fetch(`/api/posts/hashtags/suggest?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setSuggestions(d.data || []);
        })
        .catch(console.error);
    } else {
      setSuggestions([]);
      setActiveTagQuery(null);
    }
  }, [caption]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Insert suggested hashtag into the caption
  const handleSelectHashtag = (tag) => {
    const cursorPos = textareaRef.current?.selectionStart || caption.length;
    const textBeforeCursor = caption.slice(0, cursorPos);
    const textAfterCursor = caption.slice(cursorPos);
    
    // Replace the incomplete #query with #tag and add a trailing space
    const updatedBefore = textBeforeCursor.replace(/#([a-zA-Z0-9_]*)$/, `#${tag} `);
    setCaption(updatedBefore + textAfterCursor);
    setSuggestions([]);
    setActiveTagQuery(null);

    // Re-focus input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image to share');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('caption', caption);
    formData.append('userId', currentUser?.id || 1);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload post');
      }

      onPostCreated(data.data);
      onClose();
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuggestions([]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while uploading');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 shrink-0">
          <h3 className="text-sm font-bold text-white tracking-tight">Create new post</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* File Picker / Preview Dropzone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed border-zinc-800 transition flex flex-col items-center justify-center overflow-hidden min-h-[220px] max-h-[300px] ${
              !previewUrl ? 'cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/40' : 'bg-black'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {previewUrl ? (
              <div className="relative w-full h-full max-h-[290px] flex items-center justify-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-[290px] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2.5 right-2.5 bg-black/70 hover:bg-black p-1.5 rounded-full text-white backdrop-blur-md transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Select photo from device</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">JPEG, PNG, WEBP up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* User info & Caption with Instagram Hashtags Autocomplete */}
          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-2.5">
              <img 
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={currentUser?.username} 
                className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
              />
              <span className="text-xs font-bold text-white">@{currentUser?.username}</span>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={3}
                placeholder="Write a caption... (e.g. Hello from dream Home #interiors #design)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-[#18181b] border border-zinc-700/80 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition resize-none leading-relaxed"
              />

              {/* INSTAGRAM-STYLE FLOATING HASHTAG AUTOCOMPLETE DROPDOWN */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 bottom-full mb-2 bg-[#1b1b1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-zinc-800 max-h-44 overflow-y-auto"
                  >
                    <div className="px-3 py-1.5 bg-[#141416] text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-rose-400" />
                      <span>Suggested Hashtags</span>
                    </div>

                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectHashtag(item.tag)}
                        className="px-3.5 py-2 hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">#{item.tag}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{item.posts_count} posts</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular quick-tag pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 shrink-0">
                <Flame className="w-3 h-3 text-amber-400" />
                Popular:
              </span>
              {['interior', 'homedecor', 'design', 'architecture', 'clickstar'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setCaption(prev => prev.trim() ? `${prev} #${tag}` : `#${tag}`);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-[10px] text-zinc-300 transition shrink-0 border border-zinc-700 cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+100 ClickStars per post</span>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs disabled:opacity-40 transition shadow-lg shadow-rose-500/25 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <span>Share Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
