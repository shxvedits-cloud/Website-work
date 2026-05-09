import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  User, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft,
  MoreVertical,
  Trash2,
  Loader2,
  Activity
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { cn } from '../lib/utils';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceTitle?: string;
  service: string;
  doctorName?: string;
  doctor: string;
  date: string;
  time: string;
  status: 'scheduled' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

interface MyAppointmentsViewProps {
  setView: (view: 'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide' | 'my-appointments') => void;
  currentUser: any;
  handleFirestoreError: (error: any, operation: any, path: string) => void;
}

export const MyAppointmentsView = ({ setView, currentUser, handleFirestoreError }: MyAppointmentsViewProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'appointments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    setError(null);
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      });
      setShowConfirmModal(null);
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      setError(error.message || 'Failed to cancel appointment. Please try again.');
      handleFirestoreError(error, 'update', `appointments/${id}`);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-32 pb-20 px-6">
      <div className="atmosphere" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => setView('landing')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-serif font-bold text-white tracking-tight">My Appointments</h1>
            <p className="text-slate-400 font-medium">Manage your scheduled dental visits</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Loading your schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark p-12 text-center rounded-[40px] border-white/5"
          >
            <div className="w-20 h-20 bg-brand-900/30 rounded-3xl flex items-center justify-center text-brand-400 mx-auto mb-8">
              <Calendar className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No appointments found</h2>
            <p className="text-slate-400 mb-10 max-w-md mx-auto">You haven't scheduled any dental visits yet. Start your journey with a $1 trial today.</p>
            <button 
              onClick={() => setView('booking')}
              className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/20"
            >
              Book Your First Visit
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {appointments.map((apt) => (
                <motion.div
                  key={apt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-dark p-8 rounded-[32px] border-white/5 hover:border-brand-500/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-400 flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all">
                        <Activity className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{apt.serviceTitle || apt.service || 'N/A'}</h3>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border",
                            getStatusColor(apt.status)
                          )}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-400" />
                            {apt.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-400" />
                            {apt.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-brand-400" />
                            {apt.doctorName || apt.doctor || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {apt.status === 'scheduled' || apt.status === 'pending' || apt.status === 'confirmed' ? (
                        <button
                          onClick={() => setShowConfirmModal(apt.id)}
                          disabled={cancellingId === apt.id}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl font-bold text-sm transition-all border border-red-500/20 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancel Appointment
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                          No actions available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !cancellingId && setShowConfirmModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-dark p-8 rounded-[32px] border-white/10 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Cancel Appointment?</h3>
              <p className="text-slate-400 mb-8 font-medium">This action cannot be undone. Are you sure you want to cancel this visit?</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  disabled={cancellingId !== null}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 disabled:opacity-50"
                >
                  Keep It
                </button>
                <button
                  onClick={() => handleCancel(showConfirmModal)}
                  disabled={cancellingId !== null}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancellingId ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
