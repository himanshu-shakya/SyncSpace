'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id?: number; fullName: string; email: string; role?: string } | null>(null);

  // Edit profile state
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('syncspace_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const savedUser = localStorage.getItem('syncspace_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setFullName(parsed.fullName || '');
      } catch {
        localStorage.removeItem('syncspace_user');
      }
    }

    // Also fetch fresh profile from backend
    api.get('/auth/me')
      .then((res) => {
        if (res.data) {
          setCurrentUser(res.data);
          setFullName(res.data.fullName || '');
          localStorage.setItem('syncspace_user', JSON.stringify(res.data));
        }
      })
      .catch(() => {
        // use local storage fallback
      });
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirmation do not match.');
        return;
      }
      if (!currentPassword) {
        setErrorMessage('Please enter your current password to set a new password.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: Record<string, string> = { fullName: fullName.trim() };
      if (newPassword && currentPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);

      if (res.data) {
        const updated = {
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
          id: res.data.id,
        };
        setCurrentUser(updated);
        localStorage.setItem('syncspace_user', JSON.stringify(updated));
        if (res.data.token) {
          localStorage.setItem('syncspace_token', res.data.token);
        }
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setErrorMessage(errorObj.response?.data?.error || 'Failed to update profile. Please check your credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('syncspace_token');
    localStorage.removeItem('syncspace_user');
    router.push('/login');
  };

  const userInitial = currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface text-on-surface">
      <AppHeader
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Profile & Account' }
        ]}
        showShareButton={false}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-space-md sm:p-space-lg lg:p-gutter-desktop flex flex-col gap-space-lg">
        {/* Page Title & Overview */}
        <div className="flex flex-col gap-1 pb-space-sm border-b border-surface-container-high/60">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Profile &amp; Account Settings
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your personal details, credentials, and active session.
          </p>
        </div>

        {/* Status Alerts */}
        {successMessage && (
          <div className="p-space-md rounded-lg bg-primary-container/15 border border-primary-container/40 text-primary-container flex items-center gap-space-sm animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-label-ui text-label-ui font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-space-md rounded-lg bg-error-container/20 border border-error-container/50 text-error flex items-center gap-space-sm animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span className="font-label-ui text-label-ui font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Profile & Password Edit Form */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* Edit Profile Card */}
            <form onSubmit={handleSaveProfile} className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/60">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">person</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Personal Information
                  </h2>
                </div>
                <span className="font-label-mono-sm text-xs text-outline">JWT Encrypted</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2">
                {/* Full Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-ui text-label-ui text-on-surface-variant font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                    className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-on-surface focus:outline-none focus:border-primary-container transition-colors text-sm font-label-ui"
                  />
                </div>

                {/* Email Address (Read-only Account Identifier) */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-ui text-label-ui text-on-surface-variant font-medium flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-outline font-label-mono-sm uppercase">Primary ID</span>
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-high/40 border border-surface-container-high text-on-surface-variant opacity-80 cursor-not-allowed text-sm font-label-ui"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-space-md mt-space-sm border-t border-surface-container-high/40 flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]">lock_reset</span>
                  <h3 className="font-label-ui text-label-ui text-on-surface font-semibold">
                    Change Password (Optional)
                  </h3>
                </div>

                <div className="flex flex-col gap-space-sm">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-ui text-xs text-on-surface-variant font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-space-md py-2 rounded-lg bg-surface-container-lowest border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary transition-colors text-sm font-label-ui"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-ui text-xs text-on-surface-variant font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-space-md py-2 rounded-lg bg-surface-container-lowest border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary transition-colors text-sm font-label-ui"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-ui text-xs text-on-surface-variant font-medium">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-space-md py-2 rounded-lg bg-surface-container-lowest border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary transition-colors text-sm font-label-ui"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-space-md flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-ui text-label-ui font-semibold shadow-[0_0_16px_rgba(0,245,160,0.25)] hover:bg-secondary-container transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Identity Summary & Sign Out */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Identity Profile Badge Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-sm text-xs text-outline uppercase tracking-wider">Account</span>
                <span className="px-2 py-0.5 rounded bg-primary-container/15 text-primary-container font-label-mono-sm text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="flex items-center gap-space-md pt-1">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center font-bold text-xl text-on-primary shadow-md">
                    {userInitial}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-container shadow-[0_0_8px_#00f5a0]"></span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                    {currentUser?.fullName || 'User'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {currentUser?.email || ''}
                  </span>
                </div>
              </div>

              <div className="pt-space-xs flex flex-col gap-space-xs font-label-mono-sm text-xs">
                <div className="flex justify-between py-2 px-space-sm rounded bg-surface-container-lowest border border-surface-container-high/60">
                  <span className="text-on-surface-variant">Cloud Database</span>
                  <span className="text-primary-container font-semibold">Neon Postgres</span>
                </div>
                <div className="flex justify-between py-2 px-space-sm rounded bg-surface-container-lowest border border-surface-container-high/60">
                  <span className="text-on-surface-variant">Authorization</span>
                  <span className="text-on-surface font-semibold">Bearer JWT</span>
                </div>
              </div>
            </div>

            {/* Logout / Session Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs text-error">
                <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                <span className="font-headline-sm text-headline-sm font-semibold">Session Management</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Signing out will clear your authentication token and active session from this device.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-space-md rounded-lg bg-error-container/20 hover:bg-error-container/35 text-error border border-error-container/40 font-label-ui text-label-ui font-semibold transition-all flex items-center justify-center gap-space-xs cursor-pointer shadow-sm hover:shadow"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Log Out of SyncSpace</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
