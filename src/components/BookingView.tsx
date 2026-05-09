import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

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

interface BookingViewProps {
  setView: (view: 'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide') => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  handleFirestoreError: (error: unknown, operationType: any, path: string | null) => void;
}

export const BookingView = React.memo(({ setView, currentUser, userProfile, handleFirestoreError }: BookingViewProps) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phoneNumber || '');

  const services = [
    { id: 'trial', title: '$1 Wellness Trial', price: '$1', duration: '45 min', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'checkup', title: 'Comprehensive Checkup', price: '$149', duration: '60 min', icon: <Activity className="w-5 h-5" /> },
    { id: 'whitening', title: 'Laser Whitening', price: '$299', duration: '90 min', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'emergency', title: 'Emergency Care', price: '$199', duration: '30 min', icon: <ShieldCheck className="w-5 h-5" /> }
  ];

  const dates = ['Mar 25', 'Mar 26', 'Mar 27', 'Mar 28', 'Mar 29', 'Mar 30'];
  const times = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="atmosphere" />
      <nav className="h-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Exit</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-white tracking-tight">Book Appointment</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={cn(
                "w-8 h-1 rounded-full transition-all duration-500",
                step >= i ? "bg-brand-500" : "bg-white/10"
              )} 
            />
          ))}
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full p-8 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-serif font-bold text-white mb-4">Select a Service</h2>
                <p className="text-slate-400 font-medium">Choose the treatment that best fits your needs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "p-6 rounded-3xl border transition-all duration-300 text-left group relative overflow-hidden",
                      selectedService === service.id 
                        ? "bg-brand-600 border-brand-500 shadow-xl shadow-brand-900/20" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                      selectedService === service.id ? "bg-white/20 text-white" : "bg-brand-900/30 text-brand-400"
                    )}>
                      {service.icon}
                    </div>
                    <h3 className={cn("text-xl font-bold mb-2", selectedService === service.id ? "text-white" : "text-white")}>{service.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-bold opacity-70">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {service.duration}</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {service.price}</span>
                    </div>
                    {selectedService === service.id && (
                      <CheckCircle2 className="absolute top-6 right-6 w-6 h-6 text-white" />
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-end pt-8">
                <button
                  disabled={!selectedService}
                  onClick={handleNext}
                  className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl"
                >
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-4xl font-serif font-bold text-white mb-4">Choose Date & Time</h2>
                <p className="text-slate-400 font-medium">Select a convenient slot for your visit.</p>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Select Date
                  </h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                    {dates.map((date) => (
                      <motion.button
                        key={date}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex-shrink-0 w-24 h-24 rounded-2xl border flex flex-col items-center justify-center transition-all",
                          selectedDate === date 
                            ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/20" 
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400"
                        )}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest mb-1">{date.split(' ')[0]}</span>
                        <span className="text-2xl font-serif font-bold">{date.split(' ')[1]}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Select Time
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {times.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-4 rounded-xl border font-bold text-sm transition-all",
                          selectedTime === time 
                            ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/20" 
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400"
                        )}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <button
                  onClick={handleBack}
                  className="px-8 py-4 rounded-2xl font-bold text-lg text-slate-400 hover:text-white transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleNext}
                  className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl"
                >
                  Final Step <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-serif font-bold text-white mb-4">Confirm Details</h2>
                <p className="text-slate-400 font-medium">Review your information before finalizing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="glass-dark p-8 rounded-3xl border border-white/5">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Appointment Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Service</span>
                        <span className="text-white font-bold">{services.find(s => s.id === selectedService)?.title}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Date</span>
                        <span className="text-white font-bold">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Time</span>
                        <span className="text-white font-bold">{selectedTime}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-brand-400 text-2xl font-serif font-bold">{services.find(s => s.id === selectedService)?.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Full Name *" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="Email Address *" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="tel" 
                      placeholder="Phone Number (10 digits) *" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-500 transition-all font-medium"
                    />
                    {phone && phone.length !== 10 && (
                      <p className="text-xs text-red-400 mt-1 ml-4">Phone number must be exactly 10 digits</p>
                    )}
                  </div>
                  <div className="relative">
                    <MessageSquare className="w-5 h-5 absolute left-4 top-6 text-slate-500" />
                    <textarea 
                      placeholder="Reason for visit / Additional notes (optional)" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-500 transition-all font-medium min-h-[120px] resize-none"
                    />
                  </div>
                  <div className="p-4 bg-brand-900/20 border border-brand-800/30 rounded-2xl flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Your data is protected by HIPAA-compliant encryption. We never share your personal information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <button
                  onClick={handleBack}
                  className="px-8 py-4 rounded-2xl font-bold text-lg text-slate-400 hover:text-white transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  disabled={isBooking || !fullName || !email || !phone || !/^[0-9]{10}$/.test(phone)}
                  onClick={async () => {
                    if (!currentUser || !selectedService || !selectedDate || !selectedTime || !fullName || !email || !phone || !/^[0-9]{10}$/.test(phone)) return;
                    
                    setIsBooking(true);
                    const service = services.find(s => s.id === selectedService);
                    
                    const appointmentData = {
                      patientId: currentUser.uid,
                      patientName: fullName,
                      patientEmail: email,
                      patientPhone: phone,
                      doctorId: selectedService === 'whitening' ? 'dr-jones' : 'dr-smith',
                      doctorName: selectedService === 'whitening' ? 'Dr. Jones' : 'Dr. Smith',
                      serviceId: selectedService,
                      serviceTitle: service?.title,
                      notes: notes,
                      date: selectedDate, // In a real app, this would be a proper date string
                      time: selectedTime,
                      status: 'scheduled',
                      createdAt: serverTimestamp(),
                    };

                    try {
                      const appointmentRef = doc(collection(db, 'appointments'));
                      await setDoc(appointmentRef, appointmentData);
                      
                      // Send email confirmation
                      try {
                        await fetch('/api/send-email-confirmation', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            patientEmail: email,
                            patientName: fullName,
                            doctorName: appointmentData.doctorName,
                            date: selectedDate,
                            time: selectedTime,
                            serviceTitle: service?.title,
                          }),
                        });
                      } catch (emailError) {
                        console.error("Email confirmation error:", emailError);
                      }

                      setView('landing');
                    } catch (error) {
                      handleFirestoreError(error, 'create', 'appointments');
                    } finally {
                      setIsBooking(false);
                    }
                  }}
                  className="bg-brand-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'} <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

BookingView.displayName = 'BookingView';
