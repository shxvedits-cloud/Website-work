import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval, 
  isBefore, 
  startOfDay,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BookingCalendarProps {
  currentUser: any;
  userProfile: any;
  onSuccess?: () => void;
}

const DOCTORS = [
  { id: 'dr-smith', name: 'Dr. Smith', specialty: 'General Dentistry' },
  { id: 'dr-jones', name: 'Dr. Jones', specialty: 'Orthodontics & Cosmetic' }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export function BookingCalendar({ currentUser, userProfile, onSuccess }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate || !selectedDoctor) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', selectedDoctor.id),
      where('date', '==', dateStr),
      where('status', '==', 'scheduled')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booked = snapshot.docs.map(doc => doc.data().time);
      setBookedSlots(booked);
    }, (error) => {
      console.error("Error listening to booked slots:", error);
    });

    return () => unsubscribe();
  }, [selectedDate, selectedDoctor]);

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setOtpError("Please enter a valid phone number.");
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setSimulatedOtp(null);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOtpSent(true);
        if (data.simulated && data.otp) {
          setSimulatedOtp(data.otp);
        }
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOtpVerified(true);
      } else {
        setOtpError(data.error || "Invalid OTP.");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!currentUser || !selectedDate || !selectedTime || !selectedDoctor || !isOtpVerified) return;

    setIsBooking(true);
    setBookingStatus('idle');

    try {
      const appointmentData = {
        patientId: currentUser.uid,
        patientName: userProfile?.name || currentUser.displayName || 'Anonymous',
        patientEmail: currentUser.email,
        patientPhone: phoneNumber,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        status: 'scheduled',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);
      
      // Send SMS confirmation via backend
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientPhone: phoneNumber,
            patientName: userProfile?.name || currentUser.displayName || 'Anonymous',
            doctorName: selectedDoctor.name,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
          }),
        });
      } catch (smsError) {
        console.error("SMS confirmation error:", smsError);
      }

      // Send email confirmation via backend
      try {
        await fetch('/api/send-appointment-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientEmail: currentUser.email,
            patientName: userProfile?.name || currentUser.displayName || 'Anonymous',
            doctorName: selectedDoctor.name,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            serviceTitle: 'Dental Consultation',
            type: 'booking',
          }),
        });
      } catch (emailError) {
        console.error("Email confirmation error:", emailError);
      }

      // Send WhatsApp confirmation via backend
      try {
        await fetch('/api/send-whatsapp-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientPhone: phoneNumber,
            patientName: userProfile?.name || currentUser.displayName || 'Anonymous',
            doctorName: selectedDoctor.name,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
          }),
        });
      } catch (waError) {
        console.error("WhatsApp confirmation error:", waError);
      }

      setBookingStatus('success');
      if (onSuccess) setTimeout(onSuccess, 2000);
    } catch (error: any) {
      console.error("Booking error:", error);
      setBookingStatus('error');
      setErrorMessage(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-bold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, startOfDay(new Date()));
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative aspect-square flex items-center justify-center text-sm cursor-pointer transition-all rounded-xl",
              isDisabled ? "text-slate-800 cursor-not-allowed" : "text-slate-300 hover:bg-white/5",
              isSelected && "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-900/20"
            )}
            onClick={() => !isDisabled && setSelectedDate(cloneDay)}
          >
            <span>{format(day, 'd')}</span>
            {isSameDay(day, new Date()) && !isSelected && (
              <div className="absolute bottom-2 w-1 h-1 bg-brand-600 rounded-full" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-2">{rows}</div>;
  };

  if (bookingStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 bg-emerald-900/20 border border-emerald-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Appointment Confirmed!</h2>
        <p className="text-slate-400 max-w-sm">
          Your visit with {selectedDoctor.name} on {selectedDate && format(selectedDate, 'MMMM do')} at {selectedTime} has been scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="bg-slate-900 p-8 rounded-[32px] border border-white/10 shadow-sm">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      <div className="space-y-8">
        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Select Doctor</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOCTORS.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                  selectedDoctor.id === doc.id 
                    ? "border-brand-600 bg-brand-900/10 ring-1 ring-brand-600" 
                    : "border-white/10 hover:border-white/20 bg-white/5"
                )}
              >
                <div className="w-12 h-12 bg-slate-800 rounded-full overflow-hidden">
                  <img src={`https://picsum.photos/seed/${doc.id}/100/100`} alt={doc.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-white">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.specialty}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Available Slots for {format(selectedDate, 'MMM do')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map(time => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-3 rounded-xl border text-sm font-medium transition-all",
                        isBooked 
                          ? "bg-slate-950 text-slate-700 border-white/5 cursor-not-allowed" 
                          : isSelected
                            ? "bg-brand-600 text-white border-brand-600 shadow-md"
                            : "border-white/10 hover:border-brand-600/50 hover:bg-brand-900/10 text-slate-300"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
              <CalendarIcon className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Please select a date to view available times</p>
            </div>
          )}
        </AnimatePresence>
 
        {/* OTP Verification Section */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Verification
          </label>
          
          {!isOtpSent ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm font-medium">+</span>
                </div>
                <input
                  type="tel"
                  placeholder="Mobile Number (e.g. 1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-sm text-white"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={otpLoading || !phoneNumber}
                className="px-6 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all"
              >
                {otpLoading ? "..." : "Send OTP"}
              </button>
            </div>
          ) : !isOtpVerified ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all text-sm tracking-[0.5em] text-center font-bold text-white"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  className="px-6 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all"
                >
                  {otpLoading ? "..." : "Verify"}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  OTP sent to <span className="font-bold text-slate-300">{phoneNumber}</span>
                </p>
                <button 
                  onClick={() => setIsOtpSent(false)}
                  className="text-xs text-brand-400 font-bold hover:underline"
                >
                  Change Number
                </button>
              </div>
              {simulatedOtp && (
                <div className="p-3 bg-amber-900/20 border border-amber-900/30 rounded-lg text-amber-500 text-xs">
                  <strong>Demo Mode:</strong> Use OTP <strong>{simulatedOtp}</strong> to verify.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-900/20 border border-emerald-900/30 rounded-2xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-bold">Mobile Verified</p>
                <p className="text-xs opacity-80">{phoneNumber}</p>
              </div>
              <button 
                onClick={() => {
                  setIsOtpVerified(false);
                  setIsOtpSent(false);
                  setOtp('');
                }}
                className="text-xs font-bold hover:underline"
              >
                Edit
              </button>
            </div>
          )}

          {otpError && (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {otpError}
            </p>
          )}
        </div>

        {/* Booking Action */}
        <div className="pt-4">
          {bookingStatus === 'error' && (
            <div className="mb-4 p-4 bg-rose-900/20 border border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {errorMessage}
            </div>
          )}
          <button
            disabled={!selectedDate || !selectedTime || !isOtpVerified || isBooking}
            onClick={handleBooking}
            className="w-full bg-brand-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-900/20"
          >
            {isBooking ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Booking
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-4">
            By booking, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
