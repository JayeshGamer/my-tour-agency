# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15 travel agency application built with TypeScript and Tailwind CSS v4. The project uses Turbopack for faster builds and follows the modern Next.js App Router architecture.

## Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (optimized with next/font)
- **Build Tool**: Turbopack (Next.js's faster bundler)
- **Linting**: ESLint with Next.js configuration

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing and Quality
The project currently uses the default Next.js ESLint configuration. No test framework is set up yet.

### Single File Operations
- Lint a specific file: `npx eslint src/app/page.tsx`
- Type check: `npx tsc --noEmit`

## Architecture and Structure

### App Router Structure
The project uses Next.js 13+ App Router with the following structure:

```
src/
  app/                 # App Router directory
    layout.tsx         # Root layout with fonts and global styles
    page.tsx           # Home page component
    globals.css        # Global CSS with Tailwind and CSS variables
    favicon.ico        # Site favicon
```

### Key Architectural Patterns

1. **App Router**: Uses the modern Next.js App Router (not Pages Router)
2. **Font Optimization**: Implements `next/font/google` for Geist fonts with CSS variables
3. **Dark Mode Support**: CSS variables with `prefers-color-scheme` media query
4. **Tailwind v4**: Uses the latest Tailwind CSS version with PostCSS plugin
5. **TypeScript Path Mapping**: `@/*` paths resolve to `./src/*`

### CSS Architecture
- Global styles defined in `globals.css` with CSS custom properties
- Tailwind CSS v4 imported via `@import "tailwindcss"`
- Theme configuration uses CSS variables for colors and fonts
- Responsive design with mobile-first approach

### Font System
- Primary font: Geist Sans (`--font-geist-sans`)
- Monospace font: Geist Mono (`--font-geist-mono`)
- Fonts are loaded optimally via Next.js font optimization

## Development Guidelines

### File Creation Patterns
- New pages: Create in `src/app/[route]/page.tsx`
- Layouts: Use `layout.tsx` files for nested layouts
- Components: Consider creating a `src/components/` directory for reusable components
- Utilities: Consider creating a `src/lib/` directory for utility functions

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` → `./src/*`)
- ES2017 target with modern module resolution
- Next.js TypeScript plugin included

### Styling Approach
- Use Tailwind CSS classes for styling
- Leverage CSS custom properties for theme consistency
- Follow mobile-first responsive design
- Use `dark:` prefix for dark mode styles

### ESLint Configuration
- Extends `next/core-web-vitals` and `next/typescript`
- Ignores build directories and generated files
- Uses flat config format (eslint.config.mjs)

## Build Configuration

### Next.js Config
- Minimal configuration in `next.config.ts`
- Turbopack enabled for development and build
- Ready for additional optimizations as project grows

### PostCSS Setup
- Configured with `@tailwindcss/postcss` plugin
- Supports Tailwind CSS v4 processing

## Project Status
This appears to be a fresh Next.js project with the default starter template. The travel agency functionality is yet to be implemented beyond the basic Next.js scaffold.
