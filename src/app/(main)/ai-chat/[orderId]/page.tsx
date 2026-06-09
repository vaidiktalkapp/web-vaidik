'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import aiSocketService from '@/lib/aiSocketService';
import aiAstrologerService, { AiChatMessage, AiAstrologer } from '@/lib/aiAstrologerService';
import { Send, Clock, Wallet, LogOut, MessageCircle, Sparkles, User, Info, Languages, Star, Shield, Zap, Moon, Sun, Heart, ChevronDown, ThumbsUp, ThumbsDown, Copy, Share2, Volume2, Check, RefreshCw, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { renderMessageContent } from '@/lib/renderUtils';
import LowBalanceBanner from '@/components/chat/LowBalanceBanner';
import QuickRechargeModal from '@/components/chat/QuickRechargeModal';
import PostSessionModal from '@/components/chat/PostSessionModal';
import ContinueChatOfferCard from '@/components/chat/ContinueChatOfferCard';
import { orderService } from '@/lib/orderService';
import chatService from '@/lib/chatService';

const MANTRA_ROTATION_SPEED_MS = 4000;

const ChatPage = () => {
    const { t } = useTranslation();

  const params = useParams();
  const orderId = params.orderId as string;
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [astrologer, setAstrologer] = useState<AiAstrologer | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState({ duration: 0, currentCost: 0, walletBalance: user?.wallet?.balance || 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`ai-chat-intake-${orderId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return data.language || 'English';
        } catch (e) {
          return 'English';
        }
      }
    }
    return 'English';
  });
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // ✅ Added for smart scroll detection
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ✅ Robust typing indicator management
  const userAtBottomRef = useRef(true); // ✅ Track if user is currently at the bottom
  const hasSentIntake = useRef(false);

  // ✅ Missing system refs
  const socketConnected = useRef(false);
  const listenersAttached = useRef(false);
  const activeSessionRef = useRef<string | null>(null);
  const hasEmittedIntake = useRef(false);
  const isInitialLoad = useRef(true);
  const notifiedThresholds = useRef<Set<number>>(new Set());

  // Use astrologer's languages if available, otherwise default set
  const languages = astrologer?.languages && astrologer.languages.length > 0 ?
  astrologer.languages :
  ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];

  // Spiritual mantras for blessings
  const spiritualBlessings = [
  "ॐ शांति शांति शांति",
  "सर्वे भवन्तु सुखिनः",
  "ॐ नमः शिवाय",
  "ॐ गं गणपतये नमः",
  "जय श्री राम",
  "हरे कृष्ण हरे राम"];


  const [currentMantra, setCurrentMantra] = useState(spiritualBlessings[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMantra((prev) => {
        const currentIndex = spiritualBlessings.indexOf(prev);
        const nextIndex = (currentIndex + 1) % spiritualBlessings.length;
        return spiritualBlessings[nextIndex];
      });
    }, MANTRA_ROTATION_SPEED_MS);

    return () => clearInterval(interval);
  }, []);

  // Preload and monitor SpeechSynthesis voices to prevent foreign fallback
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
        console.log('🔊 [TTS] Loaded voices:', voicesRef.current.length);
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Initialize and check auth
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('🔐 [AI Chat] Auth State:', {
      isAuthenticated,
      authLoading,
      orderId,
      hasUser: !!user
    });

    // CRITICAL: Only redirect if auth has DEFINITELY finished loading and user is NOT authenticated
    // Don't redirect during initial auth loading to prevent premature redirects
    if (!authLoading && isAuthenticated === false) {
      console.warn('🔒 [AI Chat] Not authenticated after auth check completed, redirecting to home...');
      toast.error('Please login to access AI chat');
      router.push('/');
      return;
    }

    // Fetch data only when authenticated and auth loading is complete
    if (isAuthenticated && !authLoading && orderId) {
      console.log('✅ [AI Chat] Authenticated, fetching chat data for order:', orderId);

      // ✅ RESET STATE to prevent flickering from previous session
      if (activeSessionRef.current !== orderId) {
        setMessages([]);
        setSession(null);
        setAstrologer(null);
        setTimer({ duration: 0, currentCost: 0, walletBalance: user?.wallet?.balance || 0 });
        hasSentIntake.current = false;
        hasEmittedIntake.current = false;
        isInitialLoad.current = true;
        // Do NOT reset socketConnected here as we might reuse connection, 
        // but fetch data will handle re-joining rooms.
        activeSessionRef.current = orderId;
      }

      fetchData();
    } else if (!authLoading && isAuthenticated && !orderId) {
      console.error('❌ [AI Chat] Missing order ID');
      toast.error('Invalid chat session');
      router.push('/ai-chat-history');
    }
  }, [orderId, isAuthenticated, authLoading]);

  const setupSocketListeners = () => {
    // 1. Listen for new messages
    const handleNewMessage = (rawData: any) => {
      console.log('📩 [AI Chat] Raw Socket Payload:', rawData);

      // Normalize message - carefully handle if data is nested
      const data = rawData && typeof rawData.message === 'object' ?
      { ...rawData, ...rawData.message } :
      rawData;

      console.log('📩 [AI Chat] Normalized Message:', data);

      // Stop typing indicator immediately
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsTyping(false);

      const currentSessionId = activeSessionRef.current || orderId;
      const msgSessionId = data.sessionId || data.orderId;

      if (!currentSessionId) {
        console.warn('⚠️ [AI Chat] Ignoring message - No session context');
        return;
      }

      // Allow if it matches current sessionId OR the initial orderId
      const isMatch = msgSessionId === currentSessionId || msgSessionId === orderId;

      if (!isMatch) {
        console.warn(`⚠️ [AI Chat] Ignoring message from different session: ${msgSessionId}. Expected: ${currentSessionId} or ${orderId}`);
        return;
      }

      setMessages((prev) => {
        // Prevent duplicates using both id and messageId for robustness
        if (prev.some((m) => data._id && m._id === data._id || data.messageId && m.messageId === data.messageId)) return prev;

        // Remove optimistic message if this is the real one
        // (Assuming optimistic ID matches or content matches)
        const withoutOptimistic = prev.filter((m) =>
        !m._id?.toString().startsWith('temp-') ||
        m.content !== data.content
        );

        return [...withoutOptimistic, {
          ...data,
          content: data.content || data.message || (typeof data === 'string' ? data : ''),
          senderModel: data.sender || data.senderModel || 'Astrologer', // Normalize sender
          sentAt: data.createdAt || data.sentAt || new Date().toISOString()
        }];
      });

      scrollToBottom();
    };

    if (!listenersAttached.current) {
      console.log('🎧 [AI Chat] setting up socket listeners...');

      aiSocketService.on('ai_message', handleNewMessage);

      aiSocketService.on('ai_typing', (data: {sessionId?: string;orderId?: string;isTyping?: boolean;}) => {
        // Only show if for this session
        if (activeSessionRef.current && data.sessionId === activeSessionRef.current || data.orderId === orderId) {
          const shouldBeTyping = data.isTyping !== undefined ? !!data.isTyping : true;
          setIsTyping(shouldBeTyping);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }

          if (shouldBeTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              typingTimeoutRef.current = null;
            }, 6000); // 6s safety clear
          }

          if (userAtBottomRef.current) {
            scrollToBottom();
          }
        }
      });

      aiSocketService.on('timer_update', (data: {sessionId?: string;orderId?: string;duration: number;currentCost?: number;walletBalance: number;}) => {
        // Updated timer logic
        if (data.sessionId === activeSessionRef.current || data.orderId === orderId) {
          setTimer({
            duration: data.duration,
            currentCost: data.currentCost || data.duration * ((astrologer as any)?.charges || 0) / 60,
            walletBalance: data.walletBalance
          });
        }
      });

      // Handle suggestions
      aiSocketService.on('suggestions', (data: string[]) => {
        console.log('💡 [AI Chat] Received suggestions:', data);
        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      });

      // Handle chat error
      aiSocketService.on('chat_error', (data: {message: string;error?: string;}) => {
        console.error('❌ [AI Chat] Chat Error:', data);
        setChatError(data.message);
        toast.error(data.message || 'Celestial connection lost');
        setIsTyping(false);
      });

      // Handle session ended
      aiSocketService.on('session_ended', (data: {sessionId?: string;orderId?: string;reason?: string;}) => {
        if (data.sessionId === activeSessionRef.current || data.orderId === orderId) {
          console.log('🛑 [AI Chat] Session Ended:', data.reason);

          const reasonMap: Record<string, string> = {
            'user_ended': 'Completed by User',
            'low_balance': 'Insufficient Balance',
            'timeout': 'Session Timed Out',
            'error': 'System Connection Error',
            'completed': 'Consultation Completed'
          };

          const displayReason = reasonMap[data.reason || ''] || data.reason || 'Completed';
          toast('Session Ended: ' + displayReason);
          setIsSessionEnded(true);
          setShowContinueModal(true);
        }
      });

      listenersAttached.current = true;
    }
  };

  const cleanupSocketListeners = () => {
    aiSocketService.off('ai_message');
    aiSocketService.off('ai_typing');
    aiSocketService.off('timer_update');
    aiSocketService.off('suggestions');
    aiSocketService.off('chat_error');
    aiSocketService.off('session_ended');
    listenersAttached.current = false;
  };

  useEffect(() => {
    return () => {
      console.log('🧹 [AI Chat] Component unmounting, cleaning up socket listeners...');
      cleanupSocketListeners();
      if (activeSessionRef.current && user?._id) {
         aiSocketService.leaveSession(activeSessionRef.current, user._id);
      }
    };
  }, [user?._id]);

  const fetchData = async () => {
    // ✅ FIX: If modal is already shown (session ended), don't fetch or redirect
    if (showContinueModal) {
      console.log('⏭️ [AI Chat] Skipping fetch - session already ended/modal shown');
      return;
    }

    try {
      // Validate order ID before proceeding
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        console.error('❌ [AI Chat] Invalid Order ID:', orderId);
        toast.error("Invalid chat session. Please start a new consultation.");
        setTimeout(() => router.push('/ai-chat-history'), 1500);
        return;
      }

      console.log('📡 [AI Chat] Fetching conversation data for order:', orderId);
      setLoading(true);

      // Fetch conversation with error handling
      const conversation = await aiAstrologerService.getAiChatConversation(orderId);

      // Validate conversation data
      if (!conversation || !conversation._id) {
        console.error('❌ [AI Chat] Invalid conversation data received:', conversation);
        // ✅ Guard: Only redirect if NOT showing the end-session modal
        if (!showContinueModal) {
          toast.error("Failed to load chat session. Redirecting to history...");
          setTimeout(() => router.push('/ai-chat-history'), 2000);
        }
        return;
      }

      // Set astrologer with validation
      if (conversation.astrologer) {
        console.log('✅ [AI Chat] Setting astrologer:', conversation.astrologer.name);
        setAstrologer(conversation.astrologer);
        toast.success(`Connected with ${conversation.astrologer.name}`);
      } else {
        console.warn('⚠️ [AI Chat] Astrologer data missing in conversation');
        toast('Loading astrologer details...', { icon: '⏳' });
        // Don't fail completely - the service should populate astrologer in normalization
      }

      // We need session info for the timer
      setSession(conversation);

      // Resilient session ID extraction
      if (conversation.activeSession?.sessionId) {
        activeSessionRef.current = conversation.activeSession.sessionId;
      } else if (conversation.sessionId) {
        activeSessionRef.current = conversation.sessionId;
      } else if (conversation._id && conversation._id !== orderId) {
        activeSessionRef.current = conversation._id;
      }

      // Sync wallet balance if user is loaded
      if (user?.wallet?.balance !== undefined) {
        setTimer((prev) => ({ ...prev, walletBalance: user.wallet.balance }));
      }

      // Check if session is already ended
      if (conversation.status === 'ended') {
        setIsSessionEnded(true);
        setShowContinueModal(true);
        // Do not connect socket or load optimistic messages if already ended
        return;
      }

      // 1. Identify locked content types unique to this chat
      const history = conversation.messages || [];
      const hasIntakeInHistory = history.some((m) => m.content?.startsWith("Below are my details:"));

      setMessages((prev) => {
        // 2. Filter PREVIOUS messages (optimistic ones)
        const cleanPrev = prev.filter((m) => {
          const isTemp = m._id?.toString().startsWith('temp-');

          // A. Remove temp intake if valid one exists in history
          if (isTemp && m.content?.startsWith("Below are my details:") && hasIntakeInHistory) {
            return false;
          }

          // B. Remove temp greeting if real greeting (astrologer msg) exists in history
          const hasRealGreeting = history.some((hm) => hm.senderModel === 'AiAstrologer');
          if (isTemp && m._id?.toString().startsWith('temp-greeting') && hasRealGreeting) {
            return false;
          }

          // C. General Content Match
          const isMatch = history.some((hm) => hm.content?.trim() === m.content?.trim());
          if (isTemp && isMatch) return false;

          return true;
        });

        const combined = [...cleanPrev, ...history];

        // 3. Final Unique Pass (Dedup by ID)
        const unique = [];
        const seen = new Set();
        let foundIntake = false;

        for (const m of combined) {
          const id = m._id?.toString();

          if (m.content?.startsWith("Below are my details:")) {
            if (foundIntake) continue;
            foundIntake = true;
          }

          if (id && !seen.has(id)) {// Added id check
            seen.add(id);
            unique.push(m);
          }
        }

        return unique.sort((a, b) => {
          const idA = a._id?.toString(); // Added null/undefined check
          const idB = b._id?.toString(); // Added null/undefined check
          if (idA?.startsWith('temp-greeting')) return 1; // Added null/undefined check
          if (idB?.startsWith('temp-greeting')) return -1; // Added null/undefined check
          const timeA = a.sentAt ? new Date(a.sentAt).getTime() : 0; // Added null/undefined check
          const timeB = b.sentAt ? new Date(b.sentAt).getTime() : 0; // Added null/undefined check
          return timeA - timeB;
        });
      });

      // Connect socket
      const token = localStorage.getItem('accessToken');
      if (token && !socketConnected.current) {
        await aiSocketService.connect(token, user?._id);
        setupSocketListeners();
        socketConnected.current = true;

        if (user?._id) {
          aiSocketService.joinSession(
            conversation.sessionId || orderId,
            user._id,
            orderId
          );

          // ✅ TRIGGER: Send intake details via socket to trigger specialized greeting
          // ✅ TRIGGER: Send intake details via socket to trigger specialized greeting
          // ONLY if no history exists (prevents duplicates on reload)
          const storedIntake = localStorage.getItem(`ai-chat-intake-${orderId}`);

          if (storedIntake && !hasEmittedIntake.current && history.length === 0) {
            hasEmittedIntake.current = true;
            const intakeData = JSON.parse(storedIntake);

            const initialMsg = `Below are my consultation details:
Name: ${intakeData.name || 'User'}
Gender: ${intakeData.gender || 'Unknown'}
Date: ${intakeData.date}
Time: ${intakeData.time}
Place: ${intakeData.place}
Marital Status: ${intakeData.maritalStatus || 'Single'}
Occupation: ${intakeData.occupation || 'Employee'}`;

            // Add optimistic message locally
            const optimisticMsg = {
              _id: 'temp-intake-' + Date.now(),
              senderModel: 'User',
              content: initialMsg,
              sentAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, optimisticMsg]);

            aiSocketService.sendMessage(
              conversation.sessionId || orderId,
              initialMsg,
              user._id,
              orderId
            );
          }

        }
      }
    } catch (error: any) {
      console.error('❌ [AI Chat] Fetch Data Error:', error);

      // Handle specific error types
      if (error.response?.status === 404) {
        console.error('❌ [AI Chat] Chat session not found (404)');
        // ✅ Guard: Only redirect if NOT showing the end-session modal
        if (!showContinueModal) {
          toast.error("Chat session not found. Redirecting to history...");
          setTimeout(() => router.push('/ai-chat-history'), 2000);
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('❌ [AI Chat] Authentication error:', error.response?.status);
        toast.error("Session expired. Please login again.");
        setTimeout(() => router.push('/'), 2000);
      } else if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
        console.error('❌ [AI Chat] Backend connection failed');
        toast.error("Unable to connect to server. Please check your connection and try again.");
      } else {
        console.error('❌ [AI Chat] Unexpected error:', error.message);
        toast.error(error.response?.data?.message || "Failed to load conversation. Please try again.");
        setTimeout(() => router.push('/ai-chat-history'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    // Local timer ticker as fallback
    // If socket is connected, we rely on server updates to prevent fluctuation
    if (loading || !astrologer) return;

    const interval = setInterval(() => {
      // If the socket is connected, we rely on server timer updates
      if (aiSocketService.isConnected()) return;

      setTimer((prev) => {
        // If we have a start time from the session, use that for accuracy
        let newDuration = prev.duration + 1;

        if (session?.startedAt || (session as any)?.startTime) {
          const start = new Date(session?.startedAt || (session as any)?.startTime).getTime();
          const now = Date.now();
          newDuration = Math.floor((now - start) / 1000);
        }

        const rate = (astrologer as any)?.chatRate || (astrologer as any)?.rate || 0;
        const estimatedCost = Math.ceil(newDuration / 60 * rate);

        return {
          ...prev,
          duration: newDuration,
          currentCost: rate > 0 ? estimatedCost : prev.currentCost
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, astrologer, session, socketConnected.current]);

  // Low Balance Proactive Notifications
  useEffect(() => {
    if (!astrologer || loading) return;

    const rate = (astrologer as any)?.chatRate || 10;
    const currentBalance = Math.max(0, timer.walletBalance - timer.currentCost);
    const remainingSeconds = rate > 0 ? (currentBalance / rate) * 60 : 0;

    if (remainingSeconds <= 0) return;

    // 5 Minute Warning (300s)
    if (remainingSeconds <= 300 && remainingSeconds > 290 && !notifiedThresholds.current.has(300)) {
      toast.error("Low Balance! Approximately 5 minutes remaining.", {
        icon: '⚠️',
        duration: 5000,
        position: 'top-center'
      });
      notifiedThresholds.current.add(300);
    }

    // 2 Minute Warning (120s)
    if (remainingSeconds <= 120 && remainingSeconds > 110 && !notifiedThresholds.current.has(120)) {
      toast.error("Critical Balance! Less than 2 minutes left. Please recharge to avoid disconnection.", {
        icon: '🚨',
        duration: 6000,
        position: 'top-center'
      });
      notifiedThresholds.current.add(120);
    }

    // 1 Minute Auto-Popup (60s)
    if (remainingSeconds <= 60 && remainingSeconds > 50 && !notifiedThresholds.current.has(60)) {
      setShowRechargeModal(true);
      notifiedThresholds.current.add(60);
    }

    // Reset thresholds if balance increases significantly (recharge)
    if ((timer.walletBalance - timer.currentCost) / rate * 60 > 360) {
      notifiedThresholds.current.clear();
    }
  }, [timer.walletBalance, timer.currentCost, astrologer, loading]);



  useEffect(() => {
    // Only auto-scroll if user is at bottom OR it is the very first load
    if (userAtBottomRef.current || isInitialLoad.current) {
      scrollToBottom(isInitialLoad.current);
    }

    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
    }
  }, [messages, isTyping]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    // If the distance from bottom is less than 100px, consider user "at bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    userAtBottomRef.current = atBottom;
  };

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? 'auto' : 'smooth',
      block: 'end'
    });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user?._id || !astrologer) return;

    const msgText = input.trim();
    
    // Prevent sending if not connected
    if (!aiSocketService.isConnected()) {
      toast.error('Connection lost. Please wait while we reconnect...', { id: 'conn_err' });
      return;
    }

    setInput('');
    setSuggestions([]); // Clear suggestions on new message
    setChatError(null); // Clear previous errors

    // Optimistic Update
    const optimisticMsg = {
      _id: 'temp-manual-' + Date.now(),
      senderModel: 'User',
      content: msgText,
      sentAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const socket = aiSocketService.getSocket();
    if (socket) {
      console.log('📤 [AI Chat] Sending message:', msgText);

      const sessionIdToUse = activeSessionRef.current || orderId;
      aiSocketService.sendMessage(sessionIdToUse, msgText, user._id, orderId);

      // Force scroll to bottom when USER sends message
      setTimeout(() => scrollToBottom(), 100);
    }

    setSuggestions([]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Divine Guidance from Vaidik Talk',
          text: text,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy(text, 'share-temp');
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Determine if text is primarily Hindi / Devanagari / Hinglish
      const isHindi = /[\u0900-\u097F]/.test(text) || text.toLowerCase().includes('kundli') || text.toLowerCase().includes('graha') || text.toLowerCase().includes('rashi');
      
      // Force the utterance language code to trigger Indian Speech Engine in OS/Browser
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Slightly measured, professional Indian astrologer pace

      // Try to find a good Indian/Hindi or Indian English voice from preloaded ref or active getVoices
      const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
      
      const preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        if (isHindi) {
          return lang.includes('hi-in') || name.includes('hindi') || name.includes('swara') || name.includes('neerja') || name.includes('lekha');
        } else {
          return lang.includes('en-in') || name.includes('india') || name.includes('neerja') || name.includes('prabhat');
        }
      }) || voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('en-IN')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`🔊 [TTS] Selected voice: ${preferredVoice.name} (${preferredVoice.lang}) for text type: ${isHindi ? 'Hindi' : 'English'}`);
      }

      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  const handleFeedback = async (id: string, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [id]: type }));
    
    try {
      await chatService.submitMessageFeedback({
        type: type === 'up' ? 'thumbs_up' : 'thumbs_down',
        messageId: id,
        sessionId: activeSessionRef.current || orderId,
        astrologerId: astrologer?._id,
        astrologerModel: 'AiAstrologerProfile'
      });
      toast.success(type === 'up' ? 'Glad you liked it!' : 'Thanks for the feedback');
    } catch (error) {
      console.error('Feedback submission failed:', error);
      // Fallback: still show success to user for better UX
      toast.success(type === 'up' ? 'Glad you liked it!' : 'Thanks for the feedback');
    }
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    const socket = aiSocketService.getSocket();
    if (socket) {
      // Direct emit if service doesn't have helper yet
      socket.emit('change_ai_language', {
        orderId,
        language: lang
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Optimistic Update
    const optimisticMsg = {
      _id: 'temp-suggestion-' + Date.now(),
      senderModel: 'User',
      content: suggestion,
      sentAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const socket = aiSocketService.getSocket();
    if (socket) {
      console.log('📤 [AI Chat] Sending suggestion:', suggestion);

      const sessionIdToUse = activeSessionRef.current || orderId;
      aiSocketService.sendMessage(sessionIdToUse, suggestion, user?._id || '', orderId);
    }
    setSuggestions([]);
  };

  const handleEndSession = () => {
    setShowEndConfirmModal(true);
  };

  const confirmEndSession = async () => {
    try {
      if (activeSessionRef.current && user?._id) {
        aiSocketService.endChat(activeSessionRef.current, user._id);
      }
      await aiAstrologerService.endAiChat(orderId);
      toast.success('Session ended');
      setIsSessionEnded(true);
      setShowContinueModal(true);
    } catch (error: any) {
      console.error("End session error:", error);
      // If session was already ended or not found, just redirect anyway
      if (error.response?.status === 404 || error.message?.includes('already ended')) {
        setShowContinueModal(true);
      } else {
        toast.error("Failed to end session");
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getImageUrl = (url?: string, name: string = 'AI') => {
    if (url && url.trim() !== '') return url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF8C00&color=fff&bold=true`;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-saffron-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>);

  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-0 md:p-4 flex items-center justify-center overflow-hidden z-50 font-outfit">
      {/* Main Chat Box */}
      <div className="relative flex flex-col bg-gradient-to-br from-saffron-50 via-white to-amber-50 w-full md:max-w-4xl rounded-none md:rounded-3xl overflow-hidden shadow-3xl border-0 md:border-2 border-orange-200 h-full md:h-[95vh] z-10 mx-auto">
        {/* Spiritual Background Patterns */}
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyMCAyMEMxNjYuMiAyMCAyMDQgNTcuOCAyMDQgMTA0QzIwNCAxNTAuMiAxNjYuMiAxODggMTIwIDE4OEM3My44IDE4OCAzNiAxNTAuMiAzNiAxMDRDMzYgNTcuOCA3My44IDIwIDEyMCAyMFoiIGZpbGw9IiNGRjlDMzYiLz48Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMDQiIHI9IjQwIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI4IiBmaWxsPSIjRkY5QzM2Ij7FtTwvdGV4dD48L3N2Zz4=')] bg-repeat" />

        {/* Chat Header */}
        <header className="relative bg-gradient-to-r from-white to-orange-50 border-b-2 border-orange-200 px-2 py-1.5 md:px-4 md:py-2 flex items-center justify-between shadow-sm z-10 shrink-0 backdrop-blur-sm">
          {/* Left: Astrologer Info */}
          <div className="flex items-center space-x-1.5 md:space-x-3 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-full blur opacity-30"></div>
              <img
                src={getImageUrl(astrologer?.profileImage, astrologer?.name)}
                className="relative w-7 h-7 md:w-12 md:h-12 rounded-full object-cover border-1.5 md:border-3 border-white shadow-lg"
                alt={astrologer?.name} />
              
                <div className="absolute bottom-0 right-0 p-[2px] bg-white rounded-full">
                  <div className="w-2 h-2 md:w-3.5 md:h-3.5 bg-orange-500 rounded-full relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 md:gap-2 mb-0 md:mb-1">
                <h2 className="font-bold text-gray-900 text-xs md:text-lg truncate">{astrologer?.name}</h2>
                <Shield className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="flex shrink-0">
                  {[1, 2, 3, 4, 5].map((star) =>
                  <Star key={star} className="w-2 h-2 md:w-3 md:h-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <span className="text-[9px] md:text-xs font-bold text-gray-700">{astrologer?.rating || 4.8}</span>
              </div>
            </div>
          </div>

          {/* Center: Blessing */}
          <div className="flex flex-col items-center gap-0.5 md:gap-2 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMantra}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-[9px] md:text-sm font-black text-orange-800 bg-orange-100/80 px-1.5 md:px-5 py-1 md:py-2.5 rounded-lg md:rounded-2xl border-2 border-orange-200 shadow-sm flex items-center gap-1 md:gap-3 max-w-[100px] md:max-w-none">
                
                <Moon className="w-3 h-3 md:w-5 md:h-5 text-orange-600 shrink-0" />
                <span className="truncate">{currentMantra}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Stats & End Button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Stats Group for Mobile/Desktop */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Timer */}
              <div className="flex flex-col items-center bg-white px-2 md:px-5 py-0.5 md:py-2 rounded-lg md:rounded-2xl border border-orange-100 shadow-sm">
                <div className="flex items-center text-[8px] md:text-xs text-gray-700 font-black uppercase tracking-widest">
                  <Clock className="w-2.5 h-2.5 md:w-4 md:h-4 mr-1 text-orange-600" />
                  <span className="hidden xs:inline">{t("_orderId_.time")}</span>
                </div>
                <div className="text-[11px] md:text-2xl font-black bg-gradient-to-br from-orange-600 to-amber-700 bg-clip-text text-transparent font-mono">
                  {formatDuration(timer.duration)}
                </div>
              </div>

              {/* Balance & Cost */}
              <div className="flex flex-col items-center bg-white px-2 md:px-5 py-0.5 md:py-2 rounded-lg md:rounded-2xl border border-orange-100 shadow-sm">
                <div className="flex items-center text-[8px] md:text-xs text-gray-700 font-black uppercase tracking-widest">
                  <Wallet className="w-2.5 h-2.5 md:w-4 md:h-4 mr-1 text-orange-600" />
                  <span className="hidden xs:inline">{t("_orderId_.bal")}</span>
                </div>
                <div className="flex flex-col items-center -space-y-0.5 md:-space-y-1">
                  <div className="text-[11px] md:text-xl font-black text-green-700">
                    ₹{Math.max(0, Math.floor(timer.walletBalance - timer.currentCost))}
                  </div>
                  {timer.currentCost > 0 &&
                  <div className="text-[7px] md:text-[10px] font-black text-white bg-red-600 px-1 md:px-2 rounded-full shadow-sm animate-pulse">
                      -₹{timer.currentCost}
                    </div>
                  }
                </div>
              </div>
            </div>

            {/* End Session Button */}
            <button
              onClick={handleEndSession}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-1 md:px-4 md:py-2 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1 font-bold text-[10px] md:text-sm shrink-0"
              title="End Session">
              
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="inline">{t("_orderId_.end")}</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <main
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-orange-50/30 to-amber-50/20 relative custom-scrollbar">
          
          
          {/* Low Balance Warning */}
          {(() => {
            const rate = astrologer?.chatRate || 10;
            const remainingSeconds = rate > 0 ? timer.walletBalance / rate * 60 : 0;
            return (
              <div className="sticky top-0 z-50 -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4">
                <LowBalanceBanner
                  remainingTime={remainingSeconds}
                  onRechargeClick={() => setShowRechargeModal(true)} />
                
              </div>);

          })()}

          {/* Welcome Message */}
          {messages.length === 0 &&
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-orange-200">
                  <MessageCircle className="w-10 h-10 text-orange-400" />
                </div>
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-gray-800 text-lg mb-2">{t("_orderId_.start_your_spiritual_consultat")}</h3>
                <p className="text-sm text-gray-600">{t("_orderId_.ask_about_your_career_relation")}</p>
                <div className="mt-4 text-xs text-orange-600 font-bold bg-orange-50/50 px-4 py-2 rounded-lg border border-orange-200">
                  <Heart className="w-3 h-3 inline mr-1" />
{t("_orderId_.your_questions_are_answered_wi")}
              </div>
              </div>
            </div>
          }

          <AnimatePresence>
            {messages.map((msg, idx) => {
              const isAstrologerMsg = msg.senderModel !== 'User' && msg.senderModel !== 'System';
              return (
            <motion.div
              key={msg._id || idx}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className={`flex ${msg.senderModel === 'User' ? 'justify-end' : 'justify-start'}`}>
              
                <div className={`max-w-[85%] px-4 md:px-5 py-3 md:py-4 rounded-[20px] shadow-md relative overflow-hidden ${msg.senderModel === 'User' ?
              'bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-tr-none' :
              msg.senderModel === 'System' ?
              'bg-red-50 border-2 border-red-200 text-red-800 rounded-xl shadow-red-100' :
              'bg-white/80 backdrop-blur-sm text-gray-800 rounded-tl-none border border-orange-100/50 shadow-orange-100/20'}`
              }>

                  {isAstrologerMsg &&
                <div className="flex items-center gap-2 mb-2.5 text-[10px] md:text-[11px] font-black text-orange-700 uppercase tracking-widest opacity-80">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                      {astrologer?.name}
                    </div>
                }

                  <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap relative z-10 font-['Inter',sans-serif] font-medium tracking-tight">
                    {renderMessageContent(msg.content)}
                  </div>

                    <div className={`flex items-center justify-between mt-2.5 pt-2 border-t ${msg.senderModel === 'User' ? 'border-white/10' : 'border-orange-100/50'}`}>
                      <span className={`text-[9px] md:text-[10px] flex items-center gap-1 font-bold tracking-tight opacity-50 ${msg.senderModel === 'User' ? 'text-white' : 'text-orange-800'}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {isAstrologerMsg && (
                        <div className="flex items-center gap-3 md:gap-4">
                          <button 
                            onClick={() => handleCopy(msg.content, msg._id)}
                            className="text-gray-400 hover:text-orange-600 transition-all active:scale-90"
                            title="Copy">
                            {copiedId === msg._id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          
                          <div className="flex items-center gap-2 border-l border-orange-100/50 pl-2 md:pl-3">
                            <button 
                              onClick={() => handleFeedback(msg._id, 'up')}
                              className={`transition-all active:scale-90 ${feedback[msg._id] === 'up' ? 'text-orange-600 scale-110' : 'text-gray-400 hover:text-orange-600'}`}
                              title="Helpful">
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleFeedback(msg._id, 'down')}
                              className={`transition-all active:scale-90 ${feedback[msg._id] === 'down' ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                              title="Not helpful">
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button 
                            onClick={() => handleShare(msg.content)}
                            className="text-gray-400 hover:text-orange-600 transition-all active:scale-90"
                            title="Share">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={() => handleSpeak(msg.content, msg._id)}
                            className={`transition-all active:scale-90 ${speakingId === msg._id ? 'text-orange-600 animate-pulse' : 'text-gray-400 hover:text-orange-600'}`}
                            title="Listen">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <button className="text-gray-300 hover:text-orange-600 transition-all opacity-40 cursor-not-allowed">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          
                          <button className="text-gray-300 hover:text-orange-600 transition-all opacity-40 cursor-not-allowed">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {isAstrologerMsg && !speakingId && (
                        <Sparkles className="w-2.5 h-2.5 text-orange-400/50" />
                      )}
                    </div>
                </div>
              </motion.div>
            );})}

            {isTyping &&
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white border border-orange-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-600 to-amber-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-xs text-gray-600 font-bold">{t("_orderId_.astrologer_is_typing")}</span>
                </div>
              </motion.div>
            }

            {showContinueModal && (
              <ContinueChatOfferCard
                astrologer={astrologer}
                type="chat"
                onContinue={async () => {
                   if (astrologer?._id) {
                     router.push(`/ai-astrologer/${astrologer._id}`);
                   }
                }}
              />
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area - Hidden when session ended */}
        {(!showContinueModal && !isSessionEnded) ? (
          <footer className="relative bg-gradient-to-r from-white to-orange-50 border-t-2 border-orange-200 p-3 md:px-6 md:py-3 shrink-0">
            <div className="max-w-5xl mx-auto">
              {/* Auto-suggestions */}
              {suggestions.length > 0 &&
              <div className="flex overflow-x-auto no-scrollbar gap-2 mb-2 pb-1">
                  {suggestions.map((suggestion, idx) =>
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="whitespace-nowrap bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-xl text-[10px] md:text-xs font-bold hover:from-orange-200 hover:to-amber-200 transition-all shadow-sm active:scale-95">
                  
                      {suggestion}
                    </motion.button>
                )}
                </div>
              }

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="relative">
                <div className="relative flex items-end gap-2">
                  <textarea
                    rows={1}
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || isTyping}
                    className="flex-1 px-5 py-3 md:py-4 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-sm md:text-base font-bold text-gray-900 shadow-lg placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none overflow-hidden min-h-[56px] max-h-48"
                    onInput={(e) => {
                      const target = e.currentTarget as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !loading && !isTyping) {
                          handleSendMessage(e as any);
                        }
                      }
                    }} />
                  
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || isTyping}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white p-2.5 md:p-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none shrink-0">
                    
                    <Send className="w-4 h-4 md:w-5 md:h-5 " />
                  </button>
                </div>

                {/* Footer Info */}
                <div className="mt-2 flex items-center justify-between text-[8px] md:text-[10px] text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center font-bold text-green-600">
                      <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
  {t("_orderId_.live")}
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-2.5 h-2.5 mr-1" />
  {t("_orderId_.secure")}
                    </div>
                  </div>
                  <div className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                    ॐ दिव्य मार्गदर्शन
                  </div>
                </div>
              </form>
            </div>
          </footer>
        ) : isSessionEnded ? (
          <footer className="bg-gray-100 border-t border-gray-300 p-4 text-center">
            <p className="text-gray-600 font-bold">This consultation has ended. Thank you for seeking guidance.</p>
            <button 
              onClick={() => router.push('/ai-chat-history')}
              className="mt-2 text-orange-600 font-bold hover:underline"
            >
              Back to History
            </button>
          </footer>
        ) : null}
      </div>

      {/* Sleek Minimalist End Session Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Soft backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEndConfirmModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />

            {/* Clean Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl text-center z-10 overflow-hidden"
            >
              {/* Subtle top red badge */}
              <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-5 h-5" />
              </div>

              {/* Text details with professional typography */}
              <h3 className="text-lg font-bold text-slate-900">
                End Chat Consultation?
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mt-2 mb-6 font-normal">
                Are you sure you want to end this consultation? This session will be saved in your chat history.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowEndConfirmModal(false);
                    await confirmEndSession();
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                >
                  Yes, End Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuickRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        ratePerMinute={astrologer?.chatRate || 10}
        astrologerName={astrologer?.name || 'Astrologer'}
        onSuccess={(newBalance) => {
          setTimer((prev) => ({ ...prev, walletBalance: newBalance }));
          toast.success('Wallet recharged successfully!');
        }} />

      <PostSessionModal
        isOpen={showContinueModal}
        onClose={() => {
          setShowContinueModal(false);
          if (astrologer?._id) {
            router.replace(`/ai-astrologer/${astrologer._id}`);
          } else {
            router.replace('/ai-chat-history');
          }
        }}
        onGoHome={() => {
          setShowContinueModal(false);
          router.replace('/ai-chat-history');
        }}
        astrologer={astrologer}
        type="chat"
        isProcessing={isProcessing}
        onSubmitRating={async (rating, review) => {
          if (astrologer?._id) {
            try {
              await orderService.addReview(astrologer._id, orderId, rating, review, 'chat');
              toast.success('Review submitted successfully!');
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review';
              toast.error(errorMessage);
              throw error; // Re-throw to prevent false success in UI
            }
          }
        }}
        onContinue={async () => {
          try {
            if (!astrologer?._id) return;
            
            setIsProcessing(true);
            // 1. Get existing intake data for this session
            const storedIntake = localStorage.getItem(`ai-chat-intake-${orderId}`);
            let intakeData = null;
            if (storedIntake) {
              try {
                intakeData = JSON.parse(storedIntake);
              } catch (e) {
                console.error('Failed to parse stored intake', e);
              }
            }

            // 2. Start a new AI chat order
            const order = await aiAstrologerService.startAiChatOrder(
              astrologer._id,
              'chat',
              intakeData ? {
                name: intakeData.name,
                dateOfBirth: intakeData.date,
                timeOfBirth: intakeData.time,
                placeOfBirth: intakeData.place,
                lat: intakeData.lat || '',
                lon: intakeData.lon || '',
                language: intakeData.language || 'English'
              } : undefined
            );

            if (order && order._id) {
              // 3. Save intake for the NEW orderId
              if (intakeData) {
                localStorage.setItem(`ai-chat-intake-${order._id}`, JSON.stringify(intakeData));
              }
              
              toast.success('Restarting consultation...');
              router.push(`/ai-chat/${order._id}`);
              setShowContinueModal(false);
            } else {
              toast.error('Failed to restart chat. Going to profile...');
              router.push(`/ai-astrologer/${astrologer._id}`);
            }
          } catch (error: any) {
            console.error('Error restarting AI chat:', error);
            toast.error(error.message || 'Failed to restart chat');
          } finally {
            setIsProcessing(false);
          }
        }}
      />
    </div>);

};


export default ChatPage;