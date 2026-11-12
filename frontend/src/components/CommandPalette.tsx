'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types/document';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  category: 'Actions' | 'Navigation' | 'Documents';
  onSelect: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch documents for search
  const { data: documents = [] } = useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    },
    enabled: isOpen,
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct items list
  const defaultActions: ActionItem[] = [
    {
      id: 'new-doc',
      title: 'Create New Document',
      subtitle: 'Create a collaborative Markdown specification',
      icon: 'add_circle',
      category: 'Actions',
      onSelect: async () => {
        try {
          const res = await api.post('/documents', {
            title: 'Untitled Document',
            content: '# Untitled Document\n\nStart writing Markdown...',
          });
          onClose();
          router.push(`/dashboard/document/${res.data.id}`);
        } catch {
          onClose();
          router.push('/dashboard');
        }
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Knowledge hub & active repository matrix',
      icon: 'space_dashboard',
      category: 'Navigation',
      onSelect: () => {
        onClose();
        router.push('/dashboard');
      },
    },
    {
      id: 'nav-workspaces',
      title: 'Knowledge Workspaces',
      subtitle: 'Browse workspaces and project clusters',
      icon: 'workspaces',
      category: 'Navigation',
      onSelect: () => {
        onClose();
        router.push('/dashboard?tab=workspaces');
      },
    },
    {
      id: 'nav-favorites',
      title: 'Starred Favorites',
      subtitle: 'Quick access to bookmarked technical specs',
      icon: 'star',
      category: 'Navigation',
      onSelect: () => {
        onClose();
        router.push('/dashboard?tab=favorites');
      },
    },
    {
      id: 'nav-settings',
      title: 'Settings & Appearance',
      subtitle: 'Obsidian themes, typography and real-time STOMP sync',
      icon: 'settings',
      category: 'Navigation',
      onSelect: () => {
        onClose();
        router.push('/settings');
      },
    },
  ];

  const docActions: ActionItem[] = documents.map((doc) => ({
    id: `doc-${doc.id}`,
    title: doc.title || 'Untitled Document',
    subtitle: doc.content ? doc.content.slice(0, 70).replace(/\n/g, ' ') : 'Empty document',
    icon: 'article',
    category: 'Documents',
    onSelect: () => {
      onClose();
      router.push(`/dashboard/document/${doc.id}`);
    },
  }));

  const allItems = [...defaultActions, ...docActions];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  // Keyboard navigation inside palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].onSelect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface-container-low border border-surface-container-high rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-space-sm px-space-md py-3.5 border-b border-surface-container-high/80 bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary-container text-[20px]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search documents (e.g. RFC, Settings)..."
            className="w-full bg-transparent text-on-surface placeholder:text-outline-variant outline-none font-body-md text-body-md"
          />
          <kbd className="font-label-mono-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-surface-container-high">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-space-sm space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-3xl mb-1 opacity-50">search_off</span>
              <p>No matching commands or documents found for &quot;{query}&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-surface-container text-primary-container'
                      : 'hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-primary-container/20 text-primary-container border-primary-container/40'
                          : 'bg-surface-container-high text-on-surface-variant border-surface-container-highest'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-ui text-label-ui font-medium truncate text-on-surface">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="font-label-mono-sm text-[11px] text-on-surface-variant truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-label-mono-sm text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline-variant border border-surface-container-high">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary-container text-[16px]">
                        keyboard_return
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-space-md py-2 bg-surface-container-lowest border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-mono-sm text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-surface-container text-[10px]">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-surface-container text-[10px]">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-surface-container text-[10px]">esc</kbd> close
            </span>
          </div>
          <span className="text-primary-container font-mono text-[10px]">SyncSpace 2.0</span>
        </div>
      </div>
    </div>
  );
}

