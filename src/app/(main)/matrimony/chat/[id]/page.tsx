'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowLeft, Loader2, Shield, Heart, Wallet, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { historyApiService } from '@/lib/historyApiService';

export default function MatrimonyChatPage() {
    const params = useParams();
    const router = useRouter();
    const matchId = params.id as string;
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Paid chat state
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    
    const [hasActiveQuota, setHasActiveQuota] = useState(false);
    const [remainingMessages, setRemainingMessages] = useState(0);
    const [hasUnlockedHistory, setHasUnlockedHistory] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const unlockedRef = useRef(false);

    useEffect(() => {
        unlockedRef.current = hasUnlockedHistory;
    }, [hasUnlockedHistory]);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        let activeSocket: Socket | null = null;

        const initChat = async () => {
            if (!historyApiService.isAuthenticated()) {
                router.push('/matrimony');
                return;
            }

            const token = localStorage.getItem('accessToken');
            const cachedUser = localStorage.getItem('userData');
            let userId = '';
            let currentUserObj: any = null;
            
            if (cachedUser) {
                currentUserObj = JSON.parse(cachedUser);
                userId = currentUserObj._id || currentUserObj.id || ''; // Robust check
                setCurrentUser(currentUserObj);
            }

            if (!userId) {
                console.error('❌ [MatrimonyChat] No User ID found in localStorage!');
                return;
            }

            // 1. Fetch chat settings & History
            try {
                const [settingsRes, historyRes] = await Promise.all([
                    apiClient.get('/matrimony-chat/settings'),
                    apiClient.get(`/matrimony-chat/history/${matchId}`)
                ]);

                if (settingsRes.data?.success) {
                    setPricingTiers(settingsRes.data.data.pricingTiers || []);
                }

                if (historyRes.data?.success) {
                    const chatData = historyRes.data.data;
                    setMessages(chatData.messages || []);
                    setHasUnlockedHistory(chatData.hasUnlocked || false);
                    
                    const remaining = chatData.remainingMessages || 0;
                    console.log('📊 [MatrimonyChat] Initial Quota:', remaining);
                    setHasActiveQuota(remaining > 0);
                    setRemainingMessages(remaining);
                }
            } catch (e) { 
                console.error('❌ Data fetch failed', e); 
            } finally {
                setLoading(false);
            }

            // 2. Setup Socket
            const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
            const newSocket = io(`${SOCKET_URL}/matrimony-chat`, {
                auth: { token, userId },
                transports: ['websocket'],
                reconnection: true,
            });

            newSocket.on('connect', () => {
                console.log('🔌 [MatrimonyChat] Socket Connected:', newSocket.id);
                newSocket.emit('join_match_room', { interestId: matchId, userId });
            });

            newSocket.on('receive_matrimony_message', (payload) => {
                console.log('📥 [MatrimonyChat] Incoming Message:', payload);
                const isMe = payload.senderId === userId;
                
                setMessages((prev) => {
                    // 1. Reconcile optimistic messages for the current user
                    if (isMe) {
                        const optIndex = prev.findIndex(m => m.isOptimistic && m.content === payload.content);
                        if (optIndex !== -1) {
                            const updated = [...prev];
                            updated[optIndex] = {
                                ...payload,
                                _id: payload.messageId,
                                isOptimistic: false,
                                isBlurred: false
                            };
                            return updated;
                        }
                    }

                    // 2. Avoid duplicates
                    if (prev.find(m => m._id === payload.messageId)) return prev;

                    const isBlurred = !isMe && !unlockedRef.current;
                    const content = isBlurred ? '•••••••••••••••••••••••••••••' : payload.content;
                    
                    return [...prev, { 
                        _id: payload.messageId, 
                        ...payload, 
                        content, 
                        isBlurred,
                        sentAt: payload.sentAt || new Date().toISOString()
                    }];
                });
            });

            newSocket.on('chat_quota_status', (payload) => {
                console.log('📉 [MatrimonyChat] Quota Update:', payload);
                setHasActiveQuota(payload.hasActiveQuota);
                setRemainingMessages(payload.remainingMessages);
                
                if (payload.hasActiveQuota) {
                    setHasUnlockedHistory(true);
                    setMessages(prev => prev.map(m => ({ ...m, isBlurred: false })));
                }
            });

            newSocket.on('chat_quota_exhausted', (payload) => {
                console.warn('⚠️ [MatrimonyChat] Quota Exhausted:', payload);
                setHasActiveQuota(false);
                setRemainingMessages(0);
            });

            newSocket.on('disconnect', (reason) => {
                console.warn('🔌 [MatrimonyChat] Socket Disconnected:', reason);
            });

            activeSocket = newSocket;
            setSocket(newSocket);
        };

        if (matchId) initChat();

        return () => {
            if (activeSocket) {
                console.log('🔌 [MatrimonyChat] Cleaning up socket...');
                activeSocket.disconnect();
            }
        };
    }, [matchId, router]); // Removed hasUnlockedHistory to fix infinite loop flicker

    const handlePurchase = async (tierIndex: number) => {
        const tier = pricingTiers[tierIndex];
        const confirmMsg = `Are you sure you want to buy the "${tier.label}" for ₹${tier.price}? \n\nThis will unlock chat history and give you ${tier.messageCount} messages.`;
        
        if (!window.confirm(confirmMsg)) return;

        setPurchasing(true);
        try {
            const res = await apiClient.post('/matrimony-chat/purchase', {
                interestId: matchId,
                tierIndex,
            });
            
            if (res.data?.success) {
                const data = res.data.data;
                console.log('💰 [MatrimonyChat] Purchase Successful:', data);
                
                setHasUnlockedHistory(true);
                setHasActiveQuota(true);
                setRemainingMessages(data.remainingMessages);
                setShowPurchaseModal(false);
                alert('✨ Success! Your pack has been activated. You can now chat and see all messages.');
                
                // We'll actually reload the exact chat history so the unblurred contents return
                const histRes = await apiClient.get(`/matrimony-chat/history/${matchId}`);
                if (histRes.data?.success) {
                    setMessages(histRes.data.data.messages);
                }

                // Notify socket room to sync live state
                socket?.emit('purchase_confirmed', {
                    interestId: matchId,
                    userId: currentUser?._id,
                    remainingMessages,
                });
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Purchase failed';
            // Custom redirect to wallet if insufficient
            if (msg.toLowerCase().includes('insufficient')) {
                const shouldRedirect = window.confirm(`${msg}\nWould you like to recharge your wallet now?`);
                if (shouldRedirect) {
                    router.push('/wallet/recharge');
                }
            } else {
                alert(msg);
            }
        }
        setPurchasing(false);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !socket || !currentUser) return;
        
        if (!hasActiveQuota) {
            setShowPurchaseModal(true);
            return;
        }

        const senderId = currentUser._id || currentUser.id;
        const tempId = `temp_${Date.now()}`;
        
        // 1. Optimistic Update
        const optimisticMsg = {
            _id: tempId,
            content: content,
            senderId: senderId,
            sentAt: new Date().toISOString(),
            isOptimistic: true
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        
        // 2. Actual Send
        socket.emit('send_matrimony_message', {
            interestId: matchId,
            senderId: senderId,
            content: content,
        }, (response: any) => {
            if (!response?.success) {
                // Rollback on failure
                setMessages(prev => prev.filter(m => m._id !== tempId));
                setNewMessage(content); // Put text back so user doesn't lose it

                if (response?.message === 'QUOTA_EXHAUSTED') {
                    setHasActiveQuota(false);
                    setRemainingMessages(0);
                    setShowPurchaseModal(true);
                } else {
                    alert(response?.message || 'Failed to send message');
                }
            }
        });
    };

    // The layout is always rendered, but parts are conditionally loading
    return (
        <div className="min-h-screen bg-[#fdf6e3] pb-10">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
                .chat-wrap { font-family: 'Source Sans 3', sans-serif; }
                .chat-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
            `}</style>
            
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-[#d6c89a]/30 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/matrimony" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Link>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 serif flex items-center gap-2">
                                <Heart className="w-4 h-4 text-[#b8962e] fill-current" /> Divine Match Chat
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-black flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Secure & Private
                            </p>
                        </div>
                    </div>

                    {/* Quota Display */}
                    {!loading && (
                        hasActiveQuota ? (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${remainingMessages <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                <MessageSquare className="w-4 h-4" />
                                {remainingMessages} Messages
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowPurchaseModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#b8962e] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#8f7422] transition-colors"
                            >
                                <Wallet className="w-4 h-4" /> Recharge Pack
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Chat Container */}
            <div className="max-w-2xl mx-auto px-4 py-6 chat-wrap">
                <div className="bg-white rounded-[24px] shadow-xl border border-[#d6c89a]/20 h-[60vh] flex flex-col overflow-hidden relative">
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'md.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23b8962e\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

                    {/* Messages Area */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4 z-10 relative scroll-smooth"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                                <Loader2 className="w-10 h-10 text-[#b8962e] animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Syncing scrolls...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                                <Heart className="w-10 h-10 text-[#b8962e]" />
                                <p className="text-sm font-black uppercase tracking-widest text-[#1a1a1a]">Start the divine conversation</p>
                                {!hasActiveQuota && <p className="text-xs text-gray-500">Purchase a message pack to begin chatting</p>}
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = typeof msg.senderId === 'object' ? msg.senderId._id === currentUser?._id : msg.senderId === currentUser?._id;
                                
                                return (
                                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] font-bold leading-relaxed shadow-sm overflow-hidden transition-opacity ${
                                            isMe 
                                                ? 'bg-[#b8962e] text-white rounded-br-sm' 
                                                : 'bg-gray-100 text-[#1a1a1a] rounded-bl-sm border border-gray-200'
                                        } ${msg.isOptimistic ? 'opacity-60' : 'opacity-100'}`}>
                                            {/* Blur Overlay */}
                                            {msg.isBlurred && (
                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100/50 backdrop-blur-[6px]">
                                                    <Shield className="w-4 h-4 text-gray-500 bg-white rounded-full mb-1" />
                                                </div>
                                            )}

                                            <span className={msg.isBlurred ? 'opacity-30 blur-sm flex items-center select-none' : ''}>
                                                {msg.content}
                                            </span>
                                            
                                            <div className={`text-[9px] mt-1 text-right font-bold ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Unread Blur Call To Action */}
                    {!loading && !hasUnlockedHistory && messages.some(m => m.isBlurred) && (
                        <div className="absolute bottom-20 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent z-20 flex justify-center">
                            <button 
                                onClick={() => setShowPurchaseModal(true)}
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-xl shadow-indigo-200 animate-bounce flex items-center gap-2 text-sm"
                            >
                                <Shield className="w-4 h-4" /> Unlock Hidden Messages
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 z-30 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                        {loading ? (
                            <div className="h-[52px] bg-gray-50 animate-pulse rounded-2xl" />
                        ) : !hasActiveQuota ? (
                            <button
                                onClick={() => setShowPurchaseModal(true)}
                                className="w-full py-4 bg-gradient-to-r from-[#b8962e] to-[#d4aa3e] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                            >
                                <Wallet className="w-5 h-5" /> Buy Message Pack to Start Typing
                            </button>
                        ) : (
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                <input 
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#b8962e]/30 text-[14px] font-bold text-gray-900 placeholder:text-gray-400"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className="w-12 h-12 rounded-full bg-[#7A1F01] text-white flex items-center justify-center shadow-lg hover:bg-[#5a1701] transition-all disabled:opacity-50 active:scale-95"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowPurchaseModal(false)}>
                    <div className="bg-white rounded-[28px] max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#b8962e] to-[#d4aa3e] rounded-full flex items-center justify-center mb-3">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Unlock Matrimony Chat</h2>
                            <p className="text-xs text-gray-500 mt-1.5">Buy a message pack to unblur and reply.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {pricingTiers.map((tier, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePurchase(i)}
                                    disabled={purchasing}
                                    className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl hover:border-[#b8962e] hover:shadow-md transition-all text-left flex flex-col items-center text-center group"
                                >
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#b8962e] mb-1.5">
                                        {tier.label || `${tier.messageCount} Messages`}
                                    </p>
                                    <div className="flex items-end gap-1 mb-1">
                                        <p className="text-2xl font-black text-gray-900">₹{tier.price}</p>
                                    </div>
                                    <p className="text-[10px] text-amber-700 font-semibold">{tier.messageCount} Messages</p>
                                </button>
                            ))}
                        </div>

                        {purchasing && (
                            <div className="flex items-center justify-center gap-2 text-[#b8962e] font-bold text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing payment...
                            </div>
                        )}

                        <button onClick={() => setShowPurchaseModal(false)} className="w-full py-3 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
