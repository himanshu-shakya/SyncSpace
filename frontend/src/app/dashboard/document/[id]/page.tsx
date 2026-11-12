'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types/document';
import ShareModal from '@/components/ShareModal';
import { useDocumentSync } from '@/hooks/useDocumentSync';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Link as LinkIcon,
  Columns,
  Loader2,
  AlertCircle,
  Share2,
  Lock,
  Image as ImageIcon,
  Table as TableIcon
} from 'lucide-react';

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const docId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [remoteEditNotice, setRemoteEditNotice] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; fullName: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read current user info from localStorage
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

  // 1. Fetch document from Spring Boot
  const { data: document, isLoading, isError } = useQuery<DocumentItem>({
    queryKey: ['document', docId],
    queryFn: async () => {
      const res = await api.get(`/documents/${docId}`);
      return res.data;
    },
    enabled: !!docId,
  });

  // When initial data loads, populate state
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content || '');
    }
  }, [document]);

  // 2. Real-Time WebSocket Collaboration hook
  const { sendEdit } = useDocumentSync({
    documentId: docId,
    userEmail: currentUser?.email,
    userName: currentUser?.fullName,
    onRemoteUpdate: (remoteTitle, remoteContent, senderName) => {
      setContent(remoteContent);
      if (remoteTitle) setTitle(remoteTitle);
      setRemoteEditNotice(`🟢 ${senderName} is editing live...`);

      const timer = setTimeout(() => {
        setRemoteEditNotice(null);
      }, 4000);
      return () => clearTimeout(timer);
    },
  });

  // 3. Save Mutation
  const saveMutation = useMutation({
    mutationFn: async ({ newTitle, newContent }: { newTitle: string; newContent: string }) => {
      const res = await api.put(`/documents/${docId}`, {
        title: newTitle,
        content: newContent,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      setHasUnsavedChanges(false);
      queryClient.setQueryData(['document', docId], updated);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  // Manual save trigger
  const handleManualSave = useCallback(() => {
    if (document?.role === 'VIEWER') return;
    saveMutation.mutate({ newTitle: title, newContent: content });
  }, [title, content, saveMutation, document]);

  // Debounced auto-save (2 seconds after typing stops)
  useEffect(() => {
    if (!hasUnsavedChanges || document?.role === 'VIEWER') return;

    const timer = setTimeout(() => {
      saveMutation.mutate({ newTitle: title, newContent: content });
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, title, hasUnsavedChanges, saveMutation, document]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  const handleContentChange = (newVal: string) => {
    if (document?.role === 'VIEWER') return;
    setContent(newVal);
    setHasUnsavedChanges(true);

    if (currentUser) {
      sendEdit(title, newVal);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (document?.role === 'VIEWER') return;
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = res.data.url;
      const markdownImage = `\n![${file.name}](${imageUrl})\n`;
      insertFormatting(markdownImage, '', false);
    } catch {
      alert('Failed to upload image. Must be image file under 5MB.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Insert markdown helper
  const insertFormatting = (prefix: string, suffix: string = '', wrap: boolean = true) => {
    if (document?.role === 'VIEWER') return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    if (wrap) {
      replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    } else {
      replacement = `${prefix}${suffix}`;
    }

    const updated = content.substring(0, start) + replacement + content.substring(end);
    handleContentChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex flex-col items-center justify-center text-on-surface-variant font-mono text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-primary-container mb-3" />
        <span>Loading document and WebSocket session...</span>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-low border border-surface-container-high rounded-xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
          <h2 className="text-lg font-bold text-on-surface">Document Not Found or Access Denied</h2>
          <p className="text-xs text-on-surface-variant mt-2 mb-6">
            You might not have permission to view this document, or it has been deleted.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary-container text-on-primary-container font-mono text-xs font-semibold rounded-lg shadow-emerald-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isViewer = document.role === 'VIEWER';
  const isOwner = document.role === 'OWNER';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface text-on-surface flex flex-col">
      
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
      />

      {/* TOP HEADER / ACTION BAR */}
      <div className="bg-surface-container-low border-b border-surface-container-high px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30">
        
        {/* Left: Back Arrow + Document Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={title}
              disabled={isViewer}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Document Title"
              className="bg-transparent text-sm sm:text-base font-bold text-on-surface focus:outline-none focus:bg-surface-container-high/40 px-2 py-1 rounded transition-colors truncate max-w-md w-full"
            />
            {isViewer && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                <Lock className="w-3 h-3 text-secondary" /> Read-Only
              </span>
            )}
          </div>
        </div>

        {/* Right: Presence, Status, View Switcher & Share */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Live Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant">
            {saveMutation.isPending ? (
              <span className="flex items-center gap-1 text-tertiary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-secondary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Unsaved</span>
              </span>
            ) : (
              <span className="text-primary-container flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-container" />
                <span>Synced</span>
              </span>
            )}
          </div>

          {/* Segmented View Mode Controller */}
          <div className="flex items-center bg-surface-container-lowest border border-surface-container-high p-0.5 rounded-lg text-xs font-mono">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded transition-all ${viewMode === 'editor' ? 'bg-surface-container-high text-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Raw Editor Only"
            >
              Raw
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${viewMode === 'split' ? 'bg-surface-container-high text-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded transition-all ${viewMode === 'preview' ? 'bg-surface-container-high text-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Rendered Preview Only"
            >
              Rendered
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-primary-container" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Manual Save Button */}
          {!isViewer && (
            <button
              onClick={handleManualSave}
              disabled={saveMutation.isPending || !hasUnsavedChanges}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg text-xs font-mono font-semibold shadow-emerald-sm transition-all disabled:opacity-40"
              title="Save (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5 sm:mr-1 inline" />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}

        </div>
      </div>

      {/* REMOTE COLLABORATOR LIVE BANNER */}
      {remoteEditNotice && (
        <div className="bg-primary-container/15 border-b border-primary-container/30 px-6 py-1.5 text-xs font-mono text-primary-container flex items-center justify-between animate-pulse">
          <span>{remoteEditNotice}</span>
          <span className="text-[10px] text-on-surface-variant">WebSocket STOMP Parity</span>
        </div>
      )}

      {/* FORMATTING TOOLBAR RIBBON */}
      {!isViewer && (
        <div className="bg-surface-container-lowest border-b border-surface-container-high px-4 sm:px-6 py-1.5 flex items-center justify-between gap-1 overflow-x-auto text-on-surface-variant">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => insertFormatting('# ', '', false)}
              className="px-2 py-1 hover:bg-surface-container hover:text-on-surface rounded text-xs font-mono font-semibold"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => insertFormatting('## ', '', false)}
              className="px-2 py-1 hover:bg-surface-container hover:text-on-surface rounded text-xs font-mono font-semibold"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => insertFormatting('### ', '', false)}
              className="px-2 py-1 hover:bg-surface-container hover:text-on-surface rounded text-xs font-mono font-semibold"
              title="Heading 3"
            >
              H3
            </button>

            <div className="h-4 w-[1px] bg-surface-container-high mx-1" />

            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('`', '`')}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('```\n', '\n```', true)}
              className="px-2 py-1 hover:bg-surface-container hover:text-on-surface rounded text-xs font-mono"
              title="Code Block"
            >
              &lt;/&gt;
            </button>

            <div className="h-4 w-[1px] bg-surface-container-high mx-1" />

            <button
              onClick={() => insertFormatting('- ', '', false)}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('1. ', '', false)}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('> ', '', false)}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('[', '](https://)')}
              className="p-1.5 hover:bg-surface-container hover:text-on-surface rounded transition-colors"
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-surface-container-high mx-1" />

            {/* Image upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="flex items-center gap-1 px-2 py-1 hover:bg-surface-container hover:text-primary-container rounded transition-colors text-xs font-mono"
              title="Upload Image"
            >
              {isUploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Image</span>
            </button>

            {/* Table template */}
            <button
              onClick={() => insertFormatting('\n| Feature | Status | Notes |\n| :--- | :--- | :--- |\n| WebSockets | Ready | STOMP |\n| Storage | Persistent | H2 |\n\n', '', false)}
              className="flex items-center gap-1 px-2 py-1 hover:bg-surface-container hover:text-secondary rounded transition-colors text-xs font-mono"
              title="Insert Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Word & Character counts */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-on-surface-variant/70">
            <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
            <span>·</span>
            <span>{content.length} chars</span>
          </div>
        </div>
      )}

      {/* EDITOR CANVAS (SPLIT PANES) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Raw Markdown Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`flex flex-col bg-surface-container-lowest ${viewMode === 'split' ? 'w-full md:w-1/2 border-r border-surface-container-high' : 'w-full'} overflow-hidden`}>
            <textarea
              ref={textareaRef}
              value={content}
              disabled={isViewer}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write Markdown here... Use # for headings, - for lists, ``` for code blocks"
              className="w-full flex-1 p-6 bg-surface-container-lowest text-on-surface font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:bg-surface-container-low/10 overflow-y-auto selection:bg-primary-container selection:text-on-primary-container"
              spellCheck={false}
            />
          </div>
        )}

        {/* Right: Live Rendered Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`flex flex-col bg-surface overflow-y-auto ${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'} p-6 sm:p-8`}>
            <div className="max-w-3xl mx-auto w-full prose prose-invert">
              <ReactMarkdown>{content || '*No content yet. Start typing on the left to see live Markdown preview...*'}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>

      {/* SHARE MODAL */}
      <ShareModal
        documentId={docId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isOwner={isOwner}
      />

    </div>
  );
}
