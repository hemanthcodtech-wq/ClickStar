import React from 'react';
import { X, Shield, Lock, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

const PolicyModal = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-rose-400 border border-rose-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ClickStar Legal & Policies</h2>
              <p className="text-[11px] text-zinc-400">ZEWOTECH Transparency Center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-zinc-800/80 bg-[#101012]">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 ${
              activeTab === 'privacy' 
                ? 'border-rose-500 text-white bg-zinc-800/40' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 ${
              activeTab === 'terms' 
                ? 'border-rose-500 text-white bg-zinc-800/40' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 ${
              activeTab === 'guidelines' 
                ? 'border-rose-500 text-white bg-zinc-800/40' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Community Guidelines
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-zinc-300 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">1. Information We Collect</h3>
              <p>
                ClickStar collects information to provide creators with an engaging visual experience. This includes account information (username, email address, password hash), profile details (bio, avatar photos uploaded through Cloudinary), and social engagement metrics (likes, saves, comments, and ClickStars balance).
              </p>

              <h3 className="text-sm font-bold text-white">2. How We Use Your Data</h3>
              <p>
                Your data is used to authenticate your session, display your creative content on global and following feeds, calculate fair leaderboard rankings in the Hall of Stars, and ensure a secure, spam-free platform.
              </p>

              <h3 className="text-sm font-bold text-white">3. Cloud Storage & Security</h3>
              <p>
                All media assets are securely hosted on Cloudinary CDN with HTTPS encryption. Structured account data is securely stored on Neon PostgreSQL serverless infrastructure with strict access controls. We never sell your personal data to third parties.
              </p>

              <h3 className="text-sm font-bold text-white">4. Your Rights</h3>
              <p>
                You maintain ownership of all photos you publish on ClickStar. You can edit your profile, delete any published post (which removes the image from Cloudinary permanently), or delete your account at any time.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">1. Acceptance of Terms</h3>
              <p>
                By accessing or using ClickStar, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the service.
              </p>

              <h3 className="text-sm font-bold text-white">2. Content Ownership & Permissions</h3>
              <p>
                You retain all rights to the photos and captions you post on ClickStar. By posting content, you grant ClickStar a non-exclusive license to display, host, and distribute your content across the platform to your followers and public feeds.
              </p>

              <h3 className="text-sm font-bold text-white">3. Gamification & ClickStars</h3>
              <p>
                ClickStars points are virtual social rewards earned through posting high-quality content, receiving likes, and community engagement. ClickStars hold no cash value and cannot be redeemed for fiat currency.
              </p>

              <h3 className="text-sm font-bold text-white">4. Account Termination</h3>
              <p>
                ClickStar reserves the right to suspend or remove accounts that violate our Community Guidelines, engage in abusive behavior, or upload unauthorized intellectual property.
              </p>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">1. Authentic Creators</h3>
              <p>
                Post original photos, creative artwork, and authentic moments. Do not impersonate other creators or post copyright-infringing material.
              </p>

              <h3 className="text-sm font-bold text-white">2. Respectful Community</h3>
              <p>
                ClickStar fosters an inspiring creator ecosystem. Harassment, hate speech, bullying, spam comments, and inappropriate content will be flagged and deleted by administrators.
              </p>

              <h3 className="text-sm font-bold text-white">3. Safety First</h3>
              <p>
                Never share sensitive private credentials or malicious links. Content deemed harmful to the community will result in immediate suspension.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#101012] flex items-center justify-between text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} ZEWOTECH</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;

