'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  ChevronRight,
  Search,
  Users,
  Star,
  Award,
  Crown,
  Shield,
  Heart,
  Loader } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OccultSearchForm from '@/components/occult-directory/OccultSearchForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface DirectorySettings {
  cities: string[];
  popularCities: string[];
  expertise: string[];
  languages: string[];
}

const OccultDirectoryLandingPage = () => {
    const { t } = useTranslation();

  const [settings, setSettings] = useState<DirectorySettings>({
    cities: [],
    popularCities: [],
    expertise: [],
    languages: []
  });

  const [selectedCity, setSelectedCity] = useState('');
  const [availableExpertise, setAvailableExpertise] = useState<string[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/occult-directory/settings`);
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
          setAvailableExpertise(data.data.expertise);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    if (!city) {
      setAvailableExpertise(settings.expertise);
      return;
    }

    setIsFiltering(true);
    try {
      const response = await fetch(`${API_BASE}/occult-directory/expertise/${encodeURIComponent(city)}`);
      const data = await response.json();
      if (data.success) {
        setAvailableExpertise(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch city expertise:', err);
      // Fallback to all expertise if filter fails
      setAvailableExpertise(settings.expertise);
    } finally {
      setIsFiltering(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        .vaidik-wrap * { font-family: 'Source Sans 3', sans-serif; }
        .vaidik-wrap h1, .vaidik-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
        
        .gold-divider {
            display: flex; align-items: center; gap: 12px;
            color: #b8962e;
        }
        .gold-divider::before, .gold-divider::after {
            content: ''; flex: 1; height: 1px;
            background: linear-gradient(to right, transparent, #d6c89a);
        }
        .gold-divider::after { background: linear-gradient(to left, transparent, #d6c89a); }
        
        .text-grid-container {
            background: #fffdf5;
            border: 1px solid #e8d99a;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(184,150,46,0.05);
        }
        .text-grid-header {
            background: #fff0bc;
            color: #7A1F01;
            padding: 12px 20px;
            font-weight: 700;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #e8d99a;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .text-grid-content {
            padding: 16px 24px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px 40px;
        }

        .text-link {
            font-size: 14px;
            font-weight: 600;
            color: #4b3f2a;
            text-decoration: none;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            width: fit-content;
            white-space: nowrap;
        }
        .text-link:hover { 
            color: #8B2303; 
            background: #fffdcc;
            transform: scale(1.1);
        }
      ` }} />

      <div className="vaidik-wrap">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-8 overflow-hidden text-center border-b border-[#e8d99a] bg-gradient-to-b from-[#fdf6e3] to-[#fffde6]">
            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <div className="flex items-center justify-center gap-2 mb-4 text-[#b8962e]">
                        <Crown className="w-5 h-5" />
                        <span className="serif text-sm font-bold tracking-[0.2em] uppercase">{t("occult_directory.vedic_wisdom_directory")}</span>
                    </div>

                    <h1 className="serif font-semibold text-gray-900 leading-tight mb-8" style={{ fontSize: 'clamp(28px, 4.5vw, 54px)' }}>
{t("occult_directory.find_top_rated")}<span className="text-[#b8962e]">{t("occult_directory.certified_experts")}</span> <br />
{t("occult_directory.accross_all_prime_cities")}
              </h1>

                    <div className="max-w-3xl mx-auto">
                        <OccultSearchForm
                  expertiseOptions={settings.expertise}
                  cityOptions={settings.cities}
                  initialCity={selectedCity}
                  onCityChange={handleCityChange} />
                
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Dynamic Expertise Section */}
        <section className="py-16 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-grid-container">
                    <div className="text-grid-header">
{t("occult_directory.browse_experts_by_skills")}{selectedCity ? `in ${selectedCity}` : ''}
                    </div>
                    <div className="text-grid-content min-h-[100px]">
                        <AnimatePresence mode="wait">
                          {isFiltering ?
                  <div className="col-span-full flex items-center justify-center py-8">
                                <Loader className="w-6 h-6 animate-spin text-[#b8962e]" />
                            </div> :
                  availableExpertise && availableExpertise.length > 0 ?
                  availableExpertise.map((exp) =>
                  <Link
                    key={exp}
                    href={`/occult-directory/results?city=${encodeURIComponent(selectedCity)}&expertise=${encodeURIComponent(exp)}`}
                    className="text-link">
                    
                                  {exp}
                              </Link>
                  ) :

                  <div className="col-span-full text-center py-8">
                                <p className="text-sm text-gray-400">{t("occult_directory.no_expertise_data_found")}{selectedCity ? ` for ${selectedCity}` : ''}.</p>
                            </div>
                  }
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>

        {/* Popular Cities Section (Redesigned as Grid) */}
        <section className="py-16 px-4 sm:px-8 bg-white/30">
            <div className="max-w-7xl mx-auto">
                <div className="text-grid-container">
                    <div className="text-grid-header" style={{ background: '#7A1F01', color: '#fff0bc', borderBottom: '1px solid #922501' }}>
{t("occult_directory.browse_experts_in_popular_citi")}
              </div>
                    <div className="text-grid-content min-h-[100px]">
                      {settings.popularCities && settings.popularCities.length > 0 ?
                settings.popularCities.map((city) =>
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className="text-link">
                  
                              {city}
                          </button>
                ) :

                <div className="col-span-full text-center py-8">
                            <p className="text-sm text-gray-400">{t("occult_directory.no_popular_cities_added_yet_co")}</p>
                        </div>
                }
                    </div>
                </div>
            </div>
        </section>

        {/* Join as Expert CTA */}
        <section className="py-16 px-4" style={{ backgroundColor: '#fdf6e3' }}>
           <div className="max-w-4xl mx-auto text-center border-2 border-dashed border-[#d6c89a] p-10 rounded-2xl">
                <h3 className="serif text-3xl font-semibold mb-4 text-[#1a1209]">{t("occult_directory.are_you_an_expert")}</h3>
                <p className="text-[#6b5535] text-lg mb-8 max-w-xl mx-auto font-medium">{t("occult_directory.join_our_verified_network_of_v")}</p>
                <Link
              href="/register-astrologer"
              className="inline-block px-12 py-4 text-white font-bold rounded-xl transition-all shadow-xl active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1a1209 0%, #332b1d 100%)' }}>
{t("occult_directory.apply_for_verification")}

            </Link>
           </div>
        </section>
      </div>
    </div>);

};

export default OccultDirectoryLandingPage;