'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, User, MapPin,
  Briefcase, ArrowLeft,
  Save, GraduationCap,
  Info, Target,
  Loader2, Camera,
  Image as ImageIcon,
  X, Crop, ArrowRight,
  Coins, Users, Plus, Star } from
'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { matrimonyService } from '@/lib/matrimonyService';
import { historyApiService } from '@/lib/historyApiService';
import { uploadService } from '@/lib/upload.web';
import Cropper from 'react-easy-crop';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DRAFT_KEY = 'matrimony_setup_draft';

// Helper to create a cropped image blob from the crop area
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve) => {image.onload = resolve;});

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.92);
  });
}

export default function MatrimonySetupPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    isActive: true,
    bio: '',
    profession: '',
    education: '',
    income: '',
    height: '',
    religion: 'Hindu',
    caste: '',
    motherTongue: '',
    hobbies: '',
    photos: [] as string[],
    partnerPreferences: {
      minAge: 18,
      maxAge: 35,
      location: [] as string[]
    }
  });

  const [newLocation, setNewLocation] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // 1. Initial Mount Load
  useEffect(() => {
    setMounted(true);
    if (!historyApiService.isAuthenticated()) {
      router.push('/matrimony');
      return;
    }

    const fetchProfile = async () => {
      // Check if we have a draft saved in browser memory
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      let draftData = null;
      if (savedDraft) {
        try { draftData = JSON.parse(savedDraft); } catch(e) {}
      }

      // Fetch from API to see if they already have an existing live profile
      const apiData = await matrimonyService.getProfile();
      
      setFormData((prev) => ({
        ...prev,
        // Override with API data if exists, otherwise fallback to local draft or keep default
        ...(apiData || draftData || {}),
        partnerPreferences: {
          ...prev.partnerPreferences,
          ...(apiData?.partnerPreferences || draftData?.partnerPreferences || {}),
          location: apiData?.partnerPreferences?.location || draftData?.partnerPreferences?.location || prev.partnerPreferences.location || []
        }
      }));
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  // 2. Draft Persistor
  useEffect(() => {
    if (!loading && mounted) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, loading, mounted]);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image is too large. Maximum allowed size is 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'profile-photo.jpg', { type: 'image/jpeg' });
      const res = await uploadService.uploadImage(croppedFile);
      setFormData((prev) => ({
        ...prev,
        photos: [res.url]
      }));
      setCropImage(null);
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await matrimonyService.updateProfile(formData);
    setSaving(false);
    if (result.success) {
      toast.success('Matrimony profile updated successfully!');
      // VERY IMPORTANT: Clear the draft so it doesn't accidentally overwrite future loads with old browser cache
      localStorage.removeItem(DRAFT_KEY);
      router.push('/matrimony');
    } else {
      toast.error(result.message || 'Failed to update profile.');
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !formData.partnerPreferences.location.includes(newLocation.trim())) {
      setFormData({
        ...formData,
        partnerPreferences: {
          ...formData.partnerPreferences,
          location: [...formData.partnerPreferences.location, newLocation.trim()]
        }
      });
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setFormData({
      ...formData,
      partnerPreferences: {
        ...formData.partnerPreferences,
        location: formData.partnerPreferences.location.filter(l => l !== loc)
      }
    });
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdf6e3]">
          <div className="w-12 h-12 border-4 border-[#b8962e]/20 border-t-[#b8962e] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6" style={{ backgroundColor: '#fdf6e3' }}>
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            .setup-wrap { font-family: 'Inter', sans-serif; }
            .setup-wrap .serif { font-family: 'Inter', sans-serif; }
        `}</style>

        <div className="max-w-2xl mx-auto setup-wrap">
            <div className="flex items-center justify-between mb-8">
              <Link href="/matrimony" className="inline-flex items-center gap-2 text-[#b8962e] text-sm font-bold hover:underline">
                  <ArrowLeft className="w-4 h-4" />Back
              </Link>
              <div className="flex items-center gap-4">
                  <div className="text-[10px] font-extrabold text-[#b8962e] uppercase tracking-widest">Step {step} of {totalSteps}</div>
                  <div className="w-32 h-1.5 bg-[#b8962e]/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        className="h-full bg-[#b8962e]" 
                      />
                  </div>
              </div>
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900 serif mb-2">Build your <span className="text-[#b8962e]">Divine Profile</span></h1>
                <div className="flex justify-center gap-8 mt-6">
                    {['Identity', 'Life & Interests', 'Preferences'].map((label, idx) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${step > idx + 1 ? 'bg-[#b8962e] text-white' : step === idx + 1 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                                {step > idx + 1 ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${step === idx + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-8 relative min-h-[500px]">
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-[#b8962e]/5 border border-[#d6c89a]/20 space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-amber-50 text-[#b8962e] rounded-xl"><User size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-900 serif">1. Your Divine Identity</h2>
                        </div>

                        {/* Photo Upload */}
                        <div className="flex flex-col items-center p-6 border-2 border-dashed border-[#d6c89a]/50 rounded-2xl bg-amber-50/10">
                            <p className="text-sm font-bold text-gray-900 mb-4 serif flex items-center justify-center gap-2">
                                <ImageIcon className="w-4 h-4 text-[#b8962e]" />Profile Recognition
                            </p>
                            <div className="flex gap-4 items-center">
                                {formData.photos?.[0] ?
                                  <div className="relative group">
                                      <img src={formData.photos[0]} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white" />
                                      <button
                                        onClick={() => setFormData((p) => ({ ...p, photos: [] }))}
                                        className="absolute inset-0 bg-black/50 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        Remove
                                      </button>
                                  </div> 
                                :
                                  <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center shadow-inner border-4 border-white">
                                      <User className="w-10 h-10 text-gray-200" />
                                  </div>
                                }
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-5 py-2.5 bg-[#b8962e] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#8f7422] transition-colors flex items-center gap-2">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    {formData.photos?.[0] ? 'Change Photo' : 'Upload Photo'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#b8962e]" />Your Journey (Bio)
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Share your story, your values, and what you seek in a soulmate..."
                                className="w-full h-40 px-5 py-4 rounded-2xl bg-amber-50/5 border border-[#d6c89a]/30 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 focus:bg-white resize-none text-[15px] leading-relaxed text-gray-900 font-medium"
                            />
                        </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: LIFE & INTERESTS */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-[#b8962e]/5 border border-[#d6c89a]/20 space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-amber-50 text-[#b8962e] rounded-xl"><Briefcase size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-900 serif">2. Life, Career & Hobbies</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#b8962e]" />Profession</label>
                                <input
                                  type="text"
                                  value={formData.profession}
                                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                  placeholder="e.g. Software Engineer"
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 text-[15px] font-semibold text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#b8962e]" />Education</label>
                                <input
                                  type="text"
                                  value={formData.education}
                                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                  placeholder="e.g. B.Tech Computer Science"
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 text-[15px] font-semibold text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Target className="w-4 h-4 text-[#b8962e]" />Height</label>
                                <select
                                  value={formData.height}
                                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 text-[15px] font-semibold text-gray-900"
                                >
                                    <option value="">Select Height</option>
                                    {["5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"+"].map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Star className="w-4 h-4 text-[#b8962e]" />Hobbies & Interests</label>
                                <input
                                  type="text"
                                  value={formData.hobbies}
                                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                                  placeholder="e.g. Cricket, Traveling, Yoga"
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 text-[15px] font-semibold text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: VEDIC INTENT & PREFERENCES */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-[#b8962e]/5 border border-[#d6c89a]/20 space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-amber-50 text-[#b8962e] rounded-xl"><Target size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-900 serif">3. Vedic & Partner Intent</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Religion</label>
                                <input
                                  type="text"
                                  value={formData.religion}
                                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 text-[15px] font-semibold text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Caste</label>
                                <input
                                  type="text"
                                  value={formData.caste}
                                  onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8962e]/50 text-[15px] font-semibold text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-[#b8962e]" />Partner Preferences</label>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Min Age</span>
                                <input
                                    type="number"
                                    min="18"
                                    value={formData.partnerPreferences.minAge}
                                    onChange={(e) => {
                                        const val = Math.max(18, parseInt(e.target.value) || 18);
                                        setFormData({ ...formData, partnerPreferences: { ...formData.partnerPreferences, minAge: val } });
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none text-gray-900 font-bold"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Max Age</span>
                                <input
                                    type="number"
                                    min="18"
                                    value={formData.partnerPreferences.maxAge}
                                    onChange={(e) => {
                                        const val = Math.max(18, parseInt(e.target.value) || 18);
                                        setFormData({ ...formData, partnerPreferences: { ...formData.partnerPreferences, maxAge: val } });
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none text-gray-900 font-bold"
                                />
                              </div>
                          </div>
                          
                          <div className="space-y-3">
                              <div className="flex gap-2">
                                  <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLocation()} placeholder="Add preferred cities..." className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none text-gray-900" />
                                  <button onClick={addLocation} className="px-4 bg-gray-900 text-white rounded-xl hover:bg-[#b8962e] transition-colors"><Plus size={18} /></button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  {formData.partnerPreferences.location.map((loc, i) => (
                                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-[#b8962e] border border-amber-100 rounded-lg text-xs font-bold">
                                          {loc} <button onClick={() => removeLocation(loc)} className="hover:text-amber-700"><X size={12} /></button>
                                      </span>
                                  ))}
                              </div>
                          </div>
                        </div>
                    </div>
                  </motion.div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="flex items-center justify-between pt-10">
                    <button
                        onClick={() => step > 1 && setStep(step - 1)}
                        disabled={step === 1}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${step > 1 ? 'text-gray-900 hover:bg-white active:scale-95' : 'text-gray-300 pointer-events-none'}`}
                    >
                        <ArrowLeft size={18} /> Previous Step
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center gap-2"
                        >
                            Next Step <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-10 py-4 bg-gradient-to-r from-[#b8962e] to-[#d4aa3e] text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Finish & Enter Matrimony
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* CROPPER MODAL */}
        {cropImage && (
            <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col">
                <div className="p-4 flex justify-between items-center bg-black">
                    <h3 className="text-white font-bold">Crop Photo</h3>
                    <button onClick={() => setCropImage(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={20} /></button>
                </div>
                <div className="flex-1 relative">
                    <Cropper
                        image={cropImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 1:1 aspect ratio for profile picture
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>
                <div className="p-6 bg-black flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-white">
                        <span>Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1"
                        />
                    </div>
                    <button
                        onClick={handleCropConfirm}
                        disabled={uploading}
                        className="w-full py-4 bg-[#b8962e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#8f7422]">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crop className="w-5 h-5" />}
                        Crop & Upload
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}