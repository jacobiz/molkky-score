# Tasks: Shuffle Player Order

**Input**: Design documents from `/specs/005-shuffle-order/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: 本フィーチャーは UI コンポーネントへの変更のみ（ゲームロジックへの変更なし）。Constitution 原則 II に従い新規ユニットテストは不要。既存テスト（scoring.test.ts / gameReducer.test.ts）は Polish フェーズで実行しリグレッションを確認する。

**Organization**: US1 のみの単一ストーリー。変更ファイルは3本。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 異なるファイルを対象とし、並列実行可能
- **[Story]**: 対応するユーザーストーリー（US1）

---

## Phase 1: Setup（ベースライン確認）

**Purpose**: 実装開始前のビルド・テスト状態を確認

- [x] T001 Run `npx tsc --noEmit && npm test` to verify clean baseline before any changes

---

## Phase 2: Foundational（i18n キー追加）

**Purpose**: US1 が依存する `setup.shuffle` i18n キーを型定義と実装ファイルに追加する。TypeScript strict mode のため、`Messages` 型の更新は ja.ts と en.ts を同時に行う必要がある。

**⚠️ CRITICAL**: Phase 3（US1）はこのフェーズ完了前に開始できない

- [x] T002 Add `setup.shuffle: 'シャッフル'` to the `setup` section in `src/i18n/ja.ts`
- [x] T003 [P] Add `setup.shuffle: 'Shuffle'` to the `setup` section in `src/i18n/en.ts`

**Checkpoint**: `npx tsc --noEmit` が 0 errors で通ること

---

## Phase 3: User Story 1 - 投球順をシャッフルする (Priority: P1) 🎯 MVP

**Goal**: プレイヤーリストのヘッダ行に「🔀 シャッフル」ボタンを追加し、タップで Fisher-Yates アルゴリズムによるランダム並び替えを実行する

**Independent Test**: プレイヤーを3人以上登録し「シャッフル」を複数回タップして順番が変わることを確認する。2人以上で表示、1人以下で非表示になることを確認する。シャッフル後に手動の上へ／下へボタンが引き続き動作することを確認する。

### Implementation for User Story 1

- [x] T004 [US1] Update `src/components/SetupScreen.tsx`: (1) add `handleShuffle` function using Fisher-Yates — `setPlayers(prev => { const r = [...prev]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; })`; (2) inside the existing `{players.length > 0 && ...}` block, change the `orderHint` `<p>` line to a `<div className="flex items-center justify-between px-1">` containing the `<p>` on the left and `{players.length >= 2 && <button onClick={handleShuffle} className="text-sm px-3 py-1 rounded-lg border border-gray-200 text-gray-600 bg-white active:bg-gray-100">🔀 {t.setup.shuffle}</button>}` on the right — the player list rows remain visible from 1 player (`> 0`), the shuffle button only appears from 2 players (`>= 2`)

**Checkpoint**: 2人以上でシャッフルボタンが表示され、タップで順番が変わり、1人以下では非表示であることを確認

---

## Phase 4: Polish & 検証

**Purpose**: 実装後の型チェックとリグレッション確認

- [x] T005 Run `npx tsc --noEmit` to verify 0 TypeScript errors
- [x] T006 Run `npm test` to verify all existing tests pass (scoring.test.ts / gameReducer.test.ts)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 即座に開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後。**US1 の Phase 3 は Phase 2 完了まで待機**
- **Phase 3 (US1)**: Phase 2 完了後
- **Phase 4 (Polish)**: Phase 3 完了後

### ファイル別タスクシーケンス

| ファイル | タスク順 |
|---|---|
| `src/i18n/ja.ts` | T002 のみ |
| `src/i18n/en.ts` | T003 のみ（T002 と並列） |
| `src/components/SetupScreen.tsx` | T004 のみ |

### Parallel Opportunities

- **Phase 2**: T002 と T003 は並列（異なるファイル）

---

## Parallel Example: Foundational Phase

```
# T002 と T003 は同時実行可能:
Task T002: ja.ts に setup.shuffle キー追加
Task T003: en.ts に setup.shuffle キー追加
```

---

## Implementation Strategy

### MVP First（US1 のみ — これが唯一のストーリー）

1. Phase 1: ベースライン確認
2. Phase 2: i18n キー追加（T002, T003 並列）
3. Phase 3: SetupScreen 実装（T004）
4. Phase 4: 型チェック・リグレッション確認

### Notes

- T004 は1タスクで完結（変更ファイルが1本のみ）
- `players.length > 0` の既存条件はプレイヤーリスト表示のまま維持し、シャッフルボタンのみ `>= 2` 条件で制御する
- シャッフルロジックは SetupScreen 内のインライン関数（ユーティリティ関数分離は YAGNI）
