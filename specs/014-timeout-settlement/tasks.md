# Tasks: 時間切れによる途中決着

**Input**: Design documents from `/specs/014-timeout-settlement/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Constitution により主要機能（ゲームルール）はテスト先行必須。T002 のテストを FAIL 状態で確認後に実装を開始すること。

**Organization**: ユーザーストーリー別にフェーズを分割し、各ストーリーを独立してテスト・デプロイ可能とする。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1/US2/US3）
- 各タスクに具体的なファイルパスを記載

---

## Phase 1: Setup（型定義）

**Purpose**: 後続のすべてのフェーズが依存する型定義を先に確定する

- [x] T001 `src/types/game.ts` に `finishReason: 'normal' | 'timeout'` フィールドを `Game` と `MolkkoutGame` に追加し、`GameAction` に `EARLY_SETTLEMENT` と `EARLY_MOLKKOUT_SETTLEMENT` を追加する

---

## Phase 2: Foundational（TDD・Reducer・インフラ）

**Purpose**: ゲームルールの核心ロジックをテスト駆動で実装する。すべてのユーザーストーリー実装の前提となるブロッキング作業

**⚠️ CRITICAL**: TDD — T002 のテストを作成し FAIL を確認してから T003〜T005 の実装を開始すること（Constitution 必須）

- [x] T002 `tests/unit/earlySettlement.test.ts` を新規作成し、以下の失敗テストケースをすべて記述する：`EARLY_SETTLEMENT` 単独勝者・引き分け（複数 winner）・脱落プレイヤー除外・no-op（全スコア0）、`EARLY_MOLKKOUT_SETTLEMENT` 単独勝者・引き分けケース
- [x] T003 `src/reducers/gameReducer.ts` に `EARLY_SETTLEMENT` ケースを追加する（active プレイヤーから最高スコアを判定し単独なら `winnerId` 設定・引き分けなら `winnerId: null`、全プレイヤーに `status: 'winner'` をセット、`finishReason: 'timeout'`・`status: 'finished'`・`screen: 'result'` に遷移）
- [x] T004 `src/reducers/gameReducer.ts` に `EARLY_MOLKKOUT_SETTLEMENT` ケースを追加する（teams から最高 totalScore を判定し同様のロジックで `status: 'finished'`・`finishReason: 'timeout'` に遷移、overtime は経由しない）
- [x] T005 `src/reducers/gameReducer.ts` の `START_GAME` と `START_MOLKKOUT` ケースの初期 state に `finishReason: 'normal'` を追加する
- [x] T006 `src/utils/storage.ts` の `SCHEMA_VERSION` を 3 から 4 に更新し、`StoredState` インターフェース・`isValidStoredState` の検証ロジックを v4 に対応させる
- [x] T007 [P] `src/i18n/ja.ts` に途中決着関連キーを追加する：`game.earlySettlement`（途中決着）・`game.earlySettlementConfirm`（確認文）、`result.timeoutBadge`（⏱ 時間切れ）・`result.draw`（引き分け）・`result.drawWinners`（同点優勝）
- [x] T008 [P] `src/i18n/en.ts` に T007 と同等の英語キーを追加する（`import type { Messages }` 型整合性を維持）
- [x] T009 [P] `src/i18n/fi.ts` に T007 と同等のフィンランド語キーを追加する（`import type { Messages }` 型整合性を維持）

**Checkpoint**: T002〜T009 完了後 `npm test` 実行 → reducer テストがすべてパスすることを確認

---

## Phase 3: User Story 1 - 時間切れ宣言で途中決着（Priority: P1）🎯 MVP

**Goal**: ゲーム進行中に「途中決着」ボタンを押して確認し、最高スコアのプレイヤーが勝者として結果画面に表示される

**Independent Test**: 通常ゲームでいずれかのプレイヤーが1投以上したあとに途中決着を実行し、最高スコアの1名が勝者として ResultScreen に表示され、共有・再戦ボタンが機能することを確認する

- [x] T010 [US1] `src/components/GameScreen/index.tsx` に「途中決着」ボタンを追加する：表示条件 `game.players.some(p => p.status === 'active' && p.score > 0)`、タップで `ConfirmDialog`（`t.game.earlySettlementConfirm`）を表示し確認後に `dispatch({ type: 'EARLY_SETTLEMENT' })` を実行する（全員スコア0の場合はボタン非表示 — US3 の FR-007 を同時に満たす）
- [x] T011 [US1] `src/components/ResultScreen.tsx` に ⏱ バッジを追加する：`game.finishReason === 'timeout'` の場合にタイトル下部に `t.result.timeoutBadge` を表示する
- [x] T012 [US1] `src/components/MolkkoutScreen/index.tsx` の active/overtime 状態の UI に「途中決着」ボタンを追加する：表示条件 `mg.teams.some(t => t.totalScore > 0)`、ConfirmDialog 経由で `dispatch({ type: 'EARLY_MOLKKOUT_SETTLEMENT' })` を実行し、finished 表示の `status === 'finished'` 分岐で `mg.finishReason === 'timeout'` 時に ⏱ バッジを表示する

**Checkpoint**: MVP 完成 — 通常ゲーム・Mölkkout 両方で途中決着フローを手動確認できる

---

## Phase 4: User Story 2 - 同点時の途中決着（Priority: P2）

**Goal**: 複数プレイヤーが同スコアで首位の場合、全員が「同点優勝」として結果画面に表示される

**Independent Test**: 2名以上が同スコア首位の状態で途中決着を実行し、該当全プレイヤーが同点優勝として表示され「引き分け」ラベルが確認できる

- [x] T013 [US2] `src/components/ResultScreen.tsx` の勝者表示ロジックを複数対応に更新する：`game.players.filter(p => p.status === 'winner')` で全勝者を取得し、1名なら既存の「優勝: {name}」表示、複数名なら `t.result.drawWinners` + 全員の名前を表示する
- [x] T014 [US2] `src/components/MolkkoutScreen/index.tsx` の `status === 'finished'` 表示を引き分け対応に更新する：`mg.winnerId === null` の場合に最高 totalScore のチーム全員を `t.result.drawWinners` として強調表示する

**Checkpoint**: 同点ケースで ResultScreen と MolkkoutScreen の両方で複数勝者が正しく表示されることを確認

---

## Phase 5: User Story 3 - 全員スコア0時のボタン非表示（Priority: P3）

**Goal**: ゲーム開始直後（全員スコア0）は途中決着ボタンが表示されず、1投後から表示される

**Independent Test**: 新規ゲーム開始直後に途中決着ボタンが存在しないことを確認し、スコアを入力後にボタンが現れることを確認する

> **Note**: このユーザーストーリーの実装は T010 の表示条件 `game.players.some(p => p.status === 'active' && p.score > 0)` ですでに完了している。このフェーズは動作確認と境界条件の精査のみ。

- [x] T015 [US3] `src/components/GameScreen/index.tsx` の途中決着ボタン表示条件を動作確認する：ゲーム開始直後（全員スコア0）でボタン非表示、1投後にボタン表示されることをブラウザで手動検証する。条件が意図通りでなければ T010 のロジックを修正する

**Checkpoint**: 全ユーザーストーリーが機能していることを確認

---

## Phase 6: Polish

**Purpose**: 品質ゲート通過・統合確認

- [x] T016 [P] `npm test` を実行して全ユニットテストのパスを確認する（Constitution: 主要機能テスト MUST pass）
- [x] T017 [P] `npm run build` を実行して TypeScript コンパイルエラーがないことを確認する（Constitution: TypeScript エラーなし MUST）
- [ ] T018 iOS / Android 実機またはシミュレーターで途中決着フロー全体（宣言→確認ダイアログ→結果画面→共有・再戦ボタン）を手動確認する。FR-006（共有・再戦が通常終了と同一）の動作も同時に検証する（Constitution: モバイル動作確認 MUST）
- [ ] T019 機内モード（オフライン）で途中決着が正常動作することを確認する（Constitution: オフライン動作確認 MUST）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1（Setup）**: 依存なし — 即座に開始可能
- **Phase 2（Foundational）**: Phase 1 の型定義完了後 — ユーザーストーリー実装をブロック
- **Phase 3（US1）**: Phase 2 完了後 — MVP デリバリー可能
- **Phase 4（US2）**: Phase 3 完了後（ResultScreen の同一箇所を編集するため）
- **Phase 5（US3）**: Phase 3 完了後に確認
- **Phase 6（Polish）**: Phase 3〜5 完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後に独立して実施可能
- **US2 (P2)**: US1 と同一ファイル（ResultScreen）を編集するため US1 完了後に実施
- **US3 (P3)**: T010 の実装によりすでに充足。Phase 3 完了後に確認のみ

### Within Each Phase

- T002（テスト）は T003〜T005（実装）の前に FAIL 確認必須
- T003（EARLY_SETTLEMENT）は T004（EARLY_MOLKKOUT_SETTLEMENT）の前（パターン参照のため）
- T005（START_GAME 初期値）は T003・T004 と独立して実施可能
- T006〜T009 は T003〜T005 の実装と並列実施可能

### Parallel Opportunities

- T007・T008・T009（i18n 3ファイル）は完全並列
- T016・T017（テスト・ビルド）は独立して並列実行可能
- Phase 2 内で T006（storage）と T007-T009（i18n）は reducer 実装と並列可能

---

## Parallel Example: Phase 2

```bash
# i18n 3ファイルは同時に作業可能:
Task T007: src/i18n/ja.ts に途中決着キー追加
Task T008: src/i18n/en.ts に途中決着キー追加
Task T009: src/i18n/fi.ts に途中決着キー追加

# storage 更新も reducer と並列可能:
Task T006: src/utils/storage.ts を v4 に更新
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. Phase 1 完了: 型定義
2. Phase 2 完了: TDD + Reducer + インフラ（**CRITICAL: テスト FAIL → 実装 → テスト PASS の順**）
3. Phase 3 完了: US1 UI 実装
4. **STOP & VALIDATE**: 通常ゲームと Mölkkout で途中決着フローを手動確認
5. `npm test` + `npm run build` で品質確認

### Incremental Delivery

1. Phase 1 + 2 → Reducer 動作確認
2. Phase 3（US1） → 単独勝者フローが動作 → MVP リリース可能
3. Phase 4（US2） → 引き分けフロー追加
4. Phase 5（US3） → エッジケース確認
5. Phase 6 → 品質ゲート完了

---

## Notes

- [P] タスクは異なるファイル・依存なし = 並列実行可能
- [Story] ラベルはユーザーストーリーとのトレーサビリティ
- T002 は FAIL 状態を確認してから T003 に進むこと（Constitution 必須）
- 各フェーズの Checkpoint で動作確認してから次フェーズへ進む
- 途中決着ボタンは `ConfirmDialog`（既存コンポーネント）を再利用 — 新規 UI コンポーネント不要
