# Implementation Plan: Mölkky スコア管理アプリ

**Branch**: `001-molkky-score` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-molkky-score/spec.md`

---

## Summary

TailwindCSS v4 によるレスポンシブデザインを採用したモバイルファースト PWA として Mölkky スコア管理アプリを実装する。既存の React 19 + TypeScript（strict）+ Vite 6 + vite-plugin-pwa 構成に、TailwindCSS v4（`@tailwindcss/vite`）と Vitest を追加する。

ゲームルール（スコア計算・バースト・脱落・勝利判定）はピュア関数として切り出し TDD を適用する。状態管理は React Context + `useReducer` で実装し、外部ライブラリへの依存を排除する。ゲーム状態は `localStorage` に保存してオフライン・リロード復元を保証する。

---

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode 有効）
**Primary Dependencies**: React 19, TailwindCSS v4 (`@tailwindcss/vite`), Vite 6.1, vite-plugin-pwa 0.21
**Testing**: Vitest 3 + `@testing-library/react`（UI テストは任意）
**Storage**: `localStorage`（JSON シリアライズ、バージョニング付き、バックエンドなし）
**Target Platform**: Mobile-first PWA（iOS / Android / デスクトップブラウザ）
**Project Type**: Single-project SPA（フロントエンドのみ）
**Performance Goals**: 主要操作 100ms 以内（Constitution 原則 III）
**Constraints**: オフライン動作必須、`localStorage` のみ、PostCSS 不要（Vite プラグイン使用）
**Scale/Scope**: 2〜12 プレイヤー、1 デバイス共有、日英 2 言語

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
|---|---|---|
| I. シンプルさ優先 | ✅ PASS | Context + useReducer（外部 state ライブラリなし）。TailwindCSS v4 は設定ファイル不要。依存関係は最小限 |
| II. テストファースト | ✅ PASS | Vitest を追加し、`scoring.ts` と `gameReducer.ts` に TDD を適用。UI テストは任意 |
| III. モバイルファースト・PWA | ✅ PASS | TailwindCSS のモバイルファーストブレークポイント + PWA は既設定済み。レスポンシブ対応を全コンポーネントに適用 |

**Constitution Check 後設計: PASS（違反なし）**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-molkky-score/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── localStorage-schema.md   # ストレージスキーマ
│   ├── i18n-keys.md             # 国際化文字列キー
│   └── share-text.md            # シェアテキスト仕様
└── tasks.md             # Phase 2 output (/speckit.tasks で生成)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── HomeScreen.tsx          # ホーム画面（新規開始 / 再開）
│   ├── SetupScreen.tsx         # プレイヤー名入力・投球順設定
│   ├── GameScreen/
│   │   ├── index.tsx           # ゲーム進行メイン（上下分割レイアウト）
│   │   ├── ScoreBoard.tsx      # 上半分：全プレイヤーのスコア一覧
│   │   └── PinInput.tsx        # 下半分：投球入力 UI（2 ステップ選択）
│   ├── ResultScreen.tsx        # ゲーム終了・勝者・シェアボタン
│   ├── MolkkoutScreen/
│   │   ├── index.tsx           # Mölkkout タイブレーカー進行
│   │   └── MolkkoutInput.tsx   # Mölkkout 投球入力
│   └── ui/
│       ├── Toast.tsx           # トースト通知（クリップボードコピー等）
│       └── ConfirmDialog.tsx   # 確認ダイアログ（ゲーム上書き警告）
├── context/
│   └── GameContext.tsx         # React Context（gameState + dispatch 提供）
├── reducers/
│   └── gameReducer.ts          # 全ゲームアクションの reducer
├── types/
│   └── game.ts                 # TypeScript 型定義（全エンティティ）
├── utils/
│   ├── scoring.ts              # スコア計算ピュア関数（TDD 必須）
│   ├── storage.ts              # localStorage 読み書き（バージョニング付き）
│   ├── share.ts                # Web Share API + クリップボードフォールバック
│   └── i18n.ts                 # 言語切り替えロジック
├── i18n/
│   ├── ja.ts                   # 日本語文字列
│   └── en.ts                   # 英語文字列
├── index.css                   # @import "tailwindcss"; + カスタムテーマ
├── App.tsx                     # 画面ルーティング（enum ベースの state machine）
└── main.tsx                    # エントリーポイント

tests/
└── unit/
    ├── scoring.test.ts         # スコア計算 TDD（Constitution MUST）
    └── gameReducer.test.ts     # ゲームルール TDD（Constitution MUST）
```

**Structure Decision**: Single-project SPA。バックエンドなし、すべてフロントエンドのみ。フォルダ構成は機能（components / context / utils）で分割し、シンプルさ原則に従い不必要な抽象化を避ける。

---

## Complexity Tracking

> 違反なし。記載不要。

---

## Implementation Sequence

フェーズは Constitution の「テストファースト」に従い、コアロジックのテストを先行して実装する。

### Step 1: 環境セットアップ

1. TailwindCSS v4 追加（`npm install tailwindcss @tailwindcss/vite`）
2. Vitest 追加（`npm install -D vitest @testing-library/react jsdom`）
3. `vite.config.ts` にプラグイン追加
4. `src/index.css` に `@import "tailwindcss";`
5. `vitest.config.ts` 作成（environment: jsdom）

### Step 2: 型定義（`src/types/game.ts`）

全エンティティの TypeScript 型を定義（`data-model.md` 参照）。

### Step 3: コアロジック TDD（`src/utils/scoring.ts`）

テストを先に書き、以下のピュア関数を実装：
- `calculatePoints(pinsKnockedDown, pinNumber?)` → points
- `applyBustRule(currentScore, points)` → newScore
- `checkWin(score)` → boolean
- `incrementMisses(count)` → count | 'eliminated'
- `resetMisses()` → 0

### Step 4: Reducer TDD（`src/reducers/gameReducer.ts`）

テストを先に書き、全 `GameAction` に対応する reducer を実装：
- `START_GAME`
- `RECORD_TURN`（スコア計算・バースト・脱落・勝利を内包）
- `UNDO_TURN`
- `RESTART_GAME` / `NEW_GAME`
- `SET_LANGUAGE`

### Step 5: ストレージ（`src/utils/storage.ts`）

`localStorage` への保存・読み込み・バージョン検証。

### Step 6: Context（`src/context/GameContext.tsx`）

`useReducer` + `useEffect`（storage sync）を組み合わせた Context Provider。

### Step 7: i18n（`src/i18n/`）

日英文字列定義と言語切り替えロジック。localStorage に設定永続化。コンポーネント実装の前提として先に定義する。

### Step 8: 画面コンポーネント実装（P1 → P2 → P3 順）

| Priority | コンポーネント |
|---|---|
| P1 | HomeScreen, SetupScreen, GameScreen（ScoreBoard + PinInput）, ルール自動判定 |
| P2 | ResultScreen（シェア含む）, アンドゥ UI, 言語切り替え |
| P3 | MolkkoutScreen |

### Step 9: シェア機能（`src/utils/share.ts`）

Web Share API + クリップボードフォールバック。`share-text.md` 仕様に準拠。

### Step 10: レスポンシブ・PWA 確認・パフォーマンス検証

モバイル（375px）・タブレット（768px）・デスクトップ（1024px+）での表示確認。
