'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, MapPin, Calendar, Clock, Sparkles, Shield, Globe, User, Briefcase, Heart, Users, Target } from 'lucide-react';
import { AiAstrologer } from '@/lib/aiAstrologerService';
import aiAstrologerService from '@/lib/aiAstrologerService';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/lib/AuthService';
import { toast } from 'react-hot-toast';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

interface AiChatIntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    astrologer: AiAstrologer;
    mode?: 'chat' | 'call';
}

const AiChatIntakeModal = ({ isOpen, onClose, astrologer, mode = 'chat' }: AiChatIntakeModalProps) => {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const currentBalance = user?.wallet?.balance || 0;
    const astrologerRate = Number(astrologer.chatRate || astrologer.rate || 0);
    const minRequiredBalance = astrologerRate * 5;
    const isInsufficient = astrologerRate > 0 && currentBalance < minRequiredBalance;

    const [intakeData, setIntakeData] = useState({
        name: '',
        gender: 'Male',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        maritalStatus: 'Single',
        occupation: 'Employee'
    });

    useEffect(() => {
        // Only initialize form if it's not already loading
        if (isOpen && user && !loading) {
            const u = user as any;

            let pickerDate = '';
            if (u.dateOfBirth) {
                // Handle ISO strings (e.g. 2000-11-11T00:00:00.000Z) by taking only the date part
                const datePart = u.dateOfBirth.split('T')[0];
                
                if (datePart.includes('-')) {
                    const parts = datePart.split('-');
                    if (parts[0].length === 4) {
                        // Already YYYY-MM-DD
                        pickerDate = datePart;
                    } else if (parts[0].length <= 2) {
                        // Assuming DD-MM-YYYY
                        const [d, m, y] = parts;
                        pickerDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                } else {
                    const date = new Date(u.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        pickerDate = date.toISOString().split('T')[0];
                    }
                }
            }

            setIntakeData(prev => ({
                ...prev,
                name: u.name || prev.name || '',
                gender: u.gender ? (u.gender.charAt(0).toUpperCase() + u.gender.slice(1)) : (prev.gender || 'Male'),
                date: pickerDate || prev.date || '',
                time: u.timeOfBirth || prev.time || '',
                place: u.placeOfBirth || prev.place || '',
                maritalStatus: u.maritalStatus || prev.maritalStatus || 'Single',
                occupation: u.occupation || prev.occupation || 'Employee'
            }));
        }
    }, [isOpen, user, astrologer, loading]);

    const handleIntakeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!intakeData.date) {
                toast.error('Please enter your Date of Birth');
                return;
            }
            if (!intakeData.place) {
                toast.error('Please enter your Place of Birth');
                return;
            }

            setLoading(true);

            const [y, m, d] = intakeData.date.split('-');
            const formattedDate = `${d}-${m}-${y}`;

            try {
                const profilePayload = {
                    gender: intakeData.gender.toLowerCase(),
                    dateOfBirth: intakeData.date,
                    timeOfBirth: intakeData.time,
                    placeOfBirth: intakeData.place,
                };
                await AuthService.updateBirthDetails(profilePayload);
                if (refreshUser) refreshUser();
            } catch (profileErr: any) {
                console.warn('Profile update failed:', profileErr.message);
            }

            const detailsMessage = `Below are my consultation details:
Name: ${intakeData.name}
Gender: ${intakeData.gender}
Date: ${formattedDate}
Time: ${intakeData.time}
Place: ${intakeData.place}
Marital Status: ${intakeData.maritalStatus}
Occupation: ${intakeData.occupation}`;

            if (mode === 'call') {
                const response = await aiAstrologerService.startAiVoiceCall(
                    astrologer._id,
                    user?._id || '',
                    'English',
                    {
                        name: intakeData.name,
                        dateOfBirth: formattedDate,
                        timeOfBirth: intakeData.time,
                        placeOfBirth: intakeData.place,
                        query: detailsMessage
                    }
                );

                if (response.success && response.sessionId) {
                    toast.success('Connecting to voice line...');
                    const encodedImage = encodeURIComponent(astrologer?.profileImage || '');
                    router.push(`/call/${response.sessionId}?type=audio&name=${encodeURIComponent(astrologer?.name || 'AI')}&rate=${astrologer?.voiceRate || astrologer?.chatRate || 0}&astrologerId=${astrologer._id}&orderId=${response.orderId}&image=${encodedImage}`);
                    onClose();
                } else {
                    toast.error(response.message || 'Failed to initiate call');
                }
                return;
            }

            const order = await aiAstrologerService.startAiChatOrder(
                astrologer._id,
                'chat',
                {
                    name: intakeData.name,
                    dateOfBirth: formattedDate,
                    timeOfBirth: intakeData.time,
                    placeOfBirth: intakeData.place,
                    lat: intakeData.lat,
                    lon: intakeData.lon,
                    language: 'English'
                }
            );

            if (!order || !order._id) {
                toast.error('Failed to create chat session. Please try again.');
                return;
            }

            const orderId = order._id;
            if (!orderId || orderId === 'undefined' || orderId === 'null') {
                toast.error('Invalid session ID. Please try again.');
                return;
            }

            localStorage.setItem(`ai-chat-intake-${orderId}`, JSON.stringify({
                ...intakeData,
                date: formattedDate,
                query: ''
            }));

            toast.success('Starting your consultation...');
            router.push(`/ai-chat/${orderId}`);
            onClose();
        } catch (err: any) {
            console.error("Error starting consultation", err);
            const rawMsg = err.response?.data?.message || err.message || 'Failed to start consultation. Please try again.';
            const errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
            toast.error(errorMessage);

            if (errorMessage.toLowerCase().includes('insufficient balance')) {
                router.push('/wallet/recharge');
            }
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url?: string, name: string = 'AI') => {
        if (url && url.trim() !== '') return url;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6B7280&color=fff&bold=true`;
    };

    if (!astrologer) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 flex items-start justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full max-w-xl my-auto rounded-lg shadow-xl border border-gray-200 z-10"
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-2">
                            <h3 className="text-[22px] font-bold text-gray-900">Share Birth Details</h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed pr-8">To share it with your astrologer, to save time on consultation</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 pt-4">
                            <form onSubmit={handleIntakeSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                disabled={loading}
                                                value={intakeData.name}
                                                onChange={e => setIntakeData({ ...intakeData, name: e.target.value })}
                                               className="w-full px-3 py-2.5 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Gender
                                        </label>
                                        <div className="relative">
                                            <select
                                                disabled={loading}
                                                value={intakeData.gender}
                                                onChange={e => setIntakeData({ ...intakeData, gender: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none appearance-none"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Place of Birth */}
                                <div>
                                    <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                        Place of Birth
                                    </label>
                                    <div className="relative z-50">
                                        <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                           <div className="w-full [&_.geoapify-autocomplete-input]:w-full [&_.geoapify-autocomplete-input]:!px-3 [&_.geoapify-autocomplete-input]:!pr-9 [&_.geoapify-autocomplete-input]:!py-2.5 [&_.geoapify-autocomplete-input]:!bg-white [&_.geoapify-autocomplete-input]:!border [&_.geoapify-autocomplete-input]:!border-[#ff7e1d] [&_.geoapify-autocomplete-input]:!rounded-md [&_.geoapify-autocomplete-input]:!text-[15px] [&_.geoapify-autocomplete-input]:!text-[#ff7e1d] [&_.geoapify-autocomplete-input]:!font-semibold [&_.geoapify-autocomplete-input]:!outline-none [&_.geoapify-autocomplete-input]:!shadow-none [&_.geoapify-autocomplete-input:focus]:!ring-1 [&_.geoapify-autocomplete-input:focus]:!ring-[#ff7e1d] [&_.geoapify-close-button]:!hidden [&_.geoapify-autocomplete-items-panel]:!z-[9999]">
                                                <GeoapifyGeocoderAutocomplete
                                                    placeholder=""
                                                    value={intakeData.place}
                                                    placeSelect={(value: any) => {
                                                        if (value && value.properties) {
                                                            setIntakeData({
                                                                ...intakeData,
                                                                place: value.properties.formatted,
                                                                lat: value.properties.lat,
                                                                lon: value.properties.lon
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </GeoapifyContext>
                                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Date & Time - Side by Side */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Date of Birth
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                required
                                                disabled={loading}
                                                value={intakeData.date}
                                                onChange={e => setIntakeData({ ...intakeData, date: e.target.value })}
                                               className="w-full px-3 py-2.5 pr-9 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Time of Birth
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                required
                                                disabled={loading}
                                                value={intakeData.time}
                                                onChange={e => setIntakeData({ ...intakeData, time: e.target.value })}
                                               className="w-full px-3 py-2.5 pr-9 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none"
                                            />
                                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Marital Status & Occupation - Side by Side */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Marital Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                disabled={loading}
                                                value={intakeData.maritalStatus}
                                                onChange={e => setIntakeData({ ...intakeData, maritalStatus: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none appearance-none"
                                            >
                                                <option>Single</option>
                                                <option>Married</option>
                                                <option>Divorced</option>
                                                <option>Widowed</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Occupation
                                        </label>
                                        <div className="relative">
                                            <select
                                                disabled={loading}
                                                value={intakeData.occupation}
                                                onChange={e => setIntakeData({ ...intakeData, occupation: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none appearance-none"
                                            >
                                                <option>Employee</option>
                                                <option>Business</option>
                                                <option>Student</option>
                                                <option>Unemployed</option>
                                                <option>Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Language selection hidden as per requirement - AI now defaults to Hinglish */}
                                {/* 
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Preferred Language
                                        </label>
                                        <div className="relative">
                                            <select
                                                disabled={loading}
                                                value={intakeData.language}
                                                onChange={e => setIntakeData({ ...intakeData, language: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ff7e1d] rounded-md text-[15px] text-[#ff7e1d] font-semibold focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none appearance-none"
                                            >
                                                {astrologer.languages && astrologer.languages.length > 0 ? (
                                                    astrologer.languages.map(lang => (
                                                        <option key={lang} value={lang}>{lang}</option>
                                                    ))
                                                ) : (
                                                    ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'].map(lang => (
                                                        <option key={lang} value={lang}>{lang}</option>
                                                    ))
                                                )}
                                            </select>
                                            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7e1d] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                */}

                                {/* Insufficient Balance Warning */}
                                {isInsufficient && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <Shield className="w-4 h-4" />
                                            <div>
                                                <p className="text-sm font-semibold">Low Wallet Balance</p>
                                                <p className="text-xs text-red-600">Minimum ₹{minRequiredBalance} required to start.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/wallet/recharge')}
                                            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1.5 rounded-md transition-colors"
                                        >
                                            Recharge Now
                                        </button>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <button
                                        type="submit"
                                        disabled={loading || isInsufficient}
                                        className={`w-full bg-[#ff7e1d] hover:bg-[#ea6a0c] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center text-base shadow-sm cursor-pointer ${
                                            (loading || isInsufficient) ? 'opacity-50 !cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Connecting...
                                            </div>
                                        ) : 'Proceed'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="w-full bg-[#404040] hover:bg-[#262626] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center text-base shadow-sm cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Removed the large white loading overlay in favor of inline button spinner */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AiChatIntakeModal;