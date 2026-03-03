# Tasks: 初期ピン配置ガイド

**Input**: Design documents from `/specs/015-pin-setup-guide/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅

**Tests**: Constitution II より「補助的な UI 要素のテストは不要」。本機能は表示専用モーダルのため、テストタスクは生成しない。

**Organization**: タスクはユーザーストーリー単位でグループ化。US1・US2 独立して実装・検証可能。US3（ゲーム中の再確認）は US1・US2 の実装により自動的に実現される。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、完了待ち依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2）

---

## Phase 1: Setup（i18n 型定義）

**Purpose**: `ja.ts` の `Messages` 型に `pinGuide` namespace を追加する。TypeScript の型定義ソースであり、後続の全タスクがこれに依存する。

- [x] T001 `src/i18n/ja.ts` の `ja` オブジェクトに `pinGuide` namespace を追加し `Messages` 型を更新する（追加キー: `title`, `closeButton`, `buttonAriaLabel`, `regular.heading`, `regular.layoutCaption`, `regular.distanceLabel`, `molkkout.heading`, `molkkout.layoutCaption`, `molkkout.distanceLabel`, `molkkout.spacingLabel`, `molkkout.resetNote`）

**Checkpoint**: `npm run build` で TypeScript が `Messages` 型の欠落を検出するようになる（en.ts・fi.ts が未実装のためコンパイルエラー発生が期待値）

---

## Phase 2: Foundational（共通基盤）

**Purpose**: US1・US2 双方が必要とするコンポーネントと翻訳ファイルを整備する。T001 完了後、T002〜T004 は並列実行可能。

**⚠️ CRITICAL**: このフェーズ完了まで US1・US2 の実装は開始しない

- [x] T002 [P] `src/i18n/en.ts` に `pinGuide` namespace の英語訳を追加する（`import type { Messages }` による型安全確保）
- [x] T003 [P] `src/i18n/fi.ts` に `pinGuide` namespace のフィンランド語訳を追加する（`import type { Messages }` による型安全確保）
- [x] T004 [P] `src/components/ui/PinSetupGuideModal.tsx` を新規作成する（Props: `mode: 'regular' | 'molkkout'`, `onClose: () => void`。`InstallHelpModal` パターン踏襲: `fixed inset-0 z-50 bg-black/40` バックドロップ（クリックで `onClose` を呼ぶ）・`max-h-[80dvh] overflow-y-auto` スクロール可能ダイアログ（クリックはバックドロップに伝播しないよう `stopPropagation`）・ヘッダー＋✕閉じるボタン・Escape キーで `onClose`（useEffect）。`mode="regular"` 時は12ピン三角配置図、`mode="molkkout"` 時は5ピン直線配置図を静的 JSX で表示）

**Checkpoint**: `PinSetupGuideModal` を単体でレンダリングし、通常・Mölkkout 両 `mode` で配置図が正しく表示されること。TypeScript コンパイルエラーがないこと（`npm run build`）。

---

## Phase 3: User Story 1 - 通常ゲーム開始前のピン配置確認 (Priority: P1) 🎯 MVP

**Goal**: 通常ゲーム画面の `ScreenHeader` 右側に配置ガイドボタンを追加し、タップで `PinSetupGuideModal` を表示する。

**Independent Test**: セットアップ完了後のゲーム画面でヘッダー右側のアイコンボタンをタップ → 三角配置図（Row1〜4 の12ピン）と「3.5m」が表示されること。閉じた後にスコア・ターンが変わらないこと。

- [x] T005 [US1] `src/components/GameScreen/index.tsx` を変更する（`const [showPinGuide, setShowPinGuide] = useState(false)` を追加。`ScreenHeader` の `rightContent` prop に `<button onClick={() => setShowPinGuide(true)} aria-label={t.pinGuide.buttonAriaLabel}>` を渡す。JSX ルートに `{showPinGuide && <PinSetupGuideModal mode="regular" onClose={() => setShowPinGuide(false)} />}` を追加。`ConfirmDialog` と同じ配置パターンを踏襲）

**Checkpoint**: ゲーム画面でボタンをタップすると通常ゲームの配置ガイドが表示され、閉じた後のゲーム状態が変化しないこと。

---

## Phase 4: User Story 2 - Mölkkoutのピン配置確認 (Priority: P2)

**Goal**: Mölkkout ゲーム画面の `ScreenHeader` 右側に配置ガイドボタンを追加し、Mölkkout 専用の5ピン直線配置図を表示する。

**Independent Test**: Mölkkout ゲーム画面でボタンをタップ → 直線配置図（#6・#4・#12・#10・#8）と「3.5m」「ピン間隔: Mölkky スティック1本分」「倒れたピンは元の位置に戻す」が表示されること。通常ゲームの三角配置と見出しで区別されていること。

- [x] T006 [US2] `src/components/MolkkoutScreen/index.tsx` を変更する（`const [showPinGuide, setShowPinGuide] = useState(false)` を追加。アクティブ状態・終了後の両 `ScreenHeader` 利用箇所の `rightContent` prop に `<button onClick={() => setShowPinGuide(true)} aria-label={t.pinGuide.buttonAriaLabel}>` を渡す。JSX ルートに `{showPinGuide && <PinSetupGuideModal mode="molkkout" onClose={() => setShowPinGuide(false)} />}` を追加）

**Checkpoint**: Mölkkout ゲーム画面（進行中・終了後の両状態）でボタンをタップすると Mölkkout 専用の配置ガイドが表示されること。US1 の通常ゲームと内容が視覚的に区別されていること。

> **Note**: US3（ゲーム中の配置再確認）は US1・US2 の実装により自動的に実現される。US1 完了時点でゲーム中いつでも配置ガイドが参照可能になる。

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: 品質確認と仕上げ

- [x] T007 [P] TypeScript ビルドの確認: `npm run build` がエラーなし完了することを検証（特に `en.ts`・`fi.ts` の `Messages` 型適合を確認）
- [x] T008 [P] 開発サーバーで3言語（日本語・英語・フィンランド語）を切り替えながら配置ガイドの表示を確認: `npm run dev`（確認項目: ①各言語でラベル・注記が正しく表示される、②通常ゲームと Mölkkout のガイドが見出しで明確に区別される、③ルールを知っているプレイヤー役で操作し30秒以内にピン配置を把握できることを確認）
- [x] T009 ランドスケープモードでモーダルが正常に表示・閉じられることをブラウザで手動確認

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001)
  └─ Phase 2 (T002, T003, T004) ← T001 完了後、T002〜T004 は並列実行可能
       └─ Phase 3 (T005) ← T004 完了後に実装開始（US1）
       └─ Phase 4 (T006) ← T004 完了後に実装開始（US2）（T005 と並列可能）
            └─ Phase 5 (T007, T008, T009) ← 全実装完了後
```

