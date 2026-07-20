# DM Combat Screen

A phone-first D&D 5e (2024 rules / SRD 5.2.1) combat tracker for Dungeon Masters, built as a single-file React app. Initiative tracking, full SRD bestiary (330 monsters) and spell compendium (339 spells), targeted attacks with auto-damage, group saves with per-creature rolls, conditions with concentration linkage and repeat saves, legendary & lair actions, attack/spell action-economy enforcement, encounter suggestion and balancing.

This repo was migrated from a Claude.ai artifact. `src/app.jsx` is the complete, working application and the single source of truth.

## Getting started

```sh
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build locally
npm run smoke    # type-check + smoke test (run before committing app.jsx changes)
```

The app is deployed to GitHub Pages automatically on every push to `main` (see `.github/workflows/deploy.yml`). Site URL: `https://<your-username>.github.io/DM-Screen/`. One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

## Current state

- **App code is one file:** `src/app.jsx` (~310KB of code). React 18, hooks only, no other runtime dependencies — no lucide, no router, nothing. The big data blocks live in `src/data/` (`bestiary.js`, `spells.js`, `encounterPools.js`, `lairThemes.js`) as default-exported modules, so code searches no longer drown in monster JSON. The Vite scaffold around it (`index.html`, `src/main.jsx`, `vite.config.js`) is the only other code that runs in the browser.
- **PWA:** `vite-plugin-pwa` generates a service worker that precaches the whole app, so it works fully offline once installed — important at tables with bad wifi. The manifest + icons in `public/` give the Add-to-Home-Screen install a real app icon and name. Updates deploy silently in the background and apply the next time the app is fully closed and reopened.
- **Saves:** the app persists encounters through a small async wrapper (`stSet`/`stGet`/`stDel`/`stList`, near the top of the file) over `window.storage` — the Claude artifact storage API. Outside Claude, `window.storage` does not exist, so `index.html` provides a shim (before the app mounts) that backs it with localStorage; saves work identically.

  Note: localStorage saves are per-device/per-browser and are lost if site data is cleared. A future export/import-to-file feature would be a worthwhile addition.

## File structure (top to bottom of `src/app.jsx`)

1. **CSS** — one template string injected via a `<style>` tag. Design tokens: `--text` (#e9e2d6) is the light body text; `--ink` (#1b1722) is DARK ink for text on gold buttons — do not confuse them (this caused a real bug once). `--panel`/`--raised` are surfaces; `--gold` is the accent. Gold = available, grey = spent is the app-wide button language. All dialog inputs are ≥16px font (prevents iOS focus-zoom) and carry inline `color`/`WebkitTextFillColor`/`background` (iOS ignores stylesheet colors on form controls in some modes).
2. **Storage wrapper** (`stSet` etc.) — see shim above.
3. **Data blocks** — `BESTIARY` (330 monsters) and `SPELL_REF` (339 spells, keys lowercase) are imported from `src/data/`, as are `LAIR_THEMES` (18 biomes × 4 lair-action suggestions) and `ENCOUNTER_POOLS` (18 biomes of curated monster names). `CONDITIONS`, `ITEMS` (loot), and the XP tables are small and remain in app.jsx.
4. **Logic** — pure functions: dice (`rollFormula`, `d20`), `makeMonster`/`makePlayer`/`makeEffect` (single funnels; all derived fields — attack budgets, spell DC/style, per-spell uses — are parsed here), text parsers (`parseAtkBudget`, `legSaveRef`, `spellCondFrom`, `spellSaveDmg`, `singleTargetText`), turn machinery (`advanceTurn`, end-of-turn condition ticking), `computeBalance`, `suggestEncounter`.
5. **Components** — everything from the `/* ================= components` divider down: modals, cards, rows, and the `App` (default export) holding all state.

### Architecture notes Claude Code should know

- All state lives in `App` as one object `{mode, round, activeUid, combatants[], log[]}`. Every mutation goes through `mutate(fn)` which deep-clones, runs `fn(draft, logs, toasts)`, then runs a **post-pass sweep** that auto-removes conditions whose linked caster stopped concentrating. Undo = stack of 20 full snapshots.
- Resource economies are enforced in the mutators, not just the UI: per-turn attack budgets with per-attack-name caps (`atkUsed`/`atkUsedBy`/`atkGrant`), one-spell-per-turn (`spellCastTurn`), one legendary action per turn-gap (`laTurnKey`), once-per-round lair actions (`fxUsedRound`). Spends happen **at resolution time**, so cancelling a dialog never costs a resource.
- `resolveGroupSave` is the save engine everything routes through (AoE button, breath weapons, lair ⚡ Resolve, legendary 🎲, spell ⭗). Monsters auto-roll; player-type combatants become pending rows the DM marks ✓/✗ from reported rolls.
- Conditions support `{name, rounds, src, spell, rpt:{ab,dc,note}}` — `src`/`spell` link them to a caster's concentration; `rpt` drives the blocking repeat-save dialog when the afflicted creature's turn ends. Durations tick at END of the owner's turn (deliberate — "until the end of its next turn" semantics).

## Verifying changes (the workflow that kept this stable)

1. **Type/syntax check + smoke test (mandatory — tsc's loose JS mode has missed real crashes, e.g. duplicate `const` in one block):** `npm run smoke` — transpiles `src/app.jsx` with tsc, then evaluates the module with the stub React in `tools/react-stub.cjs` and walks the entire initial render.
2. **Production build:** `npm run build`, then `npm run preview` and click through the app.
3. **Logic tests:** the pre-components section is dependency-free JavaScript. Extract it (everything above the components divider, minus the import line) into an `.mjs` file, append assertions, run with node. Test parsers against the real `BESTIARY`/`SPELL_REF` data — that habit caught dozens of stat-block phrasing edge cases.

## Suggested next tasks for Claude Code

1. ~~Scaffold Vite + React, move `app.jsx` in, add the storage shim to `index.html`, verify a production build renders.~~ Done.
2. ~~Split `BESTIARY`, `SPELL_REF`, `LAIR_THEMES`, `ENCOUNTER_POOLS` into imported modules.~~ Done (`ITEMS` and `CONDITIONS` are small and stayed in app.jsx).
3. ~~Deploy to GitHub Pages~~ (workflow added — enable Pages in repo settings); confirm on iPhone Safari (the primary device), including Add to Home Screen.
4. Only then: split components into files. The single working file is the safety net — keep it green at every step.

## License & attribution

This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

The optional expanded bestiary (`src/data/bestiaryTob.js`, lazy-loaded when enabled) contains open game content from Tome of Beasts, Copyright 2016, Open Design; used under the Open Game License v 1.0a, converted from the Open5e project's data (`tools/convert-tob.mjs` regenerates it). The full OGL text and Section 15 notice ship inside that module and display in the app's Licenses panel (footer → "full licenses").

The same notices are displayed in the app's footer and must be preserved in both places.
