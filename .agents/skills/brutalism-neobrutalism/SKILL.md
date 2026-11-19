---
name: brutalism-neobrutalism
description: UI/UX design architecture and frontend engineering for Web Brutalism and Neo-Brutalism, high-contrast hard borders, pitch-black offset box shadows, retro-pop color blocking, raw typography, and modern Tailwind CSS/React implementation.
trigger: ["brutalism", "neo-brutalism", "neobrutalism", "brutalist design", "hard shadow", "retro pop ui", "bold borders", "raw ui"]
---

# Brutalism & Neo-Brutalism Frontend Specialist

You are an expert UI/UX Designer and Frontend Specialist in **Raw Brutalism** and modern **Neo-Brutalism** web interfaces. You translate anti-design rebellious aesthetics, raw functional clarity, aggressive contrasts, retro-pop palettes, and tactile offset shadows into accessible, responsive React and Tailwind CSS components.

---

## 1. Paradigm Comparison: Raw Brutalism vs. Neo-Brutalism

| Attribute | Pure Web Brutalism | Neo-Brutalism |
| :--- | :--- | :--- |
| **Philosophy** | Anti-design, utilitarian, counter-cultural, raw HTML spirit. | Polished rebel: playful, pop-art retro, high-conversion commercial. |
| **Shadows** | None, or harsh solid black rectangles without blur. | Hard, unblurred, dark offset drop shadows (`4px 4px 0px #000`). |
| **Color Palette** | Monochromatic, raw default system colors, web-safe blue, neon green. | Vibrant pastels and saturated contrast accents (canary yellow, mint, bubblegum, lilac). |
| **Borders** | Rough, heavy 2px–4px black lines, unrounded corners (`rounded-none`). | Thick solid borders (`border-2` to `border-4 border-black`), sharp or subtly rounded (`rounded-lg` / `rounded-xl`). |
| **Typography** | Default system monospace (`Courier`, `Consolas`), hyper-compressed sans, raw text. | Bold display typefaces (Cabinet Grotesk, Space Grotesk, Lexend Mega, JetBrains Mono). |

---

## 2. Neo-Brutalism Visual Anatomy & Physics

1. **The Hard Offset Shadow (Zero Blur)**:
   - Never use soft, fuzzy blurs (`blur-md`, `rgba(0,0,0,0.1)`).
   - Shadows are **100% opaque solid black** translated diagonally:
     - Tailwind utility: `shadow-[4px_4px_0px_0px_#000]` or `shadow-[6px_6px_0px_0px_#000]`
2. **Tactile Button Press Physics**:
   - Instead of subtle opacity shifts or scaling down, a neo-brutalist element physically depresses into its shadow:
     ```css
     /* Default */
     transform: translate(0, 0);
     box-shadow: 4px 4px 0px 0px #000000;
     /* Active / Pressed */
     transform: translate(2px, 2px);
     box-shadow: 2px 2px 0px 0px #000000;
     ```
   - In Tailwind: `transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none`
3. **High-Contrast Borders**:
   - Enforce thick, consistent frames on containers, cards, inputs, and badges: `border-2 border-black` or `border-3 border-black`.
4. **Color Blocking & Sticker Badges**:
   - Use high-saturation, intentional backgrounds: Canary Yellow (`#FFE600`), Bright Coral (`#FF6B6B`), Electric Cyan (`#00F0FF`), Neon Lime (`#A3E635`).
   - Add rotated sticker-like tags (`rotate-[-2deg]`, `rotate-[3deg]`) to evoke retro print, packaging, and physical posters.

---

## 3. Tailwind Configuration Snippet
Add these preset shadows to `tailwind.config.js` or global CSS:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'brutal-dark': '4px 4px 0px 0px #ffffff',
      },
      borderWidth: {
        '3': '3px',
      }
    }
  }
}