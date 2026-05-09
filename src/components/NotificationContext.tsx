import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, AlertCircle, Info, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'appointment';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((title: string, message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, title, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'appointment': return <Bookmark className="w-5 h-5 text-brand-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-emerald-950/40 border-emerald-500/30';
      case 'error': return 'bg-red-950/40 border-red-500/30';
      case 'appointment': return 'bg-brand-950/40 border-brand-500/30';
      default: return 'bg-slate-900/40 border-slate-700/50';
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={cn(
                "pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-xl max-w-sm w-full",
                getBgColor(n.type)
              )}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm mb-1">{n.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{n.message}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="p-1 hover:bg-white/5 rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
