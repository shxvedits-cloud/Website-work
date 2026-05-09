import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Settings,
  WifiOff
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

  const errorDetails = useMemo(() => {
    if (!error) return null;
    
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes("permission") || lowerError.includes("microphone") || lowerError.includes("not allowed")) {
      return {
        title: "Microphone Access Required",
        message: "Alex needs your microphone to hear you. Please check your browser's site settings and grant permission to proceed with the voice consultation.",
        icon: <MicOff className="w-12 h-12 text-red-400" />,
        tip: "Look for the lock icon in your address bar to manage permissions.",
        actionIcon: <Settings className="w-4 h-4" />,
        actionText: "Check Settings"
      };
    }
    
    if (lowerError.includes("key") || lowerError.includes("api key")) {
      return {
        title: "Configuration Error",
        message: "There's a problem with the AI configuration (API Key missing or invalid). Clinic administrators need to verify the server environment variables.",
        icon: <AlertCircle className="w-12 h-12 text-amber-400" />,
        tip: "Ensure GEMINI_API_KEY is correctly set in the .env file.",
        actionIcon: <HelpCircle className="w-4 h-4" />,
        actionText: "System Diagnostic"
      };
    }
    
    if (lowerError.includes("network") || lowerError.includes("connect") || lowerError.includes("lost") || lowerError.includes("offline")) {
      return {
        title: "Connection Lost",
        message: "We're having trouble connecting to Alex's voice server. This usually happens due to a weak internet connection or firewall restrictions.",
        icon: <WifiOff className="w-12 h-12 text-red-500" />,
        tip: "Check your internet connection or try switching networks.",
        actionIcon: <RefreshCw className="w-4 h-4" />,
        actionText: "Reconnect Now"
      };
    }

    if (lowerError.includes("quota") || lowerError.includes("limit") || lowerError.includes("exhausted")) {
      return {
        title: "AI Service Busy",
        message: "Alex is currently handling a peak volume of patient inquiries. The system's processing capacity is momentarily reached.",
        icon: <Bot className="w-12 h-12 text-blue-400 opacity-50" />,
        tip: "Please wait 30 seconds and try initiating the session again.",
        actionIcon: <RefreshCw className="w-4 h-4" />,
        actionText: "Try Again"
      };
    }

    return {
      title: "Unexpected Error",
      message: error || "An unknown error occurred while establishing the secure audio bridge to Alex AI.",
      icon: <Activity className="w-12 h-12 text-red-400" />,
      tip: "If this persists, please refresh your browser page.",
      actionIcon: <RefreshCw className="w-4 h-4" />,
      actionText: "Retry Establishing Connection"
    };
  }, [error]);

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
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"
                )} />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest transition-colors",
                  isConnected ? "text-emerald-500" : "text-slate-500"
                )}>
                  {isConnected ? "Online" : "Connecting"}
                </span>
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
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="atmosphere" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl w-full py-12">
          {errorDetails ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 p-10 rounded-[40px] bg-red-950/20 border border-red-500/20 backdrop-blur-xl w-full max-w-lg shadow-2xl"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                <div className="relative z-10 p-6 rounded-full bg-slate-900 border border-red-500/30">
                  {errorDetails.icon}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {errorDetails.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {errorDetails.message}
                </p>
              </div>

              <div className="w-full h-px bg-white/5 my-2" />

              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                  <div className="w-8 h-8 rounded-full bg-brand-400/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Recommendation</span>
                    <p className="text-xs text-slate-300 font-medium">{errorDetails.tip}</p>
                  </div>
                </div>

                <button 
                  onClick={() => startConversation()}
                  className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-900/20"
                >
                  {errorDetails.actionIcon}
                  {errorDetails.actionText}
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Alex Visualizer */}
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: isConnected ? [1, 1.1, 1] : 1,
                    opacity: isConnected ? [0.5, 0.8, 0.5] : 0.3
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className={cn(
                    "absolute inset-0 blur-3xl rounded-full transition-colors",
                    isConnected ? "bg-brand-500" : "bg-slate-700"
                  )}
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
                    {isConnecting && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-24 h-24 text-brand-400 animate-spin opacity-20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h2 className="text-4xl font-serif font-bold text-white tracking-tight">
                  {isConnecting ? "Connecting to Alex..." : isConnected ? "Alex is Listening" : "Start your Consultation"}
                </h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                  {isConnecting 
                    ? "Initializing secure audio bridge... please wait."
                    : isConnected 
                      ? "Go ahead, speak naturally. Alex provides real-time guidance on your dental health journey." 
                      : "Experience AI-powered dental coordination. Tap below to begin your personalized session."}
                </p>
              </div>

              {/* Transcript Preview */}
              <AnimatePresence>
                {transcript.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-slate-900/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-sm shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Session Analytics</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Processing Live</span>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-[160px] overflow-y-auto no-scrollbar pr-2" ref={scrollRef}>
                      {transcript.map((line, i) => {
                        const isAlex = line.startsWith('Alex:');
                        return (
                          <div key={i} className={cn(
                            "flex items-start gap-4 p-3 rounded-2xl transition-colors",
                            isAlex ? "bg-brand-500/5 text-brand-50" : "bg-white/5 text-slate-200"
                          )}>
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                              isAlex ? "bg-brand-500/20 border border-brand-500/30" : "bg-slate-800 border border-white/10"
                            )}>
                              {isAlex ? <Bot className="w-3 h-3 text-brand-400" /> : <User className="w-3 h-3 text-slate-500" />}
                            </div>
                            <p className="text-[13px] font-medium leading-relaxed">
                              {line.replace(isAlex ? 'Alex: ' : 'You: ', '')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center gap-6 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleConnection}
                  disabled={isConnecting}
                  className={cn(
                    "px-12 py-6 rounded-[24px] font-bold uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl relative overflow-hidden group",
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
                      Termination Session
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6" />
                      Initiate Consultation
                    </>
                  )}
                  {!isConnected && !isConnecting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  )}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="p-8 text-center bg-slate-950/80 backdrop-blur-sm flex-shrink-0 mt-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
          Alex AI represents clinical intelligence. For severe pain, significant bleeding, or emergencies, please contact clinic staff immediately at <span className="text-slate-400">+91 88965 12561</span>.
        </p>
      </div>
    </div>
  );
});

ConsultationView.displayName = 'ConsultationView';
