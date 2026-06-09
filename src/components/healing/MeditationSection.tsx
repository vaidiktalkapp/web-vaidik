'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function MeditationSection({ items }: { items: any[] }) {
  return (
    <div className="space-y-12">
      {/* Featured Breathing Exercise */}
      <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles size={120} />
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Active Breathing</h2>
            <p className="text-gray-500 mb-8 max-w-lg">
              Follow the visual guide to balance your breath. Proper focus on breathing 
              can instantly lower cortisol levels and calm the nervous system.
            </p>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Inhale</span>
                <span className="text-2xl font-black text-gray-800">4 Seconds</span>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">Hold</span>
                <span className="text-2xl font-black text-gray-800">4 Seconds</span>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-rose-400 mb-1">Exhale</span>
                <span className="text-2xl font-black text-gray-800">4 Seconds</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <BreathingCircle />
          </div>
        </div>
      </section>

      {/* Meditation Sessions Grid */}
      <section>
        <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Curated Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((session, idx) => {
            const m = session.metadata || {};
            return (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] p-6 border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className={`w-full h-40 rounded-2xl ${m.color || 'bg-indigo-500'} mb-6 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link 
                      href={`/healing/guides/${session.slug}`}
                      className="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                    >
                      <Play fill="currentColor" size={24} className="ml-1" />
                    </Link>
                  </div>
                  <Sparkles size={48} className="text-white/20" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 px-3 py-1 rounded-full bg-indigo-50">
                    {m.focus || 'Wellness'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <Clock size={14} />
                    {m.duration || '5-10 min'}
                  </span>
                </div>

                <h4 className="text-xl font-black text-gray-900 mb-2 truncate">{session.title}</h4>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">
                  "{session.shortDescription || 'No description available.'}"
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="space-y-1">
                        {m.benefits?.slice(0, 2).map((benefit: string, bIdx: number) => (
                            <div key={bIdx} className="flex items-center gap-2 text-[10px] font-semibold text-gray-600">
                                <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                {benefit}
                            </div>
                        ))}
                    </div>
                    <Link 
                        href={`/healing/guides/${session.slug}`}
                        className="p-2.5 rounded-xl bg-gray-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                        <BookOpen size={16} />
                    </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BreathingCircle() {
  const [phase, setPhase] = useState('Inhale');

  useEffect(() => {
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setPhase(phases[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Pulse */}
      <motion.div
        animate={{ 
          scale: phase === 'Inhale' || phase === 'Hold' ? 1.4 : 0.8,
          opacity: phase === 'Inhale' ? 0.4 : 0.1
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute inset-0 bg-indigo-200/50 rounded-full blur-3xl shadow-2xl"
      />
      
      {/* Main Circle */}
      <motion.div
        animate={{ 
          scale: phase === 'Inhale' || phase === 'Hold' ? 1.3 : 0.9,
          borderColor: phase === 'Inhale' ? '#6366f1' : phase === 'Exhale' ? '#f43f5e' : '#10b981'
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-48 h-48 rounded-full border-2 border-dashed flex flex-col items-center justify-center bg-white shadow-2xl z-10"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Cycle Focus</span>
        <motion.span 
          key={phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-black tracking-tighter ${
            phase === 'Inhale' ? 'text-indigo-600' : phase === 'Exhale' ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {phase}
        </motion.span>
      </motion.div>

      {/* Satellite Sparkles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <Sparkles size={20} className="text-yellow-400" />
        </div>
      </motion.div>
    </div>
  );
}
