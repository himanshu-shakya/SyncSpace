'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ShareItem {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  role: string;
  sharedAt: string;
}

interface ShareModalProps {
  documentId: string | number;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
  documentTitle?: string;
}

export default function ShareModal({
  documentId,
  isOpen,
  onClose,
  isOwner = true,
  documentTitle,
}: ShareModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current shares
  const { data: shares = [], isLoading } = useQuery<ShareItem[]>({
    queryKey: ['documentShares', documentId],
    queryFn: async () => {
      const res = await api.get(`/documents/${documentId}/shares`);
      return res.data;
    },
    enabled: isOpen,
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await api.post(`/documents/${documentId}/share`, data);
      return res.data;
    },
    onSuccess: (newShare) => {
      queryClient.invalidateQueries({ queryKey: ['documentShares', documentId] });
      setEmail('');
      setError(null);
      setSuccess(`Access granted to ${newShare.userEmail} as ${newShare.role}`);
      setTimeout(() => setSuccess(null), 3500);
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Failed to share document. Make sure the user exists.');
    },
  });

  // Remove share mutation
  const removeMutation = useMutation({
    mutationFn: async (shareId: number) => {
      await api.delete(`/documents/${documentId}/shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentShares', documentId] });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-space-md selection:bg-primary-container selection:text-on-primary-container">
      <div className="w-full max-w-lg bg-surface-container-low border border-surface-container-highest/60 rounded-xl p-space-lg shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-container/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/60">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(0,245,160,0.2)]">
              <span className="material-symbols-outlined text-[20px]">group_add</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight truncate max-w-xs sm:max-w-md">
                {documentTitle ? `Share "${documentTitle}"` : 'Share Document'}
              </h3>
              <p className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">
                Role-Based Access Control (RBAC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="mt-space-md p-space-sm rounded-lg bg-error-container/20 border border-error/30 text-error text-body-sm font-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-space-md p-space-sm rounded-lg bg-primary-container/20 border border-primary-container/40 text-primary-container text-body-sm font-body-sm flex items-center gap-2 font-label-mono-sm">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Invite Collaborator Form (Enabled only for OWNER) */}
        {isOwner ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) {
                shareMutation.mutate({ email: email.trim().toLowerCase(), role });
              }
            }}
            className="mt-space-md space-y-space-sm"
          >
            <label className="block font-label-ui text-label-ui text-on-surface-variant">
              Invite by Email
            </label>
            <div className="flex flex-col sm:flex-row gap-space-xs">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                  alternate_email
                </span>
                <input
                  type="email"
                  placeholder="collaborator@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-primary-container focus:bg-surface-container-high transition-all placeholder:text-outline/60"
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
                className="bg-surface-container-lowest border border-surface-container-highest px-3 py-2 rounded-lg font-label-mono-sm text-xs text-on-surface focus:outline-none focus:border-primary-container cursor-pointer"
              >
                <option value="EDITOR">Editor (Read / Write)</option>
                <option value="VIEWER">Viewer (Read Only)</option>
              </select>

              <button
                type="submit"
                disabled={shareMutation.isPending || !email.trim()}
                className="px-space-md py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container font-label-ui text-label-ui font-semibold rounded-lg shadow-[0_0_16px_rgba(0,245,160,0.25)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {shareMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                    <span>Inviting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Grant Access</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-space-md p-space-sm bg-surface-container-lowest border border-surface-container-high rounded-lg font-label-mono-sm text-xs text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Only the document OWNER has administrative permission to manage collaborator access.</span>
          </div>
        )}

        {/* Existing Collaborators List */}
        <div className="mt-space-lg">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Collaborators
            </span>
            <span className="font-label-mono-sm text-[11px] text-primary-container bg-surface-container px-2 py-0.5 rounded">
              {shares.length} {shares.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-on-surface-variant font-label-mono-sm text-xs flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></span>
              <span>Loading collaborator permissions...</span>
            </div>
          ) : shares.length === 0 ? (
            <div className="py-6 text-center font-label-mono-sm text-xs text-on-surface-variant bg-surface-container-lowest rounded-lg border border-surface-container-high">
              This document is currently private. No external collaborators have access.
            </div>
          ) : (
            <div className="space-y-space-xs max-h-48 overflow-y-auto pr-1">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:border-surface-container-highest transition-colors"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center font-bold text-xs text-primary-container shrink-0 font-label-mono-sm">
                      {share.userName ? share.userName.charAt(0).toUpperCase() : share.userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-on-surface font-body-sm text-body-sm font-medium truncate">
                        {share.userName || share.userEmail}
                      </span>
                      <span className="font-label-mono-sm text-[11px] text-on-surface-variant truncate">
                        {share.userEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm shrink-0">
                    <span className={`text-[10px] font-label-mono-sm font-semibold px-2 py-0.5 rounded uppercase ${
                      share.role === 'EDITOR'
                        ? 'bg-secondary-container/20 text-secondary border border-secondary/30'
                        : 'bg-surface-container-high text-on-surface-variant border border-surface-container-highest'
                    }`}>
                      {share.role}
                    </span>

                    {isOwner && (
                      <button
                        onClick={() => removeMutation.mutate(share.id)}
                        className="p-1 text-on-surface-variant hover:text-error transition-colors rounded cursor-pointer"
                        title="Revoke Permission"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Done Footer */}
        <div className="mt-space-lg pt-space-sm border-t border-surface-container-high/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-mono-sm text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span>Real-time WebSocket sync enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui rounded transition-colors cursor-pointer"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
