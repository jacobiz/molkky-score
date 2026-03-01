# Tasks: Game UI Polish

**Input**: Design documents from `/specs/004-game-ui-polish/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: 本フィーチャーはすべて UI 表示変更のみ（ゲームロジックへの変更なし）。Constitution 原則 II に従い新規ユニットテストは不要。既存テスト（scoring.test.ts / gameReducer.test.ts）は Polish フェーズで実行しリグレッションを確認する。

**Organization**: US1〜US5 の各ユーザーストーリーごとにフェーズを分割。各フェーズは独立して動作確認可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 異なるファイルを対象とし、並列実行可能
- **[Story]**: 対応するユーザーストーリー（US1〜US5）

---

## Phase 1: Setup（ベースライン確認）

**Purpose**: 実装開始前のビルド・テスト状態を確認

- [x] T001 Run `npx tsc --noEmit && npm test` to verify clean baseline before any changes

---

## Phase 2: Foundational（i18n キー追加）

**Purpose**: US1 が依存する `game.throwCount` i18n キーを型定義と実装ファイルに追加する。TypeScript strict mode のため、`Messages` 型の更新は ja.ts と en.ts を同時に行う必要がある。

**⚠️ CRITICAL**: Phase 3（US1）はこのフェーズ完了前に開始できない

- [x] T002 Add `game.throwCount: (n: number) => string` returning `"${n}投目"` to `src/i18n/ja.ts`
- [x] T003 [P] Add `game.throwCount: (n: number) => string` returning `"${ordinal(n)} throw"` (reusing existing `ordinal` function) to `src/i18n/en.ts`
- [x] T004 [P] Update `specs/001-molkky-score/contracts/i18n-keys.md`: (1) add `throwCount: (n: number) => string` entry with comment `// "N投目"（ja）/ "Nth throw"（en）` under the `game` section; (2) update `bustMessage` comment to `// "💥 バースト！25点にリセット"`; (3) update `eliminatedMessage` comment to `// "❌ {name} が脱落しました"`

**Checkpoint**: `npx tsc --noEmit` が 0 errors で通ること

---

## Phase 3: User Story 1 - ターン数ヘッダ表示 (Priority: P1) 🎯 MVP

**Goal**: ゲーム中画面のヘッダを2段にし、上段にプレイヤー名、下段に各プレイヤーの個別投数を表示する

**Independent Test**: 2人でゲームを開始し、プレイヤーAが2投・プレイヤーBが1投進める。Aのターン時は「2投目」、Bのターン時は「1投目」が表示されること。やり直し後に1つ戻ること。

### Implementation for User Story 1

- [x] T005 [US1] Update `src/components/GameScreen/index.tsx`: compute `throwCount` as `game.turnHistory.filter(t => t.playerId === currentPlayer.id).length + 1`, then change the header `<p>` from single-line `{t.game.currentTurn.replace('{name}', ...)}` to a 2-row layout — top row `{t.game.currentTurn.replace('{name}', ...)}` (existing text), bottom row `{t.game.throwCount(throwCount)}` in a smaller muted style (e.g. `text-sm text-gray-500`)

**Checkpoint**: ゲームを進めてヘッダ下段に「N投目」が表示され、プレイヤー交代後に各自のカウントが維持されることを確認

---

## Phase 4: User Story 2 - 残りスコア警告表示 (Priority: P2)

**Goal**: active なプレイヤーの残りスコアが 12 点以下になったとき、残り表示を強調スタイルに切り替える

**Independent Test**: スコアが 38 点のプレイヤーの残り表示が強調（例: オレンジ/赤色）されること。37 点では通常表示。バースト後（25 点リセット）は通常表示に戻ること。脱落プレイヤーは強調しないこと。

### Implementation for User Story 2

- [x] T006 [US2] Update `src/components/GameScreen/ScoreBoard.tsx`: compute `const remaining = 50 - player.score` and `const isCloseToWin = remaining <= 12 && !isEliminated && !isWinner`; change the remaining display `<p className="text-xs text-gray-400">` to apply a warning style when `isCloseToWin` is true (e.g. `text-orange-600 font-bold` instead of `text-gray-400`), keeping the label and value together

**Checkpoint**: スコア 38 点（残り 12）で強調、37 点（残り 13）で通常表示になることを確認

---

## Phase 5: User Story 3 - スコアボード文字サイズ改善 (Priority: P3)

**Goal**: スコアボードの数値・ラベルを1段階大きくして視認性を向上させる

**Independent Test**: スコアボードの各数値が以前より大きく表示されること。6人フルゲームでもレイアウトが崩れないこと（max-h-80 スクロール動作は維持）。

### Implementation for User Story 3

- [x] T007 [US3] Update `src/components/GameScreen/ScoreBoard.tsx`: increase font sizes by one step — player name `text-base` → `text-lg`, score value `text-xl` → `text-2xl`, remaining text `text-xs` → `text-sm`, miss badge `text-xs` → `text-sm`, eliminated badge `text-xs` → `text-sm`

**Checkpoint**: スコアボードの文字が大きくなり、既存の `max-h-80 overflow-y-auto` レイアウトが維持されることを確認

---

## Phase 6: User Story 4 - アクションボタンへのアイコン追加 (Priority: P4)

**Goal**: 各画面の主要ボタンに絵文字アイコンを追加し、テキスト補助なしに操作を直感的に認識できるようにする

