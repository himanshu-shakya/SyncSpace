'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Star, Moon, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('syncspace_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('syncspace_user');
      }
    }
  }, []);

  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('syncspace_token');
    localStorage.removeItem('syncspace_user');
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        
        {/* Brand & Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary-container shadow-emerald-sm group-hover:scale-105 transition-all">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container"></span>
              </span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-on-surface">
              SyncSpace
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm">
            <a href="#features" className="text-primary font-medium transition-colors">
              Features
            </a>
            <a href="#editor-showcase" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Markdown Editor
            </a>
            <a href="#architecture" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Multiplayer Sync
            </a>
            <a href="#architecture" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Integrations
            </a>
            <a href="#architecture" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Changelog
            </a>
          </nav>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          
          {/* GitHub Star Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-low border border-surface-container-high px-2.5 py-1 rounded text-on-surface-variant text-xs font-mono">
            <Star className="w-3.5 h-3.5 fill-current text-tertiary-fixed-dim" />
            <span>12.4k</span>
          </div>

          {/* Dark Mode Icon */}
          <button
            type="button"
            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Dark theme active"
          >
            <Moon className="w-4 h-4" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs font-medium text-on-surface bg-surface-container hover:bg-surface-container-high border border-surface-container-high px-3 py-1.5 rounded transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary-container" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-on-surface hover:text-primary px-2.5 py-1.5 rounded transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary px-3.5 py-1.5 rounded shadow-[0_0_16px_rgba(0,245,160,0.35)] transition-all flex items-center gap-1.5 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
