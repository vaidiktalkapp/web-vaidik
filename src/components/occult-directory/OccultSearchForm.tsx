'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Sparkles, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OccultSearchFormProps {
  initialCity?: string;
  initialExpertise?: string;
  variant?: 'hero' | 'sidebar';
  expertiseOptions: string[];
  cityOptions: string[];
  onCityChange?: (city: string) => void;
}

const OccultSearchForm = ({ 
  initialCity = '', 
  initialExpertise = '', 
  variant = 'hero',
  expertiseOptions = [],
  cityOptions = [],
  onCityChange
}: OccultSearchFormProps) => {
  const router = useRouter();
  const [place, setPlace] = useState(initialCity);
  const [expertise, setExpertise] = useState(initialExpertise);

  // Sync state with incoming props (e.g. from clicking popular cities grid)
  useEffect(() => {
    setPlace(initialCity);
  }, [initialCity]);

  // Sync state with expertise if provided
  useEffect(() => {
    setExpertise(initialExpertise);
  }, [initialExpertise]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!place && !expertise) {
      toast.error('Please select a city or expertise area');
      return;
    }

    const params = new URLSearchParams();
    if (place) params.set('city', place);
    if (expertise) params.set('expertise', expertise);

    router.push(`/occult-directory/results?${params.toString()}`);
  };

  const handleCitySelect = (val: string) => {
    setPlace(val);
    if (onCityChange) onCityChange(val);
  };

  if (variant === 'sidebar') {
    return (
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#b8962e]" />
            Location
          </label>
          <div className="relative">
            <select
                value={place}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#d6c89a] focus:border-[#b8962e] outline-none transition-all font-semibold bg-white text-gray-900 text-xs appearance-none cursor-pointer"
            >
                <option value="">All Cities</option>
                {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#b8962e]" />
            Expertise
          </label>
          <div className="relative">
            <select
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#d6c89a] focus:border-[#b8962e] outline-none transition-all font-semibold bg-white text-gray-900 text-xs appearance-none cursor-pointer"
            >
                <option value="">All Categories</option>
                {expertiseOptions.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg, #b8962e 0%, #a07c1e 100%)', boxShadow: '0 4px 12px rgba(184,150,46,0.15)' }}
        >
          <Search size={14} />
          Find Experts
        </button>
      </form>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* City Select */}
        <div className="flex-[1.2] relative">
          <div className="relative group">
            <select
              value={place}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="w-full bg-white border border-[#d6c89a] px-4 py-[13px] rounded-lg focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/10 font-bold text-gray-800 appearance-none cursor-pointer text-sm"
            >
              <option value="">Search By City...</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Expertise Select */}
        <div className="flex-1">
          <div className="relative group">
            <select
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full bg-white border border-[#d6c89a] px-4 py-[13px] rounded-lg focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/10 font-bold text-gray-800 appearance-none cursor-pointer text-sm"
            >
              <option value="">Select Expertise Area</option>
              {expertiseOptions.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="md:w-auto text-white font-bold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-95 text-sm uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg, #b8962e 0%, #a07c1e 100%)', boxShadow: '0 8px 16px rgba(184,150,46,0.2)' }}
        >
          <Search className="w-4 h-4" />
          Search Now
        </button>
      </form>
    </div>
  );
};

export default OccultSearchForm;
