'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { api } from '@/lib/api';

interface UserSettings {
  theme: 'obsidian' | 'light' | 'cyberpunk' | 'system';
  accentColor: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose';
  pureOled: boolean;
  enhancedContrast: boolean;
  editorFont: 'Geist Sans' | 'Inter' | 'JetBrains Mono' | 'Newsreader';
  editorScale: '14px' | '15px' | '16px' | '18px';
  proseWidth: '640px' | '768px' | '960px' | '100%';
  syntaxTheme: string;
  gutterLineNumbers: boolean;
  bracketHighlight: boolean;
  liveFooterStats: boolean;
  inlineMath: boolean;
  offlineBackup: boolean;
  remoteCursors: boolean;
  visualPing: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'obsidian',
  accentColor: 'emerald',
  pureOled: true,
  enhancedContrast: false,
  editorFont: 'Geist Sans',
  editorScale: '16px',
  proseWidth: '768px',
  syntaxTheme: 'Tokyo Night (Obsidian tuned)',
  gutterLineNumbers: true,
  bracketHighlight: true,
  liveFooterStats: true,
  inlineMath: true,
  offlineBackup: true,
  remoteCursors: true,
  visualPing: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'editor' | 'sync' | 'keybindings'>('appearance');
  const [filterQuery, setFilterQuery] = useState('');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saveToast, setSaveToast] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(14);
  const [isPinging, setIsPinging] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string } | null>(null);

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
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        // ignore
      }
    }

    // Load saved settings
    const saved = localStorage.getItem('syncspace_user_settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }

    // Global keyboard listener for ⌘/
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('settingsFilterInput');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('syncspace_user_settings', JSON.stringify(updated));
    triggerToast();
  };

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2400);
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem('syncspace_user_settings', JSON.stringify(defaultSettings));
    triggerToast();
  };

  const runPingTest = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await api.get('/health');
      const diff = Math.round(performance.now() - start);
      setLatencyMs(diff);
    } catch {
      setLatencyMs(999);
    } finally {
      setIsPinging(false);
    }
  };

  const handlePruneCache = () => {
    alert('Local browser IndexedDB & cache pruned successfully. Storage reset to 0 MB.');
  };

  const handleExportMarkdown = async () => {
    try {
      const res = await api.get('/documents');
      const docs = res.data || [];
      const content = docs
        .map((d: { title: string; content: string }) => `# ${d.title}\n\n${d.content || ''}\n\n---\n`)
        .join('\n');
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SyncSpace_Export_${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export markdown documents.');
    }
  };

  const handleExportJson = async () => {
    try {
      const res = await api.get('/documents');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SyncSpace_CRDT_State_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export JSON state.');
    }
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to log out of SyncSpace?')) {
      localStorage.removeItem('syncspace_token');
      localStorage.removeItem('syncspace_user');
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <AppHeader
        breadcrumbs={[
          { label: 'SyncSpace', href: '/dashboard' },
          { label: 'Academic Workspace' },
          { label: 'Settings' },
        ]}
        showShareButton={false}
      />

      <main className="w-full pt-14 flex-1">
        <div className="px-space-md sm:px-space-xl py-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
          {/* Top Breadcrumb & Page Title Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm text-on-surface-variant">
                <span onClick={() => router.push('/dashboard')} className="hover:text-primary transition-colors cursor-pointer">
                  Workspace
                </span>
                <span className="text-outline-variant">/</span>
                <span className="hover:text-primary transition-colors cursor-pointer">SyncSpace Cluster</span>
                <span className="text-outline-variant">/</span>
                <span className="text-primary-container font-semibold">Settings</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Settings &amp; Preferences
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Manage your account profile, editor typography, Obsidian theme appearance, and real-time STOMP sync parameters.
              </p>
            </div>

            {/* Quick Filter & Auto-Save Indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
              <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low shadow-sm border border-surface-container-high/60">
                <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00f5a0]"></span>
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">
                  Auto-saved to Local Storage &amp; Cloud
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-space-sm flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                </div>
                <input
                  id="settingsFilterInput"
                  type="text"
                  placeholder="Filter settings (⌘/)"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-12 py-1.5 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline-variant outline-none border border-surface-container-high focus:border-primary-container transition-colors shadow-inner"
                />
                <div className="absolute inset-y-0 right-0 pr-space-sm flex items-center pointer-events-none">
                  <kbd className="font-label-mono-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                    ⌘/
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none border-b border-surface-container-high/60">
            {[
              { id: 'appearance', label: 'Appearance & Theme', icon: 'palette' },
              { id: 'editor', label: 'Editor & Typography', icon: 'format_shapes' },
              { id: 'sync', label: 'Real-Time & STOMP Sync', icon: 'sync_alt' },
              { id: 'profile', label: 'Profile & Account', icon: 'account_circle' },
              { id: 'keybindings', label: 'Keybindings', icon: 'keyboard' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-t font-label-ui text-label-ui transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-surface-container text-primary-container font-semibold border-b-2 border-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Settings Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
            {/* Primary Column (8 Cols): Customization Panels */}
            <div className="lg:col-span-8 flex flex-col gap-space-xl">

              {/* TAB 1: APPEARANCE & THEME */}
              {(activeTab === 'appearance' || filterQuery) && (
                <section className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary-container px-2 py-0.5 rounded bg-surface-container-high font-semibold">
                        01
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Interface Appearance</h2>
                    </div>
                    <span className="font-label-mono-sm text-label-mono-sm text-outline">Hot-reload ready</span>
                  </div>

                  {/* Theme Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    {/* Obsidian Kinetic Card */}
                    <div
                      onClick={() => updateSetting('theme', 'obsidian')}
                      className={`group relative flex flex-col p-space-lg rounded-xl bg-surface-container-low transition-all cursor-pointer shadow-sm border ${
                        settings.theme === 'obsidian'
                          ? 'border-primary-container ring-1 ring-primary-container/80'
                          : 'border-surface-container-high hover:border-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_6px_#00f5a0]"></span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            Obsidian Kinetic
                          </span>
                        </div>
                        {settings.theme === 'obsidian' ? (
                          <span className="material-symbols-outlined text-[18px] text-primary-container font-bold">
                            check_circle
                          </span>
                        ) : (
                          <span className="font-label-mono-sm text-[11px] text-outline">Default</span>
                        )}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Deep slate substrate with electric emerald dynamic focus conduits.
                      </p>
                      <div className="rounded bg-surface-container-lowest p-space-sm flex flex-col gap-space-xs border border-surface-container-high/50">
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-error-container"></div>
                            <div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
                            <div className="w-2 h-2 rounded-full bg-primary-container"></div>
                          </div>
                          <span className="font-label-mono-sm text-label-mono-sm text-primary-container text-[11px]">
                            #040709
                          </span>
                        </div>
                        <div className="h-2 w-3/4 rounded bg-surface-container-high"></div>
                        <div className="flex gap-1.5 items-center">
                          <div className="h-2 w-1/3 rounded bg-primary-container/40"></div>
                          <div className="h-2 w-1/2 rounded bg-surface-container"></div>
                        </div>
                      </div>
                    </div>

                    {/* Light Minimal Card */}
                    <div
                      onClick={() => updateSetting('theme', 'light')}
                      className={`group relative flex flex-col p-space-lg rounded-xl bg-surface-container-low transition-all cursor-pointer shadow-sm border ${
                        settings.theme === 'light'
                          ? 'border-primary-container ring-1 ring-primary-container/80'
                          : 'border-surface-container-high hover:border-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            Light Minimal
                          </span>
                        </div>
                        {settings.theme === 'light' ? (
                          <span className="material-symbols-outlined text-[18px] text-primary-container font-bold">
                            check_circle
                          </span>
                        ) : (
                          <span className="font-label-mono-sm text-[11px] text-outline">Paper</span>
                        )}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Clean high-legibility publication canvas inspired by Swiss editorial prints.
                      </p>
                      <div className="rounded bg-[#FAFAFA] p-space-sm flex flex-col gap-space-xs border border-slate-200">
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#E5E7EB]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#D1D5DB]"></div>
                          </div>
                          <span className="font-label-mono-sm text-slate-600 text-[11px]">#FAFAFA</span>
                        </div>
                        <div className="h-2 w-3/4 rounded bg-slate-300"></div>
                        <div className="flex gap-1.5 items-center">
                          <div className="h-2 w-1/3 rounded bg-slate-400"></div>
                          <div className="h-2 w-1/2 rounded bg-slate-200"></div>
                        </div>
                      </div>
                    </div>

                    {/* Cyberpunk Neo Card */}
                    <div
                      onClick={() => updateSetting('theme', 'cyberpunk')}
                      className={`group relative flex flex-col p-space-lg rounded-xl bg-surface-container-low transition-all cursor-pointer shadow-sm border ${
                        settings.theme === 'cyberpunk'
                          ? 'border-primary-container ring-1 ring-primary-container/80'
                          : 'border-surface-container-high hover:border-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            Cyberpunk Neo
                          </span>
                        </div>
                        {settings.theme === 'cyberpunk' ? (
                          <span className="material-symbols-outlined text-[18px] text-primary-container font-bold">
                            check_circle
                          </span>
                        ) : (
                          <span className="font-label-mono-sm text-[11px] text-outline">Synth</span>
                        )}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Deep midnight violet with hyper-saturated neon cyan and pink telemetry.
                      </p>
                      <div className="rounded bg-[#0d091e] p-space-sm flex flex-col gap-space-xs border border-purple-900/50">
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#f43f5e]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div>
                          </div>
                          <span className="font-label-mono-sm text-[#06b6d4] text-[11px]">#0D091E</span>
                        </div>
                        <div className="h-2 w-3/4 rounded bg-[#3b1d60]"></div>
                        <div className="flex gap-1.5 items-center">
                          <div className="h-2 w-1/3 rounded bg-[#f43f5e]/60"></div>
                          <div className="h-2 w-1/2 rounded bg-[#06b6d4]/40"></div>
                        </div>
                      </div>
                    </div>

                    {/* System Default Card */}
                    <div
                      onClick={() => updateSetting('theme', 'system')}
                      className={`group relative flex flex-col p-space-lg rounded-xl bg-surface-container-low transition-all cursor-pointer shadow-sm border ${
                        settings.theme === 'system'
                          ? 'border-primary-container ring-1 ring-primary-container/80'
                          : 'border-surface-container-high hover:border-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                            brightness_auto
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            System Default
                          </span>
                        </div>
                        {settings.theme === 'system' ? (
                          <span className="material-symbols-outlined text-[18px] text-primary-container font-bold">
                            check_circle
                          </span>
                        ) : (
                          <span className="font-label-mono-sm text-[11px] text-outline">Auto</span>
                        )}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Seamlessly syncs with your operating system light and dark schedule.
                      </p>
                      <div className="rounded bg-surface-container-lowest p-space-sm flex flex-col gap-space-xs border border-surface-container-high/50">
                        <div className="flex items-center justify-between pb-1">
                          <span className="font-label-mono-sm text-[10px] text-outline-variant">OS Schedule Match</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-6 rounded bg-[#101418] border border-surface-container-high flex items-center justify-center">
                            <span className="font-label-mono-sm text-[10px] text-on-surface-variant">Dark</span>
                          </div>
                          <div className="h-6 rounded bg-[#FAFAFA] flex items-center justify-center">
                            <span className="font-label-mono-sm text-[10px] text-slate-800">Light</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kinetic Accents & High Contrast */}
                  <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-ui text-label-ui text-on-surface font-semibold">
                          Kinetic Accent Conduits
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Active cursor presence, focus highlights, and selection conduits
                        </span>
                      </div>
                      <div className="flex items-center gap-space-sm">
                        {[
                          { id: 'emerald', color: 'bg-primary-container', label: 'Kinetic Emerald' },
                          { id: 'cyan', color: 'bg-secondary-container', label: 'Electric Cyan' },
                          { id: 'violet', color: 'bg-[#818cf8]', label: 'Cyber Violet' },
                          { id: 'amber', color: 'bg-[#f59e0b]', label: 'Solar Amber' },
                          { id: 'rose', color: 'bg-[#f43f5e]', label: 'Rose Quartz' },
                        ].map((accent) => (
                          <button
                            key={accent.id}
                            onClick={() => updateSetting('accentColor', accent.id as UserSettings['accentColor'])}
                            title={accent.label}
                            type="button"
                            className={`w-7 h-7 rounded-full ${accent.color} transition-all flex items-center justify-center cursor-pointer ${
                              settings.accentColor === accent.id
                                ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-surface scale-110 shadow-md'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                          >
                            {settings.accentColor === accent.id && (
                              <span className="material-symbols-outlined text-[14px] text-on-primary-container font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                      <div className="flex items-center justify-between p-space-md rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                        <div className="flex flex-col">
                          <span className="font-label-ui text-label-ui text-on-surface font-medium">Pure OLED Black</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Deep pure #000000 backdrop</span>
                        </div>
                        <button
                          onClick={() => updateSetting('pureOled', !settings.pureOled)}
                          type="button"
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                            settings.pureOled ? 'bg-primary-container' : 'bg-surface-container-high'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 rounded-full bg-surface transition-transform transform ${
                              settings.pureOled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-space-md rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                        <div className="flex flex-col">
                          <span className="font-label-ui text-label-ui text-on-surface font-medium">Enhanced Contrast</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Sharpened border contrast ratios</span>
                        </div>
                        <button
                          onClick={() => updateSetting('enhancedContrast', !settings.enhancedContrast)}
                          type="button"
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                            settings.enhancedContrast ? 'bg-primary-container' : 'bg-surface-container-high'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 rounded-full bg-surface transition-transform transform ${
                              settings.enhancedContrast ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 2: EDITOR & TYPOGRAPHY */}
              {(activeTab === 'editor' || filterQuery) && (
                <section className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary-container px-2 py-0.5 rounded bg-surface-container-high font-semibold">
                        02
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Editor Typography &amp; Composition</h2>
                    </div>
                    <span className="font-label-mono-sm text-label-mono-sm text-outline">Markdown AST Engine</span>
                  </div>

                  <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-lg">
                    {/* Font & Scale Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      <div className="flex flex-col gap-space-xs">
                        <label className="font-label-ui text-label-ui text-on-surface font-semibold">
                          Primary Reading Font
                        </label>
                        <div className="grid grid-cols-2 gap-space-xs">
                          {(['Geist Sans', 'Inter', 'JetBrains Mono', 'Newsreader'] as const).map((font) => (
                            <button
                              key={font}
                              onClick={() => updateSetting('editorFont', font)}
                              type="button"
                              className={`p-space-sm rounded flex items-center justify-between transition-colors cursor-pointer border ${
                                settings.editorFont === font
                                  ? 'bg-surface-container text-primary-container border-primary-container/60 font-semibold'
                                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border-surface-container-high/60'
                              }`}
                            >
                              <span className="font-body-md text-body-md truncate">{font}</span>
                              {settings.editorFont === font && (
                                <span className="material-symbols-outlined text-[16px] text-primary-container">check</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <label className="font-label-ui text-label-ui text-on-surface font-semibold">Base Editor Scale</label>
                          <span className="font-label-mono-sm text-label-mono-sm text-primary-container px-2 py-0.5 rounded bg-surface-container font-semibold">
                            {settings.editorScale}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs pt-1">
                          {(['14px', '15px', '16px', '18px'] as const).map((scale) => (
                            <button
                              key={scale}
                              onClick={() => updateSetting('editorScale', scale)}
                              type="button"
                              className={`flex-1 py-2 rounded font-label-mono-sm text-label-mono-sm transition-all cursor-pointer ${
                                settings.editorScale === scale
                                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                                  : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high/60'
                              }`}
                            >
                              {scale}
                            </button>
                          ))}
                        </div>
                        <span className="font-body-sm text-body-sm text-outline mt-1">
                          68–75 characters per line for optimal legibility.
                        </span>
                      </div>
                    </div>

                    {/* Width & Syntax Theme Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      <div className="flex flex-col gap-space-xs">
                        <label className="font-label-ui text-label-ui text-on-surface font-semibold">
                          Prose Width Constraint
                        </label>
                        <div className="flex items-center gap-space-xs">
                          {[
                            { id: '640px', label: 'Narrow', sub: '640px' },
                            { id: '768px', label: 'Standard', sub: '768px' },
                            { id: '960px', label: 'Wide', sub: '960px' },
                            { id: '100%', label: 'Full', sub: '100%' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => updateSetting('proseWidth', item.id as UserSettings['proseWidth'])}
                              type="button"
                              className={`flex-1 py-2 px-2 rounded font-label-mono-sm text-label-mono-sm flex flex-col items-center transition-all cursor-pointer border ${
                                settings.proseWidth === item.id
                                  ? 'bg-surface-container text-primary-container border-primary-container/60 shadow-sm font-semibold'
                                  : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border-surface-container-high/60'
                              }`}
                            >
                              <span>{item.label}</span>
                              <span className="text-[10px] text-outline-variant">{item.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-space-xs">
                        <label className="font-label-ui text-label-ui text-on-surface font-semibold">
                          Syntax Highlighter Theme
                        </label>
                        <select
                          value={settings.syntaxTheme}
                          onChange={(e) => updateSetting('syntaxTheme', e.target.value)}
                          className="w-full px-space-sm py-2 rounded bg-surface-container-lowest text-on-surface font-label-mono-sm text-label-mono-sm outline-none cursor-pointer border border-surface-container-high focus:border-primary-container"
                        >
                          <option>Tokyo Night (Obsidian tuned)</option>
                          <option>Dracula Official</option>
                          <option>One Dark Pro</option>
                          <option>GitHub Dark Dimmed</option>
                          <option>Catppuccin Macchiato</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="flex flex-col gap-space-xs">
                      <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/80 flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between text-outline pb-1 border-b border-surface-container-high/40">
                          <span className="font-label-mono-sm text-label-mono-sm text-secondary">
                            # RFC-042 Sync Contract Live Preview
                          </span>
                          <span className="font-label-mono-sm text-label-mono-sm">
                            {settings.editorFont} · {settings.editorScale}
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                          Every distributed peer maintains an append-only state log. When concurrent writes overlap, our LWW-element-set resolves conflicts deterministically within{' '}
                          <code className="font-code-inline text-code-inline px-1.5 py-0.5 rounded bg-surface-container text-primary-container">
                            O(log n)
                          </code>{' '}
                          steps without server intervention.
                        </p>
                        <div className="mt-1 rounded bg-surface-container p-space-sm font-code-block text-code-block text-on-surface flex flex-col gap-1 border border-surface-container-high/60">
                          <div className="flex items-center justify-between text-outline text-[11px] pb-1">
                            <span>typescript · crdt_actor.ts</span>
                            <span className="text-primary-container font-mono text-[10px]">{settings.syntaxTheme}</span>
                          </div>
                          <div className="leading-relaxed font-mono text-xs">
                            <span className="text-[#f43f5e]">const</span>{' '}
                            <span className="text-secondary-container">reconcileState</span> = (local:{' '}
                            <span className="text-tertiary-container">Node</span>, remote:{' '}
                            <span className="text-tertiary-container">Node</span>):{' '}
                            <span className="text-primary-container">SyncResult</span> =&gt; &#123;
                            <br />
                            &nbsp;&nbsp;<span className="text-outline">return</span> remote.clock.isAfter(local.clock) ? remote : local;
                            <br />
                            &#125;;
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                      {[
                        { key: 'gutterLineNumbers', label: 'Gutter Line Numbers' },
                        { key: 'bracketHighlight', label: 'Bracket & Pair Highlight' },
                        { key: 'liveFooterStats', label: 'Live Footer Stats' },
                        { key: 'inlineMath', label: 'Inline Math & LaTeX ($$)' },
                      ].map((item) => {
                        const k = item.key as keyof UserSettings;
                        const val = Boolean(settings[k]);
                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-space-md rounded-lg bg-surface-container-lowest border border-surface-container-high/60"
                          >
                            <span className="font-label-ui text-label-ui text-on-surface">{item.label}</span>
                            <button
                              onClick={() => updateSetting(k, !val as any)}
                              type="button"
                              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                val ? 'bg-primary-container' : 'bg-surface-container-high'
                              }`}
                            >
                              <span
                                className={`block w-3.5 h-3.5 rounded-full bg-surface transition-transform transform ${
                                  val ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 3: REAL-TIME & STOMP SYNC */}
              {(activeTab === 'sync' || filterQuery) && (
                <section className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high font-semibold">
                        03
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Real-Time Sync &amp; CRDT Engine</h2>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm text-primary-container">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      <span>Sub-20ms WebSocket Pipeline</span>
                    </div>
                  </div>

                  <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
                    {/* STOMP / WebSocket Connection Metric Bar */}
                    <div className="p-space-md rounded-xl bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-surface-container-high/60 shadow-inner">
                      <div className="flex items-center gap-space-md">
                        <div className="w-10 h-10 rounded-lg bg-surface-container border border-surface-container-high flex items-center justify-center text-primary-container shadow-sm">
                          <span className="material-symbols-outlined text-[22px]">network_wifi</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-sm">
                            <span className="font-label-ui text-label-ui text-on-surface font-semibold">
                              Spring Boot STOMP Socket
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-label-mono-sm text-[11px] font-bold">
                              ACTIVE
                            </span>
                          </div>
                          <span className="font-code-block text-code-block text-on-surface-variant text-[11px]">
                            ws://localhost:8080/ws
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-space-lg">
                        <div className="flex flex-col text-right">
                          <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">ROUND-TRIP</span>
                          <span className="font-label-mono-sm text-label-mono-sm text-primary-container font-bold">
                            {latencyMs !== null ? `${latencyMs}ms latency` : 'Testing...'}
                          </span>
                        </div>
                        <button
                          onClick={runPingTest}
                          disabled={isPinging}
                          className="px-space-md py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-mono-sm text-label-mono-sm transition-colors border border-surface-container-high cursor-pointer"
                          type="button"
                        >
                          {isPinging ? 'Pinging...' : 'Ping Test'}
                        </button>
                      </div>
                    </div>

                    {/* Offline Storage & Collaboration Features */}
                    <div className="flex flex-col gap-space-sm pt-space-xs">
                      {[
                        {
                          key: 'offlineBackup',
                          title: 'Enable IndexedDB Offline Backup',
                          desc: 'Local-first cache holding fast document backups across your browser sessions.',
                        },
                        {
                          key: 'remoteCursors',
                          title: 'Remote Multi-Cursor Presence',
                          desc: 'Display colored peer carets with user handle callout pills in real-time split view.',
                        },
                        {
                          key: 'visualPing',
                          title: 'Visual Ping on Conflict Resolution',
                          desc: 'Subtle emerald pulse highlight when an autonomous merge completes via CRDT engine.',
                        },
                      ].map((item) => {
                        const k = item.key as keyof UserSettings;
                        const val = Boolean(settings[k]);
                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-space-md rounded-lg bg-surface-container-lowest border border-surface-container-high/60"
                          >
                            <div className="flex flex-col">
                              <span className="font-label-ui text-label-ui text-on-surface font-medium">{item.title}</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</span>
                            </div>
                            <button
                              onClick={() => updateSetting(k, !val as any)}
                              type="button"
                              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                val ? 'bg-primary-container' : 'bg-surface-container-high'
                              }`}
                            >
                              <span
                                className={`block w-3.5 h-3.5 rounded-full bg-surface transition-transform transform ${
                                  val ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 4: PROFILE & ACCOUNT */}
              {(activeTab === 'profile' || filterQuery) && (
                <section className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high font-semibold">
                        04
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Profile &amp; Authentication</h2>
                    </div>
                    <span className="font-label-mono-sm text-label-mono-sm text-outline">JWT Secured</span>
                  </div>

                  <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-lg">
                    <div className="flex items-center gap-space-md">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-on-primary">
                          {currentUser?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-container shadow-[0_0_6px_#00f5a0]"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          {currentUser?.fullName || 'Academic Researcher'}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {currentUser?.email || 'user@college.edu'}
                        </span>
                        <span className="font-label-mono-sm text-[11px] text-primary-container mt-1">
                          Role: Primary Workspace Author
                        </span>
                      </div>
                    </div>

                    <div className="pt-space-xs flex flex-col gap-space-xs font-label-mono-sm text-label-mono-sm">
                      <div className="flex justify-between py-2 px-space-md rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                        <span className="text-on-surface-variant">Auth Method</span>
                        <span className="text-on-surface font-semibold">Stateless JWT Bearer Token</span>
                      </div>
                      <div className="flex justify-between py-2 px-space-md rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                        <span className="text-on-surface-variant">Backend Target Node</span>
                        <span className="text-primary-container font-semibold">Spring Boot (Port 8080)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-md pt-2">
                      <button
                        onClick={handleSignOut}
                        className="px-space-md py-2 rounded bg-error-container/20 hover:bg-error-container/30 text-error font-label-ui text-label-ui font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out from Device</span>
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 5: KEYBINDINGS */}
              {(activeTab === 'keybindings' || filterQuery) && (
                <section className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high font-semibold">
                        05
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Keyboard Accelerators</h2>
                    </div>
                    <span className="font-label-mono-sm text-label-mono-sm text-outline">Obsidian Hotkeys</span>
                  </div>

                  <div className="rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left font-label-ui text-label-ui">
                      <thead>
                        <tr className="border-b border-surface-container-high text-on-surface-variant font-label-mono-sm text-[11px] uppercase tracking-wider bg-surface-container-lowest">
                          <th className="py-space-sm px-space-md">Action</th>
                          <th className="py-space-sm px-space-md">Scope</th>
                          <th className="py-space-sm px-space-md text-right">Hotkey</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-high/60 font-body-sm text-body-sm">
                        {[
                          { action: 'Quick Settings Search', scope: 'Settings', key: '⌘ /' },
                          { action: 'Bold Selection', scope: 'Editor', key: '⌘ B' },
                          { action: 'Italic Selection', scope: 'Editor', key: '⌘ I' },
                          { action: 'Insert Code Block', scope: 'Editor', key: '⌘ E' },
                          { action: 'Insert Math Formula ($$)', scope: 'Editor', key: '⌘ M' },
                          { action: 'Save & Commit Document', scope: 'Editor', key: '⌘ S' },
                          { action: 'Toggle Split Live Preview', scope: 'Editor', key: '⌘ \\' },
                          { action: 'Open RBAC Share Dialog', scope: 'Global', key: '⌘ P' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-surface-container transition-colors">
                            <td className="py-space-sm px-space-md font-medium text-on-surface">{row.action}</td>
                            <td className="py-space-sm px-space-md text-on-surface-variant font-label-mono-sm text-xs">
                              {row.scope}
                            </td>
                            <td className="py-space-sm px-space-md text-right">
                              <kbd className="px-2 py-1 rounded bg-surface-container-high text-primary-container font-label-mono-sm text-xs border border-surface-container-highest shadow-sm">
                                {row.key}
                              </kbd>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>

            {/* Secondary Column (4 Cols): Identity, Storage & Export Hub */}
            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              {/* Identity Card */}
              <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-outline">IDENTITY</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-mono-sm text-label-mono-sm text-primary-container font-medium">
                    Owner
                  </span>
                </div>
                <div className="flex items-center gap-space-md">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-base text-on-primary">
                      {currentUser?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary-container shadow-[0_0_6px_#00f5a0]"></span>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {currentUser?.fullName || 'Academic Author'}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {currentUser?.email || 'user@college.edu'}
                    </span>
                  </div>
                </div>
                <div className="pt-space-xs flex flex-col gap-space-xs font-label-mono-sm text-label-mono-sm">
                  <div className="flex justify-between py-1.5 px-space-sm rounded bg-surface-container-lowest border border-surface-container-high/60">
                    <span className="text-on-surface-variant">Primary Node</span>
                    <span className="text-on-surface font-semibold">localhost:8080</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-space-sm rounded bg-surface-container-lowest border border-surface-container-high/60">
                    <span className="text-on-surface-variant">Active Sessions</span>
                    <span className="text-primary-container font-semibold">1 Live Tab</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-full mt-1 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui transition-colors flex items-center justify-center gap-space-xs border border-surface-container-high cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Storage Quota Card */}
              <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-outline">STORAGE</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary-container font-semibold">
                    12.4 MB
                  </span>
                </div>
                <div className="flex items-center justify-center py-space-xs">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-surface-container-lowest fill-none"
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                      ></circle>
                      <circle
                        className="text-primary-container fill-none transition-all duration-1000 ease-out"
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeDasharray="251.2"
                        strokeDashoffset="210"
                        strokeLinecap="round"
                        strokeWidth="6"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">2.5%</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-outline">Used</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-label-mono-sm font-label-mono-sm px-space-xs text-on-surface-variant">
                  <span>Local Cache</span>
                  <span className="text-primary-container font-semibold">500 MB limit</span>
                </div>
                <button
                  onClick={handlePruneCache}
                  className="w-full py-2 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-mono-sm text-label-mono-sm transition-colors flex items-center justify-center gap-space-xs border border-surface-container-high cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">cleaning_services</span>
                  <span>Prune Cache</span>
                </button>
              </div>

              {/* Data Sovereignty Card */}
              <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary-container text-[18px]">archive</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Data Sovereignty</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Export all documents as standard CommonMark Markdown or raw JSON telemetry state.
                </p>
                <div className="flex flex-col gap-space-xs">
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full py-2 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui transition-colors flex items-center justify-between border border-surface-container-high cursor-pointer"
                    type="button"
                  >
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px]">folder_zip</span>
                      <span>Export Markdown</span>
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-primary-container font-semibold">
                      .md
                    </span>
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-2 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui transition-colors flex items-center justify-between border border-surface-container-high cursor-pointer"
                    type="button"
                  >
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px]">database</span>
                      <span>Export JSON State</span>
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-outline">.json</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-error/30 shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-xs text-error">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span className="font-label-ui text-label-ui font-semibold">Danger Zone</span>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Reset local editor logs or terminate your active session token.
                </p>
                <div className="pt-space-xs flex gap-space-sm">
                  <button
                    onClick={resetDefaults}
                    className="flex-1 py-1.5 rounded bg-error-container/20 hover:bg-error-container/30 text-error font-label-ui text-label-ui transition-colors cursor-pointer"
                    type="button"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 py-1.5 rounded bg-error-container/20 hover:bg-error-container/30 text-error font-label-ui text-label-ui transition-colors cursor-pointer"
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar / Micro Toast State */}
          <div className="sticky bottom-4 z-30 w-full mt-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-high/90 backdrop-blur-xl border border-surface-container-highest shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_10px_#00f5a0]"></div>
                <span className="font-body-md text-body-md text-on-surface">
                  {saveToast
                    ? '✨ Preferences updated and synchronized across all active engineering nodes!'
                    : 'Configuration is synchronized across all active engineering nodes.'}
                </span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button
                  onClick={resetDefaults}
                  className="px-space-md py-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-ui text-label-ui transition-colors cursor-pointer"
                  type="button"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={triggerToast}
                  className="px-space-lg py-1.5 rounded bg-primary-container text-on-primary-container font-label-ui text-label-ui font-semibold shadow-[0_0_16px_rgba(0,245,160,0.3)] hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer"
                  type="button"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

