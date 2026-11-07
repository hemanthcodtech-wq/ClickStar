import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, Trophy } from 'lucide-react';
import { useUser } from '../context/UserContext';

const MobileBottomNav = ({ activeTab, setActiveTab, onOpenCreate }) => {
  const { currentUser } = useUser();

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'search', label: 'Explore', icon: Compass },
    { id: 'create', label: 'Create', action: onOpenCreate, isCreate: true },
    { id: 'leaderboard', label: 'Stars', icon: Trophy },
    { id: 'profile', label: 'You', isAvatar: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-[env(safe-area-inset-bottom,12px)]">
      {/* Floating Island Wrapper */}
      <div className="pointer-events-auto px-4 pb-2">
        <div className="relative max-w-[370px] mx-auto">
          
          {/* Subtle Dynamic Ambient Lighting behind capsule */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/25 via-amber-500/20 to-purple-500/25 rounded-[32px] blur-xl opacity-60 pointer-events-none" />

          {/* Main Glassmorphic Dock */}
          <nav className="relative bg-[#0c0c0e]/85 backdrop-blur-2xl border border-white/[0.12] rounded-[30px] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-between">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              // 1. Create Action Button - Sleek Pill with micro gradient border
              if (item.isCreate) {
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    aria-label="Create Post"
                    className="relative flex-1 py-1.5 flex flex-col items-center justify-center cursor-pointer select-none group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-white/[0.08] to-white/[0.03] border border-white/20 group-hover:border-rose-500/60 flex items-center justify-center text-zinc-300 group-hover:text-white shadow-inner transition duration-200"
                    >
                      <Plus className="w-5 h-5 stroke-[2.4] group-hover:text-rose-400 transition" />
                    </motion.div>
                  </button>
                );
              }

              // 2. Profile Avatar Tab
              if (item.isAvatar) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-label="Profile"
                    className="relative flex-1 py-1.5 flex flex-col items-center justify-center cursor-pointer select-none"
                  >
                    {/* Active Sliding Ambient Capsule */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavDockPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        className="absolute inset-x-1.5 inset-y-1 bg-white/[0.08] rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(244,63,94,0.15)] -z-10"
                      />
                    )}

                    <motion.div 
                      whileTap={{ scale: 0.86 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="relative p-0.5 rounded-full"
                    >
                      <div className={`p-0.5 rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0c0c0e] shadow-md shadow-rose-500/40' 
                          : 'ring-1 ring-white/20 hover:ring-white/40'
                      }`}>
                        <img
                          src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={currentUser?.username}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* Active glowing micro-dot */}
                    {isActive ? (
                      <motion.div
                        layoutId="activeDot"
                        className="w-1 h-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 mt-1 shadow-[0_0_8px_rgba(244,63,94,1)]"
                      />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-transparent mt-1" />
                    )}
                  </button>
                );
              }

              // 3. Regular Navigation Items (Feed, Explore, Stars)
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className="relative flex-1 py-1.5 flex flex-col items-center justify-center cursor-pointer select-none group"
                >
                  {/* Active Sliding Ambient Capsule */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavDockPill"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute inset-x-1.5 inset-y-1 bg-white/[0.08] rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(244,63,94,0.15)] -z-10"
                    />
                  )}

                  <motion.div
                    whileTap={{ scale: 0.84 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="relative flex items-center justify-center w-10 h-10"
                  >
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-rose-400 stroke-[2.4] drop-shadow-[0_2px_10px_rgba(244,63,94,0.7)]' 
                        : 'text-zinc-400 group-hover:text-zinc-200 stroke-[2]'
                    }`} />
                  </motion.div>

                  {/* Active glowing micro-dot */}
                  {isActive ? (
                    <motion.div
                      layoutId="activeDot"
                      className="w-1 h-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 mt-0.5 shadow-[0_0_8px_rgba(244,63,94,1)]"
                    />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-transparent mt-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
