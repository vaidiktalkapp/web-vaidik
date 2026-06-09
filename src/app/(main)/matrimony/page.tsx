'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Users, Shield, ArrowRight, Star,
  CheckCircle2, Loader2, Target, Calendar, MapPin,
  Briefcase, Image as ImageIcon, Camera, Search, X, Check,
  Settings, Clock, ChevronRight, Zap, GraduationCap, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { matrimonyService } from '@/lib/matrimonyService';
import { historyApiService } from '@/lib/historyApiService';
import LoginModal from '@/components/layout/LoginModal';

export default function MatrimonyPage() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'discover' | 'requests'>('discover');
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      if (historyApiService.isAuthenticated()) {
        const profileData = await matrimonyService.getProfile();
        setProfile(profileData);
        const incoming = await matrimonyService.getInterests('incoming');
        setIncomingRequests(incoming);
        if (profileData && profileData.isActive) {
          if (activeTab === 'discover') {
            const suggs = await matrimonyService.getSuggestions(20, locationFilter);
            setSuggestions(suggs);
          } else {
            const outgoing = await matrimonyService.getInterests('outgoing');
            setOutgoingRequests(outgoing);
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [locationFilter, activeTab]);

  const pendingCount = incomingRequests.filter((r) => r.status === 'pending').length;
  const unreadMessageCount = [
    ...incomingRequests.filter(r => r.status === 'accepted'),
    ...outgoingRequests.filter(r => r.status === 'accepted')
  ].reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  const totalNotificationCount = pendingCount + unreadMessageCount;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationFilter(searchLocation);
  };

  const handleInterestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    const res = await matrimonyService.handleInterestResponse(requestId, status);
    if (res.success) {
      const incoming = await matrimonyService.getInterests('incoming');
      setIncomingRequests(incoming);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: '#fdf6e3' }}>
        <div className="w-12 h-12 border-4 border-[#b8962e]/20 border-t-[#b8962e] rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'Georgia, serif', fontStyle: 'normal' }}>
          Scanning the cosmos for your perfect union…
        </p>
      </div>
    );
  }

  // ── GUEST / NO PROFILE VIEW ──────────────────────────────────────────────
  if (!profile || !profile.isActive) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3', fontFamily: "'Source Sans 3', sans-serif" }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap');
          .mat-serif { font-family: 'Inter', sans-serif; }
          .mat-body { font-family: 'Inter', sans-serif; }
          .mat-divider { width: 40px; height: 2px; background: linear-gradient(90deg, #b8962e, transparent); }
          .mat-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; background: rgba(184,150,46,0.1); border: 1px solid rgba(184,150,46,0.25); color: #b8962e; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
          .mat-card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .mat-card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
          .mat-btn-primary { background: #7A1F01; color: white; padding: 13px 32px; border-radius: 14px; font-weight: 600; font-size: 15px; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; cursor: pointer; border: none; }
          .mat-btn-primary:hover { background: #5a1701; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(122,31,1,0.3); }
          .mat-btn-secondary { background: white; color: #7A1F01; padding: 13px 28px; border-radius: 14px; font-weight: 600; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; cursor: pointer; border: 1.5px solid #d6c89a; }
          .mat-btn-secondary:hover { background: #fdf0d5; }
        `}</style>

        {/* ── HERO ── */}
        <div style={{ borderBottom: '1px solid #e8dfc4', background: 'linear-gradient(160deg, #fff9ee 0%, #fdf6e3 60%, #faefd1 100%)' }}>
          <div className="max-w-5xl mx-auto px-6 py-20 mat-body">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left Text */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mat-badge mb-6">
                  <Sparkles style={{ width: 12, height: 12 }} />
                  Vaidik Matrimony
                </div>

                <h1 className="text-gray-900 mb-5" style={{ fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
                  Find a partner<br />
                  <span style={{ color: '#b8962e' }}>chosen by the stars</span>
                </h1>

                <div className="mat-divider mb-5" />

                <p className="text-gray-500 mb-8" style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 480, fontWeight: 300 }}>
                  Vaidik Matrimony unites ancient Vedic wisdom with modern search — pairing you through Guna compatibility, planetary alignment, and sincere intent. Not swipes. Not algorithms. Destiny.
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    className="mat-btn-primary"
                    onClick={() => {
                      if (!historyApiService.isAuthenticated()) {
                        setShowAuthModal(true);
                      } else if (profile) {
                        // Smart Redirect: If profile exists, just try to set it active and stay on this page
                        matrimonyService.updateProfile({ ...profile, isActive: true }).then(() => {
                           window.location.reload();
                        });
                      } else {
                        window.location.href = '/matrimony/setup';
                      }
                    }}
                  >
                    {profile ? 'Enter Matrimony' : 'Begin Your Journey'} <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                  <button className="mat-btn-secondary">
                    <Shield style={{ width: 16, height: 16, color: '#b8962e' }} />
                    Verified & Secure
                  </button>
                </div>

                {/* Trust strip */}
                <div style={{ display: 'flex', gap: 24, marginTop: 36, paddingTop: 28, borderTop: '1px solid #e8dfc4' }}>
                  {[
                    { val: '10,000+', label: 'Verified Profiles' },
                    { val: '36 Gunas', label: 'Compatibility Score' },
                    { val: '100%', label: 'Privacy Protected' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="mat-serif" style={{ fontSize: 20, fontWeight: 700, color: '#7A1F01' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: '#9b8860', fontWeight: 500, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Image */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                style={{ position: 'relative' }}
              >
                <div style={{ borderRadius: 28, overflow: 'hidden', border: '2px solid #e8dfc4', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600"
                    alt="Divine Union"
                    style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22, color: 'white' }}>
                    <div className="mat-serif" style={{ fontSize: 24, fontWeight: 700, fontStyle: 'normal' }}>32 / 36 Points</div>
                    <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Divine Guna Matching</div>
                  </div>
                </div>
                {/* Floating pill */}
                <div style={{ position: 'absolute', top: -14, right: -14, background: 'white', border: '1.5px solid #e8dfc4', borderRadius: 16, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                  <Star style={{ width: 14, height: 14, fill: '#b8962e', color: '#b8962e' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>Vedic Certified</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="max-w-5xl mx-auto px-6 py-16 mat-body">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="mat-badge" style={{ margin: '0 auto 14px' }}>How It Works</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>
              Not just a matrimony portal — a{' '}
              <span style={{ color: '#b8962e' }}>divine compass</span>
            </h2>
            <p style={{ color: '#9b8860', fontSize: 15, marginTop: 10, maxWidth: 520, margin: '10px auto 0', fontWeight: 300, lineHeight: 1.7 }}>
              Every match is calculated, not random. Planetary positions, birth charts, and Guna analysis guide every pairing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              {
                icon: <Target style={{ width: 22, height: 22, color: '#b8962e' }} />,
                title: 'Astrological Precision',
                desc: 'Suggestions based on your Janam Kundali, Nakshatra, and planetary alignments — not just photos and preferences.',
              },
              {
                icon: <Shield style={{ width: 22, height: 22, color: '#b8962e' }} />,
                title: 'Verified Profiles',
                desc: 'Every profile is manually reviewed so you only connect with sincere, marriage-ready individuals.',
              },
              {
                icon: <Users style={{ width: 22, height: 22, color: '#b8962e' }} />,
                title: 'Deeper Connections',
                desc: 'Understand your partner strengths, challenges, and life path before the first conversation.',
              },
              {
                icon: <Heart style={{ width: 22, height: 22, color: '#b8962e' }} />,
                title: 'Privacy First',
                desc: 'Contact details stay hidden until mutual interest is confirmed. Your dignity is always protected.',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="mat-card-hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ background: 'white', borderRadius: 20, padding: '24px 22px', border: '1px solid #ede3c8' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(184,150,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid rgba(184,150,46,0.15)' }}>
                  {f.icon}
                </div>
                <h3 className="mat-serif" style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#9b8860', lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA BANNER ── */}
        <div className="max-w-5xl mx-auto px-6 pb-20 mat-body">
          <div style={{ background: 'linear-gradient(135deg, #7A1F01 0%, #4c1301 100%)', borderRadius: 28, padding: '52px 48px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, boxShadow: '0 24px 48px rgba(122,31,1,0.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div>
              <h2 className="mat-serif" style={{ fontSize: 30, fontWeight: 700, color: 'white', fontStyle: 'normal', marginBottom: 10 }}>
                Ready to find your divine match?
              </h2>
              <p style={{ color: 'rgba(255,220,140,0.7)', fontSize: 14, fontWeight: 300, maxWidth: 400, lineHeight: 1.65 }}>
                Join thousands of families who found their perfect union through Vedic astrology. Your chart is waiting.
              </p>
            </div>
            <button
              onClick={() => historyApiService.isAuthenticated() ? window.location.href = '/matrimony/setup' : setShowAuthModal(true)}
              style={{ background: '#b8962e', color: 'white', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(184,150,46,0.4)' }}
            >
              Access Your Divine Profile <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // ── AUTHENTICATED MAIN VIEW ──────────────────────────────────────────────
  return (
    <div className="min-h-screen mat-body" style={{ backgroundColor: '#fdf6e3' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        .mat-serif { font-family: 'Inter', sans-serif; }
        .mat-body { font-family: 'Inter', sans-serif; }
        .match-card:hover .match-card-img { transform: scale(1.05); }
        .match-card { transition: box-shadow 0.25s, transform 0.25s; }
        .match-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── TOP BAR ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, background: 'white', padding: 5, borderRadius: 16, border: '1px solid #e8dfc4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {(['discover', 'requests'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  background: activeTab === tab ? '#7A1F01' : 'transparent',
                  color: activeTab === tab ? 'white' : '#9b8860',
                }}
              >
                {tab === 'discover' ? t('matrimony.discover') : t('matrimony.connections')}
                {tab === 'requests' && totalNotificationCount > 0 && (
                  <span style={{ background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 800, borderRadius: 999, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {totalNotificationCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {activeTab === 'discover' && (
              <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#c0a870' }} />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder={t('common.filter_by_city')}
                  style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'white', border: '1px solid #e8dfc4', borderRadius: 12, fontSize: 13, color: '#333', outline: 'none', width: 180, fontFamily: 'inherit' }}
                />
              </form>
            )}
            <Link
              href="/matrimony/setup"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'white', border: '1px solid #e8dfc4', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#7A1F01', textDecoration: 'none', transition: 'all 0.2s', letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              <Settings style={{ width: 13, height: 13 }} /> {t('matrimony.edit_profile')}
            </Link>
          </div>
        </div>

        {/* ── PAGE HEADING ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="mat-serif" style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
            {activeTab === 'discover' ? (
              <>{t('matrimony.divine_suggestions_title').split(' ')[0]} <span style={{ color: '#b8962e', fontStyle: 'normal' }}>{t('matrimony.divine_suggestions_title').split(' ').slice(1).join(' ')}</span></>
            ) : (
              <>{t('matrimony.my_connections_title').split(' ')[0]} <span style={{ color: '#b8962e', fontStyle: 'normal' }}>{t('matrimony.my_connections_title').split(' ').slice(1).join(' ')}</span></>
            )}
          </h1>
          <p style={{ color: '#9b8860', fontSize: 13, marginTop: 5, fontWeight: 300 }}>
            {activeTab === 'discover'
              ? t('matrimony.discover_desc')
              : t('matrimony.connections_desc')}
          </p>
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'discover' ? (
            <motion.div key="discover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {suggestions.length === 0 ? (
                <div style={{ background: 'white', border: '1.5px dashed #d6c89a', borderRadius: 24, padding: '64px 24px', textAlign: 'center' }}>
                  <Users style={{ width: 40, height: 40, color: '#d6c89a', margin: '0 auto 12px' }} />
                  <p className="mat-serif" style={{ color: '#c0a870', fontStyle: 'normal', fontSize: 16 }}>{t('matrimony.no_matches')}</p>
                  <p style={{ color: '#bbb', fontSize: 13, marginTop: 6 }}>{t('matrimony.no_matches_tip')}</p>
                </div>
              ) : (
                /* ── MATCH GRID — compact horizontal cards ── */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {suggestions.map((match, i) => (
                    <motion.div
                      key={i}
                      className="match-card"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #ede3c8', display: 'flex', flexDirection: 'column' }}
                    >
                      {/* Image — fixed 200px, not full-page tall */}
                      <div style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
                        <img
                          className="match-card-img"
                          src={(match.profile.photos && match.profile.photos.length > 0 && match.profile.photos[0]) || match.user.profileImage || 'https://vaidiktalk.s3.ap-south-1.amazonaws.com/images/row-1-column-1.png'}
                          alt={match.user.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />

                        {/* Score badge */}
                        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#1a1a1a', backdropFilter: 'blur(4px)' }}>
                          <Sparkles style={{ width: 11, height: 11, color: '#b8962e' }} />
                          {match.compatibility.score > 0 ? `${match.compatibility.score}/36` : 'TBD'}
                        </div>

                        {/* Name on image */}
                        <div style={{ position: 'absolute', bottom: 12, left: 14, color: 'white' }}>
                          <div className="mat-serif" style={{ fontSize: 17, fontWeight: 700 }}>{match.user.name}, {match.user.age}</div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                        <p style={{ fontSize: 12, color: '#9b8860', lineHeight: 1.55, fontStyle: 'normal', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{match.profile.bio || t('matrimony.default_bio')}"
                        </p>
                        <Link
                          href={`/matrimony/match/${match.profile.userId}`}
                          style={{ display: 'block', textAlign: 'center', padding: '9px 0', background: '#fdf0d5', borderRadius: 12, fontSize: 11, fontWeight: 800, color: '#7A1F01', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid #e8dfc4', transition: 'all 0.2s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#7A1F01'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#fdf0d5'; (e.currentTarget as HTMLElement).style.color = '#7A1F01'; }}
                        >
                          {t('matrimony.view_compatibility')}
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="requests" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

                {/* ── Incoming ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Heart style={{ width: 16, height: 16, color: '#b8962e' }} />
                    <h3 className="mat-serif" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', fontStyle: 'normal', margin: 0 }}>{t('matrimony.incoming_interests')}</h3>
                    {pendingCount > 0 && (
                      <span style={{ background: '#b8962e', color: 'white', fontSize: 10, fontWeight: 800, borderRadius: 999, padding: '2px 8px' }}>{pendingCount} {t('common.new')}</span>
                    )}
                  </div>

                  {incomingRequests.length === 0 ? (
                    <div style={{ background: 'white', border: '1.5px dashed #d6c89a', borderRadius: 18, padding: '32px 20px', textAlign: 'center' }}>
                      <p style={{ color: '#bbb', fontSize: 13, fontStyle: 'normal' }}>{t('matrimony.no_incoming')}</p>
                      <p style={{ color: '#ccc', fontSize: 12, marginTop: 4 }}>{t('matrimony.no_incoming_desc')}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {incomingRequests.map((req) => (
                        <div key={req._id} style={{ background: 'white', border: '1px solid #ede3c8', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '2px solid #f0e4c0' }}>
                            <img src={req.senderId.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="mat-serif" style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', margin: 0 }}>{req.senderId.name}</p>
                            <p style={{ fontSize: 11, color: '#c0a870', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Shield style={{ width: 10, height: 10 }} /> {t('matrimony.contact_hidden')}
                            </p>
                          </div>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => handleInterestAction(req._id, 'accepted')}
                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#dcfce7', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#16a34a'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#dcfce7'; (e.currentTarget as HTMLElement).style.color = '#16a34a'; }}
                              >
                                <Check style={{ width: 15, height: 15 }} />
                              </button>
                              <button
                                onClick={() => handleInterestAction(req._id, 'rejected')}
                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#dc2626'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                              >
                                <X style={{ width: 15, height: 15 }} />
                              </button>
                            </div>
                          ) : req.status === 'accepted' ? (
                            <Link href={`/matrimony/chat/${req._id}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#b8962e', color: 'white', borderRadius: 10, fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              <MessageCircle style={{ width: 12, height: 12 }} /> {t('common.chat')}
                              {req.unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                  {req.unreadCount}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{req.status}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Outgoing ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Clock style={{ width: 16, height: 16, color: '#9b8860' }} />
                    <h3 className="mat-serif" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', fontStyle: 'normal', margin: 0 }}>{t('matrimony.outgoing_interests')}</h3>
                  </div>

                  {outgoingRequests.length === 0 ? (
                    <div style={{ background: 'white', border: '1.5px dashed #d6c89a', borderRadius: 18, padding: '32px 20px', textAlign: 'center' }}>
                      <p style={{ color: '#bbb', fontSize: 13, fontStyle: 'normal' }}>{t('matrimony.no_outgoing')}</p>
                      <p style={{ color: '#ccc', fontSize: 12, marginTop: 4 }}>{t('matrimony.no_outgoing_desc')}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {outgoingRequests.map((req) => (
                        <div key={req._id} style={{ background: 'white', border: '1px solid #ede3c8', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: req.status === 'rejected' ? 0.55 : 1 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, filter: 'grayscale(0.3)' }}>
                            <img src={req.receiverId.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', margin: 0 }}>{req.receiverId.name}</p>
                            {req.status === 'accepted' ? (
                              <Link href={`/matrimony/chat/${req._id}`} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#b8962e', textDecoration: 'none', marginTop: 2 }}>
                                <MessageCircle style={{ width: 11, height: 11 }} /> {t('matrimony.chat_now')}
                                {req.unreadCount > 0 && (
                                  <span className="ml-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                    {req.unreadCount}
                                  </span>
                                )}
                              </Link>
                            ) : (
                              <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{req.status}</p>
                            )}
                          </div>
                          {req.status === 'accepted' && (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}