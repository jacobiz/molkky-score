# Quickstart: Finnish Language Support with Flag Icons

**Feature**: 010-add-finnish-lang | **Date**: 2026-03-01

## No New Setup Required

This feature requires no new dependencies, tooling, or environment configuration. All changes are within the existing TypeScript/React/Vite project.

## Development Workflow

```bash
# Install dependencies (already done — no new packages)
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Type-check
npm run build
```

## Testing the Feature Manually

1. **Finnish locale detection** (first launch):
   - Open browser DevTools → Application → Storage → Clear `molkky-score-v2`
   - Change browser language to Finnish: DevTools → Settings → Preferred language → `fi`
   - Reload — app should open in Finnish

2. **Language selector**:
   - On Home screen, look for the `🇯🇵 JA / 🇬🇧 EN / 🇫🇮 FI` button group
   - Tap each button and verify all text on screen updates immediately

3. **Session persistence**:
   - Select Finnish, close tab, reopen — Finnish should still be active

4. **Full Finnish game flow**:
   - Switch to Finnish → New Game → add 2+ players → play → verify all messages in Finnish

## Files Changed

| File | Change |
|------|--------|
| `src/types/game.ts` | `Language` type: add `'fi'` |
| `src/i18n/fi.ts` | New file: Finnish translations |
| `src/utils/i18n.ts` | Add `fi` locale + `detectLocale()` |
| `src/context/GameContext.tsx` | Use `detectLocale()` on first launch |
| `src/components/HomeScreen.tsx` | 3-button flag selector |
| `src/components/SetupScreen.tsx` | 3-button flag selector |
