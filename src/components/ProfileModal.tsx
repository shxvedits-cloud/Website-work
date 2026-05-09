import React, { useState, useRef, ReactNode } from 'react';
import { User, X, Camera, Mic, Dna, Scale, Upload, Loader2, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

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

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser;
  userProfile: UserProfile | null;
  handleFirestoreError: (error: unknown, operationType: any, path: string | null) => void;
}

export const ProfileModal = React.memo(({ isOpen, onClose, currentUser, userProfile, handleFirestoreError }: ProfileModalProps) => {
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const resizedBase64 = await resizeImage(file);
        setPhotoURL(resizedBase64);
      } catch (error) {
        console.error("Image resize failed:", error);
        alert("Failed to process image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 pb-4 flex-shrink-0 border-b border-white/5">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-brand-900/30 p-2 rounded-xl">
              <User className="w-6 h-6 text-brand-400" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <h2 className="text-3xl font-serif font-bold text-white mb-1">Your Profile</h2>
          <p className="text-slate-400 text-sm">Update your personal information for better care.</p>
        </div>

        <div className="p-8 pt-6 overflow-y-auto flex-grow custom-scrollbar">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsSaving(true);
            const formData = new FormData(e.currentTarget);
            const ageVal = formData.get('age') as string;
            const weightVal = formData.get('weight') as string;
            
            const updates: any = {
              name: formData.get('name') as string,
              phoneNumber: formData.get('phoneNumber') as string || "",
              photoURL: photoURL || "",
            };

            if (updates.phoneNumber && !/^[0-9]{10}$/.test(updates.phoneNumber)) {
              setIsSaving(false);
              alert("Phone number must be exactly 10 digits.");
              return;
            }

            if (ageVal && !isNaN(parseInt(ageVal))) {
              updates.age = parseInt(ageVal);
            }
            if (weightVal && !isNaN(parseFloat(weightVal))) {
              updates.weight = parseFloat(weightVal);
            }

            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await setDoc(userRef, updates, { merge: true });
              setIsSaving(false);
              onClose();
            } catch (error) {
              setIsSaving(false);
              handleFirestoreError(error, 'update', `users/${currentUser.uid}`);
            }
          }} className="space-y-8">
            <div className="flex items-center gap-6">
              <div 
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-3xl bg-white/5 overflow-hidden border-2 border-white/10 group-hover:border-brand-400 transition-colors flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                  ) : photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-700" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-brand-600 text-white p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex-grow">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Profile Picture</label>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {photoURL ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-[10px] text-slate-500 mt-2">Optimized for performance. Recommended: Square image.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    name="name"
                    required
                    defaultValue={userProfile?.name}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number (10 digits) *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    name="phoneNumber"
                    required
                    type="tel"
                    defaultValue={userProfile?.phoneNumber}
                    onChange={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Age</label>
                <div className="relative">
                  <Dna className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    name="age"
                    type="number"
                    defaultValue={userProfile?.age}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    name="weight"
                    type="number"
                    step="0.1"
                    defaultValue={userProfile?.weight}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-[2] bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand-900/20 hover:bg-brand-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
});

ProfileModal.displayName = 'ProfileModal';
