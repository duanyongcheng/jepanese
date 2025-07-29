# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` - Start Next.js development server at http://localhost:3000
- **Build**: `pnpm build` - Create production build
- **Production server**: `pnpm start` - Start production server
- **Lint**: `pnpm lint` - Run ESLint checks

Note: This project uses pnpm as the package manager (see packageManager field in package.json).

## Project Architecture

This is a Next.js 15 app for learning Japanese kana (hiragana/katakana) with the following structure:

### Core Components
- **Home page** (`src/app/page.tsx`): Interactive practice interface where users select kana rows and practice with flashcards
- **Gojuon chart** (`src/app/gojuon/page.tsx`): Reference chart displaying the complete Japanese syllabary
- **Data layer** (`src/data/gojuon.ts`): Complete gojuon data including hiragana, katakana, and romaji

### Key Features
- **Row-based practice**: Users select specific kana rows (あ行, か行, etc.) for targeted practice
- **Interactive flashcards**: Click to reveal kana characters
- **Dual script support**: Displays both hiragana and katakana for each sound
- **Responsive design**: Uses Tailwind CSS with dark mode support

### Data Structure
The `GOJUON_DATA` object maps romaji keys to kana data:
```typescript
{
  a: { hiragana: "あ", katakana: "ア", romaji: "a" }
}
```

The `GOJUON_ROWS` object organizes sounds by traditional Japanese rows for practice selection.

### Technology Stack
- Next.js 15 with App Router
- React 19 RC
- TypeScript
- Tailwind CSS

### Practice Flow
1. Users select Japanese kana rows (あ行, か行, etc.) from the home page
2. Click "开始练习" to shuffle selected sounds into flashcards
3. Cards initially show romaji, click to reveal hiragana/katakana characters
4. "全部翻开" button reveals all cards at once

### State Management Pattern
- Uses React useState for local component state
- Key state: `selectedRows`, `shuffledSounds`, `revealedCards`
- Card reveal state tracked with Set data structure for performance
- Shuffle algorithm uses Fisher-Yates shuffle implementation

### File Organization
- Components: App Router pages in `/src/app/`
- Data: Centralized in `/src/data/gojuon.ts`
- Styling: Tailwind classes with dark mode variants