import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast({ message: msg, type: 'success', duration }),
    error: (msg, duration) => addToast({ message: msg, type: 'error', duration }),
    info: (msg, duration) => addToast({ message: msg, type: 'info', duration }),
    warning: (msg, duration) => addToast({ message: msg, type: 'warning', duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container Floating Portal */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgClass = 'bg-[#18181b]/95 border-zinc-700/80 text-white';
            let icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;

            if (t.type === 'success') {
              bgClass = 'bg-[#121b14]/95 border-emerald-500/30 text-emerald-100 shadow-emerald-950/40';
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            } else if (t.type === 'error') {
              bgClass = 'bg-[#1e1314]/95 border-rose-500/30 text-rose-100 shadow-rose-950/40';
              icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            } else if (t.type === 'warning') {
              bgClass = 'bg-[#1c1811]/95 border-amber-500/30 text-amber-100 shadow-amber-950/40';
              icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgClass}`}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 text-xs font-medium leading-relaxed whitespace-pre-line">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 -mr-1 -mt-1 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      success: (msg) => console.log('Toast:', msg),
      error: (msg) => console.error('Toast:', msg),
      info: (msg) => console.info('Toast:', msg),
      warning: (msg) => console.warn('Toast:', msg),
    };
  }
  return context;
};

