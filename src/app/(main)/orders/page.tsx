'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import orderService from '../../../lib/orderService';
import callService from '../../../lib/callService';
import blockingService, { BlockedAstrologer } from '../../../lib/blockingService';
import { Order } from '../../../lib/types';
import Link from 'next/link';

// Updated Interface to match Backend Response
interface Conversation {
  orderId: string;
  conversationThreadId: string;
  isAi?: boolean; // ✅ Added
  astrologer: {
    _id: string;
    name: string;
    profilePicture: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    content: string;
    type: string;
    sentAt: string;
    isRead: boolean;
    sentBy?: string;
  };
  // ✅ Used for filtering
  category: 'chat' | 'call' | 'both' | 'none';
  unreadCount: number;
  updatedAt: string;
}

interface CallSession {
  _id: string;
  orderId: string;
  isAi?: boolean; // ✅ Added
  astrologerId: {
    _id: string;
    name: string;
    profilePicture?: string;
    image?: string;
  };
  duration: number; // in seconds
  totalAmount: number;
  status: string;
  createdAt: string;
}

type TabType = 'chat' | 'call' | 'reports';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'ongoing':
    case 'in_progress':
    case 'active':
      return 'bg-blue-100 text-blue-700';
    case 'cancelled':
    case 'blocked':
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending':
    case 'waiting':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

