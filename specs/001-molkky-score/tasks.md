# Tasks: Mölkky スコア管理アプリ

**Input**: Design documents from `/specs/001-molkky-score/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Constitution 原則 II に従い、`scoring.ts` と `gameReducer.ts` の TDD テストを必須として含む。UI テストは任意。

**Organization**: User Story 順（US8 → US1 → US2 → US3 → US4 → US5 → US6 → US7）

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US8、spec.md より）
- 各タスクには正確なファイルパスを記載

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: TailwindCSS v4 と Vitest を既存の Vite + React 19 + vite-plugin-pwa 構成に追加する

- [x] T001 TailwindCSS v4 をインストールする: `npm install tailwindcss @tailwindcss/vite`
- [x] T002 Vitest + テスト依存をインストールする: `npm install -D vitest @testing-library/react jsdom @vitest/coverage-v8`
- [x] T003 [P] `vite.config.ts` に `tailwindcss()` プラグインを追加する（`@tailwindcss/vite` を import、既存の `react()` と `VitePWA()` を保持）
- [x] T004 [P] `src/index.css` を作成し `@import "tailwindcss";` のみ記述する。`src/main.tsx` の先頭に `import './index.css'` を追加する（Tailwind を有効化するために Phase 1 で完結させる）
- [x] T005 [P] `vitest.config.ts` を作成する（`environment: 'jsdom'`, `globals: true`）
- [x] T006 `package.json` の `scripts` に `"test": "vitest"`, `"test:run": "vitest run"`, `"test:coverage": "vitest run --coverage"` を追加する
- [x] T007 ソースディレクトリ構造を作成する: `src/components/ui/`, `src/context/`, `src/reducers/`, `src/types/`, `src/utils/`, `src/i18n/`, `tests/unit/`

**Checkpoint**: `npm run dev` が起動し、Tailwind クラスが適用されることを確認

---

## Phase 2: Foundational（全ストーリーの前提基盤）

**Purpose**: 型定義・ゲームロジック・状態管理・ストレージ・i18n の共通基盤。全 User Story の前提条件。

**⚠️ CRITICAL**: Constitution 原則 II（テストファースト）に従い、scoring と reducer のテストを先に記述してから実装する

- [x] T008 `src/types/game.ts` に全エンティティの TypeScript 型を定義する（`data-model.md` 参照: `Player`, `Turn`, `Game`, `MolkkoutTeam`, `MolkkoutTurn`, `MolkkoutGame`, `Settings`, `GameState`, `GameAction` — data-model.md の全型を網羅）
- [x] T009 `tests/unit/scoring.test.ts` にスコア計算のテストケースを記述する（実装より先に）: `calculatePoints(0本→0, 1本→ピン値, 複数→本数)`, `applyBustRule(50超→25, 50ちょうど→50)`, `checkWin(50→true, 49→false)`
- [x] T010 `src/utils/scoring.ts` に T009 のテストをパスするスコア計算ピュア関数を実装する: `calculatePoints`, `applyBustRule`, `checkWin`, `incrementMisses`（3回→`'eliminated'`）
- [x] T011 `tests/unit/gameReducer.test.ts` に reducer のテストケースを記述する（実装より先に）: `START_GAME`, `RECORD_TURN`（通常/バースト/脱落/勝利各シナリオ）, `UNDO_TURN`, `RESTART_GAME`, `SET_LANGUAGE`
- [x] T012 `src/reducers/gameReducer.ts` に T011 のテストをパスする reducer を実装する（`scoring.ts` を利用し全 `GameAction` を処理）
- [x] T013 [P] `src/utils/storage.ts` を実装する（`localStorage` キー `molkky-score-v1`, JSON 保存/読み込み/バージョン検証、`contracts/localStorage-schema.md` 準拠）
- [x] T014 `src/context/GameContext.tsx` を実装する（`useReducer` + `useEffect` で storage sync、`GameContext` + `useGame()` フックをエクスポート）
- [x] T015 [P] `src/i18n/ja.ts` に全日本語文字列を定義する（`contracts/i18n-keys.md` の `Messages` インターフェース準拠）
- [x] T016 [P] `src/i18n/en.ts` に全英語文字列を定義する（`contracts/i18n-keys.md` 準拠、順位接尾辞 1st/2nd/3rd/Nth 対応）
- [x] T017 `src/utils/i18n.ts` に `useTranslation()` フックを実装する（`useGame()` から `settings.language` を取得して ja/en を切り替え）
- [x] T018 [P] `src/components/ui/Toast.tsx` を作成する（トースト通知: テキストと表示時間を props で受け取り、自動消去）
- [x] T019 [P] `src/components/ui/ConfirmDialog.tsx` を作成する（確認ダイアログ: メッセージ・確認/キャンセルボタン・コールバック props）
- [x] T020 `src/App.tsx` を実装する（`GameState.screen` による画面ルーティング: `home` / `setup` / `game` / `result` / `molkkout-setup` / `molkkout-game`）
- [x] T021 `src/main.tsx` を更新して `GameContext.Provider` でアプリ全体をラップする（`import './index.css'` は T004 で完了済み）

**Checkpoint**: `npm run test:run` が全テストパスすること

---

## Phase 3: User Story 8 - ホーム画面とゲーム再開 (Priority: P1) 🎯

**Goal**: アプリ起動時のホーム画面で「新規ゲーム」と「ゲーム再開」の両導線を提供する

**Independent Test**: アプリを起動し「新規ゲーム開始」ボタンが表示される。保存済みゲームがある状態では「ゲームを再開」ボタンも表示される。

- [x] T022 [US8] `src/components/HomeScreen.tsx` を作成する（「新規ゲーム開始」ボタン常時表示、`game !== null` のとき「ゲームを再開」ボタンを追加表示、TailwindCSS でモバイルファーストスタイリング）
- [x] T023 [US8] `HomeScreen` に言語切り替えボタンを追加する（`SET_LANGUAGE` dispatch、FR-031）
- [x] T024 [US8] 「ゲームを再開」ボタンに `NAVIGATE { screen: 'game' }` を dispatch する（localStorage の game を復元してゲーム画面へ遷移）
- [x] T025 [US8] 「新規ゲーム開始」ボタン押下時に進行中ゲームがある場合 `ConfirmDialog` を表示し、確認後 `NEW_GAME` を dispatch してセットアップ画面へ遷移する（FR-035）

---

## Phase 4: User Story 1 - ゲームのセットアップ (Priority: P1) 🎯

**Goal**: 2〜12人のプレイヤー名を入力し、投球順を設定してゲームを開始できる

**Independent Test**: プレイヤー名を3人分入力し「ゲーム開始」をタップすると GameScreen に遷移する。

- [x] T026 [US1] `src/components/SetupScreen.tsx` を作成する（テキスト入力フィールド + 「追加」ボタン、バリデーション: 最大10文字・重複ブロック・11文字以上ブロック、FR-001）
- [x] T027 [US1] `SetupScreen` に登録済みプレイヤーリストと削除ボタンを実装する（ドラッグ不要、上下移動ボタンで投球順変更、FR-002）
- [x] T028 [US1] `SetupScreen` に「ゲーム開始」ボタンを実装する（プレイヤー1人以下の場合はボタン無効化またはエラー表示、FR-003）
- [x] T029 [US1] 「ゲーム開始」ボタン押下時に `START_GAME` を dispatch しゲーム画面へ遷移する

---

## Phase 5: User Story 2 - ターンごとのスコア入力 (Priority: P1) 🎯

**Goal**: 投球後にピン本数（0〜12）と1本の場合はピン番号（1〜12）をボタン選択で入力できる

**Independent Test**: 1本数字ボタン → ピン番号ボタンの2ステップで入力し、正しいスコアがスコアボードに反映される。

- [x] T030 [US2] `src/components/GameScreen/PinInput.tsx` を作成する（ステップ1: 0〜12の数字ボタン13個を表示、タップで本数を選択）
- [x] T031 [US2] `PinInput` にステップ2を実装する（本数が1の場合のみ 1〜12 のピン番号ボタングリッドを表示、FR-005）
- [x] T032 [US2] `PinInput` から `RECORD_TURN` を dispatch する（`pinsKnockedDown` と `pinNumber` を渡す）
- [x] T033 [P] [US2] `src/components/GameScreen/ScoreBoard.tsx` を作成する（各プレイヤーの名前・スコアをリスト表示、現在のターンプレイヤーをハイライト、FR-014・FR-015）
- [x] T034 [US2] `src/components/GameScreen/index.tsx` を作成する（上半分 `ScoreBoard` + 下半分 `PinInput` の縦分割レイアウト、`md:flex-row` でタブレット以上は左右並列、FR-018）

---

## Phase 6: User Story 3 - ルール自動判定（バースト・脱落・勝利） (Priority: P1) 🎯

**Goal**: スコア計算後にバースト/脱落/勝利を自動判定し、即座にユーザーに通知する

**Independent Test**: 48点から5点を加算するとバーストメッセージが表示される。3回連続ミスで脱落表示。50点ちょうどで勝利画面に遷移する。

- [x] T035 [US3] バースト発生時（`Turn.isBust === true`）に `GameScreen/index.tsx` 内でバーストメッセージ（「バースト！25点にリセット」）を表示する（Toast または インライン通知）
- [x] T036 [US3] プレイヤー脱落時（`Player.status === 'eliminated'`）に脱落通知を表示する（「{name} が脱落しました」）
- [x] T037 [US3] ゲーム終了時（`Game.status === 'finished'`）に `NAVIGATE { screen: 'result' }` を dispatch して結果画面に遷移する（reducer が自動で screen を 'result' に変更するため追加実装不要）
- [x] T038 [US3] 最後の1人が残った場合（全員脱落後）に自動勝者宣言されることを `npm run test:run` で検証する（T011 で記述したテストが「全員脱落→自動勝者」シナリオをカバーしているか確認し、不足があればテストを補完する）

---

## Phase 7: User Story 4 - 現在の試合状況の確認 (Priority: P2)

**Goal**: ゲーム中に全プレイヤーのスコア・残り点数・ミス回数を視覚的に確認できる

**Independent Test**: ゲームを進めると各プレイヤー行に「残り{n}pt」「ミス{n}回」が更新表示される。ミス2回のプレイヤーは警告色になる。

- [x] T039 [US4] `ScoreBoard.tsx` に残り点数（`50 - score`）表示カラムを追加する（FR-015）
- [x] T040 [US4] `ScoreBoard.tsx` に連続ミス回数表示を追加する（FR-016）
- [x] T041 [US4] `ScoreBoard.tsx` で `consecutiveMisses === 2` のプレイヤーに警告スタイル（黄色/橙色背景）を適用する（FR-016、TailwindCSS `bg-amber-100` 等）
- [x] T042 [US4] `ScoreBoard.tsx` で `status === 'eliminated'` のプレイヤーに脱落スタイル（グレーアウト・打ち消し線）を適用する（FR-017）

---

## Phase 8: User Story 5 - 入力のやり直し（アンドゥ） (Priority: P2)

**Goal**: 誤入力後に「やり直し」ボタンで直前のターンを取り消し、スコア/ミス数/ターン順を元に戻せる

**Independent Test**: ターンを1つ進めた後に「やり直し」をタップすると、前プレイヤーのスコアと状態が復元される。

- [x] T043 [US5] `GameScreen/index.tsx` に「やり直し」ボタンを追加する（`turnHistory.length === 0` のとき非活性化）
- [x] T044 [US5] 「やり直し」ボタン押下時に `UNDO_TURN` を dispatch する
- [x] T045 [US5] `gameReducer.ts` の `UNDO_TURN` ハンドラが `playerSnapshotBefore` からスコア・ミス数・脱落フラグを完全復元することを `npm run test:run` で検証する（既存の gameReducer.test.ts でカバー済み、30/30 通過）

---

## Phase 9: User Story 6 - ゲーム終了とリスタート (Priority: P2)

**Goal**: ゲーム終了後に結果画面を表示し、リスタート・新規ゲーム・結果シェアができる

**Independent Test**: 勝者確定後に結果画面が表示され、「もう一度プレイ」でスコアがリセットされた同じメンバーのゲームが始まる。

- [x] T046 [US6] `src/components/ResultScreen.tsx` を作成する（勝者名・全プレイヤーの最終スコアランキング・総ターン数を表示、FR-021）
- [x] T047 [US6] `ResultScreen` に「もう一度プレイ」ボタンを追加する（`RESTART_GAME` dispatch → 同メンバー・スコアリセット、FR-022）
- [x] T048 [US6] `ResultScreen` に「新しいゲーム」ボタンを追加する（`NEW_GAME` dispatch → セットアップ画面へ、FR-023）
- [x] T049 [US6] `src/utils/share.ts` を実装する（`contracts/share-text.md` のフォーマットでテキスト生成、`navigator.share` 使用、非対応時は `navigator.clipboard.writeText` フォールバック）
- [x] T050 [US6] `ResultScreen` にシェアボタンを追加し `share.ts` を呼び出す（クリップボードフォールバック時に `Toast` コンポーネントで通知、FR-024）
- [x] T051 [US6] `SetupScreen.tsx` にも言語切り替えボタンを追加する（FR-031）

---

## Phase 10: User Story 7 - Mölkkout（タイブレーカー）モード (Priority: P3)

**Goal**: 5本ピンを使ったタイブレーカーモードで複数チームの得点を集計し勝者を決定する

**Independent Test**: Mölkkoutモードを選択すると「6-4-12-10-8」のピン配置ガイドが表示され、投球入力後にチーム合計スコアが更新される。

- [x] T052 [P] [US7] `src/types/game.ts` の Mölkkout 関連型（`MolkkoutTeam`, `MolkkoutTurn`, `MolkkoutGame`）が `data-model.md` の定義と一致することを確認する（T008 で定義済みのため追加実装不要。チームサイズ別投球数フィールド `throwsPerPlayer` の型も検証）
- [x] T053 [P] [US7] `src/reducers/gameReducer.ts` に `START_MOLKKOUT` と `RECORD_MOLKKOUT_TURN` アクションを追加する（`scoring.ts` のロジックを再利用）
- [x] T054 [US7] `src/components/MolkkoutScreen/index.tsx` を作成する（チーム設定入力・5本ピン配置ガイド「6-4-12-10-8」表示・FR-026）
- [x] T055 [P] [US7] `src/components/MolkkoutScreen/MolkkoutInput.tsx` を作成する（`PinInput.tsx` と同じ2ステップUI を再利用）
- [x] T056 [US7] `MolkkoutScreen/index.tsx` にチームサイズ別投球数管理を実装する（1人:3投、2人:各2投、3人以上:各1投、reducer で実装済み）
- [x] T057 [US7] `MolkkoutScreen` にチーム合計スコアと現在の投球者表示を実装する（FR-027）
- [x] T058 [US7] Mölkkout 同点時の延長戦（追加1投ずつ）を実装する（FR-029: reducer が status='overtime' に設定、UI に「延長戦」バナー表示）
- [x] T059 [US7] `ResultScreen.tsx` に「Mölkkout（タイブレーカー）」ボタンを追加し `NAVIGATE { screen: 'molkkout-setup' }` を dispatch する

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: レスポンシブ確認・PWA 動作確認・品質ゲート

- [x] T060 [P] `GameScreen/index.tsx` のレスポンシブ動作を確認する（375px でスコア一覧上・入力下の縦分割、768px 以上で `md:flex-row` による左右並列）
- [x] T061 [P] 全コンポーネントのモバイル操作を確認する（タップターゲット最小 44×44px、親指届く範囲に主要ボタン配置）
- [x] T062 PWA オフライン動作を確認する（`npm run build` → `npm run preview` → ネットワーク無効化でもアプリが動作すること）
- [x] T063 localStorage 永続化の動作確認をする（ゲーム進行中にリロードし全状態が復元されること）
- [x] T064 [P] TypeScript strict mode コンパイルチェックを実行する（`npx tsc --noEmit` でエラー0件）
- [x] T065 [P] Constitution 準拠最終確認をする（不必要な抽象化なし・TDD テスト全パス・外部 state ライブラリ未使用・PWA manifest 正常）
- [x] T066 [P] 実機（または Chrome DevTools モバイルエミュレータ）でパフォーマンスを確認する（SC-001: セットアップ 60 秒以内・SC-002: スコア入力 10 秒/ターン以内・SC-003: ルール判定が入力後即座に反映されること）

---

## Dependency Graph

```
Phase 1 (Setup)
  └── Phase 2 (Foundational: types + scoring TDD + reducer TDD + context)
        ├── Phase 3 (US8: HomeScreen) ─────────────────────────────────────────┐
        ├── Phase 4 (US1: SetupScreen) ──────────────────────────────────────┐ │
        ├── Phase 5 (US2: PinInput + ScoreBoard + GameScreen layout)          │ │
        │     └── Phase 6 (US3: ルール判定 UI フィードバック)                  │ │
        │           └── Phase 7 (US4: スコア詳細表示)                         │ │
        │                 └── Phase 8 (US5: アンドゥ UI)                      │ │
        │                       └── Phase 9 (US6: ResultScreen + シェア)   ◄──┘ │
        │                             └── Phase 10 (US7: Mölkkout)              │
        └──────────────────────────────────────────────────────────────────► Final
