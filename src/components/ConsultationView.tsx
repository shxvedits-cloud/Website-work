import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ArrowLeft, 
  Mic, 
  MicOff,
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  MessageSquare, 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User as FirebaseUser } from 'firebase/auth';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  phoneNumber?: string;
  photoURL?: string;
  age?: number;
  weight?: number;
}

interface ConsultationViewProps {
  setView: (view: 'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide') => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  startConversation: () => Promise<void>;
  stopConversation: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  transcript: string[];
  error: string | null;
}

export const ConsultationView = React.memo(({ 
  setView, 
  currentUser, 
  userProfile, 
  startConversation,
  stopConversation,
  isConnected,
  isConnecting,
  transcript,
  error
}: ConsultationViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    // Automatically start conversation when entering this view
    if (!isConnected && !isConnecting) {
      startConversation();
    }
    return () => {
      stopConversation();
    };
  }, []);

  const toggleConnection = () => {
    if (isConnected) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      {/* Header */}
      <nav className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Alex AI</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{userProfile?.name || currentUser?.email?.split('@')[0] || 'Guest'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      </nav>

      {/* Voice Agent Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="atmosphere" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl w-full">
          {/* Alex Visualizer */}
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: isConnected ? [1, 1.1, 1] : 1,
                opacity: isConnected ? [0.5, 0.8, 0.5] : 0.3
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-brand-500 blur-3xl rounded-full"
            />
            <div className={cn(
              "w-48 h-48 rounded-full bg-slate-900 border-2 flex items-center justify-center relative z-10 transition-all duration-500 shadow-2xl",
              isConnected ? "border-brand-500 shadow-brand-500/20" : "border-white/10"
            )}>
              <div className="relative">
                <Bot className={cn(
                  "w-20 h-20 transition-all duration-500",
                  isConnected ? "text-brand-400" : "text-slate-600"
                )} />
                {isConnected && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className={cn(
              "text-3xl font-serif font-bold",
              error ? "text-red-400" : "text-white"
            )}>
              {isConnecting ? "Connecting to Alex..." : isConnected ? "Alex is Listening" : error ? "Connection Error" : "Alex is Offline"}
            </h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
              {error 
                ? error 
                : isConnected 
                  ? "Go ahead, speak naturally. Alex can help with your dental health questions." 
                  : "Tap the button below to start your voice consultation."}
            </p>
          </div>

          {/* Transcript Preview */}
          {transcript.length > 0 && (
            <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Transcript</span>
              </div>
              <div className="space-y-3 max-h-[120px] overflow-y-auto no-scrollbar" ref={scrollRef}>
                {transcript.map((line, i) => (
                  <p key={i} className={cn(
                    "text-sm font-medium",
                    line.startsWith('Alex:') ? "text-brand-300" : "text-slate-300"
                  )}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleConnection}
              disabled={isConnecting}
              className={cn(
                "px-10 py-5 rounded-full font-bold uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl",
                isConnected 
                  ? "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20" 
                  : "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-900/40"
              )}
            >
              {isConnecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isConnected ? (
                <>
                  <MicOff className="w-6 h-6" />
                  End Session
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  Start Talking
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="p-8 text-center bg-slate-950/50 backdrop-blur-sm flex-shrink-0">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] max-w-lg mx-auto">
          Alex AI is a voice-first assistant. For emergencies, please call emergency services or visit our clinic immediately.
        </p>
      </div>
    </div>
  );
});

ConsultationView.displayName = 'ConsultationView';
