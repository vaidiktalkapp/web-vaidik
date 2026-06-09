'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Compass, Globe, Navigation, Crown, Info, Copy, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

const AtlasMap = dynamic(
  () => import('../../../components/AtlasMap'),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#b8962e] animate-spin" /></div>
  }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface LocationResult {
  name: string;
  lat: number;
  lon: number;
}

export default function AtlasPage() {
    const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/astrology/atlas?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Location not found');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'lat' | 'lon' | 'full') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleMapClick = async (lat: number, lon: number) => {
    // Optimistically update fast
    setResult((prev) => prev ? { ...prev, lat, lon } : { name: "Analyzing location...", lat, lon });

    // Reverse geocode
    try {
      const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=47b4a8afc7734a12bd28b482d3dbff76`);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        let finalName = props.formatted || "Custom Pinned Location";
        if (props.city && props.country) {
          finalName = `${props.city}, ${props.state ? props.state + ', ' : ''}${props.country}`;
        }
        setResult({ name: finalName, lat, lon });
      } else {
        setResult({ name: "Custom Pinned Location", lat, lon });
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      setResult({ name: "Custom Pinned Location", lat, lon });
    }
  };

  if (!mounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  return (
    <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
      <div className="min-h-screen py-10 px-4 sm:px-6 relative bg-[#fdf6e3]" style={{ backgroundColor: '#fdf6e3' }} suppressHydrationWarning>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
          .atlas-wrap * { font-family: 'Source Sans 3', sans-serif; }
          .atlas-wrap h1, .atlas-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
          
          /* Geocoder Styles - Matches the "Divine" theme precisely */
          .atlas-geo, .atlas-geo > div, .atlas-geo .geoapify-container { width: 100% !important; }
          .atlas-geo .geoapify-autocomplete-input {
              color: #111827 !important;
              font-weight: 500;
              background: #fff !important;
              border: 1px solid #d6c89a !important;
              border-radius: 12px !important;
              padding: 12px 16px !important;
              font-size: 15px !important;
              font-family: 'Source Sans 3', sans-serif !important;
              width: 100% !important;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
          .atlas-geo .geoapify-autocomplete-input:focus {
              border-color: #b8962e !important;
              box-shadow: 0 0 0 3px rgba(184,150,46,0.1) !important;
              outline: none !important;
          }
          .atlas-geo .geoapify-autocomplete-items {
              background-color: #ffffff !important;
              border: 1px solid #d6c89a !important;
              border-radius: 12px !important;
              z-index: 1000 !important;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
              margin-top: 4px !important;
              overflow: hidden !important;
              position: absolute !important;
              width: 100% !important;
          }
          .atlas-geo .geoapify-autocomplete-item { padding: 10px 16px !important; }

          /* Offset Leaflet map controls down so they don't hide behind our custom Absolute overlay */
          .atlas-map-wrapper .leaflet-top {
             top: 75px !important;
          }
          .atlas-map-wrapper .leaflet-right {
             right: 10px !important;
          }
        ` }} />

        <div className="max-w-4xl mx-auto atlas-wrap">
          <AnimatePresence mode="wait">
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8">
              
              {/* Header Section - More Compact */}
              <div className="text-center relative pt-4 pb-2">
                <div className="flex items-center justify-center gap-2 text-[#b8962e] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
                  <Crown className="w-3 h-3" />
                  <span className="serif">{t("atlas.celestial_repository")}</span>
                  <Crown className="w-3 h-3" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight serif">
{t("atlas.atlas")}<span className="text-[#b8962e]">{t("atlas.search")}</span>
                </h1>
                <p className="text-gray-600 text-[16px] leading-relaxed max-w-lg mx-auto mb-4 font-medium">
{t("atlas.scientific_precision_for_latit")}
                </p>
              </div>

              {/* Search Card - Compact and Professional */}
              <div className="relative z-30 max-w-2xl mx-auto bg-white/70 backdrop-blur-sm border border-[#d6c89a] rounded-3xl p-6 shadow-lg shadow-[#b8962e]/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#d6c89a]/30 mb-1">
                    <Search className="w-4 h-4 text-[#b8962e]" />
                    <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{t("atlas.identify_coordinates")}</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 min-w-0 atlas-geo relative z-[100]">
                      <GeoapifyGeocoderAutocomplete
                        placeholder="Search city e.g. Mumbai"
                        value={query}
                        limit={10}
                        placeSelect={(value: any) => {
                          if (value && value.properties) {
                            setQuery(value.properties.formatted);
                            setResult({
                              name: value.properties.formatted,
                              lat: value.properties.lat,
                              lon: value.properties.lon
                            });
                          }
                        }} />
                      
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      onClick={() => handleSearch()}
                      className="md:w-36 py-3 bg-[#b8962e] text-white rounded-xl font-bold text-[14px] shadow-md shadow-[#b8962e]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
{t("atlas.find_city")}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Results Area - Professional Cards Matching Screenshot */}
              <div className="min-h-[300px] max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  {loading ?
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 gap-4">
                    
                      <div className="w-12 h-12 border-4 border-[#d6c89a]/20 border-t-[#b8962e] rounded-full animate-spin" />
                    </motion.div> :
                  result ?
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4">
                    
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        {/* LEFT COLUMN: Coordinates Details */}
                        <div className="flex flex-col gap-4">
                          {/* Latitude Card */}
                          <div className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-sm shadow-[#b8962e]/5 border border-[#d6c89a]/20 flex-1">
                            <div className="absolute top-0 right-0 p-6 text-[#b8962e]/10 pointer-events-none group-hover:scale-110 transition-transform">
                               <div className="w-16 h-16 rounded-full border border-[#b8962e]/20 flex items-center justify-center relative">
                                  <Compass className="w-8 h-8 opacity-40" />
                                  <div className="absolute top-2 right-2 text-[#b8962e]/60">
                                     <Copy className="w-4 h-4" />
                                  </div>
                               </div>
                            </div>
                            
                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="px-4 py-1.5 bg-[#f5e9c8]/50 text-[#7a6010] text-[10px] font-black uppercase tracking-[0.1em] rounded-full">{t("atlas.coordinate_system")}</span>
                                <button
                                onClick={() => copyToClipboard(result.lat.toString(), 'lat')}
                                className="text-[#b8962e]/60 hover:text-[#b8962e] transition-all p-1">
                                
                                  {copied === 'lat' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5" />}
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-[#111827] serif">{t("atlas.latitude")}</h2>
                                <p className="text-3xl md:text-4xl font-bold text-[#b8962e] tracking-tight">{result.lat.toFixed(6)}°</p>
                              </div>
                              
                              <p className="text-[11px] text-[#b8962e]/60 font-black uppercase tracking-[0.2em]">{t("atlas.n_s_orientation")}</p>
                            </div>
                          </div>

                          {/* Longitude Card */}
                          <div className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-sm shadow-[#b8962e]/5 border border-[#d6c89a]/20 flex-1">
                            <div className="absolute top-0 right-0 p-6 text-[#b8962e]/10 pointer-events-none group-hover:scale-110 transition-transform">
                               <div className="w-16 h-16 rounded-full border border-[#b8962e]/20 flex items-center justify-center relative">
                                  <Globe className="w-8 h-8 opacity-40" />
                                  <div className="absolute top-2 right-2 text-[#b8962e]/60">
                                     <Copy className="w-4 h-4" />
                                  </div>
                               </div>
                            </div>

                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="px-4 py-1.5 bg-[#f5e9c8]/50 text-[#7a6010] text-[10px] font-black uppercase tracking-[0.1em] rounded-full">{t("atlas.celestial_axis")}</span>
                                <button
                                onClick={() => copyToClipboard(result.lon.toString(), 'lon')}
                                className="text-[#b8962e]/60 hover:text-[#b8962e] transition-all p-1">
                                
                                  {copied === 'lon' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5" />}
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-[#111827] serif">{t("atlas.longitude")}</h2>
                                <p className="text-3xl md:text-4xl font-bold text-[#b8962e] tracking-tight">{result.lon.toFixed(6)}°</p>
                              </div>
                              
                              <p className="text-[11px] text-[#b8962e]/60 font-black uppercase tracking-[0.2em]">{t("atlas.e_w_orientation")}</p>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Map Display */}
                        <div className="bg-white rounded-3xl p-2 relative shadow-sm shadow-[#b8962e]/5 border border-[#d6c89a]/20 min-h-[350px] lg:min-h-full">
                           <div className="absolute top-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-md pointer-events-none border border-[#d6c89a]/20">
                              <p className="text-[11px] sm:text-xs font-bold text-gray-800 tracking-wide font-sans text-center">
{t("atlas.latitude")}<span className="text-[#b8962e] font-normal">{result.lat.toFixed(6)}</span>{t("atlas._longitude")}
                            <span className="text-[#b8962e] font-normal">{result.lon.toFixed(6)}</span> 
                                <span className="hidden sm:inline"> | <span className="text-[#b8962e] font-bold">{result.name.split(',')[0]}</span></span>
                              </p>
                           </div>
                           <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-[#f5e9c8]/20 relative isolate z-0 atlas-map-wrapper">
                             <AtlasMap center={[result.lat, result.lon]} onLocationSelect={handleMapClick} />
                           </div>
                        </div>

                      </div>

                      {/* Footer Result Card */}
                      <div className="bg-white rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-[#b8962e]/5 border border-[#d6c89a]/20">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-[#f5e9c8]/30 rounded-2xl flex items-center justify-center text-[#b8962e]">
                            <MapPin className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-[#b8962e] uppercase tracking-[0.2em] mb-1">{t("atlas.authenticated_location")}</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-[#111827] serif lowercase">{result.name.split(',')[0]}</h3>
                          </div>
                        </div>
                        
                        <button
                        onClick={() => copyToClipboard(`${result.lat}, ${result.lon}`, 'full')}
                        className="px-6 py-3.5 bg-[#111827] text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-3 text-sm">
                        
                          {copied === 'full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
{t("atlas.copy_global_pair")}
                      </button>
                      </div>
                    </motion.div> :
                  error ?
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10 text-center space-y-3">
                    
                      <Info className="w-8 h-8 text-red-400 mx-auto" />
                      <h3 className="text-xl font-bold text-gray-900 serif">{error}</h3>
                    </motion.div> :

                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 space-y-6 opacity-30 grayscale">
                    
                      <Globe className="w-16 h-16 text-gray-400 mx-auto" />
                      <p className="text-gray-500 font-medium serif text-xl">
{t("atlas.enter_a_location_to_retrieve_p")}
                    </p>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>

              {/* Minimalist Footnote */}
              <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em] pt-8 opacity-50">
{t("atlas.precision_mapping_system")}
              </div>

            </motion.div>

          </AnimatePresence>
        </div>
      </div>
    </GeoapifyContext>);

}