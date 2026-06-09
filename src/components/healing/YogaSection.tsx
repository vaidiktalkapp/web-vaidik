'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, Activity, Info, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function YogaSection({ items }: { items: any[] }) {
  const [selectedPose, setSelectedPose] = useState<any>(null);

  const categories = Array.from(new Set(items.map(p => p.metadata?.category || 'General')));

  return (
    <div className="space-y-12">
      {/* Yoga Dashboard Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Ancient Flow</h2>
            <p className="text-gray-500 max-w-lg">
              Explore the sacred geometry of the body. Yoga is more than physical 
              exercise—it's a path to spiritual alignment.
            </p>
          </div>
          <div className="flex gap-4">
            <Stat icon={<Activity size={18} />} label="Daily Practice" value="20 Min" color="emerald" />
            <Stat icon={<Flower2 size={18} />} label="Poses" value="50+" color="indigo" />
          </div>
        </div>
        <div className="absolute -bottom-12 -right-12 opacity-[0.03]">
          <Flower2 size={240} />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pose List */}
        <div className="lg:col-span-2 space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 ml-4">
                {category} Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.filter(p => (p.metadata?.category || 'General') === category).map((pose, idx) => (
                  <motion.div
                    key={pose._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedPose(pose)}
                    className={`group p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPose?._id === pose._id 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl translate-x-2'
                      : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedPose?._id === pose._id ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className={`font-black text-lg ${selectedPose?._id === pose._id ? 'text-white' : 'text-gray-900'}`}>
                          {pose.title}
                        </h4>
                        <p className={`text-xs font-medium italic ${selectedPose?._id === pose._id ? 'text-emerald-100' : 'text-gray-400'}`}>
                          {pose.metadata?.sanskritName || ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className={`transition-transform ${selectedPose?._id === pose._id ? 'rotate-90' : 'group-hover:translate-x-1 opacity-20'}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Pose Detail / Placeholder */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedPose ? (
              <motion.div
                key={selectedPose._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="sticky top-24 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Flower2 size={24} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedPose.metadata?.difficulty === 'Beginner' ? 'bg-sky-50 text-sky-600' : 
                    selectedPose.metadata?.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600' : 
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {selectedPose.metadata?.difficulty || 'General'}
                  </span>
                </div>

                <h3 className="text-3xl font-black text-gray-900 mb-1 leading-tight">{selectedPose.title}</h3>
                <p className="text-emerald-600 font-bold serif mb-8">{selectedPose.metadata?.sanskritName}</p>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                       <Info size={14} /> Key Benefits
                    </h5>
                    <div className="space-y-3">
                      {(selectedPose.metadata?.benefits || []).map((benefit: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 text-sm font-medium text-gray-700">
                          <Sparkles size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/healing/guides/${selectedPose.slug}`}
                    className="block p-6 rounded-3xl bg-emerald-600 text-white shadow-lg relative overflow-hidden group/btn cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <div className="relative z-10 flex items-center justify-between font-black uppercase tracking-widest text-[11px]">
                      View Full Guide
                      <ArrowRight size={16} />
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 -translate-y-12 translate-x-12 blur-2xl group-hover/btn:scale-150 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="sticky top-24 bg-white/40 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-6">
                  <Sparkles size={24} />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">Select a Pose</h4>
                <p className="text-gray-500 text-sm font-medium">Discover the benefits and guidance for individual asanas.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className={`px-6 py-4 rounded-3xl border border-gray-100 flex items-center gap-4 ${colors[color]}`}>
      <div className="p-2 rounded-xl bg-white/50 shadow-sm">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5">{label}</span>
        <span className="text-lg font-black">{value}</span>
      </div>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
