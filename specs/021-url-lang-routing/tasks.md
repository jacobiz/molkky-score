# Tasks: URLベースの言語ルーティング

**Input**: Design documents from `/specs/021-url-lang-routing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: タスクはユーザーストーリー単位で整理されており、各ストーリーを独立して実装・検証できます。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可（別ファイル、未完了タスクへの依存なし）
- **[Story]**: 対象ユーザーストーリー（US1/US2/US3）

---

## Phase 1: Setup（共通基盤）

**Purpose**: 変更対象ファイルの確認と開発環境の準備

- [x] T001 既存の `src/utils/i18n.ts` を読み込み、`getLangFromUrl()` 追加箇所を確認する
- [x] T002 既存の `src/context/GameContext.tsx` を読み込み、initializer と useEffect 追加箇所を確認する
- [x] T003 [P] 既存の `tests/unit/` ディレクトリ構成を確認し、`i18n.test.ts` の有無を確認する

---

## Phase 2: 基盤（全ストーリーの前提条件）

**Purpose**: US1・US2 両方が依存する `getLangFromUrl()` ユーティリティを先行実装する

**⚠️ CRITICAL**: このフェーズが完了するまで US1・US2 の実装は開始できない

- [x] T004 `getLangFromUrl()` のユニットテストを `tests/unit/i18n.test.ts` に追加する（テストが **FAIL** することを確認してから次へ進む）
  - テストケース: `?lang=en` → `'en'`、`?lang=fi` → `'fi'`、`?lang=ja` → `'ja'`、`?lang=zh` → `null`、パラメータなし → `null`、`?lang=` → `null`、`?lang=en&lang=fi` → `'en'`（最初の値を使用）
- [x] T005 `getLangFromUrl(): Language | null` を `src/utils/i18n.ts` に追加する（`URLSearchParams` 使用、型ガードで `Language` 型を返す）
- [x] T006 `npm test` を実行し、T004 のテストが **PASS** することを確認する

**Checkpoint**: `getLangFromUrl()` が実装・テスト済み → US1・US2 の実装を開始できる

---

## Phase 3: User Story 1 - URL パラメータで言語を指定してアクセス (Priority: P1) 🎯 MVP

**Goal**: `?lang=en` / `?lang=fi` 付き URL を開くと、その言語でアプリが起動する

**Independent Test**: `http://localhost:5173/molkky-score/?lang=en` を開いてアプリが英語で表示されることを確認する

### Implementation for User Story 1

- [x] T007 [US1] `src/context/GameContext.tsx` の `useReducer` initializer を更新する
  - `getLangFromUrl()` をインポート
  - `saved` あり + URL パラメータあり → `{ ...init, ...saved, settings: { ...saved.settings, language: urlLang } }`
  - `saved` あり + URL パラメータなし → 既存挙動（`{ ...init, ...saved }`）を維持
  - `saved` なし + URL パラメータあり → `{ ...init, settings: { language: urlLang } }`
  - `saved` なし + URL パラメータなし → `{ ...init, settings: { language: detectLocale() } }`（既存挙動維持）
- [ ] T008 [US1] ブラウザで以下を手動確認する *(要手動確認)*
  - `?lang=en` → 英語表示
  - `?lang=fi` → フィンランド語表示
  - `?lang=zh`（無効値）→ デフォルト言語にフォールバック
  - パラメータなし → 既存挙動（localStorage or ブラウザ言語検出）を維持

**Checkpoint**: US1 完了 — 言語付き URL を開くだけで目的の言語でアプリが起動する

---

## Phase 4: User Story 2 - 言語切替時に URL が更新される (Priority: P2)

**Goal**: 言語セレクターで言語を切り替えると、アドレスバーの URL が自動更新される

**Independent Test**: 言語セレクターで英語に切り替えてアドレスバーに `?lang=en` が付くことを確認する。日本語選択時は `?lang` が除去されることを確認する

### Implementation for User Story 2

- [x] T009 [US2] `src/context/GameContext.tsx` に `state.settings.language` を監視する `useEffect` を追加する
  - 言語が `'ja'` の場合: `URLSearchParams` から `lang` を削除してクリーン URL にする
  - 言語が `'en'` / `'fi'` の場合: `params.set('lang', language)` で URL を更新する
  - `history.replaceState(null, '', newUrl)` を呼び出す（リロードなし・履歴スタック非汚染）
