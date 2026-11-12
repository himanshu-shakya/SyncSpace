'use client';

import React from 'react';


export default function LandingPage() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
<header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
  <div className="h-16 max-w-7xl mx-auto px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
    <div className="flex items-center gap-space-lg">
      <a className="flex items-center gap-space-sm" href="/">
        <div className="w-8 h-8 rounded bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(0,245,160,0.3)]">
          <span className="material-symbols-outlined text-[20px] text-primary-container">polyline</span>
        </div>
        <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">SyncSpace</span>
      </a>
      <nav className="hidden xl:flex items-center gap-space-lg" data-active-classes="text-primary font-medium">
        <a aria-current="page" className="transition-colors text-primary font-medium" href="#features">Features</a>
        <a className="font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-colors" href="#editor">Markdown Editor</a>
        <a className="font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-colors" href="#multiplayer">Multiplayer Sync</a>
        <a className="font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-colors" href="#architecture">Architecture</a>
      </nav>
    </div>
    <div className="flex items-center gap-space-sm">
      <div className="hidden md:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-xs rounded text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] text-primary-container">school</span>
        <span className="font-label-mono-sm text-label-mono-sm">College Full-Stack Project</span>
      </div>
      <a 
        className="font-label-ui text-label-ui text-on-surface hover:bg-surface-container-high hover:text-on-surface px-space-md py-space-xs rounded transition-colors font-medium" 
        href="/login"
      >
        Login
      </a>
      <a 
        className="font-label-ui text-label-ui bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary px-space-md py-space-xs rounded shadow-[0_0_16px_rgba(0,245,160,0.35)] transition-all flex items-center gap-space-xs font-semibold" 
        href="/register"
      >
        Sign Up
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </a>
    </div>
  </div>
</header><main className="w-full pt-16 bg-surface"><div className="flex flex-col w-full">
{/*  ATMOSPHERIC GLOWS  */}
<div className="relative w-full overflow-hidden">
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[340px] bg-primary-container/10 blur-[130px] rounded-full pointer-events-none"></div>
<div className="absolute top-96 left-12 w-[420px] h-[260px] bg-secondary-container/10 blur-[110px] rounded-full pointer-events-none"></div>
<div className="absolute top-[1350px] right-8 w-[500px] h-[320px] bg-primary-container/8 blur-[140px] rounded-full pointer-events-none"></div>
{/*  1. HERO SECTION  */}
<section className="relative max-w-7xl mx-auto px-margin-tablet lg:px-margin-desktop pt-12 pb-20 flex flex-col items-center text-center">
{/*  Eyebrow Badge  */}
<div className="inline-flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full shadow-sm mb-space-lg">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
</span>
<span className="font-label-mono-sm text-label-mono-sm text-on-surface">Java Full-Stack Project · Spring Boot 3 &amp; Next.js 14</span>
<span className="material-symbols-outlined text-[14px] text-primary-container">code</span>
</div>
{/*  Headline & Subtitle  */}
<h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-on-surface max-w-4xl mx-auto mb-space-md">
        Your ideas. <span className="bg-gradient-to-r from-on-surface via-primary to-primary-container bg-clip-text text-transparent">One collaborative space.</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl">
        A real-time collaborative Markdown editor and distributed knowledge workspace. Built with Java Spring Boot, WebSockets STOMP, and Next.js for technical teams and students.
      </p>
{/*  Dual CTAs: Sign Up & Login  */}
<div className="flex flex-col sm:flex-row items-center gap-space-md mb-space-xl">
<a className="font-label-ui text-label-ui bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary px-space-lg py-space-md rounded font-semibold transition-all shadow-[0_0_24px_rgba(0,245,160,0.35)] flex items-center gap-space-xs" href="/register">
          Sign Up
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a className="font-label-ui text-label-ui bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface px-space-lg py-space-md rounded transition-colors flex items-center gap-space-sm shadow-sm backdrop-blur-md" href="/login">
<span className="material-symbols-outlined text-[18px] text-secondary">login</span>
          Login to Workspace
</a>
</div>
{/*  Full-Stack Tech Architecture Showcase Row  */}
<div className="flex flex-col items-center gap-space-sm">
<span className="font-label-mono-sm text-label-mono-sm uppercase tracking-widest text-on-surface-variant/80">
          Built with Modern High-Concurrency Architecture
        </span>