### User Story Dependencies

- **US1 (P1)**: T001 → T002 / T003 / T004 完了後に開始可能
- **US2 (P2)**: T001 → T002 / T003 / T004 完了後に開始可能（US1 と並列実行可能）
- **US3 (P3)**: US1・US2 の完了により自動実現（追加タスクなし）

### Parallel Opportunities

- **T002・T003・T004**: T001 完了後に3タスク同時並列実行可能（異なるファイル）
- **T005・T006**: T004 完了後に並列実行可能（異なるファイル）
- **T007・T008**: T005・T006 完了後に並列実行可能

---

## Parallel Example: Phase 2

```
T001 完了後:
  並列実行:
    Task T002: en.ts に pinGuide 翻訳追加
    Task T003: fi.ts に pinGuide 翻訳追加
    Task T004: PinSetupGuideModal.tsx 新規作成
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. Phase 1 完了: T001（i18n 型定義）
2. Phase 2 完了: T002・T003・T004（翻訳＋コンポーネント）
3. Phase 3 完了: T005（GameScreen 統合）
4. **STOP and VALIDATE**: 通常ゲーム画面でガイドボタン・表示・閉じる動作を確認
5. MVP として利用可能

### Incremental Delivery

1. T001 → T002/T003/T004 (並列) → Foundation 完成
2. T005 → US1 完成（通常ゲームガイド）→ 動作確認
3. T006 → US2 完成（Mölkkout ガイド）→ 動作確認
4. T007/T008/T009 → 品質確認完了

---

## Notes

- [P] タスクは異なるファイルへの変更のため依存関係なし
- テストタスクなし（Constitution II: 補助的 UI 要素のテストは不要）
- 各タスク完了後に `npm run build` でコンパイルエラーがないことを確認推奨
- `PinSetupGuideModal` は `InstallHelpModal`（`src/components/ui/InstallHelpModal.tsx`）を参考にして実装すること
- 配置図は画像ファイルを使用せず静的 JSX で表現すること（A-002）
