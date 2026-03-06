# Implementation Plan: スコアシート印刷機能

**Branch**: `018-scoresheet-print` | **Date**: 2026-03-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/018-scoresheet-print/spec.md`

## Summary

`ScoreSheetModal` に印刷ボタンを追加し、`@media print` CSS で印刷時にモーダルコンテンツのみを表示する。`ResultScreen` にはスコアシートモーダルを開くボタンを追加し、US1 と同一の印刷フローを提供する。外部ライブラリ追加なし、`window.print()` のみ使用。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: TailwindCSS v4（`@tailwindcss/vite`）、既存コンポーネント流用
**Storage**: N/A（印刷は表示専用、永続データなし）
**Testing**: Vitest（印刷ボタン追加は UI コンポーネント、テスト任意）
**Target Platform**: モバイルブラウザ（iOS Safari・Android Chrome）・デスクトップブラウザ
**Project Type**: PWA（React SPA）
**Performance Goals**: 印刷ダイアログ表示まで 1 秒以内（`window.print()` は同期呼び出しのため実質瞬時）
**Constraints**: 外部ライブラリ追加なし。既存 `ScoreSheetModal` を最大限流用
**Scale/Scope**: 6 ファイルの変更のみ

## Constitution Check

| 原則 | 評価 | 備考 |
|------|------|------|
| I. シンプルさ優先 | PASS | 外部ライブラリなし。CSS + `window.print()` のみ。既存コンポーネント再利用 |
| II. テストファースト | PASS | 印刷機能は UI コンポーネント追加のため、Constitution II によりテストは任意 |
| III. モバイルファースト | PASS | `@media print` + `window.print()` は iOS Safari・Android Chrome でサポート済み |

**Complexity Tracking**: 不要（違反なし）

## Project Structure

### Documentation (this feature)

```text
specs/018-scoresheet-print/
├── plan.md          ← このファイル
├── research.md      ← Phase 0 完了
├── tasks.md         ← /speckit.tasks で生成
└── checklists/
    └── requirements.md
```

### Source Code（変更対象ファイル）

```text
src/
├── index.css                              # @media print ルール追加
├── components/
│   ├── ui/
│   │   └── ScoreSheetModal.tsx            # 印刷ボタン + scoresheet-print-area クラス
│   └── ResultScreen.tsx                   # ScoreSheetModal state + スコアシートボタン
└── i18n/
    ├── ja.ts                              # 印刷 i18n キー追加
    ├── en.ts                              # 同上
    └── fi.ts                              # 同上
```

## Design Details

### 印刷 CSS（`src/index.css`）

```css
@page {
  size: A4 landscape;
  margin: 1cm;
}

@media print {
  body * { visibility: hidden; }
  .scoresheet-print-area,
  .scoresheet-print-area * { visibility: visible; }
  .scoresheet-print-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: visible;
  }
}
```

### ScoreSheetModal の変更箇所

1. モーダル本体 div（`bg-white rounded-t-2xl ...`）に `scoresheet-print-area` クラスを追加
2. ヘッダー右側に印刷ボタンを追加（`🖨 t.history.printButton`）
3. 印刷ボタンは `onClick={() => window.print()}` のみ

```tsx
// 印刷ボタン（閉じるボタンの隣に追加）
<button
  onClick={() => window.print()}
  className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 border border-gray-200 rounded-lg ml-2"
  aria-label={t.history.printButton}
>
  🖨
</button>
```

### ResultScreen の変更箇所

1. `useState<boolean>(false)` で `showScoreSheet` state を追加
2. `ScoreSheetModal` を import
3. `loadHistory` を import
4. 「スコアシートを印刷」ボタンを Action buttons エリアに追加
5. `showScoreSheet` が true の場合に `ScoreSheetModal` をレンダリング

```tsx
// ボタン（シェアボタンの下に追加）
{latestRecord && (
  <button
    onClick={() => setShowScoreSheet(true)}
    className="w-full py-3 rounded-2xl border border-gray-300 text-gray-700 font-semibold active:bg-gray-50"
  >
    🖨 {t.history.printScoreSheet}
  </button>
)}
// ...
{showScoreSheet && latestRecord && (
  <ScoreSheetModal record={latestRecord} onClose={() => setShowScoreSheet(false)} />
)}
```

`latestRecord` は `loadHistory()[0] ?? null`（ResultScreen マウント時に一度評価）。

### i18n キー追加

```typescript
history: {
  // 既存キー...
  printButton: '印刷',           // ScoreSheetModal の印刷ボタン aria-label
  printScoreSheet: 'スコアシートを印刷',  // ResultScreen のボタンラベル
}
```

英語: `printButton: 'Print'`、`printScoreSheet: 'Print Score Sheet'`
フィンランド語: `printButton: 'Tulosta'`、`printScoreSheet: 'Tulosta pistelomake'`