<div className="flex flex-wrap items-center justify-center gap-space-lg opacity-75">
<span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">Spring Boot 3</span>
<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">/</span>
<span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">Next.js 14</span>
<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">/</span>
<span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">WebSockets STOMP</span>
<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">/</span>
<span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">PostgreSQL</span>
<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">/</span>
<span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">Tailwind CSS</span>
</div>
</div>
{/*  2. INTERACTIVE LIVE MARKDOWN EDITOR PREVIEW WINDOW (SHOWCASE)  */}
<div className="w-full max-w-6xl mt-12 bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden text-left relative">
{/*  Editor Top Chrome  */}
<div className="h-12 bg-surface-container-low px-space-md flex items-center justify-between">
{/*  macOS Window Dots & Breadcrumbs  */}
<div className="flex items-center gap-space-md">
<div className="flex items-center gap-1.5">
<span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
<span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
<span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
</div>
<div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-mono-sm text-label-mono-sm">
<span className="material-symbols-outlined text-[15px]">folder</span>
<span>acme-corp</span>
<span>/</span>
<span>specs</span>
<span>/</span>
<span className="text-on-surface font-medium">architecture-v2.md</span>
</div>
</div>
{/*  Live Collaborators & Command Hint  */}
<div className="flex items-center gap-space-md">
<div className="flex items-center gap-space-xs">
<div className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span className="font-label-mono-sm text-label-mono-sm text-primary-fixed-dim">Sarah C. (Typing...)</span>
</div>
<div className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
<span className="w-2 h-2 rounded-full bg-secondary-container"></span>
<span className="font-label-mono-sm text-label-mono-sm text-secondary">Alex M.</span>
</div>
</div>
<div className="hidden lg:flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded text-on-surface-variant font-label-mono-sm text-label-mono-sm">
<span className="text-primary-container">⌘K</span>
<span>Command Menu</span>
</div>
</div>
</div>
{/*  Editor Split Panes  */}
<div className="grid grid-cols-1 md:grid-cols-2 bg-surface-container min-h-[460px]">
{/*  Left Pane: Raw Markdown Syntax Highlighting  */}
<div className="p-space-lg font-code-block text-code-block text-on-surface-variant bg-surface-container-lowest/90 overflow-x-auto space-y-3">
<div className="text-on-surface-variant/50">---<br />title: Unified CRDT Architecture<br />status: production-draft<br />version: 2.1.0<br />---</div>
<p><span className="text-primary-container font-semibold"># Distributed State Synchronization</span></p>
<p className="text-on-surface">The engine guarantees <span className="text-secondary font-semibold">strong eventual consistency</span> through our vector-clock delta reconciler.</p>
<div className="space-y-1 py-1">
<div className="text-on-surface-variant"><span className="text-primary-container">- [x]</span> WebSockets STOMP connection pool</div>
<div className="text-on-surface-variant"><span className="text-primary-container">- [x]</span> CRDT state sync engine with Yjs core</div>
<div className="text-on-surface-variant"><span className="text-on-surface-variant/40">- [ ]</span> Zero-knowledge blob sync to S3</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded text-on-surface font-code-block text-code-block">
<div className="flex justify-between items-center text-on-surface-variant/70 mb-2 font-label-mono-sm text-label-mono-sm uppercase">
<span>typescript</span>
<span className="text-primary-container">Live Buffer</span>
</div>
<code>
<span className="text-secondary">const</span> provider = <span className="text-secondary">new</span> <span className="text-primary-container">SyncProvider</span>(&#123;<br />
                  &nbsp;&nbsp;endpoint: <span className="text-tertiary-fixed-dim">&quot;wss://crdt.syncspace.app/v2&quot;</span>,<br />
                  &nbsp;&nbsp;room: <span className="text-tertiary-fixed-dim">&quot;acme-specs&quot;</span>,<br />
                  &nbsp;&nbsp;awareness: <span className="text-secondary">true</span><br />
                &#125;);
              </code>
</div>
{/*  Typing indicator cursor  */}
<div className="flex items-center gap-1">
<span className="text-primary-container">Sarah:</span>
<span className="text-on-surface">Validating delta packet compression ratio...</span>
<span className="inline-block w-2 h-4 bg-primary-container animate-pulse"></span>
</div>
</div>
{/*  Right Pane: Rendered Typography Preview  */}
<div className="p-space-lg bg-surface-container-low overflow-y-auto space-y-4">
<div className="inline-flex items-center gap-2 bg-primary/10 text-primary-fixed-dim px-2.5 py-1 rounded text-label-mono-sm font-label-mono-sm">
<span className="material-symbols-outlined text-[14px]">sync</span>
              LIVE RENDER PREVIEW
            </div>
<h2 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
              Distributed State Synchronization
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              The engine guarantees <span className="text-primary font-medium">strong eventual consistency</span> through our vector-clock delta reconciler. State transitions propagate across edge clusters in sub-millisecond latencies.
            </p>
{/*  Callout Box  */}
<div className="bg-surface-container-high p-space-md rounded flex items-start gap-space-sm">
<span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified_user</span>
<div className="font-body-sm text-body-sm text-on-surface">
<span className="font-semibold text-secondary">Conflict-Free by Design:</span> Concurrent keystrokes are merged deterministically without server-side locking or cursor starvation.
              </div>
</div>
{/*  Task List Completed  */}
<div className="space-y-2 pt-1">
<label className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary-container text-[18px]">check_box</span>
<span>WebSockets STOMP connection pool</span>
</label>
<label className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary-container text-[18px]">check_box</span>
<span>CRDT state sync engine with Yjs core</span>
</label>
<label className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm opacity-60">
<span className="material-symbols-outlined text-[18px]">check_box_outline_blank</span>
<span>Zero-knowledge blob sync to S3</span>
</label>
</div>
{/*  Collaborative Cursor Bubble in right pane  */}
<div className="pt-2 flex items-center gap-2">
<div className="w-2.5 h-2.5 rounded-full bg-secondary-container"></div>
<span className="font-label-mono-sm text-label-mono-sm text-secondary">Alex M. viewing this block</span>
</div>
</div>
</div>
{/*  Editor Status Footer  */}
<div className="h-8 bg-surface-container-lowest px-space-md flex items-center justify-between text-on-surface-variant font-label-mono-sm text-label-mono-sm">
<div className="flex items-center gap-space-md">
<span>Markdown GFM</span>
<span>UTF-8</span>
<span>1,842 words</span>
</div>
<div className="flex items-center gap-space-sm text-primary-container">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
<span>Sync Engine: 4ms RTT</span>
</div>
</div>
</div>
</section>
{/*  3. CORE FEATURE PILLARS GRID  */}
<section className="max-w-7xl mx-auto px-margin-tablet lg:px-margin-desktop py-space-xl">
<div className="flex flex-col items-center text-center mb-space-xl">
<span className="font-label-mono-sm text-label-mono-sm text-primary-container uppercase tracking-widest mb-space-xs">Engineered for Latency-Zero Thought</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold max-w-2xl">
          Everything you need to write and collaborate at the speed of thought.
        </h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
{/*  Feature 1  */}
<div className="bg-surface-container-low hover:bg-surface-container transition-all p-space-lg rounded-xl flex flex-col justify-between group shadow-sm">
<div>
<div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary-container mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[22px]">hub</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-xs">
              Conflict-Free Multiplayer
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Sub-millisecond delta syncing via WebSockets and mathematically robust CRDT algorithms. No merge conflicts, ever.
            </p>
</div>
<div className="mt-space-md pt-space-sm flex items-center gap-1 font-label-mono-sm text-label-mono-sm text-primary-container">
<span>Yjs State Vectors</span>
<span className="material-symbols-outlined text-[14px]">trending_flat</span>
</div>
</div>
{/*  Feature 2  */}
<div className="bg-surface-container-low hover:bg-surface-container transition-all p-space-lg rounded-xl flex flex-col justify-between group shadow-sm">
<div>
<div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center text-secondary mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[22px]">bolt</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-xs">
              Local-First Speed
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Zero-latency typing that writes directly to IndexedDB. Instant local cache with seamless background cloud re-sync.
            </p>
</div>
<div className="mt-space-md pt-space-sm flex items-center gap-1 font-label-mono-sm text-label-mono-sm text-secondary">
<span>Offline-Ready</span>
<span className="material-symbols-outlined text-[14px]">offline_bolt</span>
</div>
</div>
{/*  Feature 3  */}
<div className="bg-surface-container-low hover:bg-surface-container transition-all p-space-lg rounded-xl flex flex-col justify-between group shadow-sm">
<div>
<div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary-container mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[22px]">functions</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-xs">
              Extensible Markdown & Math
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Native KaTeX, Mermaid diagrams, GFM tables, collapsible callouts, and sandboxed code execution environments.
            </p>
</div>
<div className="mt-space-md pt-space-sm flex items-center gap-1 font-label-mono-sm text-label-mono-sm text-primary-container">
<span>KaTeX & Mermaid</span>
<span className="material-symbols-outlined text-[14px]">terminal</span>
</div>
</div>
{/*  Feature 4  */}
<div className="bg-surface-container-low hover:bg-surface-container transition-all p-space-lg rounded-xl flex flex-col justify-between group shadow-sm">
<div>
<div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center text-secondary mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[22px]">keyboard_command_key</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-xs">
              Raycast-Style Palette
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Navigate hundreds of documents, export to PDF, jump between tags, and apply transforms without lifting your hands from the keys.
            </p>
</div>
<div className="mt-space-md pt-space-sm flex items-center gap-1 font-label-mono-sm text-label-mono-sm text-secondary">
<span>Keyboard Driven</span>
<span className="material-symbols-outlined text-[14px]">tune</span>
</div>
</div>
</div>
</section>
{/*  4. COLLABORATION & SPRING BOOT ARCHITECTURE SHOWCASE  */}
<section className="max-w-7xl mx-auto px-margin-tablet lg:px-margin-desktop py-space-xl">
<div className="bg-surface-container-low rounded-xl p-space-xl shadow-xl">
<div className="flex flex-col lg:flex-row items-center justify-between gap-space-xl">
{/*  Text explanation  */}
<div className="lg:w-1/2 flex flex-col gap-space-md">
<span className="font-label-mono-sm text-label-mono-sm text-secondary uppercase tracking-widest">Enterprise-Grade Infrastructure</span>
<h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface">
              Next.js Frontend Decoupled from High-Concurrency Java Backend
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant">
              SyncSpace combines the instantaneous reactivity of Next.js 15 client-side state models with a distributed, battle-tested Spring Boot backend. Real-time updates traverse secure WebSocket STOMP channels directly into memory-mapped PostgreSQL vector storage.
            </p>
<div className="grid grid-cols-2 gap-space-md pt-space-sm">
<div className="bg-surface-container p-space-md rounded">
<span className="font-headline-md text-headline-md font-bold text-primary-container">0.8ms</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Average local write resolution</p>
</div>
<div className="bg-surface-container p-space-md rounded">
<span className="font-headline-md text-headline-md font-bold text-secondary">99.99%</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">WebSocket channel uptime SLA</p>
</div>
</div>
</div>
{/*  Visual Architecture Diagram Card  */}
<div className="lg:w-1/2 w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-inner flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm font-label-mono-sm text-label-mono-sm text-on-surface-variant">
<span>SYSTEM_DATA_FLOW.SVG</span>
<span className="text-primary-container">E2E ENCRYPTED</span>
</div>
{/*  Architecture Flow Representation  */}
<div className="space-y-space-md font-label-mono-sm text-label-mono-sm">
{/*  Tier 1: Client  */}
<div className="p-space-md bg-surface-container-high rounded flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary-container">desktop_mac</span>
<div>
<div className="text-on-surface font-semibold">Next.js Client Tier</div>
<div className="text-on-surface-variant text-[11px]">IndexedDB Cache + Local CRDT Worker</div>
</div>
</div>
<span className="text-primary-container font-medium">Port 443</span>
</div>
{/*  Connecting Line  */}
<div className="flex items-center justify-center gap-space-sm text-on-surface-variant/70">
<span className="material-symbols-outlined text-[16px] text-secondary">expand_all</span>
<span className="text-[11px] text-secondary">WebSocket STOMP Channel (TLS 1.3)</span>
</div>
{/*  Tier 2: Spring Boot Server  */}
<div className="p-space-md bg-surface-container-high rounded flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-secondary">dns</span>
<div>
<div className="text-on-surface font-semibold">Spring Boot 3.3 Engine</div>
<div className="text-on-surface-variant text-[11px]">Concurrent Session Pool & CRDT Broker</div>
</div>
</div>
<span className="text-secondary font-medium">Virtual Threads</span>
</div>
{/*  Connecting Line  */}
<div className="flex items-center justify-center gap-space-sm text-on-surface-variant/70">
<span className="material-symbols-outlined text-[16px] text-primary-container">sync_alt</span>
<span className="text-[11px] text-primary-container">Async WAL Flush & Replication</span>
</div>
{/*  Tier 3: Database Storage  */}
<div className="p-space-md bg-surface-container-high rounded flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-tertiary-fixed-dim">database</span>
<div>
<div className="text-on-surface font-semibold">PostgreSQL 16 Cluster</div>
<div className="text-on-surface-variant text-[11px]">Append-Only CRDT Log + pgvector</div>
</div>
</div>
<span className="text-tertiary-fixed-dim font-medium">Multi-Region</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  5. ACADEMIC PROJECT CTA BANNER  */}
<section className="max-w-7xl mx-auto px-margin-tablet lg:px-margin-desktop py-space-xl">
<div className="bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest p-space-xl rounded-xl shadow-2xl text-center relative overflow-hidden">
<div className="absolute inset-0 bg-primary-container/5 pointer-events-none"></div>
<div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-space-md">
<h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Start Collaborating on SyncSpace
          </h3>
