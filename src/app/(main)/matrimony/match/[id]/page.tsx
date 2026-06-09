'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Sparkles, User, Calendar, MapPin,
  Briefcase, ArrowLeft, Star, Zap, Info,
  ChevronRight, Shield, AlertTriangle, GraduationCap,
  ImageIcon, Users, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { matrimonyService } from '@/lib/matrimonyService';
import { historyApiService } from '@/lib/historyApiService';

export default function MatchDetailPage() {
  const { t } = useTranslation();

  const params = useParams();
  const partnerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [interestStatus, setInterestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    setMounted(true);
    const fetchMatch = async () => {
      const data = await matrimonyService.getMatchDetails(partnerId);
      setMatchData(data);
      setLoading(false);
    };
    fetchMatch();
  }, [partnerId]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#fdf6e3' }}>
        <div className="w-10 h-10 border-4 border-[#b8962e]/20 border-t-[#b8962e] rounded-full animate-spin mb-3" />
        <p style={{ color: '#9b8860', fontSize: 14 }}>
          Calculating your divine alignment…
        </p>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#fdf6e3' }}>
        <AlertTriangle style={{ width: 36, height: 36, color: '#ef4444', marginBottom: 12 }} />
        <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Partner not found</p>
        <Link href="/matrimony" style={{ color: '#b8962e', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>← Back to Discovery</Link>
      </div>
    );
  }

  const { partner, compatibility } = matchData;
  const score = compatibility?.total_points || 0;
  const report = compatibility?.guna_report || [];

  const scoreLabel = score === 0 ? 'Pending' : score >= 30 ? 'Divine Match' : score >= 25 ? 'Excellent' : score >= 18 ? 'Compatible' : 'Low Match';
  const scoreBg = score >= 30 ? '#dcfce7' : score >= 25 ? '#fef9c3' : score >= 18 ? '#fff7ed' : '#fee2e2';
  const scoreColor = score >= 30 ? '#16a34a' : score >= 25 ? '#ca8a04' : score >= 18 ? '#ea580c' : '#dc2626';



  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdf6e3', fontFamily: "'Inter', sans-serif" }}>
      <style jsx global>{`
        .md-divider { width: 36px; height: 2px; background: linear-gradient(90deg, #b8962e, transparent); margin-bottom: 16px; }
        .guna-row:hover { background: #fffbf0 !important; }
        .photo-thumb:hover img { transform: scale(1.06); }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 48px' }}>

        {/* Back link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Link href="/matrimony" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#b8962e', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Discovery
          </Link>


        </div>

        <div id="matrimony-profile">

        {/* ── PROFILE HEADER CARD ── */}
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid #ede3c8', overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* Cover strip: Enhanced Premium Divine Aesthetic */}
          <div style={{
            height: 190,
            position: 'relative',
            background: 'linear-gradient(135deg, #fdf6e3 0%, #f7ecd0 40%, #faefd1 100%)',
            overflow: 'hidden'
          }}>
            {/* Subtle Mandala Background Pattern - High Visibility */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.22,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M50 0 L55 25 L80 20 L70 45 L95 50 L70 55 L80 80 L55 75 L50 100 L45 75 L20 80 L30 55 L5 50 L30 45 L20 20 L45 25 Z' fill='%23b8962e'/%3E%3C/svg%3E")`,
              backgroundSize: '140px 140px'
            }} />
            
            {/* Elegant Dotted accents - High Visibility */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.3,
              backgroundImage: 'radial-gradient(#b8962e 1.5px, transparent 1.5px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Subtle Vedic Motto - Adds professional "Life" to the blank space - Deep Maroon for maximum visibility */}
            <div style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.8,
              textAlign: 'center',
              userSelect: 'none',
              pointerEvents: 'none'
            }}>
                <div style={{ fontSize: 38, fontWeight: 700, color: '#7A1F01', letterSpacing: '0.14em', whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    Swayamvara
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#7A1F01', letterSpacing: '0.5em', textTransform: 'uppercase', marginTop: 6, opacity: 0.6 }}>
                    The Divine Choice
                </div>
            </div>

            {/* Bottom transition to white */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to top, white 0%, rgba(255,255,255,0) 100%)'
            }} />
          </div>

          {/* Profile row */}
          <div style={{ padding: '0 24px 22px', marginTop: -36, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
            {/* Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: 18, overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <img src={(partner.photos && partner.photos.length > 0 && partner.photos[0]) || partner.profileImage || 'https://vaidiktalk.s3.ap-south-1.amazonaws.com/images/row-1-column-1.png'} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Name & meta */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>
                {partner.name}<span style={{ color: '#9b8860', fontWeight: 400, fontSize: 18 }}>, {partner.age}</span>
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
                {[
                  { icon: <Briefcase style={{ width: 12, height: 12 }} />, label: partner.profession || 'Self Employed' },
                  { icon: <GraduationCap style={{ width: 12, height: 12 }} />, label: partner.education || 'Graduate' },
                  { icon: <Star style={{ width: 12, height: 12 }} />, label: partner.religion || 'Hindu' },
                  ...(partner.caste ? [{ icon: <Users style={{ width: 12, height: 12 }} />, label: partner.caste }] : []),
                  ...(partner.height ? [{ icon: <Zap style={{ width: 12, height: 12 }} />, label: partner.height }] : []),
                ].map((m, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#9b8860', fontWeight: 600 }}>
                    <span style={{ color: '#b8962e' }}>{m.icon}</span> {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Score pill — Upgraded to Vedic Alignment Meter */}
            <div style={{ textAlign: 'center', flexShrink: 0, position: 'relative' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #7A1F01 0%, #a52a01 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', color: 'white', border: '5px solid white', boxShadow: '0 8px 20px rgba(122,31,1,0.25)', padding: '15px 0' }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 2 }}>{score === 0 ? 'Divine' : 'Match'}</div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                  {score > 0 ? `${score}/36` : 'TBD'}
                </div>
                <div style={{ marginTop: 4, fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '2px 6px' }}>
                  {score === 0 ? 'Wait' : scoreLabel}
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#b8962e', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap', border: '2px solid white' }}>
                VERIFIED USER
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN BODY ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Bio */}
            <div style={{ background: 'white', borderRadius: 24, padding: '25px 28px', border: '1px solid #ede3c8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <User style={{ width: 18, height: 18, color: '#b8962e' }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>About {partner.name.split(' ')[0]}</h2>
              </div>
              <div className="md-divider" />
              <p style={{ fontSize: 15, color: '#4a4a4a', lineHeight: 1.8, margin: '0 0 20px' }}>
                "{partner.bio || 'Seeking a meaningful and spiritual life journey together.'}"
              </p>

              {/* Hobbies Section */}
              {partner.hobbies && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#b8962e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Hobbies & Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {partner.hobbies.split(',').map((hobby: string, idx: number) => (
                      <span key={idx} style={{ padding: '6px 14px', background: '#fff9e6', color: '#b8962e', borderRadius: 99, fontSize: 12, fontWeight: 600, border: '1px solid #f0e6c0' }}>
                        {hobby.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Academic & Professional Grid */}
            <div style={{ background: 'white', borderRadius: 24, padding: '25px 28px', border: '1px solid #ede3c8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <GraduationCap style={{ width: 18, height: 18, color: '#b8962e' }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Professional Summary</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: '#fafafa', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>Education</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{partner.education || 'N/A'}</div>
                </div>
                <div style={{ background: '#fafafa', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>Profession</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{partner.profession || 'Self Employed'}</div>
                </div>
              </div>
            </div>

            {/* Vedic Particulars */}
            <div style={{ background: 'white', borderRadius: 24, padding: '25px 28px', border: '1px solid #ede3c8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <Star style={{ width: 18, height: 18, color: '#b8962e' }} />
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Vedic Credentials</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                        { label: 'Nakshatra', val: partner.vedicParticulars?.nakshatra },
                        { label: 'Raasi', val: partner.vedicParticulars?.rashi },
                        { label: 'Lagna', val: partner.vedicParticulars?.lagna }
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '12px', background: 'linear-gradient(to bottom, #fff, #fdfaf0)', borderRadius: 16, border: '1px solid #f0e6c0' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: '#b8962e', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{item.val || '---'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Birth Details */}
            <div style={{ background: 'white', borderRadius: 24, padding: '25px 28px', border: '1px solid #ede3c8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <Calendar style={{ width: 18, height: 18, color: '#b8962e' }} />
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Birth Particulars</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <span style={{ fontSize: 13, color: '#888' }}>Date of Birth</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{new Date(partner.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <span style={{ fontSize: 13, color: '#888' }}>Time of Birth</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{partner.tob || '--:--'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                        <span style={{ fontSize: 13, color: '#888' }}>Place of Birth</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{partner.pob || 'New Delhi, India'}</span>
                    </div>
                </div>
            </div>

            {/* Photo Gallery */}
            <div style={{ background: 'white', borderRadius: 20, padding: '22px 24px', border: '1px solid #ede3c8', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ImageIcon style={{ width: 15, height: 15, color: '#b8962e' }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Profile Gallery</h2>
              </div>
              <div className="md-divider" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(partner.photos?.length > 0 ? partner.photos : [partner.profileImage, partner.profileImage, partner.profileImage]).slice(0, 6).map((url: string, i: number) => (
                  <div key={i} className="photo-thumb" style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: '1px solid #ede3c8' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — sticky */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 20 }}>

            {/* Guna Report */}
            <div style={{ background: 'white', borderRadius: 20, padding: '22px 22px', border: '1px solid #ede3c8', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles style={{ width: 15, height: 15, color: '#b8962e' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Divine Guna Report</h3>
              </div>
              <p style={{ fontSize: 12, color: '#000000ff', marginBottom: 14, marginTop: 4, fontWeight: 300 }}>
                Vedic compatibility across 8 dimensions
              </p>

              {report.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.map((guna: any, i: number) => (
                    <div
                      key={i}
                      className="guna-row"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 12, background: '#fafaf8', border: '1px solid #f0e8d0', transition: 'background 0.2s', cursor: 'default' }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#b8962e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{guna.name}</div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{guna.description || 'Guna Alignment'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{guna.received_points}<span style={{ fontSize: 11, color: '#bbb', fontWeight: 400 }}>/{guna.total_points}</span></div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: guna.received_points > 0 ? '#16a34a' : '#dc2626' }}>
                          {guna.received_points > 0 ? '✓ Harmonious' : '✗ Conflicting'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: '#090000ff', fontSize: 13 }}>Breakdown unavailable</p>
                  <p style={{ color: '#0c0000ff', fontSize: 12, marginTop: 4 }}>Complete birth details required from both partners</p>
                </div>
              )}

              {/* Celestial insight */}
              <div style={{ marginTop: 14, background: 'linear-gradient(135deg, #fffbf0, #fff8e6)', borderRadius: 14, padding: '14px 16px', border: '1px solid #f0e0a0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Zap style={{ width: 14, height: 14, color: '#ca8a04', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#000000ff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Celestial Insight</p>
                  <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                    {score === 0
                      ? 'Complete birth details from both partners are needed to reveal the divine alignment.'
                      : score >= 25
                      ? 'A rare and auspicious union. Strong emotional and spiritual resonance awaits.'
                      : 'A balanced connection — mutual respect can nurture a deep, lasting bond.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact / Interest */}
            <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid #ede3c8', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Shield style={{ width: 13, height: 13, color: '#b8962e' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#b8962e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {partner.isConnected ? 'Connection Verified' : 'Privacy Protected'}
                </span>
              </div>

              {partner.isConnected ? (
                <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '14px 16px', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: 12, color: '#15803d', marginBottom: 8, margin: 0, fontWeight: 600 }}>Connection verified — you're matched!</p>
                  <Link 
                    href={`/matrimony/chat/${partner.connectionId}`}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 8, 
                      padding: '12px 0', 
                      background: '#16a34a', 
                      color: 'white', 
                      borderRadius: 12, 
                      fontSize: 14, 
                      fontWeight: 700, 
                      textDecoration: 'none', 
                      marginTop: 8,
                      boxShadow: '0 4px 12px rgba(22,163,74,0.15)'
                    }}
                  >
                    <MessageCircle style={{ width: 18, height: 18 }} /> Chat Now
                  </Link>
                  <p style={{ fontSize: 11, color: '#15803d', opacity: 0.7, marginTop: 10, textAlign: 'center', fontWeight: 500 }}>
                    Feel free to reach out and begin your journey
                  </p>
                </div>
              ) : (
                <div style={{ background: '#f9f9f9', borderRadius: 14, padding: '14px 16px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#aaa', filter: 'blur(4px)', userSelect: 'none', margin: 0 }}>
                    {partner.phoneNumber || '+91 **********'}
                  </p>
                  <p style={{ fontSize: 11, color: '#bbb', marginTop: 8, margin: '8px 0 0' }}>
                    Contact is revealed once both parties express mutual interest
                  </p>
                </div>
              )}

              {!partner.isConnected && (
                interestStatus === 'sent' ? (
                  <div
                    style={{ marginTop: 12, width: '100%', padding: '13px 0', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 14, borderRadius: 14, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(22,163,74,0.2)' }}
                  >
                    <CheckCircle2 style={{ width: 18, height: 18 }} /> Interest Sent Successfully
                  </div>
                ) : (
                  <button
                    disabled={interestStatus === 'sending'}
                    onClick={async () => {
                      setInterestStatus('sending');
                      try {
                        const res = await matrimonyService.sendInterest(partner.id);
                        if (res.success) {
                          setInterestStatus('sent');
                        } else {
                          setInterestStatus('error');
                        }
                      } catch {
                        setInterestStatus('error');
                      }
                    }}
                    style={{ marginTop: 12, width: '100%', padding: '13px 0', background: interestStatus === 'error' ? '#dc2626' : interestStatus === 'sending' ? '#9b7a5a' : '#7A1F01', color: 'white', fontWeight: 700, fontSize: 14, borderRadius: 14, border: 'none', cursor: interestStatus === 'sending' ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(122,31,1,0.2)', opacity: interestStatus === 'sending' ? 0.7 : 1 }}
                    onMouseOver={e => { if (interestStatus === 'idle') (e.currentTarget as HTMLElement).style.background = '#5a1701'; }}
                    onMouseOut={e => { if (interestStatus === 'idle') (e.currentTarget as HTMLElement).style.background = '#7A1F01'; }}
                  >
                    {interestStatus === 'sending' ? (
                      <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Sending...</>
                    ) : interestStatus === 'error' ? (
                      <>Failed — Tap to Retry</>
                    ) : (
                      <>Express Interest <ChevronRight style={{ width: 16, height: 16 }} /></>
                    )}
                  </button>
                )
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
    </div>
  );
}