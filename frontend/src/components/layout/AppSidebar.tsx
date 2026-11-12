'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import CommandPalette from '@/components/CommandPalette';

interface WorkspaceItem {
  id: number;
  name: string;
  description: string;
}

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  selectedWorkspaceId?: number | null;
  onSelectWorkspace?: (id: number | null) => void;
  onOpenNewDoc?: () => void;
  onOpenNewWorkspace?: () => void;
}

export default function AppSidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  selectedWorkspaceId = null,
  onSelectWorkspace,
  onOpenNewDoc,
  onOpenNewWorkspace,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string; role?: string } | null>(null);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Close mobile sidebar on navigation
    if (onCloseMobile) onCloseMobile();
  }, [pathname, onCloseMobile]);

  useEffect(() => {
    // Global shortcut for Command Palette (⌘K or Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Fetch workspaces
  const { data: workspaces = [] } = useQuery<WorkspaceItem[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('syncspace_token'),
  });

  // Create doc mutation for sidebar trigger
  const createDocMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/documents', {
        title: 'Untitled Document',
        content: '# Untitled Document\n\nWrite in Markdown with live synchronized preview...',
        workspaceId: selectedWorkspaceId,
      });
      return res.data;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      router.push(`/dashboard/document/${newDoc.id}`);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('syncspace_token');
    localStorage.removeItem('syncspace_user');
    router.push('/login');
  };

  const activeWorkspaceName = selectedWorkspaceId
    ? workspaces.find((w) => w.id === selectedWorkspaceId)?.name || 'Custom Workspace'
    : 'SyncSpace Knowledge Hub';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
    { label: 'All Docs', path: '/dashboard', query: '?tab=all', icon: 'article' },
    { label: 'Favorites', path: '/dashboard', query: '?tab=favorites', icon: 'star' },
    { label: 'Shared with Me', path: '/dashboard', query: '?tab=shared', icon: 'group' },
    { label: 'Workspaces', path: '/dashboard', query: '?tab=workspaces', icon: 'workspaces' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high/60 transition-transform md:transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      <div className="flex flex-col">
        {/* Top Logo & Title */}
        <div className="px-space-md pt-space-md pb-space-sm flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-space-sm overflow-hidden">
            <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,245,160,0.3)]">
              <span className="material-symbols-outlined text-on-primary-container text-[16px]">polyline</span>
            </div>
            {!isCollapsed && (
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight truncate">
                SyncSpace
              </span>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="text-on-surface-variant hover:text-on-surface p-space-xs rounded hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'dock_to_right' : 'dock_to_left'}
            </span>
          </button>
        </div>

        {/* Workspace Switcher */}
        {!isCollapsed && (
          <div className="px-space-md py-space-xs relative">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="w-full flex items-center justify-between px-space-sm py-space-xs rounded bg-surface-container hover:bg-surface-container-high transition-colors"
              type="button"
            >
              <div className="flex items-center gap-space-sm overflow-hidden">
                <div className="w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container text-[10px]">hub</span>
                </div>
                <span className="font-label-ui text-label-ui text-on-surface truncate">
                  {activeWorkspaceName}
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">unfold_more</span>
            </button>

            {/* Dropdown Menu */}
            {isWorkspaceDropdownOpen && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-surface-container-high border border-surface-container-highest rounded-lg shadow-xl z-50 p-1 font-mono text-xs max-h-56 overflow-y-auto">
                <button
                  onClick={() => {
                    if (onSelectWorkspace) onSelectWorkspace(null);
                    setIsWorkspaceDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                    selectedWorkspaceId === null ? 'bg-primary-container/15 text-primary-container' : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>All Documents</span>
                </button>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      if (onSelectWorkspace) onSelectWorkspace(ws.id);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded truncate flex items-center justify-between transition-colors ${
                      selectedWorkspaceId === ws.id ? 'bg-primary-container/15 text-primary-container' : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                  </button>
                ))}
                {onOpenNewWorkspace && (
                  <div className="pt-1 mt-1 border-t border-surface-container-highest">
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        onOpenNewWorkspace();
                      }}
                      className="w-full text-left px-2.5 py-1 rounded text-primary-container hover:bg-surface-container flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>New Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Search */}
        {!isCollapsed && (
          <div className="px-space-md py-space-xs">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-space-sm py-space-xs rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span className="font-label-ui text-label-ui">Find or jump to...</span>
              </div>
              <kbd className="font-label-mono-sm text-label-mono-sm px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-surface-container-highest">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Primary CTA: New Document */}
        <div className="px-space-md pt-space-xs pb-space-sm">
          <button
            onClick={() => {
              if (onOpenNewDoc) onOpenNewDoc();
              else createDocMutation.mutate();
            }}
            disabled={createDocMutation.isPending}
            className="w-full flex items-center justify-center gap-space-sm px-space-sm py-space-xs rounded bg-primary-container text-on-primary-container font-label-ui text-label-ui font-medium transition-all shadow-[0_0_16px_rgba(0,245,160,0.25)] hover:bg-secondary-container hover:text-on-secondary disabled:opacity-50"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            {!isCollapsed && <span>New Document</span>}
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="flex flex-col gap-0.5 px-space-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.path && (!item.query || pathname.includes(item.path));
            return (
              <Link
                key={item.label}
                href={`${item.path}${item.query || ''}`}
                className={`flex items-center gap-space-sm px-space-sm py-1.5 rounded transition-colors ${
                  isActive
                    ? 'bg-surface-container-high text-on-surface font-medium'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary-container' : ''}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="font-label-ui text-label-ui">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-space-sm bg-surface-container-lowest border-t border-surface-container-high/40 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-space-xs rounded hover:bg-surface-container transition-colors"
          type="button"
        >
          <div className="flex items-center gap-space-sm overflow-hidden">
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_#00f5a0]"></span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="font-label-ui text-label-ui text-on-surface leading-tight truncate">
                  {currentUser?.fullName || 'Student Demo'}
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant truncate">
                  {currentUser?.role || 'staff-eng'}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">more_vert</span>
          )}
        </button>

        {/* User Popup Menu */}
        {showUserMenu && !isCollapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-surface-container-high border border-surface-container-highest rounded-lg shadow-xl z-50 p-1 font-mono text-xs">
            <div className="px-3 py-2 border-b border-surface-container-highest text-on-surface-variant text-[11px]">
              Signed in as <span className="text-on-surface font-semibold block truncate">{currentUser?.email}</span>
            </div>
            <Link
              href="/settings"
              onClick={() => setShowUserMenu(false)}
              className="w-full text-left px-3 py-1.5 rounded text-on-surface hover:bg-surface-container flex items-center gap-2 mt-1"
            >
              <span className="material-symbols-outlined text-[14px]">settings</span>
              <span>Settings &amp; Preferences</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-1.5 rounded text-error hover:bg-error-container/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* Global Command Palette (⌘K) */}
    <CommandPalette
      isOpen={isCommandPaletteOpen}
      onClose={() => setIsCommandPaletteOpen(false)}
    />
  </>
  );
}

