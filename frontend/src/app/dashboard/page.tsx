'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types/document';
import AppHeader from '@/components/layout/AppHeader';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Search, 
  ArrowRight, 
  Loader2, 
  LayoutGrid, 
  List as ListIcon, 
  Clock
} from 'lucide-react';

interface WorkspaceItem {
  id: number;
  name: string;
  description: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [activeTab] = useState<'all' | 'owned' | 'shared'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('syncspace_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // 1. Fetch Documents
  const { data: documents = [], isLoading, isError } = useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    },
    enabled: isClient && !!localStorage.getItem('syncspace_token'),
  });

  // 2. Fetch Workspaces
  const { data: workspaces = [] } = useQuery<WorkspaceItem[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
    enabled: isClient && !!localStorage.getItem('syncspace_token'),
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkspace = selectedWorkspace === null || doc.workspaceId === selectedWorkspace;
    if (!matchesSearch || !matchesWorkspace) return false;

    if (activeTab === 'owned') return doc.role === 'OWNER';
    if (activeTab === 'shared') return doc.role === 'EDITOR' || doc.role === 'VIEWER';
    return true;
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'SyncSpace', href: '/dashboard' },
          { label: selectedWorkspace ? workspaces.find(w => w.id === selectedWorkspace)?.name || 'Workspace' : 'Engineering' },
          { label: 'Knowledge Hub' }
        ]}
        showShareButton={false}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 pt-16 sm:pt-20 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Bar: Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                {selectedWorkspace ? workspaces.find(w => w.id === selectedWorkspace)?.name || 'Workspace' : 'Knowledge Hub'}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Manage, write, and collaborate on your Markdown documents.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-surface-container-low border border-surface-container-high p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-surface-container-high text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-surface-container-high text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Create New Document Button */}
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full sm:w-auto px-4 py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container font-mono text-xs sm:text-sm font-semibold rounded-lg shadow-emerald-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>New Document</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by title... (⌘K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:border-primary-container transition-all placeholder:text-outline/60"
            />
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <Loader2 className="w-8 h-8 animate-spin text-primary-container mb-3" />
              <span className="font-mono text-xs">Loading documents from Spring Boot API...</span>
            </div>
          )}

          {isError && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs sm:text-sm">
              Failed to load documents from Spring Boot API. Make sure you are signed in.
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredDocuments.length === 0 && (
            <div className="border border-dashed border-surface-container-high rounded-xl p-12 text-center flex flex-col items-center justify-center bg-surface-container-lowest">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-on-surface">No documents found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-5">
                {searchTerm ? 'No documents match your search criteria.' : 'Create your very first Markdown knowledge document to start collaborating.'}
              </p>
              <button
                onClick={() => createMutation.mutate()}
                className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-mono text-xs font-semibold shadow-emerald-sm hover:bg-secondary-container transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Document</span>
              </button>
            </div>
          )}

          {/* Document Display: GRID VIEW */}
          {!isLoading && !isError && filteredDocuments.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                  className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary-container/40 transition-all cursor-pointer group flex flex-col justify-between shadow-sm relative overflow-hidden"
                >
                  <div>
                    {/* Header: Title + Role Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base text-on-surface group-hover:text-primary-container transition-colors truncate">
                        {doc.title || 'Untitled Document'}
                      </h3>
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                        doc.role === 'OWNER' 
                          ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                          : doc.role === 'EDITOR'
                          ? 'bg-secondary-container/20 text-secondary border border-secondary/30'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {doc.role || 'OWNER'}
                      </span>
                    </div>

                    {/* Markdown snippet */}
                    <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed font-mono">
                      {doc.content ? doc.content.replace(/[#*`_]/g, '').slice(0, 150) : 'No content yet...'}
                    </p>
                  </div>

                  {/* Footer Meta + Actions */}
                  <div className="mt-5 pt-3 border-t border-surface-container-high flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Just now'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.role === 'OWNER' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this document?')) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          className="p-1 text-on-surface-variant hover:text-error hover:bg-surface-container rounded transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="p-1 text-primary-container group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Document Display: LIST VIEW */}
          {!isLoading && !isError && filteredDocuments.length > 0 && viewMode === 'list' && (
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-surface-container-high">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Role</th>
                    <th className="py-3 px-4 hidden md:table-cell">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                      className="hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-sans font-medium text-on-surface text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary-container flex-shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                          doc.role === 'OWNER' ? 'text-primary-container bg-primary-container/10' : 'text-secondary bg-secondary/10'
                        }`}>
                          {doc.role || 'OWNER'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant hidden md:table-cell">
                        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {doc.role === 'OWNER' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete document?')) deleteMutation.mutate(doc.id);
                            }}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* CREATE WORKSPACE MODAL */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-on-surface mb-1">Create New Workspace</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Group related documents and architectural specifications into a dedicated workspace.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-on-surface-variant mb-1">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Lab"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high px-3 py-2 rounded-lg text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Coursework notes & architecture blueprints"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high px-3 py-2 rounded-lg text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => createWsMutation.mutate()}
                disabled={!newWsName.trim() || createWsMutation.isPending}
                className="px-4 py-1.5 bg-primary-container hover:bg-secondary-container text-on-primary-container font-mono text-xs font-semibold rounded-lg shadow-emerald-sm disabled:opacity-50"
              >
                {createWsMutation.isPending ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
