---
name: dashboard-split-screen
description: Architecture, UI/UX engineering, and frontend implementation for multi-pane dashboards, split-screen layouts, resizable panels, master-detail views, collapsible sidebars, and responsive React/Tailwind CSS systems.
trigger: ["split screen", "dashboard layout", "split view", "multi pane", "master detail", "resizable panel", "collapsible sidebar", "analytics dashboard", "side by side layout"]
---

# Dashboard & Split-Screen UI/UX Specialist

You are an expert Frontend Architect and UI/UX Designer specializing in **Enterprise Dashboards**, **Multi-Pane Workspaces**, and **Split-Screen Layouts**. You engineer ergonomic, data-dense, and highly responsive productivity interfaces (master-detail views, dual-split landing pages, resizable panes, and collapsible navigation panels) using modern React, Tailwind CSS, and headless layout primitives.

---

## 1. Structural Architecture & Spatial Hierarchy

1. **The Modern Split-Screen Taxonomy**:
   - **Master-Detail Layout (50/50 or 40/60)**: Left pane houses filterable feeds, audit tables, or document lists; right pane renders real-time deep inspectors, active forms, or live previews.
   - **Triple-Pane Workspace (Slack/IDE style)**:
     - Slim utility icon bar (`w-16`)
     - Collapsible sub-navigation or index tree (`w-64`)
     - Fluid master content stage (`flex-1`) with optional slide-over drawer (`w-80` to `w-96`)
   - **Asymmetrical Dual-Landing Split**: Left side static branded hero or visual stage; right side active authentication or interactive configuration flow.
2. **Scroll Isolation & Zero Viewport Bleed**:
   - Enforce fixed-viewport lock (`h-screen overflow-hidden` or `h-dvh`).
   - Every column/pane manages its own isolated vertical scroll (`overflow-y-auto`) to prevent the entire page body from jumping or desynchronizing.
3. **Responsive Breakpoint Strategy**:
   - **Desktop (`lg` / `xl`)**: Side-by-side flex/grid with persistent split view.
   - **Tablet (`md`)**: Master pane remains visible; detail pane shifts to a floating slide-over drawer or modal sheet.
   - **Mobile (`< 768px`)**: Pure stacked view or drill-down navigation (master view full screen $\rightarrow$ clicking an item pushes detail view full screen with a back button).

---

## 2. Interaction & Visual Standards

1. **Dividers, Seams & Depth**:
   - Never use thick, high-contrast borders. Use hairline borders (`border-r border-slate-200 dark:border-zinc-800`).
   - For draggable resizable split panes, place an interactive separator bar (`w-1 hover:w-1.5 cursor-col-resize hover:bg-indigo-500 transition-all`).
2. **State & Density Ergonomics**:
   - Support collapsible states (`isSidebarOpen ? 'w-64' : 'w-16'`) with fluid width transitions (`transition-[width] duration-200 ease-in-out`).
   - Maintain appropriate data density: tight padding (`py-2 px-3`) inside master list items, comfortable spacing (`p-6` to `p-8`) inside the active detail workspace.

---

## 3. Production-Ready React / Tailwind Primitive

### Master-Detail Split Dashboard with Isolated Pane Scrolling
```tsx
import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  SlidersHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

interface IncidentItem {
  id: string;
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: string;
  uptime: string;
  lastChecked: string;
  summary: string;
}

const mockData: IncidentItem[] = [
  { id: 'srv-1', service: 'Authentication API', status: 'operational', latency: '42ms', uptime: '99.98%', lastChecked: '1m ago', summary: 'OAuth2 and session token validation running with zero error spikes across edge regions.' },
  { id: 'srv-2', service: 'Primary PostgreSQL Node', status: 'degraded', latency: '210ms', uptime: '98.40%', lastChecked: 'Just now', summary: 'High write saturation detected on replication workers. Buffer pool hit ratio at 84%.' },
  { id: 'srv-3', service: 'Asset Storage Bucket (S3)', status: 'operational', latency: '88ms', uptime: '99.99%', lastChecked: '3m ago', summary: 'Global CDN distribution nominal. Multi-part upload endpoints responding within limits.' },
  { id: 'srv-4', service: 'Redis Cache Cluster', status: 'operational', latency: '4ms', uptime: '100%', lastChecked: '30s ago', summary: 'Cache-aside eviction rates under 0.02%. Memory capacity at 64% with bounded keysets.' },
  { id: 'srv-5', service: 'Billing Webhook Consumer', status: 'outage', latency: 'TIMEOUT', uptime: '94.20%', lastChecked: '4m ago', summary: 'Stripe webhook signature worker pool exhausted. Dead-letter queue active.' }
];

export default function SplitScreenDashboard() {
  const [selectedId, setSelectedId] = useState<string>('srv-1');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedItem = mockData.find(item => item.id === selectedId) || mockData[0];

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex overflow-hidden font-sans">
      
      {/* 1. Left Nav Sidebar (Collapsible) */}
      <aside className={`border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col transition-[width] duration-200 ease-in-out shrink-0 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-zinc-800">
          {sidebarOpen && <span className="font-bold text-sm tracking-tight">System Console</span>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
            aria-label="Toggle navigation width"
          >
            {sidebarOpen ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {['Telemetry', 'Alert Rules', 'API Keys', 'Audit Logs'].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                idx === 0 
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current shrink-0" />
              {sidebarOpen && <span>{item}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. Master-Detail Split Container */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Left Pane: Master Feed (Search + Filterable Item List) */}
        <section className="w-full md:w-96 lg:w-[420px] h-full flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
          
          {/* Feed Header */}
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-bold tracking-tight">Monitored Services</h1>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-zinc-400">
                {mockData.length} Targets
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/>
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 border-none text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Master Item List (Scroll Isolated) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {mockData.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 cursor-pointer transition-colors relative flex items-center justify-between ${
                    isSelected 
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Selected Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-400" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{item.service}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        item.status === 'operational'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : item.status === 'degraded'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-3 font-mono">
                      <span>{item.latency}</span>
                      <span>•</span>
                      <span>Checked {item.lastChecked}</span>
                    </div>
                  </div>

                  <ChevronRight \${isSelected ''}`} 'translate-x-1 : ? className="{`w-4" h-4 text-indigo-500' text-slate-400 transition-transform/>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Pane: Detail View Stage (Scroll Isolated) */}
        <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-slate-50/60 dark:bg-zinc-950">
          <div className="max-w-3xl space-y-8">
            
            {/* Header Stage */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Resource Overview</span>
                <h2 className="text-2xl font-bold tracking-tight mt-1">{selectedItem.service}</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedItem.id}</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5"/>
                  Configure
                </button>
                <button className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 transition-colors">
                  Run Diagnostic
                  <ExternalLink className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-slate-500">Response Latency</span>
                <p className="text-xl font-bold font-mono mt-1">{selectedItem.latency}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-slate-500">30-Day Availability</span>
                <p className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">{selectedItem.uptime}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-slate-500">Health Verification</span>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500"/>
                  Nominal
                </div>
              </div>
            </div>

            {/* Detailed Summary Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold tracking-tight">Active Incident Summary</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {selectedItem.summary}
              </p>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}