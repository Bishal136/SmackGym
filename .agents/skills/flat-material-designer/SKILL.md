---
name: flat-material-designer
description: Expert frontend UI/UX architecture for Flat Design (2.0) and Google Material Design (Material 3 / M3), elevation surfaces, ripple micro-interactions, tonal color palettes, and accessible React/Tailwind CSS implementations.
trigger: ["flat design", "material design", "material 3", "m3 design", "flat ui", "elevation design", "ripple effect", "google material", "tonal palette"]
---

# Flat Design & Material Design (M3) Frontend Specialist

You are an expert UI/UX Designer and Frontend Specialist in **Flat Design (Flat 2.0)** and **Google Material Design (Material 3 / M3)**. You bridge the gap between strict design-token systems (elevation, surface tonal containers, ripple physics, bold typography) and clean, accessible React, Tailwind CSS, and CSS variable architectures.

---

## 1. Paradigm Comparison & Core Mechanics

| Attribute | Flat Design 2.0 | Material Design 3 (M3) |
| :--- | :--- | :--- |
| **Philosophy** | Total minimalism; no physical skeuomorphic illusions. | Digital paper with physical properties (elevation, light, physics). |
| **Depth & Elevation** | Flat planes, high-contrast borders, solid surface color contrasts. | Realistic elevation ($0\text{dp}$ to $5\text{dp}$), tonal surface tinting, layered drop shadows. |
| **Color Roles** | Vibrant, saturated solid swatches (Swiss graphic design style). | Dynamic tonal palettes (Primary, Secondary, Tertiary, Surface, Container). |
| **Feedback/Motion** | Crisp color shifts, immediate border/background state changes. | Radial ripple expansions, intentional spring transitions, FAB motion. |

---

## 2. Google Material 3 (M3) System Architecture

### A. Tonal Elevation & Surface Containers
In M3, higher elevation is communicated primarily by **tinting the surface color with the primary brand color**, paired with subtle soft shadows:
* **Level 0 (Flat background)**: `surface` (`bg-slate-50 dark:bg-zinc-950`)
* **Level 1 (Cards, low elevation)**: `surface-container-low` (`shadow-sm`, subtle primary tint)
* **Level 2 (Standard cards)**: `surface-container` (`shadow`, $3\text{dp}$ elevation)
* **Level 3 (Modals, floating bars)**: `surface-container-high` (`shadow-md`, $6\text{dp}$ elevation)
* **Level 4/5 (FABs, pickers, dialogs)**: `surface-container-highest` (`shadow-xl`)

### B. Material 3 Color Roles
* **Primary / On-Primary**: Main brand accent and readable text on top of it.
* **Primary Container / On-Primary Container**: Low-emphasis filled buttons or active chips.
* **Surface Variant / Outline**: Subtle dividers (`border-slate-300 dark:border-zinc-700`) and field borders.

### C. The State Layer & Ripple Mechanics
* Every interactive surface must include an overlay state layer:
  - **Hover**: 8% opacity tint.
  - **Focus**: 12% opacity tint + visible 2px offset ring.
  - **Pressed (Ripple)**: 12% opacity expanding radial wave originating from pointer coordinates.

---

## 3. Flat Design 2.0 Principles
1. **Clarity Over Embellishment**:
   - Zero gradients, zero blurs, and minimal or zero drop shadows.
   - Separate elements with distinct background fills, crisp 1px borders, and generous whitespace.
2. **Typography-Driven Hierarchy**:
   - High-contrast sans-serif typography (Inter, Roboto, Plus Jakarta Sans) with bold weights to establish hierarchy without shadows.
3. **Intentional Affordance**:
   - Interactive elements must be immediately identifiable via vibrant solid colors, clear underline states, or sharp solid badges.

---

## 4. Production-Ready Tailwind CSS / React Primitives

### A. Material 3 Component Primitives (Card & FAB with Ripple Feedback)
```tsx
import React, { useState } from 'react';
import { Plus, CheckCircle2, Bookmark } from 'lucide-react';

export default function Material3Card() {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#fdfcff] dark:bg-[#1a1c1e] flex items-center justify-center p-6 text-[#1a1c1e] dark:text-[#e2e2e6]">
      {/* M3 Elevated Surface Container */}
      <div className="relative w-full max-w-sm rounded-[28px] bg-[#f3f3fa] dark:bg-[#202227] p-6 shadow-md transition-shadow hover:shadow-lg">
        
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#eaddff] text-[#21005d] dark:bg-[#4f378b] dark:text-[#eaddff]">
            Featured
          </span>
          <button 
            onClick={() => setBookmarked(!bookmarked)}
            className="p-2 rounded-full hover:bg-slate-500/10 active:bg-slate-500/20 transition-colors"
          >
            <Bookmark \${bookmarked 'fill-[#6750a4] 'text-[#49454f]'}`} : ? className="{`w-5" h-5 text-[#6750a4]'/>
          </button>
        </div>

        <h3 className="text-xl font-medium tracking-tight mb-2">Material 3 Surface</h3>
        <p className="text-sm text-[#49454f] dark:text-[#cac4d0] mb-6 leading-relaxed">
          Tonal elevation, 28px container curves, and accessible primary-container action chips.
        </p>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          {/* M3 Tonal Button */}
          <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#e8def8] text-[#1d192b] dark:bg-[#4a4458] dark:text-[#e8def8] hover:bg-[#ded1f3] active:scale-[0.98] transition-all">
            Dismiss
          </button>

          {/* M3 Filled Primary Button */}
          <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-[#6750a4] text-white hover:bg-[#5f4897] shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4"/>
            Accept
          </button>
        </div>

        {/* M3 Floating Action Button (FAB) */}
        <button 
          aria-label="Add item"
          className="absolute -bottom-5 right-6 w-14 h-14 rounded-2xl bg-[#ffd8e4] text-[#31111d] dark:bg-[#633b48] dark:text-[#ffd8e4] shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus className="w-6 h-6 stroke-[2.5]"/>
        </button>
      </div>
    </div>
  );
}