/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, ThinkingLevel } from "@google/genai";
import { Mic, MicOff, PhoneOff, Stethoscope, Sparkles, Calendar, ShieldCheck, HeartPulse, LogIn, X, Mail, Lock, User, LogOut, Shield, AlertCircle, Camera, Scale, Dna, Upload, Loader2, Star, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioHandler } from './services/audioHandler';
import { auth, db } from './firebase';
import { 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

import { BookingCalendar } from './components/BookingCalendar';
import { ProfileModal } from './components/ProfileModal';
import { LandingView } from './components/LandingView';
import { AdminView } from './components/AdminView';
import { BookingView } from './components/BookingView';
import { ConsultationView } from './components/ConsultationView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { StyleGuideView } from './components/StyleGuideView';
import { IntroView } from './components/IntroView';
import { cn } from './lib/utils';

import { NotificationProvider, useNotifications } from './components/NotificationContext';

// Operation types for error handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const jsonError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', jsonError);
  throw new Error(jsonError);
}

const SYSTEM_INSTRUCTION = `You are Alex, a knowledgeable, warm, and professional dental coordinator at Prayag Dental Care.
Your tone is empathetic, clear, and reassuring. Avoid "salesy" language; focus on "patient-centered care".
Use simple terms to explain complex dental issues.

Bilingual Capability:
- You are fluent in both English and Hindi.
- Respond in the language the user speaks to you. If they speak Hindi, answer in Hindi. If they speak English, answer in English. If they mix both (Hinglish), you can respond in a natural, bilingual way.

Core Objectives:
1. Educate: Explain the importance of preventative oral health and its connection to overall wellness.
2. Qualify: Determine if the caller needs a routine check-up, emergency work, or specific cosmetic/orthodontic treatment.
3. Emergency First Aid: If a user reports an emergency (broken tooth, severe pain, bleeding), provide immediate, non-medical first aid tips:
   - For Bleeding: Advise biting down firmly on a clean gauze or cloth for 15-20 minutes.
   - For Pain/Swelling: Suggest applying a cold compress to the outside of the cheek.
   - For a Broken/Knocked-out Tooth: Advise keeping the tooth moist (in milk or saliva) and not touching the root.
   - For General Pain: Suggest rinsing with warm salt water.
   - ALWAYS follow these tips by mentioning available doctors to see them immediately.
4. The "Hook": Highlight our patient-centered care and the benefits of our initial consultations, digital scans, and personalized oral health plans.
5. Schedule: Coordinate between the patient’s availability and the doctors' schedules.

Key Knowledge:
- Doctors: Dr. Smith (General Dentistry) and Dr. Jones (Orthodontics & Cosmetic) are our primary experts.
- Comprehensive Care: We are a clinic and a medical store (medical-grade rinses, brushes, treatments).
- Financial Transparency: We provide "Personalized Treatment Estimates" before work begins.
- Support: 24/7 personal support for post-treatment recovery.

Guardrails:
- Empathy First: If pain is mentioned, say: "I’m so sorry you’re dealing with that pain; let's see how quickly we can get you seen." (or the Hindi equivalent).
- No Diagnosis: While you provide first aid tips for emergencies, do not diagnose the underlying condition. Say: "The doctor will need to take a look to give you a definitive answer, but we can certainly get that scheduled."
- Clear Pricing: Pivot to "Personalized Treatment Package" for expensive procedures.

Opening: "Hi there! This is Alex from Prayag Dental Care. I’m here to help you navigate your dental health journey. I can speak both English and Hindi. How are your teeth and gums feeling today? / नमस्ते! मैं प्रयाग डेंटल केयर से एलेक्स हूँ। मैं आपकी दंत स्वास्थ्य यात्रा में मदद करने के लिए यहाँ हूँ। मैं अंग्रेजी और हिंदी दोनों बोल सकता हूँ। आज आपके दांत और मसूड़े कैसे महसूस कर रहे हैं?"`;

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  phoneNumber?: string;
  photoURL?: string;
  age?: number;
  weight?: number;
  createdAt: Timestamp;
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

