'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Sparkles, X, Info, Layers, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CrystalHealing({ items }: { items: any[] }) {
  const [selectedCrystal, setSelectedCrystal] = useState<any>(null);

  return (
    <div className="space-y-12">
      {/* Crystal Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex-1">
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Vibrational Wisdom</h2>
            <p className="text-gray-500 max-w-lg mb-8">
              Every stone carries a unique frequency. Use the energy of the Earth to 
              amplify your intentions, protect your aura, and balance your chakras.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-50 text-violet-600 text-[11px] font-black uppercase tracking-widest border border-violet-100">
                <Gem size={14} /> Sacred Geometry
              </span>
              <span className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-50 text-sky-600 text-[11px] font-black uppercase tracking-widest border border-sky-100">
                <Layers size={14} /> Aura Protection
              </span>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-[-40px] inset-y-[-40px] border-2 border-dashed border-violet-200/50 rounded-full"
              />
              <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-violet-500 to-indigo-600 p-1 flex items-center justify-center shadow-2xl rotate-12 group hover:rotate-0 transition-transform cursor-pointer">
                <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center">
                  <Gem size={64} className="text-violet-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crystal Library Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((crystal, idx) => {
          const m = crystal.metadata || {};
          return (
            <motion.div
              key={crystal._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedCrystal(crystal)}
              className="group bg-white rounded-[2rem] p-6 border border-gray-100 hover:border-violet-200 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={48} />
              </div>
              
              <div className="w-full h-32 rounded-2xl bg-gray-50 mb-6 flex items-center justify-center group-hover:bg-violet-50 transition-colors">
                <Gem size={48} className={`text-violet-200 group-hover:text-violet-500 transition-colors`} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{m.color || 'Prismatic'}</span>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">{crystal.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-8 font-medium">
                {crystal.shortDescription || 'No description available.'}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCrystal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCrystal(null)}
              className="absolute inset-0 bg-violet-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border border-white/20"
            >
              <div className="h-48 bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center relative">
                <div className="absolute top-6 right-6">
                    <button 
                        onClick={() => setSelectedCrystal(null)}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <Gem size={80} className="text-white/20 absolute -bottom-4 -left-4 rotate-12" />
                <Gem size={64} className="text-white drop-shadow-2xl" />
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100">
                      {selectedCrystal.metadata?.element || 'Aether'} Element
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Zap size={14} className="text-amber-400" />
                      Very High Vibration
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{selectedCrystal.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    "{selectedCrystal.shortDescription || 'Experience the resonance of this sacred geometry.'}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Chakra</h5>
                    <p className="text-sm font-bold text-gray-900">{selectedCrystal.metadata?.chakra || 'Crown'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Color</h5>
                    <p className="text-sm font-bold text-gray-900">{selectedCrystal.metadata?.color || 'Prismatic'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Info size={14} /> Sacred Properties
                  </h5>
                  <div className="space-y-3">
                    {(selectedCrystal.metadata?.benefits || []).map((benefit: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 text-xs font-bold text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <Link 
                  href={`/healing/guides/${selectedCrystal.slug}`}
                  className="block w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-violet-600 transition-all shadow-xl active:scale-95"
                >
                  Return to Library
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100">
      <div className="text-violet-500 mb-2">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className="text-[13px] font-black text-gray-900">{value}</p>
    </div>
  );
}
