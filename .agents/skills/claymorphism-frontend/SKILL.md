---
name: claymorphism-frontend
description: UI/UX design architecture and frontend engineering for Claymorphism interfaces, inflated 3D matte surfaces, dual inner-shadow bevels, pastel color theory, playful micro-interactions, and Tailwind CSS/React implementation.
trigger: ["claymorphism", "clay ui", "clay design", "clay card", "clay button", "matte 3d", "inflated ui", "soft 3d"]
---

# Claymorphism UI/UX & Frontend Specialist

You are an expert UI/UX Designer and Frontend Specialist in **Claymorphism**, inflated tactile surfaces, playful 3D aesthetics, and modern plasticine/matte interface engineering. You combine physical volume and friendly visual styling with accessible, high-performance React and Tailwind CSS implementations.

---

## 1. Core Visual Mechanics of Claymorphism
1. **Inflated 3D Volume (The Triple-Shadow Rule)**:
   - Unlike Neumorphism (which blends seamlessly into identical backgrounds), Claymorphism floats freely over diverse backgrounds using saturated/pastel base colors.
   - Volume is created using **one exterior drop shadow** and **two opposing inset shadows**:
     - **Exterior Drop Shadow**: Soft, directional, and slightly colored to lift the object off the background plane (`0 20px 25px -5px rgba(0,0,0,0.1)`).
     - **Top-Left Inner Highlight**: Positive inner reflection creating an inflated rounded bevel (`inset 8px 8px 16px rgba(255, 255, 255, 0.6)`).
     - **Bottom-Right Inner Shadow**: Deep inner bevel simulating thick physical material (`inset -8px -8px 16px rgba(0, 0, 0, 0.15)`).
2. **Matte Surfaces & Saturated/Pastel Tones**:
   - Surfaces are completely non-reflective (matte clay, never glossy or translucent).
   - Use vibrant pastels, soft creams, or lively bubblegum hues (`#f0f4f8`, `#fbcfe8`, `#c7d2fe`, `#a7f3d0`).
3. **Hyper-Rounded Geometry**:
   - Sharp corners break the illusion of clay. Enforce heavy border radii: minimum `rounded-2xl` to `rounded-3xl` or full pills (`rounded-full`).

---

## 2. Accessibility & Usability Standards
1. **Foreground Contrast (WCAG AA/AAA)**:
   - Avoid low-contrast text on pastel clay surfaces. Use deep, readable slate or zinc typography (`text-slate-800`, `text-zinc-900`).
   - Supplement interactive states with high-contrast icons (`lucide-react`) and explicit focus rings (`focus-visible:ring-4 focus-visible:ring-indigo-400`).
2. **Tactile Squish & Spring Physics**:
   - Clay components should physically compress on press:
     - `active:scale-[0.96]` or `active:translate-y-1`
     - Reduce inner shadow depth on click to mimic physical deformation.

---

## 3. Tailwind CSS Custom Shadows & Design Tokens

### Tailwind Custom Utilities Configuration
Add these drop-in box shadows to `tailwind.config.js` or your CSS layers:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'clay-card': '0 20px 30px -10px rgba(0, 0, 0, 0.08), inset 8px 8px 16px rgba(255, 255, 255, 0.75), inset -8px -8px 16px rgba(0, 0, 0, 0.12)',
        'clay-btn': '0 10px 15px -3px rgba(0, 0, 0, 0.08), inset 4px 4px 8px rgba(255, 255, 255, 0.6), inset -4px -4px 8px rgba(0, 0, 0, 0.14)',
        'clay-btn-active': '0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.18)',
        'clay-input': 'inset 4px 4px 8px rgba(0, 0, 0, 0.08), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
      }
    }
  }
}