- [ ] T010 [US2] ブラウザで以下を手動確認する *(要手動確認)*
  - 言語セレクターで `EN` 選択 → URL が `?lang=en` に更新される（リロードなし）
  - 言語セレクターで `FI` 選択 → URL が `?lang=fi` に更新される
  - 言語セレクターで `JA` 選択 → `?lang` パラメータが URL から除去される
  - US1 との統合確認: `?lang=fi` で起動 → 言語セレクターで `JA` に切り替え → URL がクリーンになる

**Checkpoint**: US2 完了 — 共有可能な言語付き URL が自動生成される

---

## Phase 5: User Story 3 - hreflang リンクの静的更新 (Priority: P3)

**Goal**: `index.html` の hreflang タグが `?lang=XX` 付き URL を参照し、Google の言語バリアント認識を改善する

**Independent Test**: `index.html` のソースで `hreflang="en"` の href が `?lang=en` 付き URL を参照していることを確認する

### Implementation for User Story 3

- [x] T011 [P] [US3] `index.html` の `hreflang="en"` タグの href を `https://jacobiz.github.io/molkky-score/?lang=en` に更新する
- [x] T012 [P] [US3] `index.html` の `hreflang="fi"` タグの href を `https://jacobiz.github.io/molkky-score/?lang=fi` に更新する
- [x] T013 [US3] `index.html` の `hreflang="ja"` と `hreflang="x-default"` タグの href がパラメータなしのクリーン URL（`https://jacobiz.github.io/molkky-score/`）のままであることを確認する

**Checkpoint**: US3 完了 — Google が各言語バリアントを正確に認識できる hreflang 設定が完成

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: ビルド確認・全体動作の最終検証

- [x] T014 `npm run build` を実行し TypeScript コンパイルエラーがないことを確認する
- [x] T015 `npm test` を実行しすべてのテストが PASS することを確認する
- [ ] T016 [P] PWA 動作確認: パラメータなし URL でアプリが正常に起動し、オフライン動作に影響がないことを確認する *(要手動確認)*
- [ ] T017 [P] 既存機能の回帰確認: ゲーム開始・スコア入力・ゲーム終了が正常に動作することを確認する *(要手動確認)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即開始可能
- **基盤 (Phase 2)**: Phase 1 完了後 — **US1・US2 をブロック**
- **US1 (Phase 3)**: Phase 2 完了後に開始可能
- **US2 (Phase 4)**: Phase 2 完了後に開始可能（US1 と並列実行可能だが、US1 完了後の方が統合確認しやすい）
- **US3 (Phase 5)**: Phase 1 完了後に独立して開始可能（他フェーズに依存しない）
- **Polish (Phase 6)**: 全ストーリー完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 の `getLangFromUrl()` に依存
- **US2 (P2)**: Phase 2 の `getLangFromUrl()` に依存（US1 との直接依存なし）
- **US3 (P3)**: `index.html` 編集のみ。他ストーリーに非依存（Phase 1 完了後すぐ着手可能）

### Parallel Opportunities

- T001・T002・T003（Setup）は並列実行可能
- T011・T012（US3 の hreflang 更新）は並列実行可能
- T016・T017（Polish）は並列実行可能

---

## Parallel Example: Setup + US3 早期並列

```
Phase 1 完了直後:
  → Phase 2 を開始（T004〜T006）
  → Phase 5 も並列開始可能（T011、T012 は index.html 編集のみ）
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. Phase 1: Setup 完了
2. Phase 2: `getLangFromUrl()` 実装・テスト
3. Phase 3: US1（起動時 URL 読み取り）
4. **STOP & VALIDATE**: `?lang=en` 付き URL でアプリが英語起動することを確認
5. 確認後 Phase 4〜6 へ進む

### Incremental Delivery

1. Setup + 基盤 → `getLangFromUrl()` 準備完了
2. US1 完了 → URL 指定で言語起動（MVP！）
3. US2 完了 → 言語切替時の URL 自動更新（共有リンク生成可能）
4. US3 完了 → hreflang による SEO 改善

---

## Notes

- `[P]` タスクは別ファイル・依存なしのため並列実行可能
- `[Story]` ラベルで各タスクのトレーサビリティを確保
- T004 のテストは FAIL 状態を確認してから T005 の実装を開始すること（TDD）
- 各 Checkpoint で独立した動作確認を実施してから次フェーズへ進む
