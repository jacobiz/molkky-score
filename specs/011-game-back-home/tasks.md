# Tasks: Back to Home Navigation

**Input**: Design documents from `/specs/011-game-back-home/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: UIコンポーネントのテストは Constitution II に従い任意。新規ゲームロジックがないため TDD 対象外。

**Organization**: タスクはユーザーストーリー単位でグループ化。各ストーリーは独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3）
- 各タスクには正確なファイルパスを含む

---

## Phase 1: Setup（スキップ）

既存プロジェクトのため新規セットアップ不要。Phase 2（Foundation）から開始。

---

## Phase 2: Foundation（ブロッキング前提条件）

**Purpose**: 全ユーザーストーリーが依存する共通コンポーネントと i18n キーを用意する

**⚠️ CRITICAL**: この Phase が完了するまで、いかなるユーザーストーリーの実装も開始できない

- [x] T001 `src/i18n/ja.ts` に `common.backToHome`・`common.backToHomeConfirm`・`game.title` を追加（型定義ソース）
- [x] T002 [P] `src/i18n/en.ts` に同キーの英語訳を追加（T001 完了後に開始可）
- [x] T003 [P] `src/i18n/fi.ts` に同キーのフィンランド語訳を追加（T001 完了後に開始可）
- [x] T004 `src/components/ui/ScreenHeader.tsx` を新規作成：`title`, `requireConfirm?`, `onGoHome`, `rightContent?` の Props を持つ共通ヘッダコンポーネント。`requireConfirm=true` の場合は ConfirmDialog を内部で管理（T001・T002・T003 完了後）

**Checkpoint**: `ScreenHeader` コンポーネントが単体で動作することをブラウザで確認できること（npm run dev で確認）

---

## Phase 3: User Story 1 — ゲーム画面からホームへ戻る（Priority: P1）🎯 MVP

**Goal**: ゲームプレイ中にホームへ戻るボタンをタップ → 確認ダイアログ → 確認後ホーム画面へ遷移

**Independent Test**: ゲーム画面でホームボタンをタップ → ダイアログ表示 → 確認 → ホーム遷移。キャンセル後もゲーム状態が維持されていることを確認

### Implementation for User Story 1

- [x] T005 [US1] `src/components/GameScreen/index.tsx` の最上部に ScreenHeader を追加：`title={t.game.title}`, `requireConfirm={true}`, `onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}`（T004 完了後）

**Checkpoint**: ゲーム画面でホームボタン → ダイアログ → 確認 → ホーム画面遷移が動作すること。キャンセル時はゲーム継続・スコア変化なし

---

## Phase 4: User Story 2 — セットアップ画面からホームへ戻る（Priority: P2）

**Goal**: プレイヤー設定画面でホームへ戻るボタンをタップ → 確認ダイアログ → 確認後ホーム遷移（入力情報は破棄）

**Independent Test**: セットアップ画面でプレイヤー名を入力してからホームボタンをタップ → ダイアログ → 確認 → ホーム画面へ遷移し、入力情報が保持されないことを確認

### Implementation for User Story 2

- [x] T006 [US2] `src/components/SetupScreen.tsx` の既存ヘッダ（`bg-white border-b` の div）を ScreenHeader に置換：`title={t.setup.title}`, `requireConfirm={true}`, `onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}`, `rightContent={<LanguageSelector ... />}`（T004 完了後）

**Checkpoint**: セットアップ画面のヘッダが ScreenHeader に統一され、LanguageSelector が rightContent に移動していること。ホームボタン確認ダイアログが動作すること

---

## Phase 5: User Story 3 — 結果・Mölkkout 画面からホームへ戻る（Priority: P3）

**Goal**: 結果画面・MolkkoutSetup・Mölkkout ゲーム画面にホームへ戻るボタンを追加（確認ダイアログは Mölkkout ゲームアクティブ中のみ）

**Independent Test**: 結果画面でホームボタンタップ → ダイアログなしで即座にホーム遷移。Mölkkout ゲーム中はダイアログ表示

### Implementation for User Story 3

- [x] T007 [P] [US3] `src/components/ResultScreen.tsx` の最上部に ScreenHeader を追加：`title={t.result.title}`, `requireConfirm={false}`, `onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}`（T004 完了後）
- [x] T008 [P] [US3] `src/components/MolkkoutSetupScreen.tsx` の既存ヘッダを ScreenHeader に置換：`title={t.molkkout.title}`, `requireConfirm={false}`, `onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}`（T004 完了後）
- [x] T009 [P] [US3] `src/components/MolkkoutScreen/index.tsx` に ScreenHeader を追加：`title={t.molkkout.title}`, `requireConfirm={molkkoutGame.status === 'active' || molkkoutGame.status === 'overtime'}`, `onGoHome={...}`。既存の finished state にある "Back to Home" ボタンを削除（T004 完了後）

**Checkpoint**: 5画面すべてにヘッダが表示され、各画面で正しい動作（confirm あり/なし）が確認できること

---

## Phase 6: Polish & 最終検証

**Purpose**: 全ユーザーストーリー横断の品質チェック

- [x] T010 `npm test` を実行し既存テストがすべてパスすることを確認
- [x] T011 `npm run build` を実行し TypeScript コンパイルエラーがないことを確認
- [ ] T012 [P] 3言語（ja/en/fi）でアプリを操作し、ヘッダのボタンラベル・ダイアログメッセージが各言語で正しく表示されることを目視確認
- [ ] T013 ゲーム進行中にホームへ戻り（ゲーム画面→確認→ホーム）、ホーム画面の「ゲームを再開」をタップして中断時点のスコア・ターン数・プレイヤー順序が完全に復元されていることを確認（SC-004）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundation (Phase 2)**: 開始可能 — 依存なし
  - T001 → T002, T003 は並列可（ja.ts の型変更後）
  - T004 は T001 完了後に開始
- **US1 (Phase 3)**: T004 完了後に開始
- **US2 (Phase 4)**: T004 完了後に開始（US1 とは独立）
- **US3 (Phase 5)**: T004 完了後に開始（US1, US2 とは独立）
- **Polish (Phase 6)**: US1 〜 US3 の完了後

### User Story Dependencies

- **US1 (P1)**: Foundation 完了後に開始可 — 他ストーリー依存なし
- **US2 (P2)**: Foundation 完了後に開始可 — 他ストーリー依存なし
- **US3 (P3)**: Foundation 完了後に開始可 — 他ストーリー依存なし
  - T007, T008 は並列実行可能
  - T009 は T007/T008 と並列可能（別ファイル）

### Parallel Opportunities

```
T001（ja.ts）
  ├── T002（en.ts）[P]
  └── T003（fi.ts）[P]
  └── T004（ScreenHeader）
        ├── T005（GameScreen）  [US1]
        ├── T006（SetupScreen） [US2]
        ├── T007（ResultScreen）[US3, P]
        ├── T008（MolkkoutSetup）[US3, P]
        └── T009（MolkkoutGame）[US3]