<p className="font-body-md text-body-md text-on-surface-variant">
            Experience zero-latency Markdown synchronization backed by Java Spring Boot and WebSocket STOMP.
          </p>
<div className="flex flex-col sm:flex-row items-center gap-space-md mt-space-sm">
<a className="font-label-ui text-label-ui bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary px-space-lg py-space-md rounded font-semibold transition-all shadow-[0_0_24px_rgba(0,245,160,0.35)] flex items-center gap-space-xs" href="/register">
<span className="material-symbols-outlined text-[18px]">person_add</span>
              Sign Up
            </a>
<a className="font-label-ui text-label-ui bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface px-space-lg py-space-md rounded transition-colors flex items-center gap-space-xs shadow-sm backdrop-blur-md" href="/login">
<span className="material-symbols-outlined text-[18px] text-secondary">login</span>
              Login
            </a>
</div>
</div>
</div>
</section>
</div>
</div></main><footer className="w-full bg-surface-container-lowest border-t border-surface-container-high/50"><div className="max-w-7xl mx-auto px-margin-tablet lg:px-margin-desktop py-space-xl"><div className="flex flex-col md:flex-row md:items-center justify-between pb-space-lg gap-space-md"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(0,245,160,0.3)]"><span className="material-symbols-outlined text-[20px] text-primary-container">polyline</span></div><span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">SyncSpace</span></div><div className="inline-flex items-center gap-space-sm bg-surface-container-low px-space-sm py-space-xs rounded"><span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span><span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Academic Capstone Project · Spring Boot 3 &amp; Next.js 14 · WebSockets Online</span></div></div><div className="grid grid-cols-2 md:grid-cols-5 gap-space-lg py-space-xl"><div className="flex flex-col gap-space-sm"><span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider">Architecture</span><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#architecture">Decoupled Tiers</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#multiplayer">WebSocket STOMP</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#architecture">Virtual Threads</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#architecture">PostgreSQL Vector</a></div><div className="flex flex-col gap-space-sm"><span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider">Frontend Stack</span><span className="font-body-sm text-body-sm text-on-surface-variant">Next.js 14 App Router</span><span className="font-body-sm text-body-sm text-on-surface-variant">Tailwind CSS (Stitch UI)</span><span className="font-body-sm text-body-sm text-on-surface-variant">TypeScript Strict</span><span className="font-body-sm text-body-sm text-on-surface-variant">TanStack React Query</span></div><div className="flex flex-col gap-space-sm"><span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider">Backend Stack</span><span className="font-body-sm text-body-sm text-on-surface-variant">Java 17 / 21 Platform</span><span className="font-body-sm text-body-sm text-on-surface-variant">Spring Boot 3.3 Engine</span><span className="font-body-sm text-body-sm text-on-surface-variant">Spring Security JWT</span><span className="font-body-sm text-body-sm text-on-surface-variant">Spring Data JPA / Hibernate</span></div><div className="flex flex-col gap-space-sm"><span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider">Core Features</span><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#editor">Live Markdown Preview</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#multiplayer">Collaborative State Sync</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/dashboard">Workspaces Management</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/dashboard">Role-Based Sharing</a></div><div className="flex flex-col gap-space-sm"><span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider">Project Viva Info</span><span className="font-body-sm text-body-sm text-on-surface-variant">B.Tech Full-Stack Capstone</span><span className="font-body-sm text-body-sm text-on-surface-variant">Author: Himanshu Shakya</span><a className="font-body-sm text-body-sm text-primary-container hover:underline transition-colors" href="https://github.com/himanshu-shakya/SyncSpace" rel="noreferrer" target="_blank">GitHub Repository</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/login">Live Portal</a></div></div><div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-sm"><p className="font-body-sm text-body-sm text-on-surface-variant">© 2025–2026 SyncSpace · Academic Full-Stack Software Engineering Project. Developed by Himanshu Shakya.</p><div className="flex items-center gap-space-md"><a className="text-on-surface-variant hover:text-primary-container transition-colors" href="https://github.com/himanshu-shakya/SyncSpace" rel="noreferrer" target="_blank" title="GitHub Repository"><span className="material-symbols-outlined text-[18px]">code</span></a><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="/login" title="Login"><span className="material-symbols-outlined text-[18px]">terminal</span></a></div></div></div></footer>
    </div>
  );
}
