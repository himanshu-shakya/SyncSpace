'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types/document';
import ShareModal from '@/components/ShareModal';
import { useDocumentSync } from '@/hooks/useDocumentSync';
import AppHeader from '@/components/layout/AppHeader';

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
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

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
  const { sendEdit, activePeers } = useDocumentSync({
    documentId: docId,
    userEmail: currentUser?.email,
    userName: currentUser?.fullName,
    onRemoteUpdate: (remoteTitle, remoteContent, senderName) => {
      setContent(remoteContent);
      if (remoteTitle) setTitle(remoteTitle);
      queryClient.setQueryData(['document', docId], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        return { ...(old as Record<string, unknown>), title: remoteTitle || (old as Record<string, unknown>).title, content: remoteContent };
      });
      setRemoteEditNotice(`${senderName} is editing live...`);

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
    sendEdit(title, newVal);
  };

  const handleTitleChange = (newTitle: string) => {
    if (document?.role === 'VIEWER') return;
    setTitle(newTitle);
    setHasUnsavedChanges(true);
    sendEdit(newTitle, content);
  };

  // Track cursor position in editor
  const handleTextareaSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const lines = textarea.value.substring(0, pos).split('\n');
    setCursorPosition({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Image upload handler
  const uploadImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, GIF, WebP, SVG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // NOTE: Never set Content-Type manually for FormData in Axios/fetch; let browser calculate boundary
      const res = await api.post('/uploads', formData);

      let imageUrl: string = res.data.url;
      if (imageUrl.startsWith('/')) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://syncspace-1-ntfh.onrender.com';
        imageUrl = `${apiBase}${imageUrl}`;
      } else if (imageUrl.includes('localhost:8080') && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://syncspace-1-ntfh.onrender.com';
        imageUrl = imageUrl.replace('http://localhost:8080', apiBase);
      }

      const cleanName = file.name.replace(/[[\]]/g, '');
      const markdownImage = `\n![${cleanName}](${imageUrl})\n`;
      insertFormatting(markdownImage, '', false);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      alert(errorObj.response?.data?.error || 'Failed to upload image. Must be image file under 10MB.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImageFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          uploadImageFile(file);
          return;
        }
      }
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
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  // Copy HTML to clipboard
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(content);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // Word & line counts
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const lineCount = useMemo(() => {
    return content.split('\n').length;
  }, [content]);

  const readTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-on-surface-variant font-label-mono-sm">
        <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin mb-3"></span>
        <span>Loading document from Spring Boot backend...</span>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-error text-[48px] mb-3">error</span>
        <h2 className="text-xl font-bold text-on-surface mb-2">Document not found or inaccessible</h2>
        <p className="text-xs text-on-surface-variant mb-6">
          You may not have permission to view this document or it was deleted.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-primary-container text-on-primary-container font-semibold rounded-lg font-label-ui text-label-ui shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isReadOnly = document.role === 'VIEWER';

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top Application Header */}
      <AppHeader
        breadcrumbs={[
          { label: 'SyncSpace', href: '/dashboard' },
          { label: 'Documents', href: '/dashboard' },
          { label: title || 'Untitled Document' }
        ]}
        showShareButton={document.role === 'OWNER'}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      {/* Main Document Content Canvas */}
      <main className="w-full pt-14 bg-surface min-h-screen flex flex-col">
        {/* Document Sub-Header & Live Presence Hub */}
        <div className="w-full bg-surface-container-low/95 px-margin-tablet lg:px-gutter-desktop py-space-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-sm shadow-sm border-b border-surface-container-high/60">
          
          {/* Breadcrumb, Title & Cloud Sync Indicator */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm text-on-surface-variant truncate">
              <span onClick={() => router.push('/dashboard')} className="hover:text-primary transition-colors cursor-pointer">
                Knowledge Hub
              </span>
              <span className="text-outline-variant font-sans">/</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Specs</span>
              <span className="text-outline-variant font-sans">/</span>
              <span className="text-secondary font-medium truncate">
                {title ? `${title.toLowerCase().replace(/\s+/g, '-')}.md` : 'untitled.md'}
              </span>
            </div>

            <div className="flex items-center gap-space-md flex-wrap">
              <div className="group flex items-center gap-space-xs min-w-0">
                <input
                  type="text"
                  value={title}
                  disabled={isReadOnly}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Document Title..."
                  className="font-headline-md text-headline-md text-on-surface bg-transparent hover:bg-surface-container/60 focus:bg-surface-container px-space-xs py-0.5 rounded transition-colors focus:outline-none focus:text-primary min-w-[260px] md:min-w-[380px] font-semibold border-b border-transparent focus:border-primary-container truncate"
                />
              </div>

              {/* Sync Latency / Save Status Pill */}
              <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest border border-surface-container-high/50">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    saveMutation.isPending ? 'bg-secondary animate-ping' : hasUnsavedChanges ? 'bg-tertiary-fixed-dim' : 'bg-primary-container animate-ping'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    saveMutation.isPending ? 'bg-secondary' : hasUnsavedChanges ? 'bg-tertiary-fixed-dim' : 'bg-primary-container'
                  }`}></span>
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-primary font-medium tracking-tight">
                  {saveMutation.isPending ? 'Saving...' : hasUnsavedChanges ? 'Unsaved edits' : 'Saved to Cloud'}
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant hidden sm:inline">
                  · Spring Boot STOMP
                </span>
              </div>

              {/* Remote Edit Notification */}
              {remoteEditNotice && (
                <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-container/15 text-primary-container border border-primary-container/30 font-label-mono-sm text-[11px] animate-pulse">
                  <span className="material-symbols-outlined text-[13px]">sync</span>
                  <span>{remoteEditNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Collaborator Stack & Global Actions */}
          <div className="flex items-center gap-space-md justify-between xl:justify-end flex-wrap">
            {/* Live Collaborators Avatars */}
            <div className="flex items-center gap-space-sm bg-surface-container px-space-sm py-1 rounded border border-surface-container-highest/60">
              <div className="flex items-center -space-x-1.5">
                {/* Active Current User */}
                <div className="relative group cursor-pointer" title={`${currentUser?.fullName || 'You'} (You - Active)`}>
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-mono-sm text-xs font-bold shadow-[0_0_0_2px_rgba(0,245,160,0.5)]">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'ME'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_#00f5a0]"></span>
                </div>

                {/* Actual Real Collaborators Accessing Document */}
                {activePeers.map((peer) => {
                  const initial = peer.name ? peer.name.charAt(0).toUpperCase() : peer.email.charAt(0).toUpperCase();
                  return (
                    <div
                      key={peer.email}
                      className="relative group cursor-pointer animate-in fade-in zoom-in duration-200"
                      title={`${peer.name || peer.email} (Viewing document)`}
                    >
                      <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-mono-sm text-xs font-bold shadow-[0_0_0_2px_rgba(0,215,244,0.5)]">
                        {initial}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_#00d7f4]"></span>
                    </div>
                  );
                })}
              </div>

              {/* Status Badge */}
              <span className="text-[11px] font-label-mono-sm text-on-surface-variant font-medium select-none">
                {activePeers.length === 0 ? 'Only you' : `${activePeers.length + 1} active`}
              </span>

              {document.role === 'OWNER' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1 font-label-ui text-label-ui text-primary-fixed hover:text-primary transition-colors pl-1 cursor-pointer border-l border-surface-container-highest/60 ml-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Share</span>
                </button>
              )}
            </div>

            {/* Segmented View Mode Controller */}
            <div className="flex items-center bg-surface-container-lowest p-0.5 rounded border border-surface-container-highest/60">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-space-sm py-1 rounded font-label-ui text-label-ui transition-all cursor-pointer ${
                  viewMode === 'editor'
                    ? 'bg-surface-container-high text-primary-container font-medium shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Raw Markdown
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-space-sm py-1 rounded font-label-ui text-label-ui font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-surface-container-high text-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">vertical_split</span>
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-space-sm py-1 rounded font-label-ui text-label-ui transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-surface-container-high text-primary-container font-medium shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Rendered
              </button>
            </div>

            {/* Save / Manual Save Action */}
            <div className="flex items-center gap-1">
              {!isReadOnly && (
                <button
                  onClick={handleManualSave}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-1 px-space-md py-1.5 bg-primary-container hover:bg-secondary-container text-on-primary-container rounded font-label-ui text-label-ui font-semibold transition-all shadow-[0_0_12px_rgba(0,245,160,0.2)] disabled:opacity-50 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {saveMutation.isPending ? 'sync' : 'save'}
                  </span>
                  <span>{saveMutation.isPending ? 'Saving' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Formatting Sticky Ribbon (Distraction-Free Toolbar) */}
        {!isReadOnly && (
          <div className="sticky top-14 z-30 w-full bg-surface-container-lowest/90 backdrop-blur-md px-margin-tablet lg:px-gutter-desktop py-1.5 flex items-center justify-between gap-space-sm overflow-x-auto shadow-sm border-b border-surface-container-high/60">
            <div className="flex items-center gap-0.5 min-w-max">
              {/* Headings Quick Action */}
              <button
                onClick={() => insertFormatting('# ', '', false)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container text-on-surface font-label-mono-sm text-xs font-semibold"
                title="Heading 1"
                type="button"
              >
                <span className="text-primary-container">H1</span>
              </button>
              <button
                onClick={() => insertFormatting('## ', '', false)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container text-on-surface font-label-mono-sm text-xs font-semibold"
                title="Heading 2"
                type="button"
              >
                <span className="text-secondary">H2</span>
              </button>
              <button
                onClick={() => insertFormatting('### ', '', false)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container text-on-surface font-label-mono-sm text-xs font-semibold"
                title="Heading 3"
                type="button"
              >
                <span className="text-on-surface-variant">H3</span>
              </button>

              <div className="h-4 w-[1px] bg-surface-container-high mx-1"></div>

              {/* Text Styling */}
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Bold (⌘B)"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Italic (⌘I)"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
              </button>
              <button
                onClick={() => insertFormatting('~~', '~~')}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Strikethrough"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">format_strikethrough</span>
              </button>
              <button
                onClick={() => insertFormatting('`', '`')}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Inline Code"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>

              <div className="h-4 w-[1px] bg-surface-container-high mx-1"></div>

              {/* Block Formats */}
              <button
                onClick={() => insertFormatting('> ', '', false)}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Blockquote"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">format_quote</span>
              </button>
              <button
                onClick={() => insertFormatting('- ', '', false)}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Bullet List"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              </button>
              <button
                onClick={() => insertFormatting('- [ ] ', '', false)}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Task List"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">checklist</span>
              </button>
              <button
                onClick={() => insertFormatting('\n```typescript\n', '\n```\n', true)}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Code Block"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">data_object</span>
              </button>

              <div className="h-4 w-[1px] bg-surface-container-high mx-1"></div>

              {/* Insertables */}
              <button
                onClick={() => insertFormatting('$$\n', '\n$$', true)}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="KaTeX Math Block"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">functions</span>
              </button>
              <button
                onClick={() => insertFormatting('[', '](https://)')}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Insert Link"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
                title="Upload Image"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isUploadingImage ? 'sync' : 'image'}
                </span>
              </button>
              <button
                onClick={() => insertFormatting('\n| Feature | Status | SLA |\n|---|---|---|\n| Delta Sync | Active | 99.9% |\n', '', false)}
                className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Insert Table"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">table</span>
              </button>
            </div>

            {/* Quick Shortcuts Pill */}
            <div className="flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm text-on-surface-variant/80 shrink-0 hidden sm:flex">
              <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px]">Auto-Save: 2s</span>
              <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px]">⌘S manual save</span>
            </div>
          </div>
        )}

        {/* Read-Only Notice Bar */}
        {isReadOnly && (
          <div className="w-full bg-surface-container-high/60 border-b border-surface-container-highest px-gutter-desktop py-2 flex items-center justify-between text-xs text-secondary font-label-mono-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Read-Only Mode: You have Viewer permissions for this document.</span>
            </div>
          </div>
        )}

        {/* Main Split Canvas */}
        <div className={`w-full flex-1 grid ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        } min-h-[calc(100vh-12rem)] bg-surface-container-lowest`}>
          
          {/* LEFT PANE: Raw Markdown Editor */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <section aria-label="Raw Markdown Editor" className="flex flex-col bg-surface-container-low min-w-0 border-r border-surface-container-high/60">
              {/* Editor Subheader */}
              <div className="px-space-md py-1.5 bg-surface-container flex items-center justify-between font-label-mono-sm text-label-mono-sm text-on-surface-variant border-b border-surface-container-high/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">terminal</span>
                  <span className="text-on-surface font-medium">source/{title ? `${title.slice(0, 20)}.md` : 'doc.md'}</span>
                  <span className="text-[10px] px-1 rounded bg-surface-container-highest text-secondary">
                    GFM Markdown
                  </span>
                </div>
                <div className="flex items-center gap-space-sm text-[11px]">
                  <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
                  <span className="hidden sm:inline">Lines: {lineCount}</span>
                </div>
              </div>

              {/* Editor Code Canvas with Line Numbers */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Line Numbers Gutter */}
                <div className="py-space-md px-2 text-right text-outline select-none font-label-mono-sm text-label-mono-sm space-y-0.5 opacity-50 bg-surface-container-lowest/50 border-r border-surface-container-high/30 hidden sm:block">
                  {Array.from({ length: Math.min(lineCount, 60) }, (_, i) => (
                    <div key={i + 1} className="leading-relaxed">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  ))}
                </div>

                {/* Markdown Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  disabled={isReadOnly}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onPaste={handlePaste}
                  onSelect={handleTextareaSelect}
                  onKeyUp={handleTextareaSelect}
                  onClick={handleTextareaSelect}
                  placeholder="# Write your Markdown knowledge document here..."
                  className="flex-1 p-space-md font-code-block text-code-block bg-transparent text-on-surface focus:outline-none resize-none leading-relaxed placeholder:text-outline/40 overflow-y-auto selection:bg-primary-container selection:text-on-primary-container"
                />
              </div>
            </section>
          )}

          {/* RIGHT PANE: Live Rendered Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <section aria-label="Rendered Markdown Preview" className="flex flex-col bg-surface min-w-0">
              {/* Preview Subheader */}
              <div className="px-space-md py-1.5 bg-surface-container flex items-center justify-between font-label-mono-sm text-label-mono-sm text-on-surface-variant border-b border-surface-container-high/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-secondary">visibility</span>
                  <span className="text-on-surface font-medium">Rendered Article Output</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-container/10 text-primary-container font-semibold">
                    Live Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHtml}
                    className="hover:text-primary text-[11px] flex items-center gap-0.5 cursor-pointer text-on-surface-variant"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {copiedHtml ? 'done' : 'content_copy'}
                    </span>
                    <span>{copiedHtml ? 'Copied' : 'Copy Source'}</span>
                  </button>
                </div>
              </div>

              {/* Prose Content Stream */}
              <div className="flex-1 p-space-lg md:p-space-xl max-w-3xl mx-auto w-full overflow-y-auto font-body-lg text-body-lg leading-relaxed text-on-surface">
                {/* Header Title with Emerald Underline Accent */}
                <div className="mb-space-lg pb-space-sm border-b border-surface-container-high">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-label-mono-sm text-[11px] px-2 py-0.5 rounded bg-surface-container text-primary-container font-semibold">
                      {document.role || 'OWNER'}
                    </span>
                    <span className="font-label-mono-sm text-[11px] text-on-surface-variant">
                      Updated {document.updatedAt ? new Date(document.updatedAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                  <h1 className="font-display-hero text-headline-lg font-bold tracking-tight text-on-surface">
                    {title || 'Untitled Document'}
                  </h1>
                </div>

                {/* ReactMarkdown Formatted Output */}
                <div className="prose prose-invert max-w-none space-y-4 text-on-surface">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ ...props }) => (
                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-6 mb-3 border-b border-surface-container-highest pb-2" {...props} />
                      ),
                      h2: ({ ...props }) => (
                        <h2 className="font-headline-md text-headline-md font-semibold text-primary mt-5 mb-2.5" {...props} />
                      ),
                      h3: ({ ...props }) => (
                        <h3 className="font-headline-sm text-headline-sm font-semibold text-secondary mt-4 mb-2" {...props} />
                      ),
                      p: ({ ...props }) => (
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed my-2" {...props} />
                      ),
                      ul: ({ ...props }) => (
                        <ul className="list-disc list-inside space-y-1 text-on-surface-variant my-2" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="list-decimal list-inside space-y-1 text-on-surface-variant my-2" {...props} />
                      ),
                      li: ({ ...props }) => (
                        <li className="font-body-sm text-body-sm my-0.5" {...props} />
                      ),
                      blockquote: ({ ...props }) => (
                        <blockquote className="my-3 p-space-md rounded bg-surface-container-low border-l-4 border-secondary-container text-on-surface font-body-sm" {...props} />
                      ),
                      code: ({ className, children, ...props }) => {
                        const isBlock = className?.includes('language-');
                        return isBlock ? (
                          <div className="my-3 rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high shadow-md">
                            <div className="px-3 py-1 bg-surface-container-high flex items-center justify-between font-label-mono-sm text-[10px] text-primary-container">
                              <span>CODE BLOCK</span>
                            </div>
                            <pre className="p-3 text-xs font-code-block text-on-surface overflow-x-auto leading-relaxed">
                              <code {...props}>{children}</code>
                            </pre>
                          </div>
                        ) : (
                          <code className="px-1.5 py-0.5 rounded bg-surface-container-high text-secondary font-code-inline text-code-inline" {...props}>
                            {children}
                          </code>
                        );
                      },
                      table: ({ ...props }) => (
                        <div className="overflow-x-auto my-6 rounded-lg border border-surface-container-high bg-surface-container-lowest/60 shadow-lg">
                          <table className="w-full text-left text-xs font-label-ui border-collapse" {...props} />
                        </div>
                      ),
                      thead: ({ ...props }) => (
                        <thead className="bg-surface-container-high text-on-surface uppercase text-[11px] tracking-wider border-b border-surface-container-highest" {...props} />
                      ),
                      tbody: ({ ...props }) => (
                        <tbody className="divide-y divide-surface-container-high/60 text-on-surface-variant font-body-sm" {...props} />
                      ),
                      tr: ({ ...props }) => (
                        <tr className="hover:bg-surface-container/40 transition-colors" {...props} />
                      ),
                      th: ({ ...props }) => (
                        <th className="px-4 py-3 font-semibold text-primary-container" {...props} />
                      ),
                      td: ({ ...props }) => (
                        <td className="px-4 py-3 text-on-surface-variant" {...props} />
                      ),
                      input: ({ type, checked, ...props }) => {
                        if (type === 'checkbox') {
                          return (
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="mr-2 rounded border-surface-container-high text-primary-container focus:ring-0 cursor-default"
                              {...props}
                            />
                          );
                        }
                        return <input type={type} {...props} />;
                      },
                      img: ({ src, alt, ...props }) => {
                        let resolvedSrc = src;
                        if (resolvedSrc && resolvedSrc.startsWith('/uploads/')) {
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://syncspace-1-ntfh.onrender.com';
                          resolvedSrc = `${apiBase}${resolvedSrc}`;
                        } else if (resolvedSrc && resolvedSrc.includes('localhost:8080') && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://syncspace-1-ntfh.onrender.com';
                          resolvedSrc = resolvedSrc.replace('http://localhost:8080', apiBase);
                        }
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolvedSrc}
                            className="max-w-full rounded-lg border border-surface-container-high my-4 shadow-md object-contain max-h-[500px]"
                            alt={alt || 'Uploaded Document Asset'}
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {content || '*No content written yet. Click on the left editor to start typing.*'}
                  </ReactMarkdown>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Document Status Bar (Footer Matrix) */}
        <footer className="w-full bg-surface-container-lowest px-margin-tablet lg:px-gutter-desktop py-1 flex items-center justify-between font-label-mono-sm text-label-mono-sm text-on-surface-variant overflow-x-auto border-t border-surface-container-high/60">
          <div className="flex items-center gap-space-md shrink-0">
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-primary-container">sync_alt</span>
              <span className="font-medium text-primary">Markdown GFM</span>
            </div>
            <span className="text-outline-variant">·</span>
            <span>UTF-8</span>
            <span className="text-outline-variant">·</span>
            <span>{wordCount} words</span>
            <span className="text-outline-variant">·</span>
            <span>{readTime} min read</span>
          </div>

          <div className="flex items-center gap-space-md shrink-0">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              <span>Spring Boot WSS: 0.8ms</span>
            </div>
            <span className="text-outline-variant">·</span>
            <span className="text-secondary font-medium">Java 21 Engine</span>
          </div>
        </footer>
      </main>

      {/* Share Modal Dialog */}
      <ShareModal
        documentId={docId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isOwner={document.role === 'OWNER'}
      />
    </div>
  );
}
