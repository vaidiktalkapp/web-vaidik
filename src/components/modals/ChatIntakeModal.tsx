'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Calendar, Clock, Shield, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/lib/AuthService';
import { Astrologer } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

interface ChatIntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    astrologer: Astrologer;
    onProceed: (profileId?: string) => void;
    mode?: 'chat' | 'call';
}

const ChatIntakeModal = ({ isOpen, onClose, astrologer, onProceed, mode = 'chat' }: ChatIntakeModalProps) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // 0: My Profile, 'new': Add New Profile, or profileId
    const [selectedProfileId, setSelectedProfileId] = useState<string>('0');
    const [isEditing, setIsEditing] = useState(false);

    const currentBalance = user?.wallet?.balance || 0;
    const astrologerRate = Number(mode === 'chat' ? (astrologer.pricing?.chat || 0) : (astrologer.pricing?.call || 0));
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
        relation: ''
    });

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedProfileId('0');
            resetIntakeData();
        }
    }, [isOpen]);

    const resetIntakeData = () => {
        setIsEditing(false);
        setIntakeData({
            name: '',
            gender: 'Male',
            date: '',
            time: '',
            place: '',
            lat: '',
            lon: '',
            relation: ''
        });
    }

    const handleProceed = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProfileId !== 'new' && !isEditing) {
            // Proceed with existing profile (0 or ID)
            const finalProfileId = selectedProfileId === '0' ? undefined : selectedProfileId;
            onProceed(finalProfileId);
            return;
        }

        // Add or Edit profile flow
        try {
            if (!intakeData.name) {
                toast.error('Please enter a name');
                return;
            }
            if (!intakeData.date) {
                toast.error('Please enter Date of Birth');
                return;
            }
            if (!intakeData.place) {
                toast.error('Please enter Place of Birth');
                return;
            }

            setLoading(true);

            // Format date if needed (YYYY-MM-DD -> DD-MM-YYYY if required, but storing standard ISO or YYYY-MM-DD is safer)
            // Backend schema expects string. Let's just pass intakeData directly.

            const profilePayload = {
                name: intakeData.name,
                gender: intakeData.gender,
                dateOfBirth: intakeData.date,
                timeOfBirth: intakeData.time,
                placeOfBirth: intakeData.place,
                lat: intakeData.lat,
                lon: intakeData.lon,
                relation: intakeData.relation
            };

            let response;
            if (isEditing) {
                response = await AuthService.updateSavedProfile(selectedProfileId, profilePayload);
            } else {
                response = await AuthService.addSavedProfile(profilePayload);
            }

            if (response.success && response.data) {
                if (refreshUser) await refreshUser();
                // Proceed with the created/updated profile's ID
                onProceed(isEditing ? selectedProfileId : response.data._id);
            } else {
                toast.error(response.message || 'Failed to save profile');
            }

        } catch (err: any) {
            console.error("Error saving profile", err);
            toast.error(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!astrologer || !user) return null;

    const savedProfiles = user.savedProfiles || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full max-w-xl my-auto rounded-lg shadow-xl border border-gray-200 z-10"
                    >
                        <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                            <h3 className="text-[22px] font-bold text-gray-900">Select Profile</h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed pr-8">Who are you asking about?</p>
                        </div>

                        <div className="p-6 pt-4">
                            <form onSubmit={handleProceed} className="space-y-4">

                                {/* Profile Selection */}
                                {!isEditing && (
                                    <div>
                                        <label className="text-[15px] font-semibold text-gray-900 block mb-1.5">
                                            Choose Profile
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <select
                                                    disabled={loading}
                                                    value={selectedProfileId}
                                                    onChange={e => {
                                                        setSelectedProfileId(e.target.value);
                                                        setIsEditing(false);
                                                        if (e.target.value === 'new') resetIntakeData();
                                                    }}
                                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-[15px] text-gray-900 font-medium focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] transition-all outline-none appearance-none"
                                                >
                                                    <option value="0">My Profile ({user?.name || 'User'})</option>
                                                    {user?.savedProfiles?.map((p: any) => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.name} {/* p.relation ? `(${p.relation})` : '' */}
                                                        </option>
                                                    ))}
                                                    <option value="new" className="text-[#ff7e1d] font-semibold">+ Add New Profile</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>

                                            {selectedProfileId !== '0' && selectedProfileId !== 'new' && (
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const profile = user?.savedProfiles?.find((p: any) => p._id === selectedProfileId);
                                                            if (profile) {
                                                                setIntakeData({
                                                                    name: profile.name || '',
                                                                    gender: profile.gender || 'Male',
                                                                    date: profile.dateOfBirth || '',
                                                                    time: profile.timeOfBirth || '',
                                                                    place: profile.placeOfBirth || '',
                                                                    lat: profile.lat || '',
                                                                    lon: profile.lon || '',
                                                                    relation: profile.relation || ''
                                                                });
                                                                setIsEditing(true);
                                                            }
                                                        }}
                                                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-md transition-colors"
                                                        title="Edit Profile"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (!window.confirm("Are you sure you want to delete this profile?")) return;
                                                            setLoading(true);
                                                            try {
                                                                const response = await AuthService.deleteSavedProfile(selectedProfileId);
                                                                if (response.success) {
                                                                    toast.success('Profile deleted');
                                                                    if (refreshUser) await refreshUser();
                                                                    setSelectedProfileId('0');
                                                                } else {
                                                                    toast.error(response.message || 'Failed to delete');
                                                                }
                                                            } catch (error) {
                                                                toast.error('An error occurred');
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-md transition-colors"
                                                        title="Delete Profile"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Add / Edit Profile Form */}
                                {(selectedProfileId === 'new' || isEditing) && (
                                    <div className={`space-y-4 ${isEditing ? '' : 'pt-4 border-t border-gray-100 mt-4'}`}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-700">
                                                {isEditing ? 'Edit Details' : 'Enter Details'}
                                            </h4>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setSelectedProfileId('0');
                                                    }}
                                                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                                                >
                                                    Cancel Edit
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-700 block mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={loading}
                                                    value={intakeData.name}
                                                    onChange={e => setIntakeData({ ...intakeData, name: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-700 block mb-1">Gender</label>
                                                <select
                                                    disabled={loading}
                                                    value={intakeData.gender}
                                                    onChange={e => setIntakeData({ ...intakeData, gender: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] outline-none"
                                                >
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-700 block mb-1">Date of Birth</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        required
                                                        disabled={loading}
                                                        value={intakeData.date}
                                                        onChange={e => setIntakeData({ ...intakeData, date: e.target.value })}
                                                        className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] outline-none"
                                                    />
                                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-700 block mb-1">Time of Birth</label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        required
                                                        disabled={loading}
                                                        value={intakeData.time}
                                                        onChange={e => setIntakeData({ ...intakeData, time: e.target.value })}
                                                        className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] outline-none"
                                                    />
                                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-700 block mb-1">Place of Birth</label>
                                            <div className="relative z-50">
                                                <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                                    <div className="w-full [&_.geoapify-autocomplete-input]:w-full [&_.geoapify-autocomplete-input]:!px-3 [&_.geoapify-autocomplete-input]:!pr-9 [&_.geoapify-autocomplete-input]:!py-2 [&_.geoapify-autocomplete-input]:!bg-gray-50 [&_.geoapify-autocomplete-input]:!border [&_.geoapify-autocomplete-input]:!border-gray-200 [&_.geoapify-autocomplete-input]:!rounded-md [&_.geoapify-autocomplete-input]:!text-sm [&_.geoapify-autocomplete-input]:!outline-none [&_.geoapify-autocomplete-input:focus]:!ring-1 [&_.geoapify-autocomplete-input:focus]:!ring-[#ff7e1d] [&_.geoapify-autocomplete-input:focus]:!border-[#ff7e1d] [&_.geoapify-close-button]:!hidden [&_.geoapify-autocomplete-items-panel]:!z-[9999]">
                                                        <GeoapifyGeocoderAutocomplete
                                                            placeholder="Search city..."
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
                                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-700 block mb-1">Relation</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Brother, Friend"
                                                required
                                                disabled={loading}
                                                value={intakeData.relation}
                                                onChange={e => setIntakeData({ ...intakeData, relation: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-[#ff7e1d] focus:border-[#ff7e1d] outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Insufficient Balance Warning */}
                                {isInsufficient && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <Shield className="w-4 h-4" />
                                            <div>
                                                <p className="text-sm font-semibold">Low Wallet Balance</p>
                                                <p className="text-xs text-red-600">Minimum ₹{minRequiredBalance} required to start.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <button
                                        type="submit"
                                        disabled={loading || isInsufficient}
                                        className={`w-full bg-[#ff7e1d] hover:bg-[#ea6a0c] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center text-base shadow-sm cursor-pointer ${(loading || isInsufficient) ? 'opacity-50 !cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </div>
                                        ) : (isInsufficient ? 'Recharge Required' : 'Proceed')}
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChatIntakeModal;