```

**Note**: US8（HomeScreen）と US1（SetupScreen）は Phase 2 完了後に並列実装可能。Phase 5〜9 は順次依存。

---

## Implementation Strategy

### MVP Scope（最優先）

Phase 1 + 2 + 3 + 4 + 5 + 6 = T001〜T038 が完了すれば「プレイ可能な最小版」が成立：

- アプリ起動 → プレイヤー設定 → スコア入力 → バースト/脱落/勝利判定

### Increment 2

Phase 7 + 8 + 9（T039〜T051）: スコア詳細表示・アンドゥ・結果画面・シェア機能

### Increment 3

Phase 10（T052〜T059）: Mölkkout タイブレーカーモード

### Final

Phase Final（T060〜T065）: レスポンシブ確認・PWA・品質ゲート

---

## Parallel Execution Examples

### Phase 2 内の並列実行可能タスク

```
[Sequential]
T008 (types) → T009 (scoring tests) → T010 (scoring impl)
             → T011 (reducer tests)  → T012 (reducer impl)

[Parallel after T008]
T013 (storage) ──┐
T015 (ja.ts)  ──┤─→ T017 (i18n.ts)
T016 (en.ts)  ──┘
T018 (Toast)  ──┐
T019 (Dialog) ──┘ (both parallel)
```

### Phase 5 内の並列実行可能タスク

```
T030 → T031 → T032 (PinInput: sequential)
T033            (ScoreBoard: parallel with T030-T032)
T034            (GameScreen index: depends on T032 + T033)
```
