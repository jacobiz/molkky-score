# Research: 次のゲーム設定画面（リマッチ）

**Feature**: 009-rematch-setup
**Date**: 2026-03-01

## Decision 1: 前回プレイヤー受け渡し方式

**Decision**: `GameState` に `rematchPlayers: string[] | null` を追加する（transient state）

**Rationale**:
- `SetupScreen` は既存のまま使用可能。`rematchPlayers` が `null` なら空リスト、セットされていれば初期値として使用するだけ
- `REMATCH_SETUP` アクション一発で「前回プレイヤー名抽出 + setup 画面へ遷移」が完結。reducer の責務が明確
- `rematchPlayers` は `storage.ts` の `StoredState` に含まれていないため自動的に非永続化。ブラウザリロードで消える挙動がエッジケース要件に一致

**Alternatives Considered**:
- A. `RESTART_GAME` の動作変更（直接 setup 画面へ遷移）: 既存テスト (`RESTART_GAME` の27テスト) を壊すリスクがあり不採用
- B. 新画面 `rematch-setup` + `RematchSetupScreen` コンポーネント: `SetupScreen` のコードを複製するため Constitution I（シンプルさ優先）に違反
- C. URL パラメータ / LocalStorage での引き渡し: オーバーエンジニアリング、このアプリのアーキテクチャに不適

---

## Decision 2: `RESTART_GAME` アクションの扱い

**Decision**: `RESTART_GAME` は types・reducer ともに残す（削除しない）

**Rationale**:
- `tests/unit/gameReducer.test.ts:208` で `RESTART_GAME` がテストされており、削除するとテストが壊れる
- ResultScreen の「もう一度」ボタンからは `RESTART_GAME` の代わりに `REMATCH_SETUP` を dispatch するだけでよく、`RESTART_GAME` 自体を削除する必要はない
- 将来のデバッグや拡張に備えてアクションを残しておくことに害はない

---

## Decision 3: `rematchPlayers` の永続化

**Decision**: 永続化しない（`storage.ts` の `StoredState` に含めない）

**Rationale**:
- `saveState` / `loadState` は `game`, `molkkoutGame`, `settings` のみを保存・復元
- `rematchPlayers` は「結果画面 → セットアップ画面」間の一時的なブリッジとして機能する transient state
- エッジケース仕様「リマッチ設定中にブラウザをリロードした場合、通常のセットアップ画面として機能する」が自動的に満たされる
- ストレージスキーマのバージョン（`SCHEMA_VERSION = 2`）変更不要

---

## Decision 4: `START_GAME` での `rematchPlayers` クリア

**Decision**: `START_GAME` reducer で `rematchPlayers: null` にリセットする

**Rationale**:
- ゲームが開始したら `rematchPlayers` はもう不要
- SetupScreen でゲームを開始した後に「戻る」ケースはないが、状態をクリーンに保つ慣習として適切
- `initialState` にも `rematchPlayers: null` を追加し、型の完全性を保証

---

## Summary: 変更ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `src/types/game.ts` | `GameState` に `rematchPlayers: string[] \| null` 追加；`GameAction` に `REMATCH_SETUP` 追加 |
| `src/reducers/gameReducer.ts` | `initialState` に `rematchPlayers: null` 追加；`REMATCH_SETUP` ケース追加；`START_GAME` で `rematchPlayers: null` クリア |
| `src/components/SetupScreen.tsx` | `useState<string[]>([])` → `useState<string[]>(state.rematchPlayers ?? [])` |
| `src/components/ResultScreen.tsx` | 「もう一度」ボタンの dispatch を `RESTART_GAME` → `REMATCH_SETUP` に変更 |
