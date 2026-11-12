'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types/document';
import AppHeader from '@/components/layout/AppHeader';
import ShareModal from '@/components/ShareModal';

interface WorkspaceItem {
  id: number;
  name: string;
  description: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared' | 'favorites' | 'workspaces'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string } | null>(null);
  const [shareDoc, setShareDoc] = useState<{ id: number; title: string } | null>(null);

  // Synchronize activeTab whenever URL query changes (e.g. clicking sidebar All Docs, Favorites, etc.)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['all', 'owned', 'shared', 'favorites', 'workspaces'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    } else if (!tabParam) {
      setActiveTab('all');
    }
  }, [searchParams]);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('syncspace_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const savedUser = localStorage.getItem('syncspace_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        // ignore parse error
      }
    }
    // Load local favorites
    const savedFavs = localStorage.getItem('syncspace_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch {
        // ignore
      }
    }
  }, [router]);

  // 1. Fetch Documents
  const { data: documents = [], isLoading, isError } = useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    },
    enabled: isClient && (typeof window !== 'undefined' ? !!localStorage.getItem('syncspace_token') : false),
  });

  // 2. Fetch Workspaces
  const { data: workspaces = [] } = useQuery<WorkspaceItem[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
    enabled: isClient && (typeof window !== 'undefined' ? !!localStorage.getItem('syncspace_token') : false),
  });

  // 3. Create Document Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/documents', {
        title: 'Untitled Document',
        content: '# Untitled Document\n\nWrite in Markdown with live synchronized preview...',
        workspaceId: selectedWorkspace,
      });
      return res.data;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      router.push(`/dashboard/document/${newDoc.id}`);
    },
  });

  // 4. Create Workspace Mutation
  const createWsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/workspaces', {
        name: newWsName.trim(),
        description: newWsDesc.trim(),
      });
      return res.data;
    },
    onSuccess: (newWs) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSelectedWorkspace(newWs.id);
      setShowWorkspaceModal(false);
      setNewWsName('');
      setNewWsDesc('');
    },
  });

  // 5. Delete Document Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  // Toggle Favorite
  const toggleFavorite = (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    const updated = favorites.includes(docId)
      ? favorites.filter((id) => id !== docId)
      : [...favorites, docId];
    setFavorites(updated);
    localStorage.setItem('syncspace_favorites', JSON.stringify(updated));
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesWorkspace = selectedWorkspace === null || doc.workspaceId === selectedWorkspace;
    if (!matchesSearch || !matchesWorkspace) return false;

    if (activeTab === 'owned') return doc.role === 'OWNER';
    if (activeTab === 'shared') return doc.role === 'EDITOR' || doc.role === 'VIEWER';
    if (activeTab === 'favorites') return favorites.includes(doc.id);
    return true;
  });

  // Pinned documents (up to 3)
  const pinnedDocs = documents.slice(0, 3);

  const activeWorkspaceName = selectedWorkspace
    ? workspaces.find((w) => w.id === selectedWorkspace)?.name || 'Custom Workspace'
    : 'SyncSpace Knowledge Hub';

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Application Header */}
      <AppHeader
        breadcrumbs={[
          { label: 'SyncSpace', href: '/dashboard' },
          { label: activeWorkspaceName },
          { label: activeTab === 'all' ? 'All Artifacts' : activeTab.toUpperCase() }
        ]}
        showShareButton={false}
      />

      {/* Main Viewport Content */}
      <main className="w-full pt-14 bg-surface min-h-screen overflow-x-hidden">
        <div className="flex flex-col w-full">
          {/* Dynamic Atmosphere Underlay Glows */}
          <div className="relative w-full overflow-hidden px-margin-tablet lg:px-margin-desktop py-space-lg">
            <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-container/5 blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-secondary-container/5 blur-3xl pointer-events-none"></div>

            {/* Header & Welcome Banner Matrix */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl relative z-10">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-sm mb-1">
                  <span className="inline-flex items-center gap-1.5 font-label-mono-sm text-label-mono-sm text-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                    Spring Boot 3 Engine Active
                  </span>
                  <span className="text-outline-variant font-label-mono-sm text-label-mono-sm">·</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">WebSocket STOMP</span>
                  <span className="text-outline-variant font-label-mono-sm text-label-mono-sm">·</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary-container font-semibold">
                    {documents.length} {documents.length === 1 ? 'Doc' : 'Docs'}
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                  Welcome back, {currentUser?.fullName?.split(' ')[0] || 'Engineer'}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Real-time knowledge hub and collaborative Markdown editor workspace.
                </p>
              </div>

              {/* System Metric Badges */}
              <div className="flex items-center gap-space-lg px-space-md py-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60 shadow-sm">
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Latency</span>
                  <span className="font-label-mono-sm text-headline-sm text-primary font-semibold">
                    12.4<span className="text-body-sm font-normal text-on-surface-variant ml-0.5">ms</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-surface-container-highest"></div>
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Sync State</span>
                  <span className="font-label-mono-sm text-headline-sm text-primary-container font-semibold">
                    CRDT<span className="text-body-sm font-normal text-on-surface-variant ml-0.5">/v2</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-surface-container-highest"></div>
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Backend</span>
                  <span className="font-label-mono-sm text-body-md text-secondary font-medium mt-0.5">Java 21</span>
                </div>
              </div>
            </div>

            {/* Quick Action & Interactive Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-space-md p-space-sm rounded-xl bg-surface-container-low mb-space-xl shadow-md border border-surface-container-high/60">
              <div className="flex items-center gap-space-sm w-full md:w-auto">
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="flex items-center gap-space-xs px-space-md py-2 rounded bg-primary-container text-on-primary-container font-label-ui text-label-ui font-semibold shadow-[0_0_16px_rgba(0,245,160,0.25)] hover:bg-secondary-container transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {createMutation.isPending ? 'sync' : 'add'}
                  </span>
                  <span>{createMutation.isPending ? 'Creating...' : 'New Document'}</span>
                </button>

                <button
                  onClick={() => setShowWorkspaceModal(true)}
                  className="flex items-center gap-space-xs px-space-md py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui transition-colors cursor-pointer border border-surface-container-highest/60"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">create_new_folder</span>
                  <span>New Workspace</span>
                </button>

                {/* Workspace Quick Filter Dropdown */}
                {workspaces.length > 0 && (
                  <select
                    value={selectedWorkspace ?? ''}
                    onChange={(e) => setSelectedWorkspace(e.target.value ? Number(e.target.value) : null)}
                    className="bg-surface-container border border-surface-container-highest/60 rounded px-space-sm py-2 text-xs font-label-mono-sm text-on-surface focus:outline-none focus:border-primary-container cursor-pointer"
                  >
                    <option value="">All Workspaces</option>
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Search & View Mode Controls */}
              <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
                <div className="relative w-full md:w-80">
                  <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search docs, tags, syntax..."
                    className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm pl-9 pr-12 py-1.5 rounded focus:outline-none focus:bg-surface-container-high border border-surface-container-highest/40 placeholder:text-outline transition-colors"
                  />
                  <kbd className="absolute right-space-sm top-1/2 -translate-y-1/2 font-label-mono-sm text-label-mono-sm text-on-surface-variant border border-surface-container-highest px-1.5 py-0.5 rounded">
                    ⌘K
                  </kbd>
                </div>

                {/* Grid vs List Toggle */}
                <div className="flex items-center p-0.5 rounded bg-surface-container border border-surface-container-highest/60">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center justify-center w-7 h-7 rounded transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-surface-container-high text-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Grid View"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center justify-center w-7 h-7 rounded transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-surface-container-high text-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="List View"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">view_agenda</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs Row */}
            <div className="flex items-center gap-space-sm mb-space-lg overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Documents', icon: 'article', count: documents.length },
                { id: 'owned', label: 'My Documents', icon: 'person', count: documents.filter(d => d.role === 'OWNER').length },
                { id: 'shared', label: 'Shared with Me', icon: 'group', count: documents.filter(d => d.role !== 'OWNER').length },
                { id: 'favorites', label: 'Favorites', icon: 'star', count: favorites.length },
                { id: 'workspaces', label: 'Workspaces', icon: 'workspaces', count: workspaces.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    router.push(`/dashboard?tab=${tab.id}`);
                  }}
                  className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-full font-label-ui text-label-ui transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary-container/15 text-primary-container border border-primary-container/40 font-semibold'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-transparent'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="ml-1 text-[11px] font-label-mono-sm opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Main Workspace Split: Document Center (Bento + Feed) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-desktop">
              {/* Primary Core: Pinned Cards + Data Stream Table (8 Cols) */}
              <div className="xl:col-span-8 flex flex-col gap-space-xl">
                
                {/* Pinned Section (Top 3 Bento Cards) */}
                {pinnedDocs.length > 0 && activeTab === 'all' && !searchTerm && (
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary-container text-[20px]">
                          push_pin
                        </span>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                          Pinned Artifacts
                        </h2>
                        <span className="font-label-mono-sm text-label-mono-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                          Active Workspace Locks
                        </span>
                      </div>
                    </div>

                    {/* 3 High Precision Pinned Bento Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                      {pinnedDocs.map((doc, idx) => (
                        <div
                          key={doc.id}
                          onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                          className="group relative flex flex-col justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/70 hover:border-primary-container/40 transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
                              <span className="font-label-mono-sm text-[11px] text-secondary">
                                {idx === 0 ? 'ARCHITECTURE' : idx === 1 ? 'SPEC · V2' : 'CRDT · SYNC'}
                              </span>
                              <button
                                onClick={(e) => toggleFavorite(e, doc.id)}
                                className={`transition-colors cursor-pointer ${
                                  favorites.includes(doc.id)
                                    ? 'text-tertiary-fixed-dim'
                                    : 'text-outline hover:text-tertiary'
                                }`}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {favorites.includes(doc.id) ? 'star' : 'star_border'}
                                </span>
                              </button>
                            </div>
                            <h3 className="font-body-md text-body-md text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors truncate">
                              {doc.title || 'Untitled Document'}
                            </h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                              {doc.content
                                ? doc.content.replace(/[#*`_]/g, '').slice(0, 110)
                                : 'Empty Markdown document ready for writing...'}
                            </p>
                          </div>
                          <div className="mt-space-md pt-space-xs border-t border-surface-container-high flex items-center justify-between font-label-mono-sm text-label-mono-sm text-on-surface-variant">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-[10px] font-bold">
                                {doc.role === 'OWNER' ? 'OW' : 'ED'}
                              </div>
                              <span className="truncate max-w-[90px]">{doc.role || 'OWNER'}</span>
                            </div>
                            <span>{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Active'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WORKSPACES TAB VIEW */}
                {activeTab === 'workspaces' && (
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          workspaces
                        </span>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                          Knowledge Workspaces
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowWorkspaceModal(true)}
                        className="flex items-center gap-1 px-space-md py-1.5 rounded bg-primary-container text-on-primary-container font-label-ui text-label-ui font-semibold shadow-sm hover:bg-secondary-container transition-all cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Create Workspace</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                      {workspaces.map((ws) => {
                        const wsDocCount = documents.filter((d) => d.workspaceId === ws.id).length;
                        return (
                          <div
                            key={ws.id}
                            className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary-container/40 transition-all flex flex-col justify-between shadow-sm group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-space-sm">
                                <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary-container">
                                  <span className="material-symbols-outlined text-[18px]">folder</span>
                                </div>
                                <span className="font-label-mono-sm text-[11px] text-secondary bg-surface-container px-2 py-0.5 rounded">
                                  {wsDocCount} {wsDocCount === 1 ? 'doc' : 'docs'}
                                </span>
                              </div>
                              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors truncate">
                                {ws.name}
                              </h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                                {ws.description || 'Dedicated workspace for specifications and research.'}
                              </p>
                            </div>

                            <div className="mt-space-md pt-space-xs border-t border-surface-container-high flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setSelectedWorkspace(ws.id);
                                  setActiveTab('all');
                                }}
                                className="font-label-ui text-label-ui text-primary-container hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                                type="button"
                              >
                                <span>Open Workspace</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWorkspace(ws.id);
                                  createMutation.mutate();
                                }}
                                className="font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
                                type="button"
                                title="Add Document"
                              >
                                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                                <span>Doc</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Create Workspace Dotted Card */}
                      <button
                        onClick={() => setShowWorkspaceModal(true)}
                        className="p-space-lg rounded-xl border border-dashed border-surface-container-high hover:border-primary-container/60 bg-surface-container-lowest/50 hover:bg-surface-container-low transition-all flex flex-col items-center justify-center text-center group cursor-pointer min-h-[170px]"
                        type="button"
                      >
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform mb-2">
                          <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
                        </div>
                        <span className="font-label-ui text-label-ui text-on-surface font-semibold group-hover:text-primary transition-colors">
                          New Workspace
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] mt-0.5">
                          Create dedicated team space
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Documents Data Section (Shown when activeTab !== 'workspaces') */}
                {activeTab !== 'workspaces' && (
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          dataset
                        </span>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                          Active Repositories &amp; Documents
                        </h2>
                      </div>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">
                        Showing {filteredDocuments.length} of {documents.length}
                      </span>
                    </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-container-high">
                      <span className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin mb-3"></span>
                      <span className="font-label-mono-sm text-label-mono-sm">
                        Loading documents from Spring Boot API...
                      </span>
                    </div>
                  )}

                  {/* Error State */}
                  {isError && (
                    <div className="p-space-md rounded-xl bg-error-container/20 border border-error/30 text-error flex items-center gap-space-sm text-body-sm font-body-sm">
                      <span className="material-symbols-outlined text-[20px]">error</span>
                      <span>Failed to retrieve documents from Spring Boot. Please ensure you are logged in.</span>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && !isError && filteredDocuments.length === 0 && (
                    <div className="border border-dashed border-surface-container-high rounded-xl p-12 text-center flex flex-col items-center justify-center bg-surface-container-lowest">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container mb-3 shadow-[0_0_16px_rgba(0,245,160,0.15)]">
                        <span className="material-symbols-outlined text-[26px]">description</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        No documents found
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1 mb-5">
                        {searchTerm
                          ? `No markdown documents match "${searchTerm}".`
                          : 'Create your very first Markdown knowledge document to start collaborative editing.'}
                      </p>
                      <button
                        onClick={() => createMutation.mutate()}
                        className="px-space-md py-2 bg-primary-container text-on-primary-container rounded font-label-ui text-label-ui font-semibold shadow-[0_0_16px_rgba(0,245,160,0.25)] hover:bg-secondary-container transition-all flex items-center gap-1.5 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Create Document</span>
                      </button>
                    </div>
                  )}

                  {/* GRID VIEW */}
                  {!isLoading && !isError && filteredDocuments.length > 0 && viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                          className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high hover:border-primary-container/40 transition-all cursor-pointer group flex flex-col justify-between shadow-sm relative overflow-hidden"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors truncate">
                                {doc.title || 'Untitled Document'}
                              </h3>
                              <span className={`text-[10px] font-label-mono-sm font-semibold px-2 py-0.5 rounded uppercase shrink-0 ${
                                doc.role === 'OWNER'
                                  ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                                  : doc.role === 'EDITOR'
                                  ? 'bg-secondary-container/20 text-secondary border border-secondary/30'
                                  : 'bg-surface-container-highest text-on-surface-variant'
                              }`}>
                                {doc.role || 'OWNER'}
                              </span>
                            </div>

                            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                              {doc.content
                                ? doc.content.replace(/[#*`_]/g, '').slice(0, 130)
                                : 'Empty document...'}
                            </p>
                          </div>

                          <div className="mt-space-md pt-space-xs border-t border-surface-container-high flex items-center justify-between text-label-mono-sm font-label-mono-sm text-on-surface-variant">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              <span>{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Just now'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => toggleFavorite(e, doc.id)}
                                className={`transition-colors cursor-pointer ${
                                  favorites.includes(doc.id) ? 'text-tertiary-fixed-dim' : 'text-outline hover:text-on-surface'
                                }`}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {favorites.includes(doc.id) ? 'star' : 'star_border'}
                                </span>
                              </button>

                              {doc.role === 'OWNER' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShareDoc({ id: doc.id, title: doc.title });
                                  }}
                                  className="text-on-surface-variant hover:text-primary-container transition-colors p-1"
                                  title="Share Document"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[16px]">share</span>
                                </button>
                              )}

                              {doc.role === 'OWNER' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this document?')) deleteMutation.mutate(doc.id);
                                  }}
                                  className="text-on-surface-variant hover:text-error transition-colors p-1"
                                  title="Delete Document"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              )}
                              <span className="material-symbols-outlined text-[16px] text-primary-container group-hover:translate-x-0.5 transition-transform">
                                arrow_forward
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LIST VIEW (Stitch Obsidian Table) */}
                  {!isLoading && !isError && filteredDocuments.length > 0 && viewMode === 'list' && (
                    <div className="w-full overflow-x-auto rounded-xl bg-surface-container-low border border-surface-container-high shadow-md">
                      <table className="w-full border-collapse text-left font-label-ui text-label-ui">
                        <thead>
                          <tr className="border-b border-surface-container-high text-on-surface-variant font-label-mono-sm text-[11px] uppercase tracking-wider">
                            <th className="py-space-sm px-space-md">Document Name</th>
                            <th className="py-space-sm px-space-md hidden sm:table-cell">Role / Tag</th>
                            <th className="py-space-sm px-space-md hidden md:table-cell">Last Modified</th>
                            <th className="py-space-sm px-space-md text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-high/60">
                          {filteredDocuments.map((doc) => (
                            <tr
                              key={doc.id}
                              onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                              className="hover:bg-surface-container transition-colors cursor-pointer group"
                            >
                              <td className="py-space-md px-space-md">
                                <div className="flex items-center gap-space-sm">
                                  <span className="material-symbols-outlined text-primary-container text-[18px]">
                                    article
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-on-surface group-hover:text-primary-container transition-colors truncate">
                                      {doc.title || 'Untitled Document'}
                                    </span>
                                    <span className="font-label-mono-sm text-[11px] text-on-surface-variant truncate max-w-xs">
                                      {doc.content ? doc.content.slice(0, 60) : 'No content'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-space-md px-space-md hidden sm:table-cell">
                                <span className={`text-[10px] font-label-mono-sm font-semibold px-2 py-0.5 rounded uppercase ${
                                  doc.role === 'OWNER'
                                    ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                                    : 'bg-secondary-container/20 text-secondary border border-secondary/30'
                                }`}>
                                  {doc.role || 'OWNER'}
                                </span>
                              </td>
                              <td className="py-space-md px-space-md font-label-mono-sm text-label-mono-sm text-on-surface-variant hidden md:table-cell">
                                {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="py-space-md px-space-md text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={(e) => toggleFavorite(e, doc.id)}
                                    className={`p-1.5 transition-colors cursor-pointer ${
                                      favorites.includes(doc.id) ? 'text-tertiary-fixed-dim' : 'text-outline hover:text-on-surface'
                                    }`}
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {favorites.includes(doc.id) ? 'star' : 'star_border'}
                                    </span>
                                  </button>
                                  {doc.role === 'OWNER' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShareDoc({ id: doc.id, title: doc.title });
                                      }}
                                      className="p-1.5 text-on-surface-variant hover:text-primary-container transition-colors"
                                      title="Share Document"
                                      type="button"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">share</span>
                                    </button>
                                  )}
                                  {doc.role === 'OWNER' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this document?')) deleteMutation.mutate(doc.id);
                                      }}
                                      className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                                      title="Delete"
                                      type="button"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  )}
                                  <span className="material-symbols-outlined text-[16px] text-primary-container group-hover:translate-x-0.5 transition-transform">
                                    arrow_forward
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              </div>

              {/* Right Rail: Workspace Activity Pulse & Real-Time Node Health (4 Cols) */}
              <div className="xl:col-span-4 flex flex-col gap-space-lg">
                {/* Cluster Activity Feed */}
                <div className="flex flex-col p-space-md rounded-xl bg-surface-container-low border border-surface-container-high shadow-md">
                  <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container-high/60">
                    <h3 className="font-body-md text-body-md text-on-surface font-semibold tracking-tight">
                      Cluster Activity
                    </h3>
                    <span className="font-label-mono-sm text-[11px] text-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                      Live
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-md mt-space-xs">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] text-primary-container font-bold font-label-mono-sm">
                        SC
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                          <span className="font-medium text-primary">Sarah Connor</span> committed changes to{' '}
                          <span className="text-on-surface font-medium">Multiplayer WebSocket Protocol</span>
                        </p>
                        <span className="font-label-mono-sm text-[11px] text-on-surface-variant mt-0.5">
                          Just now · +142 -18
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] text-secondary font-bold font-label-mono-sm">
                        ER
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                          <span className="font-medium text-on-surface">Elena Rostova</span> synchronized{' '}
                          <span className="text-on-surface font-medium">API Specifications</span>
                        </p>
                        <span className="font-label-mono-sm text-[11px] text-on-surface-variant mt-0.5">
                          28m ago · CRDT delta merge
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] text-tertiary-fixed-dim font-bold font-label-mono-sm">
                        DK
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                          <span className="font-medium text-on-surface">David Kim</span> flushed memory snapshot
                        </p>
                        <span className="font-label-mono-sm text-[11px] text-on-surface-variant mt-0.5">
                          1h ago · PostgreSQL WAL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Health & Consensus Monitor */}
                <div className="flex flex-col p-space-md rounded-xl bg-surface-container-low border border-surface-container-high shadow-md">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                      Node Health &amp; STOMP Socket
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-primary font-medium">
                      100% OK
                    </span>
                  </div>

                  <div className="w-full h-14 py-1">
                    <svg className="w-full h-full text-primary-container overflow-visible" fill="none" viewBox="0 0 260 50">
                      <path
                        d="M0,35 Q30,12 60,28 T120,22 T180,38 T240,18 L260,25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-space-sm pt-space-xs border-t border-surface-container-high/60">
                    <div className="flex flex-col">
                      <span className="font-label-mono-sm text-[10px] text-on-surface-variant">CONSENSUS</span>
                      <span className="font-label-mono-sm text-body-sm text-on-surface font-medium">Synced</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-mono-sm text-[10px] text-on-surface-variant">DRIFT</span>
                      <span className="font-label-mono-sm text-body-sm text-primary font-medium">0.00 ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE WORKSPACE MODAL */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-xl p-space-lg shadow-2xl relative">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <span className="material-symbols-outlined text-secondary text-[22px]">create_new_folder</span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Create New Workspace
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Group related documents and architectural specifications into an isolated workspace.
            </p>

            <div className="space-y-space-md">
              <div>
                <label className="block font-label-ui text-label-ui text-on-surface-variant mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Lab"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high px-3 py-2 rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block font-label-ui text-label-ui text-on-surface-variant mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real-time CRDT coursework specs"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high px-3 py-2 rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-sm mt-space-lg">
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="px-space-md py-1.5 font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => createWsMutation.mutate()}
                disabled={!newWsName.trim() || createWsMutation.isPending}
                className="px-space-md py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container font-label-ui text-label-ui font-semibold rounded shadow-sm disabled:opacity-50 cursor-pointer"
                type="button"
              >
                {createWsMutation.isPending ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RBAC Document Share Modal */}
      {shareDoc && (
        <ShareModal
          isOpen={Boolean(shareDoc)}
          onClose={() => setShareDoc(null)}
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