// Helper for relative time
const getRelativeTime = (dateString: string, t: any) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return t("orders.just_now");
    if (diff < 3600) return `${Math.floor(diff / 60)}${t("orders.m_ago")}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t("orders.h_ago")}`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}${t("orders.d_ago")}`;

    return date.toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN');
  } catch (e) {
    return '';
  }
};

// ✅ Helper to format last message preview text
const getLastMessageText = (msg: Conversation['lastMessage'], t: any) => {
  if (!msg) return t("orders.start_conversation");

  switch (msg.type) {
    case 'text':
      return msg.content;
    case 'image':
      return t("orders.photo");
    case 'video':
      return t("orders.video");
    case 'audio':
      return t("orders.audio");
    case 'voice_note':
      return t("orders.voice_message");
    case 'file':
      return t("orders.file");
    case 'kundli_details':
      return t("orders.kundli_details");
    default:
      return t("orders.start_conversation");
  }
};

export default function OrdersPage() {
    const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // Data States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [callSession, setcallSession] = useState<CallSession[]>([]);
  const [reports, setReports] = useState<BlockedAstrologer[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'chat') {
      loadConversations();
    } else if (activeTab === 'call') {
      loadcallSession();
    } else if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab]);

  const loadConversations = async () => {
    try {
      const response = await orderService.getUserConversations({ page: 1, limit: 20 });
      if (response.success) {
        // ✅ FILTER LOGIC:
        // Only show 'chat' or 'both' categories in the Chats tab
        const filteredConversations = (response.data.conversations || []).filter(
          (c: any) => c.category === 'chat' || c.category === 'both' || (c.category === 'none' && c.totalMessages > 0)
        );
        setConversations(filteredConversations);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadcallSession = async () => {
    try {
      // ✅ Call History uses Order Logs (detailed duration/cost)
      const response = await callService.getCallHistory({
        page: 1,
        limit: 20
      });

      if (response.success) {
        console.log('Call history fetched:', response.data);
        setcallSession(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      // Fetch blocked list to show as "Reports"
      const response = await blockingService.getBlockedReports({ page: 1, limit: 50 });
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-yellow-400 to-yellow-500 text-black shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">{t("orders.my_activity")}</h1>
          <p className="text-gray-900 opacity-90">{t("orders.manage_your_conversations_and")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-4 py-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap ${activeTab === 'chat' ?
              'bg-yellow-400 text-black shadow-md' :
              'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }>
              
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
{t("orders.chats")}
            </button>
            <button
              onClick={() => setActiveTab('call')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap ${activeTab === 'call' ?
              'bg-yellow-400 text-black shadow-md' :
              'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }>
              
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
{t("orders.call_history")}
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap ${activeTab === 'reports' ?
              'bg-yellow-400 text-black shadow-md' :
              'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }>
              
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
{t("orders.reports")}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ?
        <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t("orders.loading")}{activeTab}...</p>
          </div> :

        <>
            {/* --- CHATS TAB (Conversations) --- */}
            {activeTab === 'chat' && (
          conversations.length > 0 ?
          <div className="space-y-3">
                  {conversations.map((convo) =>
            <Link
              key={convo.orderId}
              href={convo.isAi ? `/ai-astrologer/${convo.astrologer?._id}` : `/orders/${convo.orderId}`}
              className="group block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all hover:border-yellow-300 relative">
              
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative w-14 h-14 shrink-0">
                          <img
                    src={convo.astrologer?.profilePicture || 'https://via.placeholder.com/150'}
                    alt={convo.astrologer?.name}
                    className="w-full h-full rounded-full object-cover border border-gray-100" />
                  
                          {convo.astrologer?.isOnline &&
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">
                              {convo.astrologer?.name || t("orders.unknown_astrologer")}
                            </h3>
                            <span className={`text-xs ${convo.unreadCount > 0 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                              {getRelativeTime(convo.updatedAt, t)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            {/* ✅ Show Last Message Text instead of generic "Start conversation" */}
                            <p className={`text-sm truncate pr-4 ${convo.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                              {getLastMessageText(convo.lastMessage, t)}
                            </p>

                            {/* Unread Badge */}
                            {convo.unreadCount > 0 &&
                    <span className="shrink-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                                {convo.unreadCount}
                              </span>
                    }
                          </div>
                        </div>

                        {/* Chevron */}
                        <div className="text-gray-300 group-hover:text-yellow-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
            )}
                </div> :

          <EmptyState
            icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
            }
            title={t("orders.no_chat_conversations")}
            description={t("orders.start_chat_desc")} />)


          }

            {/* --- CALL HISTORY TAB (Logs) --- */}
            {activeTab === 'call' && (
          callSession.length > 0 ?
          <div className="space-y-4">
                  {callSession.map((session) =>
            <Link
              key={session._id}
              href={`/orders/${session.orderId}?view=call`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
              
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0">
                          <img
                    src={session.astrologerId?.profilePicture || session.astrologerId?.image || '/vaidiktalklogo.png'}
                    alt={session.astrologerId.name}
                    className="w-full h-full object-cover" />
                  
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900">{session.astrologerId.name}</h3>
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{session.totalAmount?.toFixed(0)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {new Date(session.createdAt).toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN')}
                            </span>
                            {session.duration > 0 &&
                    <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {formatDuration(session.duration)}
                              </span>
                    }
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                            {session.status === 'ended' &&
                    <span className="text-xs font-medium text-yellow-600 hover:underline">{t("orders.rate_call")}</span>
                    }
                          </div>
                        </div>
                      </div>
                    </Link>
            )}
                </div> :

          <EmptyState
            icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
            }
            title={t("orders.no_call_history")}
            description={t("orders.start_voice_desc")} />)


          }

            {/* --- REPORTS TAB (Read Only) --- */}
            {activeTab === 'reports' && (
          reports.length > 0 ?
          <div className="space-y-4">
                  {reports.map((item) =>
            <div
              key={item._id}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-100 shadow-sm shrink-0">
                          <img
                    src={item.astrologer?.profileImage || 'https://via.placeholder.com/150'}
                    alt={item.astrologer?.name || 'Astrologer'}
                    className="w-full h-full object-cover" />
                  
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {item.astrologer?.name || t("orders.unknown_astrologer")}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
{t("orders.report_filed")}
                    </span>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">{t("orders.reason")}</h4>
                            <p className="text-sm text-gray-800">"{item.reason}"</p>
                          </div>

                          <div className="flex justify-end items-center mt-2">
                            <span className="text-xs text-gray-400">{t("orders.reported_on")}{new Date(item.blockedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
            )}
                </div> :

          <EmptyState
            icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
            }
            title={t("orders.no_reports_filed")}
            description={t("orders.no_reported_desc")} />)


          }
          </>
        }
      </div>
    </div>);

}

// Empty State Component
function EmptyState({ icon, title, description }: {icon: React.ReactNode;title: string;description: string;}) {
    const { t } = useTranslation();
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      <Link
        href="/astrologers-chat"
        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl">
{t("orders.browse_astrologers")}

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>);

}