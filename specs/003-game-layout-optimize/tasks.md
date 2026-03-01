# Tasks: ゲーム画面レイアウト最適化

**Input**: Design documents from `/specs/003-game-layout-optimize/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Constitution 原則 II に従い、UI コンポーネントのテストは任意。本機能は純粋な CSS レイアウト変更のため、TDD 対象外。`npx tsc --noEmit` と `npm run test:run` で既存テストが壊れていないことを確認する。

**Organization**: US1（レイアウト構造 = index ファイル群）→ US2（ボタン拡大 = Input コンポーネント群）。各 US 内タスクは異なるファイルのため並列実行可。

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US2）
- 各タスクには正確なファイルパスを記載

---

## Phase 1: Setup

Setup 不要（既存プロジェクトへの CSS クラス変更のため）

---

## Phase 2: Foundational

Foundational 不要（型・ロジック・状態管理の変更なし。TailwindCSS ユーティリティ変更のみ）

---

## Phase 3: User Story 1 - スコア入力ボタンが常に画面に収まる (Priority: P1) 🎯

**Goal**: `h-dvh` + スコアボード `max-h-80` + 入力エリア `flex-1` でレイアウトを再構成し、6人構成でもボタンがスクロールなしで画面内に収まる

**Independent Test**: 6人でゲームを開始し、スコア入力ボタン（0〜12）がスクロールなしに全表示・操作できることを目視確認できる

- [x] T001 [P] [US1] `src/components/GameScreen/index.tsx` のレイアウトを再構成する: 外コンテナを `min-h-dvh` → `h-dvh` に変更し・スコアボード側 div を `flex-1 flex flex-col md:overflow-y-auto` → `shrink-0 flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto` に変更し・ScoreBoard を `<div className="overflow-y-auto max-h-80 md:max-h-none md:flex-1">` で囲み・PinInput 側 div を `flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-80 md:justify-center` に変更する
- [x] T002 [P] [US1] `src/components/MolkkoutScreen/index.tsx` のレイアウトを T001 と同パターンで再構成する: 外コンテナを `min-h-dvh` → `h-dvh` に変更し・チームリスト側 div を `shrink-0 flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto` に変更し・チームリスト内 `<div className="flex flex-col divide-y divide-gray-100">` を `<div className="overflow-y-auto max-h-80 md:max-h-none md:flex-1">` で囲み・MolkkoutInput 側 div を `flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-80 md:justify-center` に変更する（**注意**: `mg.status === 'finished'` の早期 return ブロックの `min-h-dvh` は変更しない。そのブロックは全画面中央寄せ表示であり本レイアウト改修の対象外）

**Checkpoint**: 6人ゲームを開始してスコア入力ボタンが画面内に収まること（ボタンサイズはまだ小さくてよい）

---

## Phase 4: User Story 2 - スコア入力ボタンが大きく押しやすい (Priority: P2)

**Goal**: `h-full` + `grid-rows-3` で入力コンポーネントが親の `flex-1` スペースをボタンに割り当て、少人数時はさらに大きくなる

**Independent Test**: ゲーム画面で全ボタン高さが 44px 以上（開発ツール確認）であり、2人ゲームでは 6人ゲームより大きいボタンが表示される

- [x] T003 [P] [US2] `src/components/GameScreen/PinInput.tsx` を拡大レイアウトに変更する: 外 div に `h-full` を追加し（`flex flex-col gap-3 p-4 h-full`）・0ボタンに `shrink-0` を追加し・1〜12 グリッド div を `grid grid-cols-4 gap-2` → `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2` に変更する（各ボタンは `min-h-[44px]` を維持、CSS Grid stretch でセル高さいっぱいに自動拡大）
- [x] T004 [P] [US2] `src/components/MolkkoutScreen/MolkkoutInput.tsx` を T003 と同パターンで変更する: 外 div に `h-full` を追加し・0ボタンに `shrink-0` を追加し・グリッド div を `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2` に変更する

**Checkpoint**: 2人ゲームと 6人ゲームで入力ボタンのサイズが異なり（2人 > 6人）、どちらも 44px 以上であること

---

## Final Phase: 品質確認

- [x] T005 [P] TypeScript strict mode チェックを実行する（`npx tsc --noEmit` でエラー 0件）
- [x] T006 [P] 全テストを実行する（`npm run test:run` でエラー 0件、既存 27テストがすべてパス）
- [x] T007 [P] `specs/003-game-layout-optimize/quickstart.md` のシナリオ 1〜6 を手動確認する（特にシナリオ 2: 6人でボタンが画面内・シナリオ 4: 2人 vs 6人のボタンサイズ比較・シナリオ 6: タブレット横並びレイアウト維持）

---

## Dependency Graph

```
Phase 3 (US1)
  T001 (GameScreen/index.tsx) ─┐
  T002 (MolkkoutScreen/index.tsx) ─┘  ← 並列可、異なるファイル

Phase 4 (US2)                         ← US1 完了後に開始（目視確認のため）
  T003 (PinInput.tsx) ─┐
  T004 (MolkkoutInput.tsx) ─┘  ← 並列可、異なるファイル

Final Phase
  T005 / T006 / T007  ← 全実装完了後（並列可）
```

**Note**: T003/T004 はファイルが T001/T002 と独立しているため技術的には並列実行可能。ただし US1（レイアウト）完了後に US2（ボタン拡大）の効果を視覚的に確認するため、Phase 3 完了後に Phase 4 を開始することを推奨。

---

## Implementation Strategy

### MVP（US1 のみ）

Phase 3（T001〜T002）= ボタンが常に画面内に収まる最小版

### フル実装

MVP + Phase 4（T003〜T004）= ボタンが動的に拡大する完全版

---

## Parallel Execution Examples

### Phase 3 内の並列

```
[Parallel start]
T001 (GameScreen/index.tsx)
T002 (MolkkoutScreen/index.tsx)
[Both complete → Phase 3 Checkpoint]
```

### Phase 4 内の並列

```
[Parallel start]
T003 (PinInput.tsx)
T004 (MolkkoutInput.tsx)
[Both complete → Phase 4 Checkpoint]
```

### Final Phase の並列

```
[Parallel start]
T005 (tsc --noEmit)
T006 (npm run test:run)
T007 (quickstart manual check)
```
