import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  User,
  Mail,
  Phone,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

interface AdminViewProps {
  setView: (view: 'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide' | 'my-appointments') => void;
  currentUser: any;
  userProfile: any;
  patients: any[];
  appointments: any[];
  patientsLoading: boolean;
  appointmentsLoading: boolean;
}

export const AdminView = ({ 
  setView, 
  currentUser, 
  userProfile, 
  patients, 
  appointments,
  patientsLoading,
  appointmentsLoading
}: AdminViewProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancelAppointment = async (id: string) => {
    setCancellingId(id);
    setError(null);
    try {
      const apt = appointments.find(a => a.id === id);
      if (!apt) throw new Error("Appointment not found");

      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      });

      // Send cancellation email via backend
      try {
        await fetch('/api/send-appointment-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientEmail: apt.patientEmail,
            patientName: apt.patientName,
            doctorName: apt.doctorName || 'Dr. Smith',
            date: apt.date,
            time: apt.time,
            serviceTitle: apt.serviceTitle || apt.service || 'Dental Consultation',
            type: 'cancellation',
          }),
        });
      } catch (emailError) {
        console.error("Cancellation email error:", emailError);
      }

      setShowConfirmModal(null);
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      setError(error.message || 'Failed to cancel appointment. Please try again.');
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
      
      {/* Fixed Exit Button */}
      <div className="fixed top-8 right-6 z-50">
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-all border border-white/10 text-[10px] uppercase tracking-widest shadow-2xl"
        >
          <XCircle className="w-4 h-4" />
          Exit Dashboard
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-600 p-2 rounded-lg shadow-lg shadow-brand-900/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-brand-400 font-bold tracking-[0.3em] uppercase text-[10px]">Clinic Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Welcome back, {userProfile?.name?.split(' ')[0]}</h1>
            <p className="text-slate-400 font-medium mt-2">Here's what's happening at Prayag Dental Care today.</p>
          </div>
          
          <div className="flex items-center gap-1 md:gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-x-auto no-scrollbar max-w-full">
            {(['overview', 'patients', 'appointments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all uppercase tracking-widest whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-900/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Patients" value={patients.length.toString()} icon={<Users />} trend="+12%" isUp={true} />
              <StatCard title="Appointments" value={appointments.length.toString()} icon={<Calendar />} trend="+5%" isUp={true} />
              <StatCard title="Revenue" value="$4,250" icon={<TrendingUp />} trend="+18%" isUp={true} />
              <StatCard title="Satisfaction" value="99%" icon={<CheckCircle2 />} trend="0%" isUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-dark p-8 rounded-[40px] border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif font-bold text-white">Recent Appointments</h3>
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors"
                  >
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                        <th className="pb-4 px-4">Patient</th>
                        <th className="pb-4 px-4">Service</th>
                        <th className="pb-4 px-4">Time</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {appointmentsLoading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">Loading appointments...</td>
                        </tr>
                      ) : appointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">No appointments scheduled yet.</td>
                        </tr>
                      ) : (
                        appointments.slice(0, 5).map((apt) => (
                          <tr key={apt.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4">
                              <button 
                                onClick={() => {
                                  const patient = patients.find(p => p.id === apt.patientId);
                                  if (patient) setSelectedPatient(patient);
                                }}
                                className="flex items-center gap-3 text-left group/patient"
                              >
                                <div className="w-8 h-8 rounded-full bg-brand-900/30 flex items-center justify-center text-brand-400 text-xs font-bold group-hover/patient:bg-brand-600 group-hover/patient:text-white transition-all">
                                  {apt.patientName?.[0] || 'P'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white group-hover/patient:text-brand-400 transition-colors">{apt.patientName}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{apt.patientEmail}</p>
                                </div>
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-medium text-slate-300">{apt.serviceTitle || apt.service || 'N/A'}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-brand-400" />
                                {apt.time}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border",
                                getStatusColor(apt.status)
                              )}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                <button 
                                  onClick={() => setShowConfirmModal(apt.id)}
                                  disabled={cancellingId === apt.id}
                                  className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                  title="Cancel Appointment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-dark p-8 rounded-[40px] border-white/5">
                <h3 className="text-2xl font-serif font-bold text-white mb-8">Quick Actions</h3>
                <div className="space-y-4">
                  <QuickAction title="Add New Patient" icon={<User />} color="bg-brand-600" />
                  <QuickAction title="Send Reminder" icon={<Mail />} color="bg-emerald-600" />
                  <QuickAction title="Update Schedule" icon={<Calendar />} color="bg-blue-600" />
                  <QuickAction title="Emergency Alert" icon={<AlertCircle />} color="bg-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="glass-dark p-8 rounded-[40px] border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h3 className="text-3xl font-serif font-bold text-white">Patient Directory</h3>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search patients by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-brand-500 transition-all text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patientsLoading ? (
                <div className="col-span-full py-20 text-center text-slate-500 font-medium">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500 font-medium">No patients found.</div>
              ) : (
                patients
                  .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((patient) => (
                    <motion.div 
                      key={patient.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        {patient.photoURL ? (
                          <img src={patient.photoURL} alt={patient.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-brand-900/30 flex items-center justify-center text-brand-400 font-bold text-xl">
                            {patient.name?.[0] || 'P'}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white text-lg">{patient.name}</h4>
                          <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">{patient.role}</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm text-slate-400 font-medium">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-slate-500" />
                          {patient.email}
                        </div>
                        {patient.phoneNumber && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-500" />
                            {patient.phoneNumber}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="w-full mt-6 py-3 bg-white/5 hover:bg-brand-600 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 hover:border-brand-600"
                      >
                        View Profile
                      </button>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="glass-dark p-8 rounded-[40px] border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h3 className="text-3xl font-serif font-bold text-white">Appointment Schedule</h3>
              <div className="flex flex-1 items-center gap-4 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search appointments..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-all text-white placeholder:text-slate-500"
                  />
                </div>
                <button 
                  onClick={() => {
                    const statuses = ['all', 'scheduled', 'confirmed', 'completed', 'cancelled'];
                    const currentIndex = statuses.indexOf(filterStatus);
                    const nextIndex = (currentIndex + (filterStatus === 'all' ? 1 : 1)) % statuses.length;
                    setFilterStatus(statuses[nextIndex]);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border whitespace-nowrap",
                    filterStatus === 'all' 
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400" 
                      : "bg-brand-600/20 border-brand-500/50 text-brand-400"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  {filterStatus === 'all' ? 'Filter' : `Status: ${filterStatus}`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="pb-6 px-4">Patient</th>
                    <th className="pb-6 px-4">Service</th>
                    <th className="pb-6 px-4">Doctor</th>
                    <th className="pb-6 px-4">Date & Time</th>
                    <th className="pb-6 px-4">Status</th>
                    <th className="pb-6 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {appointmentsLoading ? (
                      <motion.tr
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={6} className="py-20 text-center text-slate-500 font-medium">Loading appointments...</td>
                      </motion.tr>
                    ) : appointments.length === 0 ? (
                      <motion.tr
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={6} className="py-20 text-center text-slate-500 font-medium">No appointments scheduled yet.</td>
                      </motion.tr>
                    ) : (
                      appointments
                        .filter(apt => {
                          const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
                          const matchesSearch = 
                            apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            apt.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesStatus && matchesSearch;
                        })
                        .map((apt) => (
                          <motion.tr 
                            key={apt.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-6 px-4">
                              <button 
                                onClick={() => {
                                  const patient = patients.find(p => p.id === apt.patientId);
                                  if (patient) setSelectedPatient(patient);
                                }}
                                className="flex items-center gap-3 text-left group/patient"
                              >
                                <div className="w-10 h-10 rounded-xl bg-brand-900/30 flex items-center justify-center text-brand-400 font-bold group-hover/patient:bg-brand-600 group-hover/patient:text-white transition-all">
                                  {apt.patientName?.[0] || 'P'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white group-hover/patient:text-brand-400 transition-colors">{apt.patientName}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{apt.patientPhone}</p>
                                </div>
                              </button>
                            </td>
                            <td className="py-6 px-4">
                              <span className="text-sm font-medium text-slate-300">{apt.serviceTitle || apt.service || 'N/A'}</span>
                            </td>
                            <td className="py-6 px-4">
                              <span className="text-sm font-medium text-slate-300">{apt.doctorName || apt.doctor || 'N/A'}</span>
                            </td>
                          <td className="py-6 px-4">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-white">{apt.date}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <Clock className="w-3 h-3 text-brand-400" />
                                {apt.time}
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border",
                              getStatusColor(apt.status)
                            )}>
                              {apt.status}
                            </span>
                          </td>
                           <td className="py-6 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                <button 
                                  onClick={() => setShowConfirmModal(apt.id)}
                                  disabled={cancellingId === apt.id}
                                  className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                  title="Cancel Appointment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
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
              <p className="text-slate-400 mb-8 font-medium">Are you sure you want to cancel this appointment? This will notify the patient.</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {showConfirmModal && (
                <div className="bg-white/5 rounded-2xl p-4 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-900/30 flex items-center justify-center text-brand-400 font-bold text-xs">
                      {appointments.find(a => a.id === showConfirmModal)?.patientName?.[0] || 'P'}
                    </div>
                    <span className="text-white font-bold">{appointments.find(a => a.id === showConfirmModal)?.patientName}</span>
                  </div>
                  <div className="text-sm text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {appointments.find(a => a.id === showConfirmModal)?.serviceTitle || appointments.find(a => a.id === showConfirmModal)?.service} • {appointments.find(a => a.id === showConfirmModal)?.date} at {appointments.find(a => a.id === showConfirmModal)?.time}
                  </div>
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
                  onClick={() => handleCancelAppointment(showConfirmModal)}
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

      {/* Patient Profile Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl glass-dark rounded-[40px] border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {selectedPatient.photoURL ? (
                    <img src={selectedPatient.photoURL} alt={selectedPatient.name} className="w-20 h-20 rounded-3xl object-cover border-2 border-brand-500/20 shadow-xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-brand-900/30 flex items-center justify-center text-brand-400 font-bold text-3xl border-2 border-brand-500/20 shadow-xl">
                      {selectedPatient.name?.[0] || 'P'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-white mb-1">{selectedPatient.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-brand-600/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-500/20">
                        {selectedPatient.role}
                      </span>
                      <span className="text-slate-500 text-xs font-medium">ID: {selectedPatient.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/10"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Contact Information</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Email</span>
                            <span className="text-sm font-medium text-slate-300">{selectedPatient.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Phone</span>
                            <span className="text-sm font-medium text-slate-300">{selectedPatient.phoneNumber || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Account Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mb-1">Total Visits</p>
                          <p className="text-2xl font-serif font-bold text-white">
                            {appointments.filter(a => a.patientId === selectedPatient.id).length}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mb-1">Cancelled</p>
                          <p className="text-2xl font-serif font-bold text-red-400">
                            {appointments.filter(a => a.patientId === selectedPatient.id && a.status === 'cancelled').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content - Appointment History */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-brand-400" />
                      Appointment History
                    </h4>
                    
                    <div className="space-y-4">
                      {appointments.filter(a => a.patientId === selectedPatient.id).length === 0 ? (
                        <div className="py-12 text-center glass-card rounded-3xl border-white/5 bg-white/[0.02]">
                          <p className="text-slate-500 font-medium">No appointment history found for this patient.</p>
                        </div>
                      ) : (
                        appointments
                          .filter(a => a.patientId === selectedPatient.id)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((apt) => (
                            <div key={apt.id} className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                                  apt.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                  apt.status === 'cancelled' ? "bg-red-500/10 text-red-400" :
                                  "bg-brand-500/10 text-brand-400"
                                )}>
                                  {apt.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                                   apt.status === 'cancelled' ? <XCircle className="w-6 h-6" /> :
                                   <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h5 className="font-bold text-white">{apt.serviceTitle || apt.service || 'N/A'}</h5>
                                  <p className="text-xs text-slate-500 font-medium">{apt.date} at {apt.time}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                                  getStatusColor(apt.status)
                                )}>
                                  {apt.status}
                                </span>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2">{apt.doctorName || apt.doctor || 'N/A'}</p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
                >
                  Close Profile
                </button>
                <button className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-900/20 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Message Patient
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function StatCard({ title, value, icon, trend, isUp }: { title: string, value: string, icon: React.ReactNode, trend: string, isUp: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-dark p-8 rounded-[32px] border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-400">
          {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
          isUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className="text-4xl font-serif font-bold text-white tracking-tighter">{value}</p>
    </motion.div>
  );
}

function QuickAction({ title, icon, color }: { title: string, icon: React.ReactNode, color: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{title}</span>
      <ArrowRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
