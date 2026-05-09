import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  LogIn, 
  User, 
  LogOut, 
  Sparkles, 
  Calendar, 
  Mic, 
  Star, 
  ShieldCheck, 
  HeartPulse, 
  AlertCircle, 
  ArrowRight, 
  Stethoscope,
  MapPin,
  Phone
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

interface LandingViewProps {
  setView: (view: 'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide' | 'my-appointments') => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  handleLogout: () => void;
}

export const LandingView = React.memo(({ 
  setView, 
  setIsAuthModalOpen, 
  setIsProfileModalOpen, 
  currentUser, 
  userProfile, 
  handleLogout 
}: LandingViewProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-brand-800">
      <div className="atmosphere" />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto h-full flex items-center px-6 gap-4">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-brand-600 p-2 rounded-lg shadow-lg shadow-brand-900/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-tight whitespace-nowrap">Prayag Dental Care</span>
          </div>
          
          <div className="flex-1 min-w-0 flex items-center overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center gap-3 sm:gap-6 flex-nowrap min-w-max px-2 ml-auto">
              <div className="hidden md:flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <a href="#services" className="hover:text-brand-400 transition-colors whitespace-nowrap">Services</a>
                <a href="#location" className="hover:text-brand-400 transition-colors whitespace-nowrap">Location</a>
                <a href="#about" className="hover:text-brand-400 transition-colors whitespace-nowrap">AI Core</a>
                <button 
                  onClick={() => setView('styleguide')}
                  className="hover:text-brand-400 transition-colors whitespace-nowrap"
                >
                  Style Guide
                </button>
              </div>

              <div className="hidden md:block h-6 w-px bg-white/10 mx-2" />

              <div className="flex items-center gap-3 sm:gap-4">
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    {userProfile?.role === 'admin' && (
                      <button 
                        onClick={() => setView('admin')}
                        className="whitespace-nowrap text-[10px] font-bold text-brand-400 bg-brand-900/30 px-2 py-1 rounded border border-brand-800 uppercase tracking-wider hover:bg-brand-800 transition-colors"
                      >
                        Admin
                      </button>
                    )}
                    {userProfile?.role === 'patient' && (
                      <button 
                        onClick={() => setView('my-appointments')}
                        className="whitespace-nowrap text-[10px] font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-800 uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        My Appointments
                      </button>
                    )}
                    <button 
                      onClick={() => setIsProfileModalOpen(true)}
                      className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-brand-400 transition-colors whitespace-nowrap"
                    >
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-brand-800" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/10">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <span className="hidden sm:inline">{userProfile?.name || currentUser.email}</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-600 font-bold text-sm px-2 transition-all whitespace-nowrap"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setView('booking')}
                  className="bg-slate-900 text-white px-4 sm:px-6 h-11 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center whitespace-nowrap flex-shrink-0"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-900/30 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm text-brand-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-white/10 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>The Future of Dental Care</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] text-white mb-8 tracking-tighter text-balance">
              Your Smile, <br />
              <span className="relative">
                <span className="relative z-10 italic text-brand-400">Reimagined.</span>
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-4 bg-brand-900/50 -z-10"
                />
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-lg mb-12 leading-relaxed text-balance font-medium">
              Experience dental care that actually listens. Meet Alex, our AI-powered dental expert, and start your journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('booking')}
                className="bg-brand-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-900/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3"
              >
                Book Now
                <Calendar className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('consultation')}
                className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                Talk to Alex
                <Mic className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    key={i}
                    src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                    className="w-12 h-12 rounded-full border-4 border-white object-cover shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="font-bold text-slate-800">4.9/5 Rating</p>
                <p className="text-slate-600 font-medium">from 2,500+ happy patients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] group">
                <img 
                  src="input_file_0.png" 
                  alt="Prayag Dental Care Interior" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-12 right-12 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-px bg-white/40" />
                    <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">The Experience</p>
                  </div>
                  <h3 className="text-4xl font-serif italic leading-tight text-balance text-white drop-shadow-lg">"A sanctuary for your smile, powered by empathy."</h3>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          </motion.div>
        </div>
      </section>

      {/* Location Section - Moved here to be 2nd section from top */}
      <section id="location" className="py-24 px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-900/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 block"
              >
                Visit Our Clinic
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-10 tracking-tight leading-tight">
                Quality Care, <br /><span className="text-brand-400">Right Around the Corner.</span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed mb-12 font-medium">
                Conveniently located in Naini, Prayagraj. Experience the future of dentistry.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-900/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Our Address</h4>
                    <p className="text-slate-400 font-medium leading-relaxed">23 A, ADA Rd, near Durga pooja, Mukta Vihar<br />Naini, Prayagraj, Uttar Pradesh 211010</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-900/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Clinic Hours</h4>
                    <p className="text-slate-400 font-medium leading-relaxed">Sun - Sat: 9:00 AM - 9:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-900/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Call Us</h4>
                    <a href="tel:+918896512561" className="text-slate-400 font-medium leading-relaxed hover:text-brand-400 transition-colors">+91 8896512561</a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[60px] overflow-hidden border border-white/10 shadow-2xl group">
                <img 
                  src="input_file_1.png" 
                  alt="Prayag Dental Care Exterior" 
                  className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[60px]" />
              </div>

              <motion.a 
                href="https://maps.app.goo.gl/4FJsxfjrCAtJd9Ys5"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-3xl font-bold text-xl hover:bg-slate-100 transition-all shadow-xl shadow-brand-900/20"
              >
                Get Directions
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <motion.a 
                href="tel:+918896512561"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full inline-flex items-center justify-center gap-3 bg-brand-900/30 text-brand-400 border border-brand-800 px-8 py-5 rounded-3xl font-bold text-xl hover:bg-brand-800/40 transition-all shadow-xl"
              >
                Call Us Now
                <Phone className="w-5 h-5" />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Happy Patients", value: "12k+" },
              { label: "Expert Doctors", value: "24" },
              { label: "Clinic Locations", value: "08" },
              { label: "Success Rate", value: "99%" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40 px-6 bg-slate-900/20 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-500/10 blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="lg:col-span-1">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 block"
              >
                Our Expertise
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-10 tracking-tight leading-tight">
                Artistry <br />Meets <br /><span className="text-brand-400">Science.</span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed mb-12 font-medium">
                From routine wellness to complex restorative transformations, we use the world's most advanced technology to ensure your comfort.
              </p>
              <motion.button 
                whileHover={{ x: 10 }}
                onClick={() => setView('booking')}
                className="group flex items-center gap-4 font-bold text-white hover:text-brand-400 transition-all text-lg"
              >
                Explore all services
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-400 group-hover:bg-brand-900/30 transition-all">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: "Preventative Wellness", icon: <ShieldCheck className="w-7 h-7" />, desc: "Precision cleanings and early-warning scans to keep your natural smile forever." },
                { title: "Restorative Art", icon: <HeartPulse className="w-7 h-7" />, desc: "Biocompatible materials and 3D-printed restorations that mimic natural tooth structure." },
                { title: "Cosmetic Design", icon: <Sparkles className="w-7 h-7" />, desc: "Bespoke veneers and whitening protocols designed for your unique facial features." },
                { title: "Emergency Response", icon: <AlertCircle className="w-7 h-7" />, desc: "Immediate, empathetic care for pain or accidents. We're here when you need us most." }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-dark p-10 group hover:bg-slate-900 transition-all cursor-pointer border-white/5 hover:border-brand-500/30"
                >
                  <div className="w-16 h-16 bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-400 mb-8 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-brand-500/20">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{service.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Alex Section */}
      <section id="about" className="py-40 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark p-12 md:p-20 flex flex-col lg:flex-row items-center gap-20 relative overflow-hidden border-white/5"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 blur-[120px] -z-10" />
            
            <div className="relative flex-shrink-0">
              <div className="w-72 h-96 rounded-[60px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-1000 group border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
                  alt="Alex - AI Core" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-6 -right-6 bg-brand-600 text-white p-6 rounded-3xl shadow-2xl border border-white/10"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <div className="flex-1">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 block"
              >
                AI Core Intelligence
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8 tracking-tight leading-tight">Alex System.</h2>
              <p className="text-2xl text-slate-300 mb-12 leading-relaxed italic font-serif text-balance">
                "Alex is a high-precision machine intelligence trained to listen. Whether you're in pain or just curious about a brighter smile, the Alex system helps you navigate the process with absolute clarity and data-driven empathy."
              </p>
              <div className="flex flex-wrap gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('consultation')}
                  className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all flex items-center gap-4 shadow-xl shadow-brand-900/20"
                >
                  Start Conversation
                  <Mic className="w-6 h-6" />
                </motion.button>
                <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-brand-900 border-2 border-slate-900" />)}
                  </div>
                  <p className="text-sm font-bold text-slate-400">500+ Active Chats</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px] mb-12">Trusted by industry leaders in dental technology</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['ADA', 'Invisalign', 'Straumann', 'Dentsply', 'Planmeca'].map((brand) => (
              <span key={brand} className="text-2xl md:text-3xl font-serif font-black text-white tracking-tighter">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-40 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-24">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 block"
            >
              Patient Stories
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 tracking-tight">Real Smiles, <br />Real Lives.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Architect", text: "The consultation with Alex was eye-opening. I've never felt so understood by a dental practice before even stepping inside." },
              { name: "Michael Chen", role: "Tech Lead", text: "Precision is everything in my job, and I see that same level of detail here. The 3D scans and AI insights are game-changing." },
              { name: "Emma Thompson", role: "Artist", text: "They don't just fix teeth; they design smiles that fit your face. It's truly an artistic approach to dentistry." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl"
              >
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} className="w-4 h-4 text-brand-400 fill-brand-400" />)}
                </div>
                <p className="text-xl text-slate-300 mb-10 leading-relaxed font-medium italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-lg">{t.name}</p>
                  <p className="text-brand-400 text-sm font-medium tracking-wide">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-brand-600 p-2 rounded-lg shadow-lg shadow-brand-500/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="font-serif font-bold text-3xl tracking-tighter">Prayag Dental Care</span>
            </div>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed mb-10">
              Redefining the dental experience through technology, empathy, and absolute financial transparency.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-600 hover:border-brand-600 transition-all group">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-white/40 rounded-sm group-hover:bg-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-8 text-slate-500">Quick Links</h4>
            <ul className="space-y-4 text-slate-300 font-medium">
              <li><a href="#services" className="hover:text-brand-400 transition-colors">Our Services</a></li>
              <li><a href="#about" className="hover:text-brand-400 transition-colors">Meet Alex</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Patient Portal</a></li>
            </ul>
          </div>
          <div className="md:col-span-5">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-8 text-slate-400">Our Location</h4>
            <a 
              href="https://maps.app.goo.gl/4FJsxfjrCAtJd9Ys5" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 mb-6 font-medium block hover:text-brand-400 transition-colors"
            >
              23 A, ADA Rd, near Durga pooja, Mukta Vihar<br />Naini, Prayagraj, Uttar Pradesh 211010
            </a>
            <a 
              href="tel:+918896512561" 
              className="text-slate-300 mb-2 font-medium block hover:text-brand-400 transition-colors"
            >
              +91 8896512561
            </a>
            <p className="text-slate-400 text-sm font-medium">Sun - Sat: 9:00 AM - 9:00 PM</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 font-medium">
          <p>© 2026 Prayag Dental Care. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingView.displayName = 'LandingView';
