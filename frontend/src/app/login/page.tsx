'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirected after registration
    const isRegistered = searchParams.get('registered');
    const prefillEmail = searchParams.get('email');
    if (isRegistered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in with your password.');
    }
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      localStorage.setItem('syncspace_token', response.data.token);
      localStorage.setItem('syncspace_user', JSON.stringify(response.data));
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Sign in to SyncSpace
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-[320px]">
          Collaborative knowledge workspace for college projects &amp; teams
        </p>
      </div>

      {/* Registration Success Banner */}
      {successMessage && (
        <div className="mb-space-md p-space-sm rounded-lg bg-primary-container/20 border border-primary-container/40 text-primary-container flex items-center gap-space-sm text-body-sm font-body-sm font-label-mono-sm">
          <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-space-md p-space-sm rounded-lg bg-error-container/20 border border-error/30 text-error flex items-center gap-space-sm text-body-sm font-body-sm">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Auth Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        {/* Email Input Field */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-ui text-label-ui text-on-surface-variant" htmlFor="email">
            Email Address
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">alternate_email</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
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
            <span className="font-label-ui text-label-ui text-secondary cursor-default">
              Required
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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Switch Login / Register Mode */}
      <div className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
        <span>Don&apos;t have an account?</span>
        <Link
          href="/register"
          className="ml-1 text-primary-container hover:text-secondary-container font-medium transition-colors cursor-pointer underline-offset-4 hover:underline"
        >
          Create an account
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
            <span className="text-on-surface-variant font-medium">JWT Gateway:</span> Spring Boot Security Filter
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-mono-sm text-[10px]">
          <span className="material-symbols-outlined text-[12px]">terminal</span>
          <span>:8080/api/auth</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center p-space-md selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Ambient Radial Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[320px] bg-primary-container/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[360px] h-[260px] bg-secondary-container/10 blur-[110px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col w-full items-center justify-center max-w-[420px] z-10">
        <Suspense fallback={
          <div className="w-full p-8 rounded-xl bg-surface-container-low flex justify-center">
            <span className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></span>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Micro Footer System Metrics */}
        <div className="mt-space-md flex items-center gap-space-md font-label-mono-sm text-label-mono-sm text-outline">
          <span className="hover:text-on-surface transition-colors cursor-default">CRDT Core: Active</span>
          <span>•</span>
          <span className="hover:text-on-surface transition-colors cursor-default">Database: Persistent H2/PostgreSQL</span>
          <span>•</span>
          <span className="hover:text-on-surface transition-colors cursor-default">Java 21</span>
        </div>
      </div>
    </main>
  );
}
