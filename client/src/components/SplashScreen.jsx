import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import { Sparkles } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#050505] overflow-hidden select-none"
    >
      {/* Background Animated Gradient Mesh / Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/25 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]"
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div />

      {/* Center Hero Logo + Floating Stars */}
      <div className="relative flex flex-col items-center z-10">
        {/* Glow Halo behind Logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-8 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full blur-2xl opacity-60"
        />

        {/* Floating Logo Badge */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative p-2 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/15 shadow-2xl shadow-rose-500/30"
        >
          <motion.img 
            src={logoImg} 
            alt="ClickStar" 
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-2xl drop-shadow-2xl"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Sparkle Badges */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-rose-500 p-2 rounded-xl text-white shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Title & Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center mt-6"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-sm">
            ClickStar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium tracking-widest uppercase mt-2.5 flex items-center justify-center gap-2">
            <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-rose-500" />
            <span>Connect • Create • Shine</span>
            <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-rose-500" />
          </p>
        </motion.div>

        {/* Animated Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 140, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: 'easeInOut' }}
          className="h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-full mt-7 shadow-lg shadow-rose-500/50"
        />
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-1.5"
      >
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <span>from</span>
          <span className="font-bold tracking-wider text-transparent bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text">
            ZEWOTECH
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
