import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  ArrowLeft, 
  Palette, 
  Type, 
  Layout, 
  Box, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  Calendar,
  Mic,
  Star,
  HeartPulse,
  Stethoscope,
  Users,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';

interface StyleGuideViewProps {
  setView: (view: 'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide') => void;
}

export const StyleGuideView = React.memo(({ setView }: StyleGuideViewProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="atmosphere" />
      <nav className="h-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView('landing')}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-white tracking-tight">Style Guide</h1>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-24 pb-40">
        {/* Header Section */}
        <section className="space-y-6">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs block"
          >
            Design System v1.0
          </motion.span>
          <h2 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.85]">
            The <span className="italic text-brand-400">Atmospheric</span> <br />Visual Language.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-medium">
            A design system built on depth, transparency, and high-precision typography. Designed to evoke trust and modern wellness.
          </p>
        </section>

        {/* Colors Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-10 h-10 bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-white">Color Palette</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { name: "Brand Primary", hex: "#3b82f6", class: "bg-brand-600", desc: "Used for primary actions and brand identity." },
              { name: "Brand Dark", hex: "#1e3a8a", class: "bg-brand-900", desc: "Used for backgrounds and deep accents." },
              { name: "Slate 950", hex: "#020617", class: "bg-slate-950", desc: "The primary background color for the app." },
              { name: "Slate 900", hex: "#0f172a", class: "bg-slate-900", desc: "Used for cards and secondary layers." },
              { name: "Emerald 500", hex: "#10b981", class: "bg-emerald-500", desc: "Used for success states and health indicators." }
            ].map((color, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className={`aspect-square rounded-3xl ${color.class} shadow-2xl border border-white/5`} />
                <div>
                  <p className="font-bold text-white">{color.name}</p>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{color.hex}</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">{color.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-10 h-10 bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-400">
              <Type className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-white">Typography</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Serif (Playfair Display)</p>
                <h4 className="text-7xl font-serif font-bold text-white tracking-tighter leading-none italic">The quick brown fox.</h4>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Body Sans (Inter)</p>
                <p className="text-2xl text-slate-300 leading-relaxed font-medium">
                  The quick brown fox jumps over the lazy dog. A design system built on depth, transparency, and high-precision typography.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              {[
                { label: "Heading 1", class: "text-6xl font-serif font-bold", text: "Display Large" },
                { label: "Heading 2", class: "text-4xl font-serif font-bold", text: "Section Header" },
                { label: "Heading 3", class: "text-2xl font-bold", text: "Component Title" },
                { label: "Body Large", class: "text-xl font-medium text-slate-300", text: "Featured content and intro text." },
                { label: "Body Small", class: "text-sm font-medium text-slate-400", text: "Standard UI text and descriptions." },
                { label: "Micro Label", class: "text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500", text: "Metadata and small labels" }
              ].map((type, i) => (
                <div key={i} className="flex items-baseline gap-8 border-b border-white/5 pb-4">
                  <span className="w-24 text-[10px] font-bold text-slate-600 uppercase tracking-widest flex-shrink-0">{type.label}</span>
                  <span className={type.class}>{type.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Components Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-10 h-10 bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-400">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-white">UI Components</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Buttons</h4>
              <div className="flex flex-wrap gap-4">
                <button className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/20">Primary Action</button>
                <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl">Secondary Action</button>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all border border-white/5">Outline Action</button>
                <button className="text-brand-400 font-bold hover:text-brand-300 transition-colors px-4">Ghost Action</button>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Status Indicators</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> Operational
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-xl border border-amber-500/20 text-xs font-bold uppercase tracking-widest">
                  <Clock className="w-4 h-4" /> Pending
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 text-xs font-bold uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Error
                </div>
                <div className="flex items-center gap-2 bg-brand-500/10 text-brand-400 px-4 py-2 rounded-xl border border-brand-500/20 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" /> Secure
                </div>
              </div>
            </div>

            <div className="space-y-8 md:col-span-2">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Glass Containers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-dark p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full group-hover:bg-brand-500/20 transition-all duration-700" />
                  <h5 className="text-2xl font-serif font-bold text-white mb-4">Glass Dark</h5>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">The primary container style for cards and sections. Features a subtle border and backdrop blur.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
                  <h5 className="text-2xl font-serif font-bold text-white mb-4">Glass High-Contrast</h5>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">Used for modals and overlays where maximum separation from the background is required.</p>
                </div>
                <div className="bg-brand-600 p-10 rounded-[40px] shadow-2xl shadow-brand-900/20 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-700" />
                  <h5 className="text-2xl font-serif font-bold text-white mb-4">Brand Container</h5>
                  <p className="text-brand-100 text-sm leading-relaxed font-medium">Used for high-impact sections and primary calls to action.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Icons Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-10 h-10 bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-white">Iconography</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-8">
            {[
              Activity, Sparkles, Calendar, Mic, Star, ShieldCheck, HeartPulse, AlertCircle, 
              ArrowLeft, Stethoscope, Users, MessageSquare, Settings, Search, Filter, Download,
              MoreVertical, CheckCircle2, Clock, Box, Palette, Type, Layout, Layers
            ].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-400 hover:bg-white/10 transition-all cursor-pointer border border-white/5">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{Icon.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
});

StyleGuideView.displayName = 'StyleGuideView';
