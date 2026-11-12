'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, UserPlus, Trash2, Users, Loader2, CheckCircle2 } from 'lucide-react';

interface ShareItem {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  role: string;
  sharedAt: string;
}

interface ShareModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export default function ShareModal({ documentId, isOpen, onClose, isOwner }: ShareModalProps) {
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
      setSuccess(`Shared with ${newShare.userEmail} as ${newShare.role}`);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Failed to share document.');
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary-container/10 blur-[40px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Share Document</h3>
              <p className="text-xs text-on-surface-variant font-mono">Configure 3-Tier Access Permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-2.5 rounded-lg bg-primary-container/20 border border-primary-container/40 text-primary-container text-xs flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Add collaborator form (only for OWNER) */}
        {isOwner ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) {
                shareMutation.mutate({ email: email.trim().toLowerCase(), role });
              }
            }}
            className="mt-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="colleague@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-surface-container-lowest border border-surface-container-high px-3 py-2 rounded-lg text-xs font-mono text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary-container"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
                className="bg-surface-container-lowest border border-surface-container-high px-3 py-2 rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="EDITOR">Editor (Read/Write)</option>
                <option value="VIEWER">Viewer (Read Only)</option>
              </select>

              <button
                type="submit"
                disabled={shareMutation.isPending || !email.trim()}
                className="px-4 py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container font-mono text-xs font-semibold rounded-lg shadow-emerald-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {shareMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                <span>Invite</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 p-3 bg-surface-container-lowest border border-surface-container-high rounded-lg text-xs text-on-surface-variant font-mono">
            Only the document OWNER can invite or change collaborator permissions.
          </div>
        )}

        {/* Existing Collaborators List */}
        <div className="mt-6">
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold block mb-2">
            Active Collaborators ({shares.length})
          </span>

          {isLoading ? (
            <div className="py-6 text-center text-on-surface-variant text-xs font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-container" />
              <span>Loading collaborators...</span>
            </div>
          ) : shares.length === 0 ? (
            <div className="py-6 text-center text-xs text-on-surface-variant font-mono bg-surface-container-lowest rounded-lg border border-surface-container-high">
              This document is private to you. No collaborators added yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-[10px] text-primary-container">
                      {share.userName ? share.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="text-on-surface font-sans font-medium block">{share.userName || share.userEmail}</span>
                      <span className="text-[10px] text-on-surface-variant">{share.userEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                      share.role === 'EDITOR'
                        ? 'bg-secondary-container/20 text-secondary border border-secondary/30'
                        : 'bg-surface-container-high text-on-surface-variant border border-surface-container-highest'
                    }`}>
                      {share.role}
                    </span>

                    {isOwner && (
                      <button
                        onClick={() => removeMutation.mutate(share.id)}
                        className="p-1 text-on-surface-variant hover:text-error transition-colors"
                        title="Remove Collaborator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="mt-6 pt-4 border-t border-surface-container-high flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
