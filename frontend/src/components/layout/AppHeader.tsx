'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AppHeaderProps {
  isSidebarCollapsed?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onShareClick?: () => void;
  showShareButton?: boolean;
}

export default function AppHeader({
  isSidebarCollapsed = false,
  breadcrumbs = [
    { label: 'SyncSpace', href: '/dashboard' },
    { label: 'Engineering' },
    { label: 'Knowledge Hub' },
  ],
  onShareClick,
  showShareButton = true,
}: AppHeaderProps) {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline'>('connected');
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    // Health probe to Spring Boot
    api.get('/health')
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('offline'));

    const saved = localStorage.getItem('syncspace_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ${
        isSidebarCollapsed ? 'left-16' : 'left-0 md:left-64'
      }`}
    >
      <div className="h-14 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Dynamic Breadcrumb Path */}
        <div className="flex items-center gap-space-xs font-label-ui text-label-ui text-on-surface-variant overflow-hidden truncate">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              {idx > 0 && <span className="text-outline-variant">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-on-surface transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={`truncate ${idx === breadcrumbs.length - 1 ? 'text-on-surface font-medium' : ''}`}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right: Live Connection Pill, Collaborators, Notifications & Actions */}
        <div className="flex items-center gap-space-md flex-shrink-0">
          
          {/* Connection Parity Pill */}
          <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container border border-surface-container-high">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'connected' ? 'bg-primary-container animate-pulse' : 'bg-error'
              }`}
            ></span>
            <span className="font-label-mono-sm text-label-mono-sm text-primary-container font-medium">
              {backendStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            <span className="text-outline-variant font-label-mono-sm text-label-mono-sm">·</span>
            <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">0ms</span>
          </div>

          {/* Peer Presence Avatars */}
          <div className="hidden md:flex items-center -space-x-1.5 font-label-mono-sm text-label-mono-sm">
            <div className="w-6 h-6 rounded-full bg-surface-container-high border border-[#101418] flex items-center justify-center text-on-surface text-[10px]">
              TL
            </div>
            <div className="w-6 h-6 rounded-full bg-surface-variant border border-[#101418] flex items-center justify-center text-secondary text-[10px]">
              SC
            </div>
            <div className="w-6 h-6 rounded-full bg-primary-container border border-[#101418] flex items-center justify-center text-on-primary-container font-semibold text-[10px]">
              +3
            </div>
          </div>

          {/* Share Action */}
          {showShareButton && onShareClick && (
            <button
              onClick={onShareClick}
              className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui transition-colors border border-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-primary-container">ios_share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* User Icon Link */}
          <Link
            href="/settings"
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs"
            title="Account Settings"
          >
            {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
          </Link>

        </div>

      </div>
    </header>
  );
}

