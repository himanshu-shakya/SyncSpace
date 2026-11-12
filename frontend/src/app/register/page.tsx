'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem('syncspace_token', response.data.token);
      localStorage.setItem('syncspace_user', JSON.stringify(response.data));
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string, mockEmail: string, mockName: string) => {
    setError(null);
    setOauthLoading(true);

    try {
      const response = await api.post('/auth/oauth', {
        email: mockEmail,
        fullName: mockName,
        provider: provider,
      });

      localStorage.setItem('syncspace_token', response.data.token);
      localStorage.setItem('syncspace_user', JSON.stringify(response.data));
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || `${provider} authentication failed.`);
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center p-space-md selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Ambient Radial Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[320px] bg-secondary-container/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[360px] h-[260px] bg-primary-container/10 blur-[110px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col w-full items-center justify-center max-w-[420px] z-10">
        {/* Main Card Component */}
        <div className="w-full bg-surface-container-low border border-surface-container-highest/60 rounded-xl p-space-lg md:p-space-xl shadow-2xl relative">
          {/* Card Top Brand & Identity */}
          <div className="flex flex-col items-center text-center mb-space-lg">
            <Link href="/" className="relative flex items-center justify-center mb-space-sm group">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary-container shadow-[0_0_16px_rgba(0,245,160,0.2)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px] text-primary-container">polyline</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-primary-container"></div>
            </Link>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Create your Workspace account
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-[320px]">
              Spin up an instant knowledge space with real-time sync
            </p>
          </div>

          {/* Single-Click OAuth Providers */}
          <div className="grid grid-cols-2 gap-space-sm mb-space-md">
            <button
              onClick={() => handleOAuthSignIn('GITHUB', 'github.engineer@college.edu', 'GitHub Engineer')}
              disabled={oauthLoading}
              className="group flex items-center justify-center gap-space-sm py-2.5 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-all text-on-surface font-label-ui text-label-ui disabled:opacity-50"
              type="button"
            >
              <svg className="w-4 h-4 fill-current text-on-surface group-hover:text-primary-container transition-colors" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
              <span>GitHub</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('GOOGLE', 'student.demo@college.edu', 'Google Demo User')}
              disabled={oauthLoading}
              className="group flex items-center justify-center gap-space-sm py-2.5 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-all text-on-surface font-label-ui text-label-ui disabled:opacity-50"
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              <span>Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-space-md">
            <div className="w-full h-[1px] bg-surface-container-highest"></div>
            <span className="absolute bg-surface-container-low px-space-sm font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-space-md p-space-sm rounded-lg bg-error-container/20 border border-error/30 text-error flex items-center gap-space-sm text-body-sm font-body-sm">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Register Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
            {/* Full Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-ui text-label-ui text-on-surface-variant" htmlFor="fullname">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">badge</span>
                <input
                  id="fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Sterling"
                  required
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-3 py-2 rounded-lg border border-surface-container-highest focus:outline-none focus:border-primary-container focus:bg-surface-container-high transition-all placeholder:text-outline/60"
                />
              </div>
            </div>

            {/* Email Input Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-ui text-label-ui text-on-surface-variant" htmlFor="email">
                Work Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">alternate_email</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acme.dev"
                  required
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-3 py-2 rounded-lg border border-surface-container-highest focus:outline-none focus:border-primary-container focus:bg-surface-container-high transition-all placeholder:text-outline/60"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-ui text-label-ui text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <span className="font-label-ui text-label-ui text-on-surface-variant/70 text-[11px]">
                  Min 6 characters
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">key</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-10 py-2 rounded-lg border border-surface-container-highest focus:outline-none focus:border-primary-container focus:bg-surface-container-high transition-all placeholder:text-outline/60 font-code-inline"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* High-Contrast Kinetic Emerald CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-space-sm w-full py-2.5 px-space-md rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-label-ui text-label-ui font-semibold flex items-center justify-center gap-space-sm transition-all duration-200 shadow-[0_0_20px_rgba(0,245,160,0.25)] hover:shadow-[0_0_25px_rgba(0,215,244,0.4)] cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace Account</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="ml-1 text-primary-container hover:text-secondary-container font-medium transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Sign in instead
            </Link>
          </div>

          {/* Technical Architecture College Project Micro-Callout */}
          <div className="mt-space-lg pt-space-md border-t border-surface-container-highest/50 flex items-center justify-between gap-space-sm bg-surface-container-lowest/60 -mx-space-lg md:-mx-space-xl -mb-space-lg md:-mb-space-xl p-space-md rounded-b-xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
              </span>
              <p className="font-label-mono-sm text-label-mono-sm text-outline truncate">
                <span className="text-on-surface-variant font-medium">Bcrypt Hashing:</span> Spring Security UserDetails
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-mono-sm text-[10px]">
              <span className="material-symbols-outlined text-[12px]">terminal</span>
              <span>:8080/api/auth</span>
            </div>
          </div>
        </div>

        {/* Micro Footer System Metrics */}
        <div className="mt-space-md flex items-center gap-space-md font-label-mono-sm text-label-mono-sm text-outline">
          <span className="hover:text-on-surface transition-colors cursor-default">CRDT Core: Active</span>
          <span>•</span>
          <span className="hover:text-on-surface transition-colors cursor-default">Latency: 14ms</span>
          <span>•</span>
          <span className="hover:text-on-surface transition-colors cursor-default">Java 21 Virtual Threads</span>
        </div>
      </div>
    </main>
  );
}
