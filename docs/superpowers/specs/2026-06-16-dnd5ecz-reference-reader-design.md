# DnD5eCZ Reference Reader — Design Spec

## Overview

An Owlbear Rodeo extension that provides a searchable Czech-language D&D 5e reference reader. The extension opens as an action popover inside an Owlbear Rodeo room, letting GMs and players browse rules, spells, monsters, and classes during sessions. It processes 949 markdown files at build time and deploys as a static site on Vercel, loaded into Owlbear Rodeo via an iframe.

## Owlbear Rodeo Integration

### Manifest

The extension is defined by a `manifest.json` served from the deployed site root:

```json
{
  "name": "DnD5e CZ",
  "version": "1.0.0",
  "manifest_version": 1,
  "author": "kankaj",
  "description": "Czech D&D 5e reference reader — browse rules, spells, monsters, and classes",
  "icon": "/icon.png",
  "action": {
    "title": "DnD5e CZ",
    "icon": "/icon.png",
    "popover": "/",
    "width": 480,
    "height": 640
  }
}
```

### SDK

The `@owlbear-rodeo/sdk` package is installed and initialized on app load. The SDK is used to:

- Detect when the extension is running inside Owlbear Rodeo vs standalone
- React to action open/close events via `OBR.action.onOpenChange`
- Read the current room's theme via `OBR.theme` to match the host's dark/light mode

### Iframe Constraints

The app runs inside an iframe popover with configurable dimensions (default 480x640). This means:

- No browser URL bar — React Router uses `MemoryRouter` (no browser history)
- Layout is optimized for the popover size, not full-screen
- No need for mobile responsive breakpoints — the popover is always a fixed panel

## Architecture

The app is a static site built with Vite + React + TypeScript, loaded into Owlbear Rodeo as an iframe popover.

**Key layers:**

- **Content layer** — Vite plugin reads markdown, parses custom components, outputs structured data
- **Routing layer** — React Router with `MemoryRouter` for in-popover navigation
- **UI layer** — React components for layout, navigation, content rendering, and search
- **Search layer** — FlexSearch index built at build time, loaded on demand
- **Integration layer** — Owlbear Rodeo SDK initialization and theme syncing

## Content Pipeline

The Vite plugin processes markdown files at build time:

1. **File discovery** — Scans `src/files/` recursively, groups by source book (bestiar, prirucka-hrace, etc.)
2. **Markdown parsing** — Uses `remark` + `rehype` pipeline to convert markdown to HTML
3. **Custom components** — `<Monster>` and similar tags are parsed as MDX components, rendered by React components with the same props (title, armor-class, hit-points, str, dex, etc.)
4. **Metadata extraction** — Pulls title from first `# heading`, file path determines category and URL slug
5. **Search index** — Builds a FlexSearch document index with fields: title, content text, category, source book
6. **Route generation** — Generates a route manifest mapping paths to content modules

### Content Sources

| Directory | Content | Entry Count |
|-----------|---------|-------------|
| `bestiar/` | Bestiary / monsters | 157 |
| `prirucka-hrace/` | Player's Handbook | 20 |
| `pruvodce-pana-jeskyne/` | DM Guide | 15 |
| `jeskyne-a-draci/` | Caves & Dragons | 19 |
| `tasha/` | Tasha's Cauldron | 18 |
| `xanathar/` | Xanathar's Guide | 6 |
| `voluv-pruvodce-netvory/` | Volo's Guide to Monsters | 57 |
| `snippets/kouzla/` | Spells | ~300+ |
| `snippets/povolani/` | Classes | ~50+ |
| `snippets/obory/` | Subclasses | ~280+ |
| `templates/` | Templates | 18 |

## Navigation & UI

### Layout

The UI is designed for the popover panel (480x640 default):

- Top bar with search input and back navigation
- Collapsible category tree below the top bar (or as a slide-out drawer)
- Main content area for rendered markdown
- Back button to return from content to category list

### Pages

- **Home** — Grid of category cards (Bestiary, Player's Handbook, Spells, Classes, etc.) with entry counts
- **Category page** — Scrollable, searchable list of all entries in that category
- **Content page** — Rendered markdown with custom components

### Search

- Search bar in top bar, always visible
- Instant results as you type (debounced 150ms)
- Results grouped by category with highlighted matches
- Keyboard navigable (arrow keys + enter)
- Click result to navigate, search clears

### Custom Components

- `<Monster>` — Stat block with standard D&D 5e layout (AC, HP, speed, ability scores, actions, legendary actions, etc.)
- Tables, blockquotes, and code blocks styled for readability

## Tech Stack

**Already in place:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, ESLint

**UI library:**

- `shadcn/ui` — Component library built on Radix UI + Tailwind. Components are copied into the project for full control. Key components: Accordion (category tree), Command (search), ScrollArea, Dialog, Sheet (mobile sidebar), Separator, Badge

**New dependencies:**

- `@owlbear-rodeo/sdk` — Owlbear Rodeo extension SDK
- `react-router-dom` — Client-side routing (MemoryRouter)
- `remark` + `remark-rehype` + `rehype-stringify` + `rehype-raw` — Markdown to HTML pipeline
- `flexsearch` — Fast client-side full-text search
- `gray-matter` — Frontmatter parsing (if needed later)

**Dev dependencies:**

- `@mdx-js/rollup` or custom Vite plugin — MDX processing for custom components

No backend, no database. Everything is static. Search index is a JSON file generated at build time.

## Deployment

Static site deployed on Vercel with automatic rebuilds on every commit. The `manifest.json` is served from the Vercel deployment URL. Users install the extension by adding the manifest URL in Owlbear Rodeo's extension settings.

## Design Principles

- **Clean modern design** — Focused on readability, good typography, and spacing within the popover
- **Fast** — Static site with lazy-loaded search index, no runtime markdown parsing
- **Theme-aware** — Syncs with Owlbear Rodeo's dark/light theme via the SDK
