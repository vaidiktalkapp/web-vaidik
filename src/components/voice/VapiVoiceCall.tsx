"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import Vapi from "@vapi-ai/web";
import callService from '@/lib/callService';

// ─────────────────────────────────────────────────────────────────
// NOTE: vapiConfig from backend is a COMPLETE Vapi assistant config:
//   { name, model, transcriber, voice, firstMessage, maxDurationSeconds,
//     metadata, recordingEnabled, serverMessages, serverUrl, ... }
// It does NOT contain assistantId / voiceConfig / authToken.
// Parent page.tsx handles: socket connect → join_session → sync_timer.
// This component ONLY initializes Vapi and manages the call UI.
// ─────────────────────────────────────────────────────────────────

interface VapiVoiceCallProps {
  config: any;           // Full Vapi assistant config from backend
  sessionId: string;
  onEnd: () => void;
  astrologerName: string;
  remainingTime: number;
  walletBalance: number;
  callRate: number;
  profileImage?: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'ended';

export default function VapiVoiceCall({
  config,
  sessionId,
  onEnd,
  astrologerName,
  remainingTime,
  walletBalance,
  callRate,
  profileImage,
}: VapiVoiceCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentWallet, setCurrentWallet] = useState(walletBalance);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  // Refs to avoid re-initialization on re-renders
  const vapiRef = useRef<Vapi | null>(null);
  const initializedRef = useRef(false);       // guard: init only once
  const sessionIdRef = useRef(sessionId);
  const onEndRef = useRef(onEnd);

  // Keep refs in sync without triggering re-init
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  useEffect(() => { setCurrentWallet(walletBalance); }, [walletBalance]);

