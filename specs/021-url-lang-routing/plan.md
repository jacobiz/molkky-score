# Implementation Plan: URLベースの言語ルーティング

**Branch**: `021-url-lang-routing` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/021-url-lang-routing/spec.md`

## Summary

URL クエリパラメータ `?lang=XX` によって起動時の言語を指定できるようにし、言語切替時に URL を自動更新する。既存の `src/utils/i18n.ts` に `getLangFromUrl()` を追加し、`GameContext.tsx` で初期化と URL 同期を行う。新ライブラリ不要・永続データ変更なし。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: `URLSearchParams` / `history.replaceState`（ブラウザネイティブ API）
**Storage**: N/A（URL パラメータは非永続。localStorage 変更なし）
**Testing**: Vitest（`tests/unit/i18n.test.ts`）
**Target Platform**: モバイル・デスクトップブラウザ、PWA（オフライン動作に影響なし）
**Project Type**: PWA（SPA on GitHub Pages）
**Performance Goals**: URL 更新は同期処理で <1ms、ユーザー体験への影響なし
**Constraints**: GitHub Pages 静的ホスティング（パスベースルーティング不可）、既存 localStorage との共存

## Constitution Check

| ゲート | 状態 | 根拠 |
|--------|------|------|
| シンプルさ優先 | ✅ PASS | 新ライブラリ不要。既存ファイルへの小規模追加のみ |
| 追加ライブラリ最小限 | ✅ PASS | `URLSearchParams` / `history.replaceState` はブラウザ標準 API |
| モバイルファースト・PWA | ✅ PASS | PWA 動作に影響なし、オフライン動作継続 |
| テストファースト（主要機能） | ✅ PASS | `getLangFromUrl()` は URL 解釈ロジックとしてユニットテスト対象 |
| TypeScript strict | ✅ PASS | `Language` 型の型ガードで型安全を確保 |

**Complexity Tracking**: 違反なし（記載不要）

## Project Structure

### Documentation (this feature)

```text
specs/021-url-lang-routing/
├── plan.md          ← このファイル
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md         ← /speckit.tasks で生成
```

### Source Code Changes

```text
src/
├── utils/
│   └── i18n.ts              ← getLangFromUrl() 追加
└── context/
    └── GameContext.tsx       ← 初期化ロジック + URL同期 useEffect 追加

index.html                    ← hreflang タグの href を ?lang=XX 付き URL に更新

tests/unit/
└── i18n.test.ts              ← getLangFromUrl() ユニットテスト追加
```

**Structure Decision**: 既存のシングルプロジェクト構成を維持。変更は最小限の4ファイルに留める。

## Phase 0: Research 完了

→ [research.md](research.md) 参照

解決した決定事項:
- URL パラメータ読み取り: `URLSearchParams` API
- URL 更新: `history.replaceState`（履歴スタック汚染なし）
- ロジック配置: `src/utils/i18n.ts`（既存ファイル拡張）
- 更新トリガー: `GameContext.tsx` の `useEffect`
- 初期化優先順位: URL パラメータ → localStorage → ブラウザ言語検出

## Phase 1: Design 完了

→ [data-model.md](data-model.md) / [quickstart.md](quickstart.md) 参照

### 実装ポイント

**`getLangFromUrl()` の型ガード**:
```typescript
const lang = new URLSearchParams(window.location.search).get('lang')
if (lang === 'ja' || lang === 'en' || lang === 'fi') return lang
return null
```

**初期化（`GameContext.tsx`）**:
- `loadState()` あり + URL パラメータあり → URL パラメータを言語として使用
- `loadState()` あり + URL パラメータなし → 保存済み言語を使用
- `loadState()` なし + URL パラメータあり → URL パラメータを言語として使用
- `loadState()` なし + URL パラメータなし → `detectLocale()` にフォールバック

**URL 更新（`useEffect`）**:
- `'ja'` 選択時 → `?lang` パラメータを除去（クリーン URL）
- `'en'` / `'fi'` 選択時 → `?lang=XX` を設定
- `history.replaceState` でリロードなし・履歴スタック汚染なし

**`index.html` の hreflang 更新**:
- `hreflang="en"` → `?lang=en` 付き URL
- `hreflang="fi"` → `?lang=fi` 付き URL
- `hreflang="ja"` / `hreflang="x-default"` → パラメータなしのクリーン URL（変更なし）

### contracts/: 不要

本機能は外部インターフェースを新設しないため contracts/ は省略。

## Post-Design Constitution Check

| ゲート | 再確認 |
|--------|--------|
| シンプルさ優先 | ✅ 変更4ファイル、新抽象化なし、条件分岐最小限 |
| テストファースト | ✅ `getLangFromUrl()` のテストを実装前に記述 |
| PWA・オフライン | ✅ URL パラメータ読み取りはオフラインでも機能 |
