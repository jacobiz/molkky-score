# Implementation Plan: 得点直接入力（1タップスコア入力）

**Branch**: `002-direct-score-input` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-direct-score-input/spec.md`

---

## Summary

現行の2ステップ入力（本数選択 → ピン番号選択）を廃止し、0〜12 の得点ボタンを1タップするだけでスコアを記録できる UI に変更する。`Turn` 型から `pinsKnockedDown` / `pinNumber` を削除して `points` のみに簡素化し、`calculatePoints` 関数も削除する。localStorage スキーマバージョンを v2 に更新して旧データを自動クリアする。UI は 0（ミス）全幅ボタン + 1〜12 の 4×3 グリッドで、ボタンサイズを均一・タップしやすいサイズに設計する。

---

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode 有効）
**Primary Dependencies**: React 19, TailwindCSS v4（`@tailwindcss/vite`）, Vite 6.1, vite-plugin-pwa 0.21
**Testing**: Vitest + @testing-library/react
**Target Platform**: Mobile-first PWA（iOS / Android / デスクトップブラウザ）
**Project Type**: Single-project SPA（フロントエンドのみ）
**Performance Goals**: ボタンタップから画面更新まで 100ms 以内（Constitution 原則 III）
**Constraints**: オフライン動作必須、localStorage のみ、PostCSS 不要
**Scale/Scope**: 型変更 2ファイル・ロジック変更 2ファイル・UI変更 2ファイル・テスト変更 2ファイル・合計 8ファイル

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | `calculatePoints` 削除・型フィールド削除によりコードが減る。新しい抽象化なし |
| II. テストファースト | ✅ PASS | reducer テストを更新してから実装変更する。`calculatePoints` テスト削除・reducer テスト更新が先行 |
| III. モバイルファースト・PWA | ✅ PASS | ボタン最小 44×44px・0 ボタン全幅で誤タップ防止・オフライン動作変更なし |

**Constitution Check: PASS（違反なし）**

---

## Project Structure

### Documentation (this feature)

```text
specs/002-direct-score-input/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── pin-input-ui.md  # UI レイアウト contract
└── tasks.md             # /speckit.tasks output（未生成）
```

### Source Code（変更ファイル）

```text
src/
├── types/
│   └── game.ts                          # Turn / MolkkoutTurn / GameAction 変更
├── utils/
│   ├── scoring.ts                       # calculatePoints 削除
│   └── storage.ts                       # STORAGE_KEY・SCHEMA_VERSION 更新
├── reducers/
│   └── gameReducer.ts                   # RECORD_TURN / RECORD_MOLKKOUT_TURN 変更
├── components/
│   ├── GameScreen/
│   │   ├── PinInput.tsx                 # 1タップUI に全面変更
│   │   └── index.tsx                   # handlePinSubmit シグネチャ変更
│   └── MolkkoutScreen/
│       ├── MolkkoutInput.tsx            # PinInput と同じ1タップUI に変更
│       └── index.tsx                   # handleSubmit シグネチャ変更

tests/
└── unit/
    ├── scoring.test.ts                  # calculatePoints テスト削除
    └── gameReducer.test.ts              # RECORD_TURN ディスパッチ更新
