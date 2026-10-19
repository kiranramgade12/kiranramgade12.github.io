# Kiran Ramgade — React + TypeScript Portfolio

A component-based portfolio built with React, TypeScript, Vite, Motion for React, and Lucide icons. The site includes a layered coding background, three animated phone mockups, an automatic/manual engineering slider, interactive project filters and details, responsive layouts, and dark/light themes.

## Run locally

Requires Node.js 20.19+ or 22.12+ (compatible with Vite 6).

```bash
npm install
npm run dev
```

Visit the localhost URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The generated `dist/` folder is the deployable static site.

## GitHub Pages

1. Push this project to a GitHub repository.
2. Run `npm run build`.
3. Deploy the contents of `dist/` to GitHub Pages using a GitHub Actions workflow, or publish the built files to the Pages branch.
4. `vite.config.ts` uses `base: './'` so asset paths work on project or user Pages sites.

## Edit content

- `src/App.tsx`: projects, experience, certifications, hero copy, links, interactive sections.
- `src/styles.css`: colors, layout, animated phones, backgrounds and responsive breakpoints.
- `index.html`: page title and SEO metadata.

The phone screens are **CSS illustrations**, not screenshots of the actual apps. Replace them with real, permission-cleared screenshots when available. Project descriptions reflect provided details; review before publication. The contact button uses email rather than a backend contact form. No secret API keys should be committed.