**Independent Test**: 各画面を開いて全ボタンに絵文字が付いていること。ボタン機能（undo・新規ゲーム・開始・シェア）が引き続き正常動作すること。

### Implementation for User Story 4

- [x] T008 [US4] Update `src/components/GameScreen/index.tsx`: add `↩️ ` prefix to undo button label (change `{t.game.undo}` to `↩️ {t.game.undo}` or `{'↩️ ' + t.game.undo}`)
- [x] T009 [P] [US4] Update `src/components/HomeScreen.tsx`: add `▶️ ` prefix to New Game button label and `▶️ ` prefix to Resume Game button label
- [x] T010 [P] [US4] Update `src/components/SetupScreen.tsx`: add `▶️ ` prefix to Start Game button label (`{t.setup.startGame}`)
- [x] T011 [P] [US4] Update `src/components/ResultScreen.tsx`: add `📤 ` prefix to Share button label and `🔄 ` prefix to Play Again button label (🏆 on winner row is already implemented — no change needed)

**Checkpoint**: 各ボタンに絵文字が表示され、機能に問題がないことを確認

---

## Phase 7: User Story 5 - ゲーム内状態アイコン (Priority: P5)

**Goal**: スコアボードの脱落バッジとバースト/脱落トーストに絵文字を追加し、状態を直感的に示す

**Independent Test**: 脱落したプレイヤーのバッジに `❌` が表示されること。バースト発生時のトーストに `💥` が含まれること。脱落発生時のトーストに `❌` が含まれること。

### Implementation for User Story 5

- [x] T012 [P] [US5] Update `src/components/GameScreen/ScoreBoard.tsx`: change eliminated badge to show `❌ {t.game.eliminated}` (add `❌ ` prefix before the translated text in the badge span)
- [x] T013 [P] [US5] Update `src/i18n/ja.ts`: change `bustMessage` to `'💥 バースト！25点にリセット'` and `eliminatedMessage` to `'❌ {name} が脱落しました'`
- [x] T014 [P] [US5] Update `src/i18n/en.ts`: change `bustMessage` to `'💥 Bust! Reset to 25'` and `eliminatedMessage` to `'❌ {name} is eliminated'`

**Checkpoint**: 脱落バッジに ❌、バーストトーストに 💥、脱落トーストに ❌ が表示されることを確認

---

## Phase 8: Polish & 検証

**Purpose**: 全ストーリー実装後の型チェックとリグレッション確認

- [x] T015 Run `npx tsc --noEmit` to verify 0 TypeScript errors
- [x] T016 Run `npm test` to verify all existing tests pass (scoring.test.ts / gameReducer.test.ts)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 即座に開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後。**US1 の Phase 3 は Phase 2 完了まで待機**
- **Phase 3 (US1)**: Phase 2 完了後（`throwCount` i18n key が必要）
- **Phase 4〜7 (US2〜US5)**: Phase 2 完了後（各ストーリーは独立して実施可能）
- **Phase 8 (Polish)**: 全実装フェーズ完了後

### ファイル別タスクシーケンス

| ファイル | タスク順 |
|---|---|
| `src/i18n/ja.ts` | T002 → T013 |
| `src/i18n/en.ts` | T003 → T014 |
| `src/components/GameScreen/index.tsx` | T005 → T008 |
| `src/components/GameScreen/ScoreBoard.tsx` | T006 → T007 → T012 |
| `src/components/HomeScreen.tsx` | T009 のみ |
| `src/components/SetupScreen.tsx` | T010 のみ |
| `src/components/ResultScreen.tsx` | T011 のみ |

### Parallel Opportunities

- **Phase 2**: T003 と T004 は T002 と並列（異なるファイル）
- **Phase 6**: T009, T010, T011 は相互に並列（すべて異なるファイル）
- **Phase 7**: T012, T013, T014 はすべて並列（すべて異なるファイル）

---

## Parallel Example: US4

```
# US4の3ファイルは同時実行可能:
Task T009: HomeScreen.tsx のボタンアイコン
Task T010: SetupScreen.tsx のボタンアイコン
Task T011: ResultScreen.tsx のボタンアイコン
```

## Parallel Example: US5

```
# US5の3タスクは同時実行可能:
Task T012: ScoreBoard.tsx の脱落バッジ
Task T013: ja.ts のトーストメッセージ更新
Task T014: en.ts のトーストメッセージ更新
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. Phase 1: ベースライン確認
2. Phase 2: i18n キー追加
3. Phase 3: US1（投数ヘッダ）
4. **STOP & VALIDATE**: 投数表示が正しく動作することを確認
5. 必要であればここでデモ

### Incremental Delivery

1. Phase 1 + 2 → 基盤完成
2. Phase 3 (US1) → 投数ヘッダ ✓
3. Phase 4 (US2) → 残りスコア強調 ✓
4. Phase 5 (US3) → 文字サイズ改善 ✓
5. Phase 6 (US4) → ボタンアイコン ✓
6. Phase 7 (US5) → 状態アイコン ✓
7. Phase 8 → 最終検証

---

## Notes

- FR-011（結果画面の 🏆 優勝アイコン）は**実装済み**（`ResultScreen.tsx` に既に `🏆` がある）→ タスクなし
- 絵文字はすべて Unicode 文字として JSX 内に直接記述する（外部ライブラリ不要）
- `src/types/game.ts` と `src/reducers/gameReducer.ts` への変更は不要
- 投数は `turnHistory` からの導出のみ（新しい state フィールドなし）