```

---

## Implementation Phases

### Phase A: 型・ロジック・テスト（基盤変更）

**目的**: UI を変更する前に型とロジックを整合させ、テストでリグレッションを防ぐ。

**⚠️ Constitution 原則 II**: テスト更新を実装変更より先に行う。

#### A-1: テストの更新（先行）

1. `tests/unit/scoring.test.ts`
   - `calculatePoints` の `describe` ブロックを丸ごと削除
   - import から `calculatePoints` を除く

2. `tests/unit/gameReducer.test.ts`
   - すべての `RECORD_TURN` ディスパッチを `{ type: 'RECORD_TURN', pinsKnockedDown: X, pinNumber: Y }` から `{ type: 'RECORD_TURN', points: P }` に更新
   - `points` 値はテストの意図する得点を直接指定する
     - 例: `{ type: 'RECORD_TURN', pinsKnockedDown: 1, pinNumber: 12 }` → `{ type: 'RECORD_TURN', points: 12 }`
     - 例: `{ type: 'RECORD_TURN', pinsKnockedDown: 3, pinNumber: null }` → `{ type: 'RECORD_TURN', points: 3 }`
     - 例: `{ type: 'RECORD_TURN', pinsKnockedDown: 0, pinNumber: null }` → `{ type: 'RECORD_TURN', points: 0 }`

   *(この時点でテストは型エラーでコンパイル失敗 → 意図どおり)*

#### A-2: 型定義の変更

`src/types/game.ts`:

1. `Turn` インターフェースから `pinsKnockedDown` と `pinNumber` を削除
2. `MolkkoutTurn` インターフェースから `pinsKnockedDown` と `pinNumber` を削除
3. `GameAction` の `RECORD_TURN` を `{ type: 'RECORD_TURN'; points: number }` に変更
4. `GameAction` の `RECORD_MOLKKOUT_TURN` を `{ type: 'RECORD_MOLKKOUT_TURN'; points: number }` に変更

#### A-3: スコアリング関数の整理

`src/utils/scoring.ts`:
- `calculatePoints` 関数を削除
- `applyBustRule`・`checkWin`・`incrementMisses` は変更なし

#### A-4: Reducer の変更

`src/reducers/gameReducer.ts`:

1. `calculatePoints` の import を削除
2. `RECORD_TURN` ケース:
   - `const { pinsKnockedDown, pinNumber } = action` を削除
   - `const points = calculatePoints(pinsKnockedDown, pinNumber)` を削除
   - `const points = action.points` を追加
   - `const isMiss = pinsKnockedDown === 0` を `const isMiss = points === 0` に変更
   - `turn` オブジェクトから `pinsKnockedDown` と `pinNumber` を削除
3. `RECORD_MOLKKOUT_TURN` ケース:
   - `const { pinsKnockedDown, pinNumber } = action` を削除
   - `const points = calculatePoints(pinsKnockedDown, pinNumber)` を削除
   - `const points = action.points` を追加
   - `turn` オブジェクトから `pinsKnockedDown` と `pinNumber` を削除

#### A-5: ストレージバージョン更新

`src/utils/storage.ts`:
- `const STORAGE_KEY = 'molkky-score-v1'` → `'molkky-score-v2'`
- `const SCHEMA_VERSION = 1` → `2`
- `version: typeof SCHEMA_VERSION` の型推論は自動で `2` になる

**Checkpoint A**: `npm run test:run` が全テストパス（`calculatePoints` テスト削除・reducer テスト更新済み）

---

### Phase B: UI 変更

**目的**: PinInput と MolkkoutInput を1タップ UI に置き換える。

#### B-1: PinInput.tsx の全面変更

`src/components/GameScreen/PinInput.tsx`:

```
Props: { onSubmit: (points: number) => void }
```

レイアウト:
- 0 ボタン: 全幅・`bg-red-500 text-white`・「0（ミス）」または「0」の表示
- 1〜12 ボタン: `grid grid-cols-4` の 3行・`bg-green-500 text-white`・均一サイズ
- 各ボタンの最小高さ: `py-4` または `min-h-[44px]`（44px 以上確保）
- ボタン間の gap は均一にし 1〜12 が正方形に近いアスペクト比になるよう調整

動作:
- ボタンタップで `onSubmit(value)` を即時呼び出す
- ステップ 2 は存在しない（`useState` のステップ管理を削除）

#### B-2: GameScreen/index.tsx の変更

`src/components/GameScreen/index.tsx`:

- `handlePinSubmit(pinsKnockedDown: number, pinNumber: number | null)` を `handlePinSubmit(points: number)` に変更
- `calculatePoints` 呼び出しを削除
- バスト通知: `applyBustRule(player.score, points)` は引き続き使用（変更なし）
- ミス通知: `pinsKnockedDown === 0` を `points === 0` に変更
- dispatch: `{ type: 'RECORD_TURN', pinsKnockedDown, pinNumber }` → `{ type: 'RECORD_TURN', points }`
- `<PinInput key={game.totalTurns} onSubmit={handlePinSubmit} />` の key 戦略は変更なし

#### B-3: MolkkoutInput.tsx の変更

`src/components/MolkkoutScreen/MolkkoutInput.tsx`:

- PinInput.tsx と同じ1タップ UI に変更（同じレイアウト・Props）
- `Props: { onSubmit: (points: number) => void }`
- ステップ 2 を削除
- ボタンレイアウトは PinInput と共通（0 全幅赤 + 1〜12 グリッド緑）

#### B-4: MolkkoutScreen/index.tsx の変更

`src/components/MolkkoutScreen/index.tsx`:

- `handleSubmit(pinsKnockedDown: number, pinNumber: number | null)` を `handleSubmit(points: number)` に変更
- dispatch: `{ type: 'RECORD_MOLKKOUT_TURN', pinsKnockedDown, pinNumber }` → `{ type: 'RECORD_MOLKKOUT_TURN', points }`

**Checkpoint B**: `npm run dev` で動作確認。得点ボタン1タップでスコア更新・2ステップ入力が出ないこと。

---

### Phase C: 品質確認

1. `npx tsc --noEmit` でコンパイルエラー 0 件
2. `npm run test:run` で全テストパス
3. `npm run lint` でエラーなし
4. quickstart.md のシナリオ 1〜7 を手動確認

---

## 変更ファイル一覧

| ファイル | 変更種別 | 主な内容 |
|---------|---------|---------|
| `tests/unit/scoring.test.ts` | 変更 | `calculatePoints` テスト削除 |
| `tests/unit/gameReducer.test.ts` | 変更 | `RECORD_TURN` 引数を `points` に更新 |
| `src/types/game.ts` | 変更 | `Turn`・`MolkkoutTurn`・`GameAction` 型変更 |
| `src/utils/scoring.ts` | 変更 | `calculatePoints` 削除 |
| `src/utils/storage.ts` | 変更 | ストレージバージョン v1 → v2 |
| `src/reducers/gameReducer.ts` | 変更 | `RECORD_TURN`・`RECORD_MOLKKOUT_TURN` ロジック更新 |
| `src/components/GameScreen/PinInput.tsx` | 全面変更 | 1タップUI |
| `src/components/GameScreen/index.tsx` | 変更 | `handlePinSubmit` シグネチャ変更 |
| `src/components/MolkkoutScreen/MolkkoutInput.tsx` | 全面変更 | 1タップUI |
| `src/components/MolkkoutScreen/index.tsx` | 変更 | `handleSubmit` シグネチャ変更 |

**変更なし**: `share.ts`・`storage.ts`以外のutils・全画面コンポーネント（Home/Setup/Result/MolkkoutSetup）
