'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRealTime } from '../../context/RealTimeContext';

export default function CallWaitingModal() {
  const { callWaitingVisible, pendingCallSession, cancelCall, continueCall, isCallProcessing } = useRealTime();
  const [timeLeft, setTimeLeft] = useState(60); // Reduced from 3 minutes to 1 minute
  const [isRetrying, setIsRetrying] = useState(false);
  const reconnectTriggeredRef = useRef(false);

  const handleReconnect = async () => {
    if (!pendingCallSession || isRetrying || isCallProcessing || reconnectTriggeredRef.current) return;
    
    reconnectTriggeredRef.current = true;
    console.log('🔄 [CallWaiting] Automatically triggering reconnect API...');
    setIsRetrying(true);
    
    try {
      const res = await continueCall(
        pendingCallSession.sessionId, 
        pendingCallSession.astrologer as any, 
        pendingCallSession.callType
      );
      
      if (res.success) {
        console.log('✅ [CallWaiting] Reconnect API triggered successfully');
        // Reset timer to give another minute for the astrologer to join
        setTimeLeft(60);
      } else {
        console.error('❌ [CallWaiting] Reconnect attempt failed:', res.message);
      }
    } catch (error) {
      console.error('❌ [CallWaiting] Error during reconnect:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!callWaitingVisible || !pendingCallSession) {
      setTimeLeft(60);
      setIsRetrying(false);
      reconnectTriggeredRef.current = false;
      return;
    }

    // Safety shield: If this is an AI session, ignore the background countdown timer and do not reconnect
    const isAiSession = pendingCallSession.sessionId?.startsWith('AI_VOICE_') || pendingCallSession.orderId?.startsWith('AI-VC-');
    if (isAiSession) {
      console.log('🤖 [CallWaiting] AI session detected, skipping auto-reconnect timer');
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleReconnect(); // Automatically trigger reconnect API instead of cancelling
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callWaitingVisible, pendingCallSession, isCallProcessing]); // Added isCallProcessing to deps

  return null; // Force hide as per user request to avoid "Calling astrologer..." state

}
