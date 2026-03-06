# Tasks: Mölkkout ピン配置図の縦向き表示

**Input**: Design documents from `/specs/016-rotate-pin-layout/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Organization**: ユーザーストーリーは1件（P1）のみ。セットアップ・基盤フェーズは不要なため省略。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[US1]**: ユーザーストーリー1 に対応

---

## Phase 1: User Story 1 - Mölkkout ピン配置を縦向きで確認する (Priority: P1) 🎯 MVP

**Goal**: `MolkkoutLayout` コンポーネントをスロワー視点の縦向き表示に変更し、i18n キャプションを更新する

**Independent Test**: Mölkkoutゲーム画面から配置ガイドを開き、ピン（#8→#10→#12→#4→#6 の順で上から下）が縦一列に表示され、下部に破線インジケーター（▽）が表示されることを確認する

### Implementation

- [x] T001 [P] [US1] `src/i18n/ja.ts` の `pinGuide.molkkout.layoutCaption` を `'配置図（左から）'` から `'配置図（スロワー側から）'` に変更
- [x] T002 [P] [US1] `src/i18n/en.ts` の `pinGuide.molkkout.layoutCaption` を `'Layout (left to right)'` から `'Layout (viewed from thrower)'` に変更
- [x] T003 [P] [US1] `src/i18n/fi.ts` の `pinGuide.molkkout.layoutCaption` を `'Asettelu (vasemmalta oikealle)'` から `'Asettelu (heittäjän suunnasta)'` に変更
- [x] T004 [P] [US1] `src/components/ui/PinSetupGuideModal.tsx` の `MolkkoutLayout` を以下のように変更する（T001–T003 と独立して並列実行可能）:
  - コンテナを `flex flex-col items-center gap-1 py-2 select-none` に変更
  - ピン順序を上から `#8, #10, #12, #4, #6` に並び替え
  - ピン間の `<span>—</span>` を削除（余白のみ）
  - 配置図の下部に `RegularLayout` と同一スタイルの投球ラインインジケーターを追加:
    ```
    <div className="mt-3 border-t-2 border-dashed border-gray-400 relative">
      <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-xs text-gray-500">▽</span>
    </div>
    ```

**Checkpoint**: `MolkkoutLayout` が縦向き表示され、`RegularLayout` の動作・表示は変化していないことを確認する

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: ビルド確認・表示検証

- [x] T005 TypeScript コンパイルエラーがないことを確認: `npm run build`
- [x] T006 [P] 通常ゲーム（Regular）配置ガイドの表示が変更前と同一であることを目視確認（モーダルの開閉動作が正常であること・SC-002 受け入れシナリオ4 も含む）
- [x] T007 [P] 言語切り替え（日本語・英語・フィンランド語）後に Mölkkout 配置ガイドのキャプションが正しく更新され、ピン間隔ラベル（FR-003）が引き続き表示されることを確認

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Phase 1 (US1)**: 依存なし。T001–T004 はすべて即座に開始可能
- **Phase 2 (Polish)**: Phase 1 完了後

### ユーザーストーリー内の並列実行

- **T001・T002・T003・T004** はすべて異なるファイルを変更するため完全に並列実行可能

### Parallel Example: User Story 1

```
同時実行可能:
  T001: src/i18n/ja.ts の layoutCaption 更新
  T002: src/i18n/en.ts の layoutCaption 更新
  T003: src/i18n/fi.ts の layoutCaption 更新
  T004: src/components/ui/PinSetupGuideModal.tsx の MolkkoutLayout 変更

↓ すべて完了後

  T005: ビルド確認
  T006: Regular 配置ガイド目視確認（T004 完了後）
  T007: 言語切り替え確認（T001–T004 完了後）
```

---

## Implementation Strategy

### MVP（このフィーチャーはシングルストーリーなのでそのまま MVP）

1. T001–T004 を並列実行（全4ファイル変更）
2. T005 でビルド確認
3. T006–T007 で目視確認
4. **完了**: 全受け入れシナリオ（SC-001〜SC-003）を満たしていることを確認

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [US1] ラベルは spec.md の User Story 1 に対応
- 新規ファイル作成なし、新規依存ライブラリなし
- テストは UI 補助コンポーネントのため任意（Constitution II MAY）
