---
name: GoCrazy
updated: 2026-11-17
---

# GoCrazy design system

Derived from the shipped code (`frontend/src/index.css`, `lib/theme.tsx`, components). The board is the ad: a live rupee auction for #1, lit from behind by neon light.

## Colour
Dark theme only. One accent, used as light: fills for the primary action and active states, tints and soft glows for the top three rows, beams under active navigation.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#07070a` | Page ground |
| `--surface` | `#101016` | Cards, inputs, rows |
| `--raised` | `#17171f` | Dialogs, search, raised panels |
| `--line` / `--line-strong` | white 11% / 20% | Hairlines (inset box-shadow, not borders) |
| `--ink` | `#fafafc` | Primary text |
| `--ink-2` | `#e2e2e9` | Secondary text |
| `--ink-3` | `#b8b8c4` | Meta text and placeholders; ≥9:1 on every surface |
| `--accent` | `#38bdf8` | Brand sky blue |
| `--accent-ink` | `#041419` | Text on accent fills |
| `--accent-subtle` / `--accent-muted` | sky 10% / 20% | Tints, chips, focus |

Excluded by product commitment: navy grounds, amber accents, gradient text.

## Type
| Role | Face | Notes |
| --- | --- | --- |
| Display | Bricolage Grotesque 700–800, opsz 96, tracking −0.035em | Hero "Claim #1 for ₹X", page titles; class `display` |
| Body | Schibsted Grotesk 400–600 | UI and prose; 65–75ch measure on reading pages |
| Numerals | Spline Sans Mono 500–600, tabular | Every amount, rank and count; classes `font-mono tnum` |

Hero 2.2rem → 3.5rem; page titles 2.25–2.75rem; body 14.5–15.5px; meta 12–13px.

## Shape and depth
- Radii: pills (`rounded-full`) for inputs, buttons, chips and tabs; 16px rows; 24px cards.
- Depth is light, not shadow: inset hairlines plus an offset accent glow (`0 8px 36px -4px`) on #1–#3 and the primary button.
- Rows tilt up to 3.5° toward the pointer and carry a pointer-following accent spotlight.

## Motion
- Grammar: rise and un-blur, ease `cubic-bezier(0.16, 1, 0.3, 1)`, 0.3–0.55s. Route changes cross-fade the page; tab pills share a layout spring.
- Signature: the price stepper. Each ± sweeps light across the amount, and the #1 row's glow scales with the offered amount relative to the leader.
- Hero background: multi-colour threejs-components `tubes1` neon tubes (reference palette pink/green/violet with orange and cyan lights, three more curated palettes) follow the cursor in the first viewport and fade out downward. A click on empty hero space cycles four sky-family palettes.
- `prefers-reduced-motion`: no tubes (static accent glow), no entrances, near-zero transitions.

## Components
Claim form with `*` on required fields and an optional details fieldset that opens once URL and category are set; header with live strip (only when real numbers exist), category chip rail, board tabs, claim hero, listing row, side mini-boards, activity strip, stats strip (DataFast only), checkout dialog, search overlay (⌘/Ctrl K), legal document layout, empty states for every board.

## Browser surfaces
Accent selection colour and caret, thin themed scrollbars, 2px accent focus ring with 3px offset, 3px underline offset.

## Icons
lucide, stroke 1.75; brand marks (X, LinkedIn) as authored SVG. Category icons are a static map in `Icon.tsx`.

## Assets
`public/og.png`: share card rendered from an authored HTML template (fonts above) with Playwright; no generated imagery. `public/favicon.svg`: three-bar mark in accent on ground.