function AppContent() {
  const { notify } = useNotifications();
  const [view, setView] = useState<'intro' | 'landing' | 'consultation' | 'admin' | 'booking' | 'styleguide' | 'my-appointments'>('intro');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInterrupted, setIsInterrupted] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);
  
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      let profile;
      if (!docSnap.exists()) {
        // Create new profile for first-time Google users
        profile = {
          uid: user.uid,
          name: user.displayName || 'Anonymous User',
          email: user.email,
          role: user.email === 'shxvedits@gmail.com' ? 'admin' : 'patient',
          createdAt: serverTimestamp(),
        };
        await setDoc(docRef, profile);
      } else {
        profile = docSnap.data();
      }
      
      setUserProfile(profile);
      if (profile.role === 'admin') {
        setView('admin');
      } else if (view !== 'booking' && view !== 'consultation') {
        setView('landing');
      }
      
      setIsAuthModalOpen(false);
      setIsAdminLogin(false);
    } catch (error: any) {
      console.error('Google Auth failed:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
  };

  useEffect(() => {
    if (view === 'admin' && userProfile?.role === 'admin') {
      setPatientsLoading(true);
      setAppointmentsLoading(true);

      const patientsQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const isRecent = data.createdAt?.toMillis() > (Date.now() - 60000);
          if (change.type === 'added' && !snapshot.metadata.hasPendingWrites && isRecent) {
            notify('New Patient Registered', `${data.name || 'A new user'} has joined Prayag Dental Care.`, 'info');
          }
        });
        const patientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPatients(patientList);
        setPatientsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
        setPatientsLoading(false);
      });

      const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const isRecent = data.createdAt?.toMillis() > (Date.now() - 60000); // Created in last 60 seconds

          if (change.type === 'added' && !snapshot.metadata.hasPendingWrites && isRecent) {
            notify('New Appointment', `${data.patientName} booked a ${data.serviceTitle || 'consultation'}`, 'appointment');
          } else if (change.type === 'modified' && !snapshot.metadata.hasPendingWrites) {
            if (data.status === 'cancelled') {
              notify('Appointment Cancelled', `${data.patientName}'s appointment has been cancelled.`, 'error');
            }
          }
        });
        const appointmentList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(appointmentList);
        setAppointmentsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'appointments');
        setAppointmentsLoading(false);
      });

      return () => {
        unsubscribePatients();
        unsubscribeAppointments();
      };
    }
  }, [view, userProfile?.role, notify]);

  // Add real-time listener for patient's own appointments
  useEffect(() => {
    if (currentUser && userProfile?.role === 'patient') {
      const q = query(
        collection(db, 'appointments'), 
        where('patientId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const isRecentUpdate = data.updatedAt ? (data.updatedAt.toMillis() > (Date.now() - 60000)) : (data.createdAt?.toMillis() > (Date.now() - 60000));
          
          if (change.type === 'modified' && !snapshot.metadata.hasPendingWrites && isRecentUpdate) {
            if (data.status === 'confirmed') {
              notify('Appointment Confirmed', `Your appointment on ${data.date} at ${data.time} has been confirmed!`, 'success');
            } else if (data.status === 'cancelled') {
              notify('Appointment Cancelled', `Your appointment on ${data.date} at ${data.time} has been cancelled.`, 'error');
            }
          }
        });
      }, (error) => {
        // Not critical if this fails, but log it
        console.error("Patient appointment listener error:", error);
      });

      return () => unsubscribe();
    }
  }, [currentUser, userProfile?.role, notify]);

  useEffect(() => {
    if (view !== 'consultation' && isConnected) {
      stopConversation();
    }
  }, [view, isConnected]);

  const audioHandlerRef = useRef<AudioHandler | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    audioHandlerRef.current = new AudioHandler();
    return () => {
      audioHandlerRef.current?.stopInput();
    };
  }, []);

  const startConversation = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setTranscript([]);
    setError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          // Note: thinkingLevel is for Gemini 3, but we can try to optimize other params if available
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            try {
              await audioHandlerRef.current?.startInput((base64Data) => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            } catch (err) {
              console.error("Audio Input Error:", err);
              stopConversation();
            }
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioHandlerRef.current?.playAudioChunk(part.inlineData.data);
                }
                if (part.text) {
                  setTranscript(prev => [...prev.slice(-5), `Alex: ${part.text}`]);
                }
              }
            }

            if (message.serverContent?.userTurn?.parts) {
              for (const part of message.serverContent.userTurn.parts) {
                if (part.text) {
                  setTranscript(prev => [...prev.slice(-5), `You: ${part.text}`]);
                }
              }
            }

            if (message.serverContent?.interrupted) {
              audioHandlerRef.current?.clearQueue();
              setIsInterrupted(true);
              setTimeout(() => setIsInterrupted(false), 1000);
            }
          },
          onclose: () => {
            stopConversation();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            const msg = error.message || "Connection lost";
            setTranscript(prev => [...prev.slice(-5), `Error: ${msg}`]);
            setError(msg);
            stopConversation();
          }
        }
      });

      sessionRef.current = session;
    } catch (error: any) {
      console.error("Failed to connect:", error);
      setError(error.message || "Failed to connect to Alex");
      setIsConnecting(false);
    }
  };

  const stopConversation = () => {
    sessionRef.current?.close();
    audioHandlerRef.current?.stopInput();
    setIsConnected(false);
    setIsConnecting(false);
    sessionRef.current = null;
  };

  const handleCloseProfileModal = React.useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <IntroView onGetStarted={() => setView('landing')} />
          </motion.div>
        )}
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <LandingView 
              setView={setView}
              setIsAuthModalOpen={setIsAuthModalOpen}
              setIsProfileModalOpen={setIsProfileModalOpen}
              currentUser={currentUser}
              userProfile={userProfile}
              handleLogout={handleLogout}
            />
          </motion.div>
        )}
        {view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <AdminView 
              setView={setView}
              currentUser={currentUser}
              userProfile={userProfile}
              patients={patients}
              appointments={appointments}
              patientsLoading={patientsLoading}
              appointmentsLoading={appointmentsLoading}
            />
          </motion.div>
        )}
        {view === 'booking' && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <BookingView 
              setView={setView}
              currentUser={currentUser}
              userProfile={userProfile}
              handleFirestoreError={handleFirestoreError}
            />
          </motion.div>
        )}
        {view === 'consultation' && (
          <motion.div
            key="consultation"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <ConsultationView 
              setView={setView}
              currentUser={currentUser}
              userProfile={userProfile}
              startConversation={startConversation}
              stopConversation={stopConversation}
              isConnected={isConnected}
              isConnecting={isConnecting}
              transcript={transcript}
              error={error}
            />
          </motion.div>
        )}
        {view === 'styleguide' && (
          <motion.div
            key="styleguide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StyleGuideView setView={setView} />
          </motion.div>
        )}
        {view === 'my-appointments' && (
          <motion.div
            key="my-appointments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <MyAppointmentsView 
              setView={setView}
              currentUser={currentUser}
              handleFirestoreError={handleFirestoreError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Auth Modal */}
      <AnimatePresence>
        {isProfileModalOpen && currentUser && (
          <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={handleCloseProfileModal}
            currentUser={currentUser}
            userProfile={userProfile}
            handleFirestoreError={handleFirestoreError}
          />
        )}

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="bg-brand-900/30 p-2 rounded-xl">
                    <Activity className="w-6 h-6 text-brand-400" />
                  </div>
                  <button 
                    onClick={() => setIsAuthModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <h2 className="text-3xl font-serif font-bold text-white mb-2">
                  {isAdminLogin ? 'Staff Portal' : 'Welcome to Prayag Dental Care'}
                </h2>
                <p className="text-slate-400 mb-8">
                  {isAdminLogin 
                    ? 'Sign in with your administrator account to access the clinic dashboard.' 
                    : 'Sign in with Google to access your dental wellness dashboard.'}
                </p>

                <div className="space-y-4">
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold shadow-sm hover:bg-white/10 transition-all disabled:opacity-50 text-white"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    {authLoading ? 'Connecting...' : 'Continue with Google'}
                  </button>

                  {authError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-900/20 border border-red-900/30 rounded-xl">
                      <AlertCircle className="w-4 h-4" />
                      {authError}
                    </div>
                  )}
                </div>

                <div className="mt-8 text-center space-y-4">
                  <button 
                    onClick={() => setIsAdminLogin(!isAdminLogin)}
                    className="text-xs font-medium text-slate-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2 w-full"
                  >
                    <Shield className="w-3 h-3" />
                    {isAdminLogin ? 'Switch to Patient Access' : 'Staff/Administrator Access'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
