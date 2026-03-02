# Tasks: コードレビュー残課題の対処

**Input**: Design documents from `/specs/012-fix-review-issues/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: US5 (storage validation) と US6 (Mölkkout/share) は Constitution II に基づき TDD 適用 — テストを先に書き、失敗を確認してから実装する。

**Organization**: フェーズ順に 6 ユーザーストーリー + 基盤フェーズ + ポリッシュ。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（異なるファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US6）
- 各タスクには正確なファイルパスを記載

---

## Phase 1: Foundational — i18n キー追加

**Purpose**: 全ユーザーストーリーの前提。TypeScript が `Messages` 型を通じてキー漏れをコンパイルエラーとして検出するため、他のすべての変更より先に完了する必要がある。

**⚠️ CRITICAL**: このフェーズが完了するまで US1〜US4 の作業を開始しない

- [ ] T001 `src/i18n/ja.ts` に `setup.moveUp` / `setup.moveDown` / `setup.removePlayer` / `molkkout.errorRequiredFields` / `licenses.*`（5キー）を追加
- [ ] T002 [P] `src/i18n/en.ts` に同キーを英語訳で追加（Messages 型コンパイルエラーが消えるまで）
- [ ] T003 [P] `src/i18n/fi.ts` に同キーをフィンランド語訳で追加（data-model.md の翻訳値テーブル参照）

**Checkpoint**: `npm run build` でコンパイルエラーなし → US1〜US6 の実装を開始できる

---

## Phase 2: User Story 1 — 全言語でUIテキストが正しく表示される (Priority: P1) 🎯 MVP

**Goal**: Finnish / English ユーザーがライセンス画面・プレイヤー設定画面・Mölkkout設定画面を開いたとき、すべてのテキストが設定言語で表示される。

**Independent Test**: 言語を Finnish に設定 → ライセンス画面・SetupScreen・MolkkoutSetupScreen を開いてフィンランド語テキストを確認。

- [ ] T004 [US1] `src/components/LicensesScreen.tsx` を `useTranslation()` 移行: `useGame()` + `isJa` フラグ削除、タイトル / 戻るボタン aria-label / 全文表示ボタン / プライバシーポリシー見出し・本文をすべて `t.licenses.*` に置き換える
- [ ] T005 [P] [US1] `src/components/MolkkoutSetupScreen.tsx` 60行目のハードコード日本語エラー文字列を `t.molkkout.errorRequiredFields` に変更
- [ ] T006 [P] [US1] `src/components/SetupScreen.tsx` の 147 / 155 / 163 行目の aria-label を `t.setup.moveUp` / `t.setup.moveDown` / `t.setup.removePlayer` に変更

**Checkpoint**: Finnish 設定でライセンス画面・SetupScreen・MolkkoutSetupScreen の全テキストがフィンランド語表示 → US1 完了

---

## Phase 3: User Story 2 — スクリーンリーダーユーザーがダイアログを正しく操作できる (Priority: P2)

**Goal**: 確認ダイアログが WCAG 2.1 準拠となり、スクリーンリーダーに dialog ロールとして認識され、フォーカストラップが機能する。

**Independent Test**: ゲーム画面で「ホームへ戻る」をクリック → Tab キーがダイアログ外に出ない / Escape でキャンセル / 背景クリックでキャンセル。

- [ ] T007 [US2] `src/components/ui/ConfirmDialog.tsx` を更新:
  - 外側オーバーレイ div に `onClick={onCancel}` 追加
  - 内側コンテナ div に `role="dialog"` / `aria-modal="true"` / `aria-labelledby="confirm-dialog-msg"` / `onClick={e => e.stopPropagation()}` 追加
  - メッセージ `<p>` に `id="confirm-dialog-msg"` 追加
  - `useRef<HTMLButtonElement>` でキャンセルボタンを参照（`cancelRef`）、`useRef<HTMLDivElement>` でダイアログコンテナを参照（`dialogRef`）
  - `useEffect` でキャンセルボタンへ自動フォーカス + Tab フォーカストラップ + Escape キーキャンセルを実装（research.md のコードパターン参照）

**Checkpoint**: キーボード操作のみで確認ダイアログを操作できる → US2 完了

---

## Phase 4: User Story 3 — SetupScreen の入力制限が一貫している (Priority: P2)

**Goal**: プレイヤー名入力フィールドの maxLength をバリデーション上限と一致させ、13文字目が入力できないようにする。

**Independent Test**: SetupScreen で13文字入力しようとすると12文字目で止まる。

- [ ] T008 [US3] `src/components/SetupScreen.tsx` 104行目の `maxLength={13}` を `maxLength={12}` に変更（1行修正）

**Checkpoint**: 13文字目の入力が物理的にブロックされる → US3 完了

---

## Phase 5: User Story 4 — コードの重複が排除されメンテナンス性が向上する (Priority: P3)

**Goal**: PinInput / MolkkoutInput の共通化、i18n.ts の lookup object 化、handleMove の統合により重複コードをゼロにする。

**Independent Test**: ゲーム画面と Mölkkout 画面が両方正常に動作し、`npm run build` が成功する。

- [ ] T009 [US4] `src/utils/i18n.ts` の三項演算子を `Record<Language, Messages>` ルックアップオブジェクトに変更（research.md パターン参照、`import type { Messages }` 追加）
- [ ] T010 [US4] `src/components/ui/NumberInput.tsx` を新規作成: `variant: 'game' | 'molkkout'` prop で PinInput / MolkkoutInput のスタイル差分を制御（data-model.md の差分テーブル参照）
- [ ] T011 [P] [US4] `src/components/GameScreen/PinInput.tsx` を `NumberInput variant="game"` の薄いラッパーに変更（T010 完了後）
- [ ] T012 [P] [US4] `src/components/MolkkoutScreen/MolkkoutInput.tsx` を `NumberInput variant="molkkout"` の薄いラッパーに変更（T010 完了後）
- [ ] T013 [US4] `src/components/SetupScreen.tsx` の `handleMoveUp` / `handleMoveDown` を `handleMove(index: number, direction: -1 | 1)` に統合（T008 完了後、同ファイル）

**Checkpoint**: `npm run build` エラーなし、ゲーム画面・Mölkkout 画面の入力が正常動作 → US4 完了

---

## Phase 6: User Story 5 — localStorage データ破損時もアプリがクラッシュしない (Priority: P3)

**Goal**: `loadState` が破損データを安全に処理し、クラッシュせずホーム画面に戻る。

**Independent Test**: DevTools で `molkky-score-v2` を `{"version":2,"game":"CORRUPT","settings":"BAD"}` に変更してリロード → ホーム画面が表示される。

> **NOTE: T014 のテストを先に書き、失敗（赤）を確認してから T015 を実装する（Constitution II / TDD）**

- [ ] T014 [US5] `tests/unit/storage.test.ts` を新規作成してテストを記述（赤フェーズ）:
  - バージョン不一致データ → `null` 返却 + localStorage から削除
  - `settings` が文字列のデータ → `null` 返却 + localStorage から削除
  - 不正 JSON → `null` 返却 + localStorage から削除
  - 正常データ → 正しく復元できる
- [ ] T015 [US5] `src/utils/storage.ts` に `isValidStoredState` type guard を追加し `loadState` で `as StoredState` キャストを置き換える（research.md パターン参照、T014 テストが緑になるまで）

**Checkpoint**: `npm test` で storage テスト通過、破損データでのクラッシュなし → US5 完了

---

## Phase 7: User Story 6 — Mölkkout・storage・share のロジックがテストで保護される (Priority: P3)

**Goal**: 主要ゲームロジックのテストカバレッジを拡充し、回帰バグを自動検出できる状態にする。

**Independent Test**: `npm test` の総件数が 40 件以上になる。

> **NOTE: 先にテストファイルを作成して失敗（赤）を確認してから実装を完了する（Constitution II / TDD）**

- [ ] T016 [P] [US6] `tests/unit/molkkoutReducer.test.ts` を新規作成:
  - チームローテーション（チーム0→1→0 のインデックス移動）
  - overtime 遷移（全チーム同点 → `status: 'overtime'`）
  - 連続 overtime（overtime → overtime → 勝者決定）
  - 単独最高スコアチームが `winnerId` にセットされる
- [ ] T017 [P] [US6] `tests/unit/share.test.ts` を新規作成:
  - 全員 active 時のランキング順（スコア降順）
  - 脱落プレイヤーが末尾に移動する
  - winner に `🏆` が含まれる
  - `totalTurns` テンプレートの `{n}` 置換が正しい

**Checkpoint**: `npm test` 全件通過、件数が 40 件以上 → US6 完了

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 最終確認とビルド検証

- [ ] T018 [P] `npm run build` を実行して TypeScript strict mode でコンパイルエラーがないことを確認
- [ ] T019 `npm test` を実行して全テスト通過（27件→40件以上）を確認

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: 依存なし — すぐに開始可能
- **US1〜US4 (Phase 2〜5)**: Phase 1（i18n キー追加）完了後に開始可能
- **US5 (Phase 6)**: 他のフェーズに依存しない（独立）
- **US6 (Phase 7)**: 他のフェーズに依存しない（独立）
- **Polish (Phase 8)**: 全フェーズ完了後

### User Story Dependencies

- **US1 (P1)**: Phase 1 完了後 → T004 / T005 / T006 は並行実行可
- **US2 (P2)**: Phase 1 完了後（独立して開始可能）
- **US3 (P2)**: Phase 1 完了後（独立）
- **US4 (P3)**: Phase 1 完了後。T010→T011/T012 は順次。T013 は T008 の後（同ファイル）
- **US5 (P3)**: 依存フェーズなし — TDD 順序: T014→T015
- **US6 (P3)**: 依存フェーズなし — T016 / T017 は並行実行可

### Parallel Opportunities

- **Phase 1**: T002 と T003 は T001 完了後に並行実行可（異なるファイル）
- **Phase 2**: T005 と T006 は T004 と並行実行可（異なるファイル）
- **Phase 5**: T011 と T012 は T010 完了後に並行実行可（異なるファイル）
- **Phase 7**: T016 と T017 は並行実行可（異なるファイル）
- **Phase 8**: T018 は他と並行実行可

---

## Parallel Example: Phase 1（i18n キー追加）

```bash
# T001 完了後、T002 と T003 を並行実行:
Task: "en.ts に licenses.* / setup.* / molkkout.* を追加"
Task: "fi.ts に licenses.* / setup.* / molkkout.* を追加"
```

## Parallel Example: US6（テスト追加）

```bash
# T016 と T017 を並行実行:
Task: "molkkoutReducer.test.ts を作成"
Task: "share.test.ts を作成"
```

---

## Implementation Strategy

### MVP First (US1 のみ)

1. Phase 1 完了（i18n キー追加）
2. Phase 2 完了（US1 — 言語テキスト修正）
3. **STOP & VALIDATE**: Finnish 設定で全画面テキスト確認
4. 他ストーリーへ進む

### Incremental Delivery

1. Phase 1 → Phase 2 (US1): 言語テキスト修正 MVP
2. Phase 3 (US2) + Phase 4 (US3): アクセシビリティ + 入力制限
3. Phase 5 (US4): コード品質改善
4. Phase 6 (US5) + Phase 7 (US6): 堅牢性 + テストカバレッジ
5. Phase 8: 最終確認

### Quick Win Order（1人開発の推奨順）

T001 → T002/T003 → T004/T005/T006 → T007 → T008 → T009 → T010 → T011/T012 → T013 → T014 → T015 → T016/T017 → T018/T019

---

## Notes

- `[P]` = 異なるファイル、依存関係なし
- `[Story]` = トレーサビリティのためのユーザーストーリーマッピング
- US5 / US6 は Constitution II に基づきテスト（赤）→ 実装（緑）の順
- SetupScreen.tsx を変更するタスクが複数あるため順序を守る: T006 → T008 → T013
- 各フェーズ完了後に `npm run build` でコンパイル確認を推奨
