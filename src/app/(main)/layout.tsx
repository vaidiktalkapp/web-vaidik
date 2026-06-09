'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { RealTimeProvider } from '../../context/RealTimeContext';
import ChatWaitingModal from '../../components/modals/ChatWaitingModal';
import CallWaitingModal from '../../components/modals/CallWaitingModal';
import PromoBannerModal from '../../components/modals/PromoBannerModal';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Define routes where sidebar should be hidden by default (full width for chat/call interfaces)
  const isChatRoute = pathname?.startsWith('/chat/') ||
                      pathname?.startsWith('/call/') ||
                      pathname?.startsWith('/ai-chat/');

  // Sidebar is persistent on all pages EXCEPT home, chat routes, (and never on mobile)
  const isPersistent = isMounted && !isMobile && pathname !== '/' && !isChatRoute;

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure sidebar closes on mobile/overlay routes when navigating
  useEffect(() => {
    if (isMounted && (isMobile || !isPersistent)) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isPersistent, isMobile, isMounted]);

  return (
    // overflow-x-hidden contains any stray child without relying only on body
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      {/* min-w-0 lets the row's children shrink instead of forcing the page wide */}
      <div className="flex flex-1 min-w-0">
        {/* Sidebar - Handles its own fixed/overlay modes internally */}
        <Suspense fallback={null}>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isPersistent={isPersistent}
          />
        </Suspense>

        {/* Content Area containing Header and Main
            min-w-0 + w-full = the critical fix. Without min-w-0 a flex item keeps
            min-width:auto and refuses to shrink below its content, pushing the
            header's right controls off-screen (where overflow-x:hidden clips them). */}
        <div
          className={`flex-1 min-w-0 w-full flex flex-col transition-[margin] duration-500 ${
            isPersistent ? 'md:ml-[240px]' : ''
          }`}
        >
          <Header
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isPersistent={isPersistent}
          />

          <RealTimeProvider>
            <main className="flex-1 min-w-0">
              {children}
              <ChatWaitingModal />
              <CallWaitingModal />
              <PromoBannerModal />
            </main>
          </RealTimeProvider>
        </div>
      </div>
    </div>
  );
}