  // ── VAPI INITIALIZATION (runs once on mount) ──────────────────
  useEffect(() => {
    let isMounted = true;

    // Prevent double-initialization (React Strict Mode / re-renders)
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Guard:config must be present
    if (!config) {
      console.error('❌ [Vapi] No config provided — cannot start call.');
      setConnectionStatus('disconnected');
      return;
    }

    // Lightweight validation: backend always sends model + firstMessage
    if (!config.model && !config.firstMessage) {
      console.error('❌ [Vapi] Invalid config — missing model and firstMessage.', config);
      setConnectionStatus('disconnected');
      return;
    }

    // Sanitize the Public Key: Remove any trailing characters like 'x' or backticks that often appear in .env copy-pastes
    const rawKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'fbf7f38f-d6ba-4d60-93e0-b92ada2d016c';
    const vapiPublicKey = rawKey.replace(/[^a-fA-F0-9-]/g, '').trim();

    console.log(`🎙️ [Vapi] Initializing SDK...`);
    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    // ── Event: call-start ──────────────────────────────────────
    (vapi as any).on('call-start', (call: any) => {
      console.log('🚀 [Vapi] Call started:', call?.id);
      setConnectionStatus('connected');
      setIsVapiReady(true);

      // Notify backend → starts billing timer, stores vapiCallId for webhooks
      callService.emit('vapi_start', {
        sessionId: sessionIdRef.current,
        vapiCallId: call?.id || call?.callId,
      });
    });

    // ── Event: call-end ───────────────────────────────────────
    vapi.on('call-end', () => {
      console.log('🛑 [Vapi] Call ended');
      setConnectionStatus('ended');
      setIsVapiReady(false);
      setTimeout(() => onEndRef.current(), 1000);
    });

    // ── Event: speech-start (user speaking) ───────────────────
    vapi.on('speech-start', () => {
      setIsSpeaking(true);
    });

    // ── Event: speech-end (user stopped) ─────────────────────
    vapi.on('speech-end', () => {
      setIsSpeaking(false);
    });

    // ── Event: assistant-speech-start ────────────────────────
    (vapi as any).on('assistant-speech-start', () => {
      setAssistantSpeaking(true);
    });

    // ── Event: assistant-speech-end ──────────────────────────
    (vapi as any).on('assistant-speech-end', () => {
      setAssistantSpeaking(false);
    });

    // ── Event: volume-level ───────────────────────────────────
    vapi.on('volume-level', (vol: number) => {
      setVolumeLevel(vol);
    });

    // ── Event: message (transcripts, speech-update, errors) ──
    vapi.on('message', (msg: any) => {
      const t = msg?.type;
      if (t === 'assistant-speech-start') {
        setAssistantSpeaking(true);
      } else if (t === 'assistant-speech-end') {
        setAssistantSpeaking(false);
      } else if (t === 'speech-update' && msg.role === 'assistant') {
        if (msg.status === 'started') {
          setAssistantSpeaking(true);
          setIsSpeaking(false);
        } else if (msg.status === 'stopped') {
          setAssistantSpeaking(false);
        }
      } else if (t === 'transcript') {
        console.log(
          `💬 [Vapi] ${msg.role === 'user' ? 'User' : 'AI'} transcript:`,
          msg.transcript
        );
      } else if (t === 'error') {
        console.error('❌ [Vapi] Message error:', msg.error);
      }
    });

    // ── Event: error (engine-level) ───────────────────────────
    vapi.on('error', (e: any) => {
      const errorMsg = e?.error?.message || e?.message || "";

      // Ignore "Duplicate DailyIframe" errors which happen in React Strict Mode (Dev)
      if (errorMsg.includes('Duplicate DailyIframe')) {
        console.warn('⚠️ [Vapi] Duplicate instance detected in dev mode. Ignoring safely.');
        return;
      }

      console.error('❌ [Vapi] Engine error:', JSON.stringify(e, null, 2), e);

      // Don't immediately show "disconnected" — Vapi may recover
      // Only set disconnected if call never started (isVapiReady still false)
      if (!isVapiReady) {
        setConnectionStatus('disconnected');
      }
    });

    // ── START VAPI ────────────────────────────────────────────
    // Pass the full assistant config directly.
    // Cap maxDurationSeconds to avoid accidental multi-hour billing.
    try {
      const { maxDurationSeconds: cfgMax, ...restConfig } = config;
      const safeDuration = Math.min(cfgMax || 3600, 7200);

      console.log('▶️ [Vapi] Calling vapi.start() with:', {
        name: restConfig.name,
        model: restConfig.model?.provider,
        voice: restConfig.voice?.provider,
        maxDurationSeconds: safeDuration,
        hasFirstMessage: !!restConfig.firstMessage,
      });

      vapi.start({
        ...restConfig,
        maxDurationSeconds: safeDuration,
        recordingEnabled: true, // Explicitly enable recording in the SDK
      } as any);
      
      // If component unmounted while starting (e.g. user pressed back button very fast), ensure we stop it.
      setTimeout(() => {
        if (!isMounted && vapiRef.current) {
           console.log('⚠️ [Vapi] Component unmounted during startup. Forcing stop.');
           vapiRef.current.stop();
        }
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ [Vapi] vapi.start() threw:', err);
      setConnectionStatus('disconnected');
    }

    // ── CLEANUP ───────────────────────────────────────────────
    return () => {
      console.log('🧹 [Vapi] Stopping and cleaning up');
      isMounted = false;
      try {
        if (vapiRef.current) {
          // DO NOT call removeAllListeners() here because it can break internal Daily.co event handling needed for proper teardown
          vapiRef.current.stop();
        }
      } catch (err) {
        console.warn('⚠️ [Vapi] Error during unmount cleanup:', err);
      }
      vapiRef.current = null;
      initializedRef.current = false; // CRITICAL: Reset the initialization flag on unmount to prevent WebRTC instance leaks
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ Intentionally empty deps — we use refs for sessionId/onEnd/config
  //   to prevent re-initialization on parent re-renders.

  // ── DURATION TIMER (counts up while connected) ────────────────
  useEffect(() => {
    if (!isVapiReady || connectionStatus !== 'connected') return;
    const interval = setInterval(() => {
      setDuration(prev => {
        const next = prev + 1;
        if (next % 60 === 1) {
          setCurrentWallet(w => Math.max(0, w - callRate));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVapiReady, connectionStatus, callRate]);

  // ── HANDLERS ─────────────────────────────────────────────────
  const handleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    vapiRef.current?.setMuted(newMuted);
  };

  const handleEndCall = () => {
    console.log('🔌 [Vapi] Manually ending call...');
    try {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    } catch (e) {
      console.warn('⚠️ [Vapi] Error during manual stop:', e);
    }

    setConnectionStatus('ended');

    // Stop the backend timer immediately to avoid inflated durations while waiting for webhook
    callService.emit('vapi_end', { sessionId: sessionIdRef.current });

    onEnd();
  };

  const formatTime = (s: number) => {
    if (s < 0) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── STATUS TEXT ───────────────────────────────────────────────
  const statusText = (() => {
    if (connectionStatus === 'ended') return 'Call Ended';
    if (connectionStatus === 'disconnected') return 'Connection Failed';
    if (!isVapiReady) return 'Connecting to AI Astrologer...';
    if (assistantSpeaking) return 'AI Speaking...';
    if (isSpeaking) return 'Listening...';
    return 'Connected';
  })();

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden bg-slate-900 text-white">

      {/* ── FULL SCREEN BACKGROUND ── */}
      {profileImage && (
        <img src={profileImage} alt={astrologerName} className="absolute inset-0 w-full h-full object-cover z-0" />
      )}

      {/* ── EXISTING GRADIENT OVERLAY ── */}
      <div className={`absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-700 transition-opacity duration-500 ${profileImage ? 'opacity-30' : 'opacity-100'}`} />

      {/* ── CONNECTING / ERROR OVERLAY ── */}
      {!isVapiReady && (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${profileImage ? 'bg-slate-900/20 backdrop-blur-[4px]' : 'bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-700'}`}>
          <div className="relative flex items-center justify-center mb-10">
            <div className="absolute w-52 h-52 rounded-full border-2 border-blue-400/20 animate-ping" />
            <div className="absolute w-40 h-40 rounded-full border border-indigo-400/30 animate-pulse" />
            {/* Avatar Profile Image or Initial */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600/50 to-indigo-600/50 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(37,99,235,0.5)] border-4 border-white/20 backdrop-blur-sm overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt={astrologerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-white">{astrologerName.charAt(0)}</span>
              )}
            </div>
          </div>

          <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-white drop-shadow-md z-10">{astrologerName}</h2>

          {connectionStatus === 'disconnected' ? (
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-red-400 text-lg font-medium mb-6 drop-shadow-md">Connection failed</p>
              <button
                onClick={handleEndCall}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg"
              >
                Go Back
              </button>
            </div>
          ) : connectionStatus === 'ended' ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                <PhoneOff className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-white text-2xl font-bold mb-2 drop-shadow-md">Call Ended</p>
              <p className="text-white/80 text-sm mb-8 text-center px-10 drop-shadow-md">
                Your session has concluded. Redirecting...
              </p>
            </div>
          ) : (
            /* Connecting state — animated dots */
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-blue-300 text-base font-medium tracking-wide uppercase drop-shadow-md">
                Connecting to AI Astrologer...
              </p>
              <p className="text-white/60 text-xs mt-2 drop-shadow-md">Timer &amp; billing starts only after connection</p>

              <button
                onClick={handleEndCall}
                className="mt-8 group relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-red-500/30 hover:ring-red-400/50"
                title="Cancel Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ANIMATED BACKGROUND PULSE ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className={`border-2 border-blue-400/20 rounded-full transition-all duration-300 ${isSpeaking || assistantSpeaking ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            width: `${300 + volumeLevel * 200}px`,
            height: `${300 + volumeLevel * 200}px`,
            transition: 'width 0.1s ease-out, height 0.1s ease-out',
          }}
        />
        {(isSpeaking || assistantSpeaking) && (
          <div className="absolute w-[350px] h-[350px] border border-blue-500/10 rounded-full animate-ping" />
        )}
      </div>

      {/* ── TOP STATS (visible only when connected) ── */}
      {isVapiReady && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-full max-w-sm px-4">
          <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center justify-center gap-4 w-auto min-w-[240px]">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/60 uppercase font-black tracking-widest leading-none mb-1">Duration</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Recording In Progress" />
                <span className="font-mono text-xl font-bold text-white leading-none drop-shadow-md">{formatTime(duration)}</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/60 uppercase font-black tracking-widest leading-none mb-1">Remaining</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${remainingTime < 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}`} />
                <span className={`font-mono text-xl font-bold leading-none drop-shadow-md ${remainingTime < 60 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(remainingTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/60 uppercase font-bold">Balance:</span>
              <span className={`text-xs font-bold drop-shadow-md ${currentWallet < callRate * 2 ? 'text-orange-400 animate-pulse' : 'text-green-400'}`}>
                ₹{Math.floor(currentWallet)}
              </span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/60 uppercase font-bold">Rate:</span>
              <span className="text-xs font-bold text-white/90 drop-shadow-md">₹{callRate}/min</span>
            </div>
          </div>

          {remainingTime < 30 && (
            <div className="bg-red-600/90 backdrop-blur-md px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter animate-bounce shadow-lg mt-1 text-white">
              Low Balance • Call Ending Soon
            </div>
          )}
        </div>
      )}

      {/* ── AVATAR REPLACEMENT (SPEAKING INDICATOR) ── */}
      <div className="relative mb-12 z-10 h-40 flex flex-col items-center justify-end w-full">
        {assistantSpeaking && (
          <div className="flex items-end justify-center gap-1.5 h-16 pb-4">
            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-10 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* ── NAME + STATUS ── */}
      <h2 className="text-4xl font-extrabold mb-2 tracking-tight text-white drop-shadow-xl z-10">{astrologerName}</h2>
      <p className="text-blue-200 text-lg font-bold mb-12 tracking-wide uppercase drop-shadow-lg z-10">{statusText}</p>

      {/* ── CONTROLS ── */}
      <div className="flex gap-8 z-20">
        {/* Mute */}
        <button
          id="vapi-mute-btn"
          onClick={handleMute}
          className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all backdrop-blur-md shadow-lg duration-300 ${isMuted
              ? 'bg-red-600 border-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
              : 'bg-slate-900/90 border-slate-700/80 text-white hover:bg-slate-800 hover:scale-105 active:scale-95'
            }`}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </button>

        {/* End Call */}
        <button
          id="vapi-end-btn"
          onClick={handleEndCall}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-95 transition-all"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        {/* Volume Indicator */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border-2 shadow-lg transition-all duration-300 ${assistantSpeaking
              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-slate-900/90 border-slate-700/80 text-white/70'
            }`}
        >
          {assistantSpeaking ? <Volume2 className="animate-pulse" /> : <VolumeX />}
        </div>
      </div>
    </div>
  );
}
