"use client";
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import callService from '@/lib/callService';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import LowBalanceBanner from '@/components/chat/LowBalanceBanner';
import QuickRechargeModal from '@/components/chat/QuickRechargeModal';
import { toast } from 'react-hot-toast';
import GeminiVoiceCall from '@/components/voice/GeminiVoiceCall';
import VapiVoiceCall from '@/components/voice/VapiVoiceCall';
import aiAstrologerService from '@/lib/aiAstrologerService';
import { useRealTime } from '@/context/RealTimeContext';
import { orderService } from '@/lib/orderService';
import PostSessionModal from '@/components/chat/PostSessionModal';
import ContinueChatOfferCard from '@/components/chat/ContinueChatOfferCard';
function CallContent() {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const { initiateCall, continueCall, isCallProcessing, clearPendingCallSession } = useRealTime();

  const sessionId = params.sessionId as string;

  // Call State
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [astrologerName, setAstrologerName] = useState('Astrologer');
  const [callRate, setCallRate] = useState(0);
  const [astrologerId, setAstrologerId] = useState('');
  const [astrologerImage, setAstrologerImage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [showContinueModal, setShowContinueModal] = useState(false);

  // Timer State
  const [remainingTime, setRemainingTime] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [statusText, setStatusText] = useState('Connecting...');

  // Media State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [aiProvider, setAiProvider] = useState<'agora' | 'gemini' | 'vapi'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('AI_VOICE_')) {
        return 'vapi';
      }
      const search = window.location.search;
      if (search.includes('type=vapi')) return 'vapi';
      if (search.includes('type=gemini')) return 'gemini';
    }
    return 'agora';
  });
  const [geminiConfig, setGeminiConfig] = useState<any>(null);
  const [vapiConfig, setVapiConfig] = useState<any>(null);

  // Refs
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const remainingTimeRef = useRef(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const agoraInitializedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const notifiedThresholds = useRef<Set<number>>(new Set());

  // ✅ FIX: Track which provider is active in a ref so the cleanup function
  // can read the latest value without a stale closure.
  const aiProviderRef = useRef<'agora' | 'gemini' | 'vapi'>('agora');
  useEffect(() => {
    aiProviderRef.current = aiProvider;
  }, [aiProvider]);

  // ========== 0. REVIEW SUBMISSION LOGIC ==========
  const handleSubmitRating = async (rating: number, review: string) => {
    try {
      const finalOrderId = (sessionId && sessionId !== 'undefined') ? sessionId : (orderId && orderId !== 'undefined' ? orderId : '');
      
      if (!astrologerId || !finalOrderId) {
        console.error('❌ [CallReview] Cannot submit review: Missing IDs', { astrologerId, finalOrderId });
        toast.error('Unable to submit review: Session details missing');
        throw new Error('Missing IDs'); // Prevent modal from advancing
      }

      console.log(`📝 [CallReview] Submitting review for ${finalOrderId}...`);
      await orderService.addReview(astrologerId, finalOrderId, rating, review, 'call');
      toast.success('Review submitted successfully!');
    } catch (error: any) {
      console.error('❌ [CallReview] Submission failed:', error);
      
      // Extract backend error message to avoid generic Axios "Request failed with status code 400"
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review';
      toast.error(errorMessage);
      
      throw error; // Re-throw to ensure the modal stays on the rating screen and doesn't show false success
    }
  };

  // ========== 1. EXTRACT URL PARAMS ==========
  useEffect(() => {
    const type = searchParams.get('type') as 'audio' | 'video' || 'audio';
    const name = searchParams.get('name') || 'Astrologer';
    const rate = parseFloat(searchParams.get('rate') || '0');
    const astId = searchParams.get('astrologerId') || '';
    const astImage = searchParams.get('image') || '';
    const ordId = searchParams.get('orderId') || '';

    // Check if it's an AI call - use searchParams directly for provider types to avoid TS errors
    const callTypeParam = searchParams.get('type');
    const isAiCall = sessionId?.startsWith('AI_VOICE_') || callTypeParam === 'vapi' || callTypeParam === 'gemini';

    setCallType(type);
    setAstrologerName(decodeURIComponent(name));
    setCallRate(rate); 
    setIsVideoOn(type === 'video');
    setAstrologerId(astId);
    setAstrologerImage(decodeURIComponent(astImage));
    setOrderId(ordId);

    console.log('📋 [Call] Params loaded:', { type, name, rate: isAiCall ? 20 : rate, astId, ordId, sessionId });
  }, [searchParams, sessionId]);

  // ========== 2. LOCAL TIMER LOGIC ==========
  const startLocalTimer = (durationSeconds: number) => {
    console.log(`⏱️ [Call] Starting local timer: ${durationSeconds}s`);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    remainingTimeRef.current = durationSeconds;
    setRemainingTime(durationSeconds);
    setMaxDuration(durationSeconds);
    setIsCallActive(true);
    setStatusText('Call in Progress');

    // Clear any pending/waiting call states from the global context
    try {
      clearPendingCallSession();
    } catch (e) {
      console.error('Failed to clear pending call session:', e);
    }

    timerIntervalRef.current = setInterval(() => {
      if (remainingTimeRef.current <= 0) {
        if (!hasEndedRef.current) {
          remainingTimeRef.current = 0;
          setRemainingTime(0);
        }
        return;
      }
      remainingTimeRef.current -= 1;
      setRemainingTime(remainingTimeRef.current);
    }, 1000);
  };

  // ========== 3. AGORA SETUP ==========
  const initAgora = async (payload: any) => {
    if (agoraInitializedRef.current) {
      console.log('⚠️ [Call] Agora already initialized');
      return;
    }

    try {
      console.log('🎥 [Call] Initializing Agora with payload:', payload);
      agoraInitializedRef.current = true;
      setStatusText('Joining call...');

      callService.onUserPublished = async (remoteUser: any, mediaType: 'audio' | 'video') => {
        console.log(`👤 [Call] Remote user published ${mediaType}`, remoteUser);

        if (mediaType === 'audio') {
          await remoteUser.audioTrack?.play();
        }

        if (mediaType === 'video' && remoteVideoRef.current) {
          setTimeout(() => {
            if (remoteVideoRef.current) {
              remoteUser.videoTrack?.play(remoteVideoRef.current);
              setRemoteUserJoined(true);
              setStatusText('Connected');
            }
          }, 100);
        }
      };

      callService.onUserUnpublished = (remoteUser: any, mediaType: 'audio' | 'video') => {
        console.log(`👤 [Call] Remote user unpublished ${mediaType}`);
        if (mediaType === 'video') {
          setRemoteUserJoined(false);
        }
      };

      callService.onUserLeft = () => {
        console.log('👤 [Call] Remote user left');
        setRemoteUserJoined(false);
        setStatusText('Astrologer Disconnected');
      };

      const uid = Number(payload.agoraUid || payload.agoraUserUid);
      await callService.joinChannel(
        payload.agoraToken,
        payload.agoraChannelName || payload.channelName,
        uid,
        callType === 'video',
        payload.agoraAppId
      );

      callService.emit('user_joined_agora', { sessionId, role: 'user' });

      setIsEngineReady(true);
      console.log('✅ [Call] Agora joined successfully');

      if (callType === 'video' && localVideoRef.current) {
        setTimeout(() => {
          if (localVideoRef.current) {
            callService.playLocalVideo(localVideoRef.current);
          }
        }, 100);
      }

    } catch (error: any) {
      console.error('❌ [Call] Agora initialization failed:', error);
      setStatusText('Media Connection Failed');
      agoraInitializedRef.current = false;
    }
  };

  // ========== 4. MAIN CALL SETUP ==========
  useEffect(() => {
    if (!sessionId || !user?._id) {
      console.log('⚠️ [Call] Missing sessionId or userId');
      return;
    }

    let mounted = true;

    if (sessionId === 'dialing') {
      const astrologerId = searchParams.get('astrologerId');
      const lang = searchParams.get('lang') || 'English';
      
      if (mounted) {
        setStatusText('Ringing... 🔔');
      }
      
      if (astrologerId) {
        aiAstrologerService.startAiVoiceCall(astrologerId, user._id, lang)
          .then(response => {
            if (response.success && response.sessionId) {
              const type = searchParams.get('type') || 'audio';
              const name = searchParams.get('name') || 'Astrologer';
              const rate = searchParams.get('rate') || '0';
              const encodedImage = encodeURIComponent(response.astrologerImage || '');
              router.replace(`/call/${response.sessionId}?type=${type}&name=${name}&rate=${rate}&astrologerId=${response.astrologerId}&orderId=${response.orderId}&image=${encodedImage}`);
            } else {
              toast.error(response.message || 'Failed to connect');
              router.replace('/orders');
            }
          })
          .catch(err => {
            console.error('Dialing error:', err);
            toast.error('Connection failed');
            router.replace('/orders');
          });
      } else {
        toast.error('Invalid astrologer ID');
        router.replace('/orders');
      }
      return;
    }

    const setupCall = async () => {
      // ✅ RESET: Ensure we can start a new connection even if the previous one ended
      console.log(`🚀 [Call] Setting up fresh session: ${sessionId}`);
      hasEndedRef.current = false;
      agoraInitializedRef.current = false;
      
      // Reset UI states
      setIsCallActive(false);
      setIsEngineReady(false);
      setRemoteUserJoined(false);
      setRemainingTime(0);
      setStatusText('Connecting...');
      setGeminiConfig(null); // ✅ Reset AI configs
      setVapiConfig(null);   // ✅ Reset AI configs
      
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('⚠️ [Call] No access token');
          openLoginModal?.();
          return;
        }

        console.log('🔌 [Call] Connecting to socket...');
        await callService.connectSocket(token);

        console.log(`🚪 [Call] Joining session: ${sessionId}`);
        callService.joinSession(sessionId, user._id, 'user');

        if (mounted) {
          setStatusText('Waiting for Astrologer...');
        }

        // ✅ LISTENER 1: Call Credentials
        callService.on('call_credentials', async (payload: any) => {
          if (payload.sessionId !== sessionId) return;
          console.log('🔑 [Call] Received credentials');

          if (payload.provider === 'gemini') {
            console.log('💎 [Call] Switching to Gemini Voice');
            setAiProvider('gemini');
            aiProviderRef.current = 'gemini'; // ✅ Update ref immediately
            setGeminiConfig(payload.geminiConfig);
            setIsEngineReady(true);
            setStatusText('Connected to Gemini');
            // ✅ Do NOT emit user_joined_agora for Gemini — skip it below
          } else if (payload.provider === 'vapi') {
            console.log('🎙️ [Call] Switching to Vapi (Human Voice)');
            setAiProvider('vapi');
            aiProviderRef.current = 'vapi';
            setVapiConfig(payload.vapiConfig);
            setIsEngineReady(true);
            setStatusText('Connected to Human Voice Engine');
          } else {
            setAiProvider('agora');
            aiProviderRef.current = 'agora';
            await initAgora(payload);
            // Notify backend that user joined Agora (only for Agora path)
            console.log('📢 [Call] Emitting user_joined_agora');
            callService.emit('user_joined_agora', { sessionId, role: 'user' });
          }
        });

        // ✅ LISTENER 2: Timer Start
        callService.on('timer_start', (payload: any) => {
          if (payload.sessionId !== sessionId) return;
          console.log('⏱️ [Call] Timer start received:', payload);
          startLocalTimer(payload.maxDurationSeconds ?? 300);
        });

        // ✅ LISTENER 3: Timer Tick (Sync)
        callService.on('timer_tick', (payload: any) => {
          if (payload.sessionId !== sessionId) return;
          remainingTimeRef.current = payload.remainingSeconds;
          setRemainingTime(payload.remainingSeconds);
        });

        // ✅ LISTENER 4: Call Ended
        const handleCallEnded = (data: any) => {
          if (data?.sessionId === sessionId && !hasEndedRef.current) {
            console.log('🛑 [Call] Call ended by server:', data);
            hasEndedRef.current = true;
            if (mounted) {
              setStatusText('Call Ended');
            }
            cleanupAndExit();
          }
        };

        callService.on('call_ended', handleCallEnded);
        callService.on('end-call', handleCallEnded);

        // ✅ SYNC: Get current state (for reconnections)
        console.log('🔄 [Call] Requesting timer sync...');
        callService.emit('sync_timer', { sessionId }, (response: any) => {
          if (response?.success && response.data?.remainingSeconds > 0) {
            console.log('✅ [Call] Sync received:', response.data);
            startLocalTimer(response.data.remainingSeconds);
          }
        });

      } catch (error) {
        console.error('❌ [Call] Setup error:', error);
        if (mounted) {
          setStatusText('Connection Failed');
        }
      }
    };

    setupCall();

    return () => {
      console.log('🧹 [Call] Component unmounting');
      mounted = false;

      if (!hasEndedRef.current) {
        // ✅ FIX: If we switched to Gemini, GeminiVoiceCall manages its own
        // WebSocket. Only clean up the socket/Agora layer here; leave Gemini
        // cleanup to its own component.
        if (aiProviderRef.current === 'gemini' || aiProviderRef.current === 'vapi') {
          cleanupSocketOnly();
        } else {
          cleanup();
        }
      }
    };
  }, [sessionId, user?._id, searchParams]); // ✅ Added searchParams to trigger re-setup on continuation

  // ========== 5. CLEANUP ==========

  /** Full cleanup: socket + Agora (used when Agora is active) */
  const cleanup = async () => {
    console.log('🧹 [Call] Cleaning up...');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    callService.off('call_credentials');
    callService.off('timer_start');
    callService.off('timer_tick');
    callService.off('call_ended');
    callService.off('end-call');

    try {
      await callService.destroy();
    } catch (err) {
      console.warn('⚠️ [Call] Cleanup error:', err);
    }

    agoraInitializedRef.current = false;
  };

  /**
   * ✅ FIX: Partial cleanup for when Gemini is active.
   * Only removes socket listeners and clears the timer — does NOT destroy
   * the socket connection (GeminiVoiceCall still needs it for timer events)
   * and does NOT call callService.destroy() which would disconnect the socket.
   */
  const cleanupSocketOnly = () => {
    console.log('🧹 [Call] Cleaning up socket listeners only (Gemini active)');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    callService.off('call_credentials');
    callService.off('timer_start');
    callService.off('timer_tick');
    callService.off('call_ended');
    callService.off('end-call');
    // ✅ Intentionally NOT calling callService.destroy()
  };

  const cleanupAndExit = async () => {
    await cleanup();
    
    // For AI calls, we often want to go straight to history or show the modal
    // The user requested redirection to history page
    setShowContinueModal(true);
    
    // If it's a quick exit or connection failure, we might want to redirect faster
    // But for now, we'll let the PostSessionModal handle the 'Go Home' which points to /orders
  };

  // Low Balance Proactive Notifications
  useEffect(() => {
    if (!isCallActive || hasEndedRef.current) return;

    if (remainingTime <= 300 && remainingTime > 290 && !notifiedThresholds.current.has(300)) {
      toast.error('Low Balance! Approximately 5 minutes remaining.', {
        icon: '⚠️',
        duration: 5000,
        position: 'top-center',
      });
      notifiedThresholds.current.add(300);
    }

    if (remainingTime <= 120 && remainingTime > 110 && !notifiedThresholds.current.has(120)) {
      toast.error('Critical Balance! Less than 2 minutes left. Please recharge to avoid disconnection.', {
        icon: '🚨',
        duration: 6000,
        position: 'top-center',
      });
      notifiedThresholds.current.add(120);
    }

    if (remainingTime <= 60 && remainingTime > 50 && !notifiedThresholds.current.has(60)) {
      setShowRechargeModal(true);
      notifiedThresholds.current.add(60);
    }

    if (remainingTime > 360) {
      notifiedThresholds.current.clear();
    }
  }, [remainingTime, isCallActive]);

  // ========== 6. USER ACTIONS ==========
  const handleHangup = async (reason = 'ended_by_user') => {
    if (hasEndedRef.current) {
      console.log('⚠️ [Call] Already ended, skipping');
      return;
    }

    if (!user?._id) return;

    console.log(`📞 [Call] User hangup: ${reason}`);
    
    // If the call never successfully connected/started (no billing started),
    // we should just go back to the profile page instead of showing the "Call Ended" modal.
    if (!isCallActive) {
      console.log('🔙 [Call] Call was never active, redirecting back to profile');
      
      // ✅ Set hasEndedRef to true immediately to prevent unmount handler from running cleanupSocketOnly
      hasEndedRef.current = true;
      
      try {
        clearPendingCallSession();
      } catch (e) {
        console.error('Failed to clear pending call session:', e);
      }

      cleanup(); // ✅ Run FULL cleanup immediately
      
      if (astrologerId) {
        router.replace(`/ai-astrologer/${astrologerId}`);
      } else {
        router.back();
      }
      return;
    }

    hasEndedRef.current = true;
    setStatusText('Ending Call...');

    try {
      await callService.endCall(sessionId, user._id, reason);
    } catch (error) {
      console.error('❌ [Call] End call error:', error);
    }

    await cleanupAndExit();
  };

  const handleAutoEnd = async () => {
    console.log('⏰ [Call] Auto-ending due to timer expiry');
    await handleHangup('timer_ended');
  };

  const toggleMic = () => {
    const newState = !isMicOn;
    console.log(`🎤 [Call] Toggle mic: ${newState}`);
    setIsMicOn(newState);
    callService.toggleMic(newState);
  };

  const toggleVideo = () => {
    const newState = !isVideoOn;
    console.log(`📹 [Call] Toggle video: ${newState}`);
    setIsVideoOn(newState);
    callService.toggleVideo(newState);
  };

  // ========== 7. HELPERS ==========
  const formatTime = (s: number) => {
    if (s < 0) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show clean loader for AI calls until credentials are ready
  if (!isEngineReady && (aiProvider === 'vapi' || aiProvider === 'gemini')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-4" />
        <p className="text-blue-200">{t('_sessionId_.initializing_secure_line') || 'Initializing secure line...'}</p>
      </div>
    );
  }

  // ========== GEMINI CALL RENDER ==========
  if (aiProvider === 'gemini' && geminiConfig) {
    return (
      <>
        {!showContinueModal && (
          <GeminiVoiceCall
            key={sessionId} // ✅ Force remount on new session
            config={geminiConfig}
            sessionId={sessionId}
            onEnd={() => handleHangup('ended_by_user')}
            astrologerName={astrologerName}
            remainingTime={remainingTime}
            accessToken={localStorage.getItem('accessToken') || ''}
            walletBalance={user?.wallet?.balance || 0}
            callRate={callRate}
            profileImage={astrologerImage}
          />
        )}
        {showContinueModal && (
          <>
            <PostSessionModal
              isOpen={showContinueModal}
              onClose={() => {
                // setShowContinueModal(false); // Prevents UI flash before redirect
                const isAi = true;
                if (isAi) {
                  if (astrologerId) {
                    router.replace(`/ai-astrologer/${astrologerId}`);
                  } else {
                    router.replace('/ai-chat-history');
                  }
                } else {
                  if (astrologerId) {
                    router.replace(`/astrologer/${astrologerId}`);
                  } else {
                    router.replace('/orders');
                  }
                }
              }}
              onGoHome={() => {
                // setShowContinueModal(false); // Prevents UI flash
                router.replace('/ai-astrologer-chat');
              }}
              astrologer={{ _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } }}
              type="call"
              isProcessing={isCallProcessing}
              onSubmitRating={handleSubmitRating}
              onContinue={async () => {
                try {
                  if (orderId?.startsWith('AI-VC-')) {
                    // AI Voice Call Continuation
                    const storedIntake = localStorage.getItem(`ai-chat-intake-${orderId}`);
                    let intakeData = null;
                    if (storedIntake) {
                      try {
                        intakeData = JSON.parse(storedIntake);
                      } catch (e) {
                        console.error('Failed to parse stored intake', e);
                      }
                    }

                    const res = await aiAstrologerService.startAiVoiceCall(
                      astrologerId,
                      user?._id || '',
                      'English',
                      intakeData ? {
                        name: intakeData.name,
                        dateOfBirth: intakeData.date,
                        timeOfBirth: intakeData.time,
                        placeOfBirth: intakeData.place,
                        query: intakeData.query || ''
                      } : undefined
                    );

                    if (res.success && res.sessionId) {
                      if (intakeData) {
                        localStorage.setItem(`ai-chat-intake-${res.sessionId}`, JSON.stringify(intakeData));
                      }
                      console.log('🔄 [Call] Redirecting to new AI session:', res.sessionId);
                      const encodedImage = encodeURIComponent(astrologerImage || '');
                      
                      // Cleanup current session before moving to next
                      cleanup(); 

                      router.push(`/call/${res.sessionId}?type=audio&name=${encodeURIComponent(astrologerName)}&rate=${callRate}&astrologerId=${astrologerId}&orderId=${res.orderId || ''}&image=${encodedImage}`);
                      setShowContinueModal(false);
                    } else {
                      toast.error(res.message || 'Failed to initiate call');
                    }
                  } else {
                    // Standard Call Continuation
                    const res = await continueCall(sessionId, { _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } } as any, callType);
                    if (res.success) {
                      setShowContinueModal(false);
                      // Trigger re-setup
                      router.replace(`${window.location.pathname}?${searchParams.toString()}&t=${Date.now()}`);
                    }
                  }
                } catch (error: any) {
                  console.error('Error continuing call:', error);
                  toast.error('Failed to continue call');
                }
              }}
            />

          </>
        )}
      </>
    );
  }

  // ========== VAPI CALL RENDER ==========
  if (aiProvider === 'vapi' && vapiConfig) {
    return (
      <>
        {!showContinueModal && (
          <VapiVoiceCall
            key={sessionId} // ✅ Force remount on new session
            config={vapiConfig}
            sessionId={sessionId}
            onEnd={() => handleHangup('ended_by_user')}
            astrologerName={astrologerName}
            remainingTime={remainingTime}
            walletBalance={user?.wallet?.balance || 0}
            callRate={callRate}
            profileImage={astrologerImage}
          />
        )}
        {showContinueModal && (
          <>
            <PostSessionModal
              isOpen={showContinueModal}
              onClose={() => {
                // setShowContinueModal(false); // Prevents UI flash before redirect
                const isAi = true;
                if (isAi) {
                  if (astrologerId) {
                    router.replace(`/ai-astrologer/${astrologerId}`);
                  } else {
                    router.replace('/ai-chat-history');
                  }
                } else {
                  if (astrologerId) {
                    router.replace(`/astrologer/${astrologerId}`);
                  } else {
                    router.replace('/orders');
                  }
                }
              }}
              onGoHome={() => {
                // setShowContinueModal(false); // Prevents UI flash
                router.replace('/ai-astrologer-chat');
              }}
              astrologer={{ _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } }}
              type="call"
              isProcessing={isCallProcessing}
            onSubmitRating={handleSubmitRating}
              onContinue={async () => {
                try {
                  if (orderId?.startsWith('AI-VC-')) {
                    // AI Voice Call Continuation
                    const storedIntake = localStorage.getItem(`ai-chat-intake-${orderId}`);
                    let intakeData = null;
                    if (storedIntake) {
                      try {
                        intakeData = JSON.parse(storedIntake);
                      } catch (e) {
                        console.error('Failed to parse stored intake', e);
                      }
                    }

                    const res = await aiAstrologerService.startAiVoiceCall(
                      astrologerId,
                      user?._id || '',
                      'English',
                      intakeData ? {
                        name: intakeData.name,
                        dateOfBirth: intakeData.date,
                        timeOfBirth: intakeData.time,
                        placeOfBirth: intakeData.place,
                        query: intakeData.query || ''
                      } : undefined
                    );

                    if (res.success && res.sessionId) {
                      if (intakeData) {
                        localStorage.setItem(`ai-chat-intake-${res.sessionId}`, JSON.stringify(intakeData));
                      }
                      console.log('🔄 [Call] Redirecting to new session:', res.sessionId);
                      const encodedImage = encodeURIComponent(astrologerImage || '');
                      
                      // Cleanup current session before moving to next
                      cleanup();

                      router.push(`/call/${res.sessionId}?type=audio&name=${encodeURIComponent(astrologerName)}&rate=${callRate}&astrologerId=${astrologerId}&orderId=${res.orderId}&image=${encodedImage}`);
                      setShowContinueModal(false);
                    } else {
                      toast.error(res.message || 'Failed to initiate call');
                    }
                  } else {
                    // Standard Call Continuation
                    const res = await continueCall(sessionId, { _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } } as any, callType);
                    if (res.success) {
                      setShowContinueModal(false);
                      // Trigger re-setup
                      router.replace(`${window.location.pathname}?${searchParams.toString()}&t=${Date.now()}`);
                    }
                  }
                } catch (error: any) {
                  console.error('Error continuing call:', error);
                  toast.error('Failed to continue call');
                }
              }}
            />
            {!showContinueModal && (aiProvider as any) === 'agora' && (
              <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-md">
                <ContinueChatOfferCard
                  astrologer={{ _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } }}
                  type="call"
                  onContinue={async () => {
                    const res = await continueCall(sessionId, { _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } } as any, callType);
                    if (res.success) {
                      setShowContinueModal(false);
                      // Trigger re-setup
                      router.replace(`${window.location.pathname}?${searchParams.toString()}&t=${Date.now()}`);
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
      </>
    );
  }

  // ========== AUDIO CALL RENDER ==========
  if (callType === 'audio' && !showContinueModal) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-slate-700 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Timer Badge (Top) */}
        {isCallActive && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full shadow-lg ${
                remainingTime < 60
                  ? 'bg-red-500 animate-pulse shadow-red-400/50'
                  : 'bg-green-500 shadow-green-400/50'
              }`}
            ></div>
            <span className="font-mono text-xl font-semibold tracking-wide text-white">
              {formatTime(remainingTime)}
            </span>
          </div>
        )}

        {/* Low Balance Banner */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <LowBalanceBanner
            remainingTime={remainingTime}
            onRechargeClick={() => setShowRechargeModal(true)}
          />
        </div>

        {/* Avatar with Pulse */}
        <div className="relative mb-10 z-10">
          <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-30 animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="w-40 h-40 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-yellow-500/30 ring-4 ring-blue-400/30 overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600">
            {astrologerImage ? (
              <img 
                src={astrologerImage} 
                alt={astrologerName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl font-bold text-white">
                {astrologerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-3 z-10 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          {astrologerName}
        </h2>

        <div className="flex items-center gap-2 mb-10 z-10">
          <div
            className={`w-2 h-2 rounded-full shadow-lg ${
              isCallActive
                ? 'bg-green-500 shadow-green-400/50'
                : 'bg-yellow-400 animate-pulse shadow-yellow-400/50'
            }`}
          ></div>
          <p className="text-blue-200 text-lg">{statusText}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full text-base mb-16 z-10 border border-white/20 shadow-xl">
          <span className="text-blue-100">{t('_sessionId_.rate')}</span>
          <span className="text-yellow-400 font-bold">
            ₹{callRate}{t('_sessionId_._min')}
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-6 z-10">
          <button
            onClick={toggleMic}
            className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
              isMicOn
                ? 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/30 hover:border-yellow-400/50'
                : 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 shadow-red-500/50'
            }`}
          >
            {isMicOn ? (
              <Mic className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <MicOff className="w-6 h-6" strokeWidth={2.5} />
            )}
          </button>

          <button
            onClick={() => handleHangup('ended_by_user')}
            disabled={hasEndedRef.current}
            className="group relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-2xl shadow-red-600/50 transform hover:scale-110 active:scale-95 transition-all duration-300 hover:from-red-600 hover:to-red-800 ring-4 ring-red-500/30 hover:ring-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PhoneOff className="w-8 h-8" strokeWidth={2.5} />
          </button>
        </div>
        {showContinueModal && (
          <PostSessionModal
            isOpen={showContinueModal}
            onClose={() => {
              // Navigate back when modal is closed
              router.replace(astrologerId ? `/astrologer/${astrologerId}` : '/orders');
            }}
            astrologer={{ _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } }}
            type="call"
            isProcessing={isCallProcessing}
            onSubmitRating={handleSubmitRating}
            onGoHome={() => {
              // setShowContinueModal(false); // Keep modal visible during navigation to prevent call screen flash
              router.replace('/');
            }}
            onContinue={async () => {
              const res = await continueCall(sessionId, { _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } } as any, callType);
              if (res.success) {
                setShowContinueModal(false);
                // Trigger re-setup
                router.replace(`${window.location.pathname}?${searchParams.toString()}&t=${Date.now()}`);
              }
            }}
          />
        )}

      </div>
    );
  }

  // ========== VIDEO CALL RENDER ==========
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-800 to-blue-900 overflow-hidden">
      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900 to-slate-800">
        <div ref={remoteVideoRef} className="w-full h-full" style={{ backgroundColor: '#1e293b' }} />

        {!remoteUserJoined && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-blue-900/30 backdrop-blur-md px-10 py-8 rounded-2xl border border-blue-400/30 shadow-2xl">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20">
                  {astrologerImage ? (
                    <img src={astrologerImage} alt={astrologerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
                      {astrologerName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-blue-100 text-lg">{statusText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Small, Top Right) */}
      {isEngineReady && (
        <div className="absolute top-6 right-6 w-36 h-52 bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl overflow-hidden border-2 border-yellow-400/50 shadow-2xl shadow-blue-900/50 z-20 ring-2 ring-blue-400/20">
          <div
            ref={localVideoRef}
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#1e293b' }}
          ></div>
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/90 backdrop-blur-sm">
              <VideoOff className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          )}
        </div>
      )}

      {/* Top Overlay (Timer + Info) */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                remainingTime < 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`}
            ></div>
            <span className="font-mono text-2xl font-semibold tracking-wide text-yellow-300">
              {formatTime(remainingTime)}
            </span>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-950 px-6 py-2.5 rounded-full text-base font-bold shadow-lg shadow-yellow-500/30">
            ₹{callRate}{t('_sessionId_._min')}
          </div>
        </div>
      </div>

      {/* Low Balance Banner */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-sm px-4">
        <LowBalanceBanner
          remainingTime={remainingTime}
          onRechargeClick={() => setShowRechargeModal(true)}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`group w-16 h-16 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 ${
            isMicOn ? 'bg-white/20 border-2 border-white/30' : 'bg-red-500'
          }`}
        >
          {isMicOn ? (
            <Mic className="w-6 h-6 text-white" strokeWidth={2.5} />
          ) : (
            <MicOff className="w-6 h-6 text-white" strokeWidth={2.5} />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`group w-16 h-16 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 ${
            isVideoOn ? 'bg-white/20 border-2 border-white/30' : 'bg-blue-600'
          }`}
        >
          {isVideoOn ? (
            <Video className="w-6 h-6 text-white" strokeWidth={2.5} />
          ) : (
            <VideoOff className="w-6 h-6 text-white" strokeWidth={2.5} />
          )}
        </button>

        <button
          onClick={() => handleHangup('ended_by_user')}
          disabled={hasEndedRef.current}
          className="group w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PhoneOff className="w-8 h-8 text-white" strokeWidth={2.5} />
        </button>
      </div>

      <QuickRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        ratePerMinute={callRate}
        astrologerName={astrologerName}
      />
      {showContinueModal && (
        <>
          <PostSessionModal
            isOpen={showContinueModal}
            onClose={() => setShowContinueModal(false)}
            onGoHome={() => {
              setShowContinueModal(false);
              router.replace('/');
            }}
            astrologer={{ _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } }}
            type="call"
            isProcessing={isCallProcessing}
            onSubmitRating={handleSubmitRating}
            onContinue={async () => {
              try {
                if (orderId?.startsWith('AI-VC-')) {
                  // AI Voice Call Continuation
                  const storedIntake = localStorage.getItem(`ai-chat-intake-${orderId}`);
                  let intakeData = null;
                  if (storedIntake) {
                    try {
                      intakeData = JSON.parse(storedIntake);
                    } catch (e) {
                      console.error('Failed to parse stored intake', e);
                    }
                  }

                  const res = await aiAstrologerService.startAiVoiceCall(
                    astrologerId,
                    user?._id || '',
                    'English', // Default or from intake
                    intakeData ? {
                      name: intakeData.name,
                      dateOfBirth: intakeData.date,
                      timeOfBirth: intakeData.time,
                      placeOfBirth: intakeData.place,
                      query: intakeData.query || ''
                    } : undefined
                  );

                  if (res.success && res.sessionId) {
                    // Save intake for NEW sessionId (AI voice uses sessionId as key in some places)
                    if (intakeData) {
                      localStorage.setItem(`ai-chat-intake-${res.sessionId}`, JSON.stringify(intakeData));
                    }
                    console.log('🔄 [Call] Redirecting to new session:', res.sessionId);
                    const encodedImage = encodeURIComponent(astrologerImage || '');
                    
                    // Cleanup current session before moving to next
                    cleanup();

                    router.push(`/call/${res.sessionId}?type=audio&name=${encodeURIComponent(astrologerName)}&rate=${callRate}&astrologerId=${astrologerId}&orderId=${res.orderId || ''}&image=${encodedImage}`);
                    setShowContinueModal(false);
                  } else {
                    toast.error(res.message || 'Failed to initiate call');
                  }
                } else {
                  // Standard Call Continuation
                  const res = await continueCall(sessionId, { _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } } as any, callType);
                  if (res.success) {
                    setShowContinueModal(false);
                    cleanup();
                    // Trigger re-setup
                    router.replace(`${window.location.pathname}?${searchParams.toString()}&t=${Date.now()}`);
                  }
                }
              } catch (error: any) {
                console.error('Error continuing call:', error);
                toast.error('Failed to continue call');
              }
            }}
          />

        </>
      )}
      
      {showContinueModal && (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 text-center">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
            <PhoneOff className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Call Ended</h1>
          <p className="text-gray-400 mb-8 max-w-xs">Your consultation with {astrologerName} has finished.</p>
          
          <button 
            onClick={() => router.push('/ai-chat-history')}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-full font-bold transition-all shadow-lg shadow-orange-600/20"
          >
            Go to History
          </button>

          <PostSessionModal
            isOpen={showContinueModal}
            onClose={() => {
              setShowContinueModal(false);
              if (astrologerId) {
                router.replace(`/ai-astrologer/${astrologerId}`);
              } else {
                router.replace('/ai-chat-history');
              }
            }}
            onGoHome={() => {
              setShowContinueModal(false);
              router.replace('/ai-astrologer-chat');
            }}
            astrologer={{ _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } }}
            type="call"
            isProcessing={isCallProcessing}
            onSubmitRating={handleSubmitRating}
            onContinue={async () => {
              try {
                if (orderId?.startsWith('AI-VC-')) {
                  // AI Voice Call Continuation
                  const storedIntake = localStorage.getItem(`ai-chat-intake-${orderId}`);
                  let intakeData = null;
                  if (storedIntake) {
                    try {
                      intakeData = JSON.parse(storedIntake);
                    } catch (e) {
                      console.error('Failed to parse stored intake', e);
                    }
                  }

                  const res = await aiAstrologerService.startAiVoiceCall(
                    astrologerId,
                    user?._id || '',
                    'English',
                    intakeData ? {
                      name: intakeData.name,
                      dateOfBirth: intakeData.date,
                      timeOfBirth: intakeData.time,
                      placeOfBirth: intakeData.place,
                      query: intakeData.query || ''
                    } : undefined
                  );

                  if (res.success && res.sessionId) {
                    if (intakeData) {
                      localStorage.setItem(`ai-chat-intake-${res.sessionId}`, JSON.stringify(intakeData));
                    }
                    console.log('🔄 [Call] Redirecting to new AI session:', res.sessionId);
                    const encodedImage = encodeURIComponent(astrologerImage || '');
                    
                    // Cleanup current session before moving to next
                    cleanup();

                    router.push(`/call/${res.sessionId}?type=audio&name=${encodeURIComponent(astrologerName)}&rate=${callRate}&astrologerId=${astrologerId}&orderId=${res.orderId || ''}&image=${encodedImage}`);
                    setShowContinueModal(false);
                  } else {
                    toast.error(res.message || 'Failed to initiate call');
                  }
                } else {
                  // Standard Call Continuation
                  const res = await continueCall(sessionId, { _id: astrologerId, name: astrologerName, profileImage: astrologerImage, pricing: { call: callRate } } as any, callType);
                  if (res.success) {
                    setShowContinueModal(false);
                    cleanup();
                    // Trigger re-setup
                    router.replace(`${window.location.pathname}?${searchParams.toString()}&t=${Date.now()}`);
                  }
                }
              } catch (error: any) {
                console.error('Error continuing call:', error);
                toast.error('Failed to continue call');
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function CallScreen() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-4" />
          <p className="text-blue-200">{t('_sessionId_.initializing_secure_line')}</p>
        </div>
      }
    >
      <CallContent />
    </Suspense>
  );
}