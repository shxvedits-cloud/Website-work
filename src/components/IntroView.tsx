import React from 'react';
import { motion } from 'motion/react';
import { Activity, ArrowRight, Sparkles } from 'lucide-react';

interface IntroViewProps {
  onGetStarted: () => void;
}

export const IntroView = ({ onGetStarted }: IntroViewProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden selection:bg-brand-800">
      {/* Background Effects */}
      <div className="atmosphere" />
      <div className="absolute inset-0 z-0">
        <img 
          src="input_file_0.png" 
          alt="Clinic Interior" 
          className="w-full h-full object-cover opacity-20 scale-110 blur-sm"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
      </div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-900/20 rounded-full blur-[120px] -z-10 translate-x-1/4 -translate-y-1/4 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />

      {/* Top Left Clinic Name */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2"
      >
        <div className="bg-brand-600 p-1.5 md:p-2 rounded-lg shadow-lg shadow-brand-900/20">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <span className="font-serif font-bold text-lg md:text-xl text-white tracking-tight whitespace-nowrap">Prayag Dental Care</span>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl px-6 text-center relative z-10 pt-24 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm text-brand-400 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-6 md:mb-8 border border-white/10 shadow-sm">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            <span>Excellence in Dental Care</span>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-serif font-bold leading-[0.95] text-white mb-8 tracking-tighter"
        >
          Welcome to <br />
          <span className="text-brand-400 italic">Prayag Dental Care.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium text-balance"
        >
          Experience the future of dentistry where advanced AI meets compassionate care. Your journey to a healthier, more beautiful smile begins here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 100 }}
        >
          <button 
            onClick={onGetStarted}
            className="group relative bg-brand-600 text-white px-10 py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-brand-900/40 hover:bg-brand-700 transition-all flex items-center gap-4 mx-auto overflow-hidden active:scale-95"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-30">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Est. 2026</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/20" />
      </div>
    </div>
  );
};
