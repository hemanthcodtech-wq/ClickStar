import React, { useState, useRef } from 'react';
import { X, Camera, Sparkles, Loader2, Upload } from 'lucide-react';
import { useUser } from '../context/UserContext';

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { currentUser, switchUser } = useUser();
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userId', currentUser?.id);
      formData.append('full_name', fullName);
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update active user in context and local storage
      switchUser(data.data);
      if (onProfileUpdated) onProfileUpdated(data.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while uploading to Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white">Edit Profile</h3>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="px-6 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cloudinary Avatar Upload Picker */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <img 
                src={avatarPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover ring-2 ring-rose-500/50 group-hover:ring-rose-500 transition"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-400 hover:text-white hover:bg-rose-500 text-xs font-semibold transition flex items-center gap-1.5 mx-auto sm:mx-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Profile</span>
              </button>
              <p className="text-[11px] text-zinc-500">
                {avatarFile ? avatarFile.name : 'JPEG, PNG, WEBP up to 10MB'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <input 
              type="text"
              placeholder="e.g. Alex Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1e1e22] border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Bio
            </label>
            <textarea 
              rows={3}
              placeholder="Write a bio for your profile..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#1e1e22] border border-zinc-700/80 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs transition shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
