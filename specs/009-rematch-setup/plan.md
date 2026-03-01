# Implementation Plan: 次のゲーム設定画面（リマッチ）

**Branch**: `009-rematch-setup` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-rematch-setup/spec.md`

## Summary

結果画面の「もう一度」ボタンを押すと、前回ゲームのプレイヤー一覧が初期値として設定済みの
セットアップ画面に遷移する。`GameState` に transient フィールド `rematchPlayers` を追加し、
新規アクション `REMATCH_SETUP` で引き渡す。変更は 4 ファイル・最小限のコード追加のみ。

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode 有効）
**Primary Dependencies**: React 19, TailwindCSS v4（`@tailwindcss/vite`）
**Storage**: localStorage（既存 `SCHEMA_VERSION=2` 変更なし）
**Testing**: Vitest（既存 27 件のユニットテストがパスすることを確認）
**Target Platform**: モバイルファースト PWA（iOS / Android / Desktop）
**Project Type**: モバイルファースト PWA
**Performance Goals**: タッチ操作レスポンス 100ms 以内（既存目標を維持）
**Constraints**: 新規ライブラリ追加なし、新規画面・コンポーネント追加なし
**Scale/Scope**: 4 ファイルの変更のみ（types, reducer, SetupScreen, ResultScreen）

## Constitution Check

| 原則 | 評価 | 詳細 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | 新規コンポーネントなし。既存 SetupScreen を `rematchPlayers` 初期値で再利用 |
| II. テストファースト | ✅ PASS | ゲームロジック変更なし（ナビゲーション変更のみ）。既存 27 件継続確認で十分 |
| III. モバイルファースト | ✅ PASS | UI 変更なし。SetupScreen の既存モバイル最適化 UI をそのまま流用 |
| 品質ゲート | ✅ PASS | TypeScript エラーなし・既存テストパスを確認タスクで検証 |

## Project Structure

### Documentation (this feature)

```text
specs/009-rematch-setup/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # State/action 変更仕様
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code（変更対象）

```text
src/
├── types/
│   └── game.ts              # [US1] GameState + GameAction 更新
├── reducers/
│   └── gameReducer.ts       # [US1] initialState + REMATCH_SETUP + START_GAME
└── components/
    ├── SetupScreen.tsx      # [US1] rematchPlayers で players 初期化
    └── ResultScreen.tsx     # [US1] 「もう一度」ボタン dispatch 変更
```

## Detailed Change Specification

### 変更 1: `src/types/game.ts`

**GameState に追加**:
```diff
 export interface GameState {
   screen: Screen
   game: Game | null
   molkkoutGame: MolkkoutGame | null
   settings: Settings
+  rematchPlayers: string[] | null
 }
```

**GameAction に追加**:
```diff
   // ─ ゲーム終了後 ─
   | { type: 'RESTART_GAME' }
   | { type: 'NEW_GAME' }
+  | { type: 'REMATCH_SETUP' }
```

---

### 変更 2: `src/reducers/gameReducer.ts`

**initialState に追加**:
```diff
 export const initialState: GameState = {
   screen: 'home',
   game: null,
   molkkoutGame: null,
   settings: { language: 'ja' },
+  rematchPlayers: null,
 }
```

**START_GAME ケースで rematchPlayers をクリア**:
```diff
 case 'START_GAME': {
   // ...既存コード...
-  return { ...state, screen: 'game', game }
+  return { ...state, screen: 'game', game, rematchPlayers: null }
 }
```

**REMATCH_SETUP ケースを追加**（`NEW_GAME` ケースの直後）:
```diff
+  case 'REMATCH_SETUP': {
+    const game = state.game
+    if (!game) return state
+    return {
+      ...state,
+      screen: 'setup',
+      rematchPlayers: game.players.map(p => p.name),
+    }
+  }
```

---

### 変更 3: `src/components/SetupScreen.tsx`

**players 初期状態を rematchPlayers から取得**:
```diff
 export function SetupScreen() {
   const { state, dispatch } = useGame()
   const { t } = useTranslation()
   const [inputValue, setInputValue] = useState('')
   const [error, setError] = useState<string | null>(null)
-  const [players, setPlayers] = useState<string[]>([])
+  const [players, setPlayers] = useState<string[]>(state.rematchPlayers ?? [])
```

---

### 変更 4: `src/components/ResultScreen.tsx`

**「もう一度」ボタンの dispatch を変更**:
```diff
-  onClick={() => dispatch({ type: 'RESTART_GAME' })}
+  onClick={() => dispatch({ type: 'REMATCH_SETUP' })}
```

---

## Complexity Tracking

> 本機能は Constitution の複雑さ原則に違反しない。Tracking 不要。