```

---

## Parallel Example: Foundation Phase

```bash
# T001 完了後、以下を並列実行:
Task: "en.ts に i18n キーを追加" (T002)
Task: "fi.ts に i18n キーを追加" (T003)

# T004 完了後、以下を並列実行:
Task: "GameScreen に ScreenHeader 追加" (T005)
Task: "SetupScreen のヘッダを ScreenHeader に置換" (T006)
Task: "ResultScreen に ScreenHeader 追加" (T007)
Task: "MolkkoutSetupScreen のヘッダを ScreenHeader に置換" (T008)
Task: "MolkkoutScreen に ScreenHeader 追加・既存ボタン削除" (T009)
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 2 完了: Foundation（T001 → T002/T003 並列 → T004）
2. Phase 3 完了: US1（T005）
3. **STOP & VALIDATE**: ゲーム画面でホームボタンの動作を確認
4. 問題なければ US2, US3 へ続行

### Incremental Delivery

1. Foundation → ScreenHeader 完成
2. US1（GameScreen）→ 動作確認 → MVP デプロイ可
3. US2（SetupScreen）→ 動作確認
4. US3（Result/Molkkout）→ 動作確認 → 全5画面統一
5. Polish（テスト・ビルド確認）

---

## Notes

- [P] タスクは別ファイルへの変更のため並列実行可能
- ScreenHeader の実装（T004）は他すべてのタスクのブロッカー
- T005〜T009 は T004 完了後に任意の順序・並列で実行可能
- 各チェックポイントでブラウザ動作確認推奨（npm run dev）
- TypeScript strict mode のため、i18n 型変更（T001）後は T002/T003 で型エラーが出ることを確認してから修正する
