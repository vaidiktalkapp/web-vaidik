"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import callService from '@/lib/callService';

interface GeminiVoiceCallProps {
  config: {
    apiKey: string;
    systemInstruction: string;
    tools: any[];
    firstMessage: string;
    maxDurationSeconds: number;
  };
  sessionId: string;
  onEnd: () => void;
  astrologerName: string;
  remainingTime: number;
  accessToken: string;
  walletBalance: number;
  callRate: number;
  profileImage?: string;
}

export default function GeminiVoiceCall({
  config,
  sessionId,
  onEnd,
  astrologerName,
  remainingTime,
  walletBalance,
  callRate,
  profileImage,
}: GeminiVoiceCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeminiReady, setIsGeminiReady] = useState(false); // true only after gemini_ready event
  const [duration, setDuration] = useState(0);
  const [currentWallet, setCurrentWallet] = useState(walletBalance);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const isMutedRef = useRef(false);
  const startedRef = useRef(false);
  const isGeminiReadyRef = useRef(false); // tracks isGeminiReady without stale closure

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isGeminiReadyRef.current = isGeminiReady;
  }, [isGeminiReady]);

  useEffect(() => {
    isUnmountedRef.current = false;

    if (sessionId && sessionId !== 'dialing') {
      initGeminiProxy();
    }

    const handleDeviceChange = () => {
      console.log('🔄 [Gemini] Audio device change detected');
      // If we're already in a call, we might want to re-init mic
      // But for now, let's just log it. A better approach would be to 
      // restart the stream if it's inactive or user switches.
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      isUnmountedRef.current = true;
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      cleanup();
    };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const initGeminiProxy = async () => {
    // 1. Tell backend to open a server-side Gemini WebSocket
    callService.emit('gemini_start', { sessionId }, (res: any) => {
      if (!res?.success) {
        console.error('❌ [Gemini] Backend failed to start session');
        if (!isUnmountedRef.current) setConnectionStatus('disconnected');
        return;
      }
      console.log('✅ [Gemini] Backend session started — waiting for Gemini setup_complete...');
      // NOTE: connectionStatus stays 'connecting' until gemini_ready is received
    });

    // 2. Gemini is truly ready (setup_complete received on server)
    callService.on('gemini_ready', (data: { sessionId: string }) => {
      if (data?.sessionId !== sessionId) return;
      console.log('🚀 [Gemini] AI is live and ready!');
      if (!isUnmountedRef.current) {
        setConnectionStatus('connected');
        setIsGeminiReady(true);
      }
    });

    // 3. Receive Gemini audio from backend
    callService.on('gemini_audio_response', (data: { audio: string }) => {
      if (isUnmountedRef.current) return;
      queueAudio(base64ToFloat32(data.audio));
    });

    // 4. Backend tells us Gemini closed
    callService.on('gemini_closed', () => {
      console.log('🔌 [Gemini] Connection closed by server');
      if (!isUnmountedRef.current) setConnectionStatus('disconnected');
    });

    // 5. Start mic
    console.log('🎤 [Gemini] Requesting microphone access...');
    await startMicrophone();
  };

  const startMicrophone = async () => {
    if (isUnmountedRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true,
          sampleRate: 16000 
        },
      });

      console.log('✅ [Gemini] Microphone access granted:', stream.id);

      if (isUnmountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        // Don't send audio until Gemini is fully ready (setup_complete received)
        if (isMutedRef.current || !isGeminiReadyRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const base64Data = arrayBufferToBase64(float32ToInt16(inputData).buffer);
        // Send microphone audio to backend → Gemini
        callService.emit('gemini_audio', { sessionId, audio: base64Data });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      console.log('🎙️ [Gemini] Audio processing pipeline active');
    } catch (err) {
      console.error('❌ [Gemini] Microphone access failed:', err);
      if (!isUnmountedRef.current) {
        alert('Microphone access denied. Please allow microphone access and refresh.');
      }
    }
  };

  const queueAudio = (data: Float32Array) => {
    audioQueueRef.current.push(data);
    if (!isPlayingRef.current) playNextInQueue();
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      if (!isUnmountedRef.current) setIsSpeaking(false);
      return;
    }
    isPlayingRef.current = true;
    if (!isUnmountedRef.current) setIsSpeaking(true);

    const data = audioQueueRef.current.shift()!;
    if (!audioContextRef.current) return;

    // Gemini sends at 24000, we play it at 24000 even if context is 16000
    const buffer = audioContextRef.current.createBuffer(1, data.length, 24000);
    buffer.getChannelData(0).set(data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
    sourceRef.current = source;
  };

  const clearAudioQueue = () => {
    audioQueueRef.current = [];
    try { sourceRef.current?.stop(); } catch (_) {}
    sourceRef.current = null;
    isPlayingRef.current = false;
    if (!isUnmountedRef.current) setIsSpeaking(false);
  };

  const cleanup = () => {
    console.log('🧹 [Gemini] Cleaning up...');
    callService.off('gemini_audio_response');
    callService.off('gemini_closed');
    callService.off('gemini_ready');
    callService.emit('gemini_stop', { sessionId });
    clearAudioQueue();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
  };

  // ✅ Timer Logic (Duration Counting Up)
  useEffect(() => {
    if (!isGeminiReady || connectionStatus !== 'connected') return;
    
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
  }, [isGeminiReady, connectionStatus, callRate]);

  // Sync wallet on initial prop load
  useEffect(() => {
    setCurrentWallet(walletBalance);
  }, [walletBalance]);

  const handleEndCall = () => {
    cleanup();
    onEnd();
  };

  const float32ToInt16 = (buffer: Float32Array) => {
    const buf = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) buf[i] = Math.min(1, buffer[i]) * 0x7fff;
    return buf;
  };

  const base64ToFloat32 = (base64: string) => {
    const binary = window.atob(base64);
    const bytes = new Int16Array(binary.length / 2);
    for (let i = 0; i < binary.length; i += 2) {
      bytes[i / 2] = (binary.charCodeAt(i + 1) << 8) | binary.charCodeAt(i);
    }
    const f32 = new Float32Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) f32[i] = bytes[i] / 32768.0;
    return f32;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
  };

  const formatTime = (s: number) => {
    if (s < 0) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden bg-slate-900 text-white">

      {/* ── FULL SCREEN BACKGROUND ── */}
      {profileImage && (
        <img src={profileImage} alt={astrologerName} className="absolute inset-0 w-full h-full object-cover z-0" />
      )}
      
      {/* ── EXISTING GRADIENT OVERLAY ── */}
      <div className={`absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-700 transition-opacity duration-500 ${profileImage ? 'opacity-30' : 'opacity-100'}`} />

      {/* ── CONNECTING OVERLAY (shown until gemini_ready) ── */}
      {!isGeminiReady && (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${profileImage ? 'bg-slate-900/20 backdrop-blur-[4px]' : 'bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-700'}`}>
          {/* Outer pulsing rings */}
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
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              {/* Animated dots */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-blue-300 text-base font-medium tracking-wide uppercase drop-shadow-md">Connecting to AI Astrologer...</p>
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

      {/* ── LIVE CALL UI (shown after gemini_ready) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className={`w-[300px] h-[300px] border-2 border-blue-400/20 rounded-full transition-all duration-1000 ${isSpeaking ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-0'}`} />
        <div className={`absolute w-[400px] h-[400px] border border-blue-500/10 rounded-full transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-50' : 'scale-100 opacity-0'}`} />
      </div>

      {/* Timer Badge — only visible once Gemini is ready */}
      {isGeminiReady && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-full max-w-sm px-4">
          {/* Duration & Remaining Time */}
          <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center justify-center gap-4 w-auto min-w-[240px]">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/60 uppercase font-black tracking-widest leading-none mb-1">Duration</span>
              <span className="font-mono text-xl font-bold text-white leading-none drop-shadow-md">{formatTime(duration)}</span>
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

          {/* Wallet Balance Info */}
          <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/60 uppercase font-bold">Balance:</span>
                <span className={`text-xs font-bold drop-shadow-md ${currentWallet < (callRate * 2) ? 'text-orange-400 animate-pulse' : 'text-green-400'}`}>
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
        {isSpeaking && (
          <div className="flex items-end justify-center gap-1.5 h-16 pb-4">
            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-10 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      <h2 className="text-4xl font-extrabold mb-2 tracking-tight text-white drop-shadow-xl z-10">{astrologerName}</h2>
      <p className="text-blue-200 text-lg font-bold mb-12 tracking-wide uppercase drop-shadow-lg z-10">
        {!isGeminiReady
          ? 'Connecting...'
          : connectionStatus === 'connected'
          ? (isSpeaking ? 'Speaking...' : 'Listening...')
          : 'Disconnected'}
      </p>

      <div className="flex gap-8 z-20">
        <button
          onClick={() => setIsMuted((m) => !m)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-2 backdrop-blur-md shadow-lg ${isMuted ? 'bg-red-600 border-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-slate-900/90 border-slate-700/80 text-white hover:bg-slate-800 hover:scale-105 active:scale-95'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={handleEndCall}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-95 transition-all"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border-2 shadow-lg transition-all duration-300 ${isSpeaking ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-900/90 border-slate-700/80 text-white/70'}`}>
          {isSpeaking ? <Volume2 className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}