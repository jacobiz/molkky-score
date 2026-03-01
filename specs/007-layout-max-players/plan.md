# Implementation Plan: 得点入力エリア拡大・プレイヤー上限10人対応

**Branch**: `007-layout-max-players` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-layout-max-players/spec.md`

## Summary

得点入力（PinInput）エリアを縦方向に拡大し、プレイヤー一覧（ScoreBoard）を4人以下では
スクロールなし・5人以上では一覧内スクロールで表示するレイアウト変更、およびプレイヤー
登録上限を6人から10人に引き上げる。

技術アプローチ: ScoreBoard エリアを `flex-none`（固定高さ）、PinInput エリアを
`flex-1 min-h-0`（残余スペース獲得）に変更してフレックス役割を逆転させる。
ScoreBoard ラッパーに `h-[272px]`（4行×68px）を設定し、5人以上では一覧内スクロール
を許容する。変更ファイルは3ファイルのみで、新規ライブラリ・コンポーネントなし。

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode 有効）
**Primary Dependencies**: React 19, TailwindCSS v4（`@tailwindcss/vite`）
**Storage**: N/A（ゲームロジック・型定義への変更なし）
**Testing**: Vitest（既存27件のユニットテストが引き続きパスすることを確認）
**Target Platform**: モバイル（iOS / Android）スマートフォン、PWA、最低画面高さ600px
**Project Type**: モバイルファースト PWA
**Performance Goals**: タッチ操作レスポンス 100ms 以内（既存目標を維持）
**Constraints**: 4人以下スクロールなし（FR-003）が上位制約。最低対応画面高さ 600px dvh
**Scale/Scope**: 2〜10人プレイヤー対応

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 評価 | 詳細 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | 変更は3ファイル・CSS クラス変更のみ。新規コンポーネント・ライブラリなし。JS 動的計算なし |
| II. テストファースト | ✅ PASS | 純粋な CSS クラス変更と UI バリデーション値変更のため新規テスト不要。既存27件継続確認 |
| III. モバイルファースト | ✅ PASS | 変更はモバイルレイアウト最適化そのもの。md: デスクトップレイアウトを完全維持 |
| 品質ゲート | ✅ PASS | TypeScript コンパイルエラーなし・既存テストパスを SC-006 で確認 |

## Project Structure

### Documentation (this feature)

```text
specs/007-layout-max-players/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 output (N/A: 型定義変更なし)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (変更対象ファイル)

```text
src/
└── components/
    ├── GameScreen/
    │   ├── index.tsx        # [US1+US2] ScoreBoard/PinInput フレックス役割逆転
    │   └── PinInput.tsx     # [US1] 高さ充填・グリッドボタン拡大
    └── SetupScreen.tsx      # [US3] プレイヤー上限 6 → 10
```

**Structure Decision**: 既存の単一プロジェクト構造を維持。変更は既存3ファイルのみ。

## Detailed Change Specification

### 変更1: `src/components/GameScreen/index.tsx`（US1+US2）

**概要**: ScoreBoard エリアと PinInput エリアのフレックス役割を逆転させる。

**変更前後**:

```diff
-  {/* Top / Left: header + ScoreBoard */}
-  <div className="flex-1 min-h-0 flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto">
+  <div className="flex-none flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto">
     <header ...>...</header>
-    <div className="flex-1 min-h-0 overflow-y-auto">
+    <div className="h-[272px] overflow-y-auto md:h-auto md:flex-1 md:min-h-0">
       <ScoreBoard ... />
     </div>
   </div>

   {/* Bottom / Right: PinInput */}
-  <div className="shrink-0 flex flex-col bg-white ...">
+  <div className="flex-1 min-h-0 flex flex-col bg-white ...">
     <PinInput ... />
   </div>
```

**根拠**:
- `flex-none` (ScoreBoard エリア): 自然高さ（header ~56px + wrapper 272px = 約 328px）で固定
- `h-[272px]` (ScoreBoard ラッパー): 4行×68px の固定高さ。4人以下: コンテンツ≤272px でスクロールなし。5人以上: コンテンツ>272px でスクロール発生
- `flex-1 min-h-0` (PinInput エリア): 残余スペースを獲得してボタン拡大
- `md:flex-1 md:min-h-0 md:overflow-y-auto` / `md:h-auto md:flex-1 md:min-h-0`: デスクトップ横並びレイアウト完全維持

### 変更2: `src/components/GameScreen/PinInput.tsx`（US1）

**概要**: PinInput が親から高さを受け取り、グリッドが残余スペースを充填するよう変更。

**変更前後**:

```diff
-  <div className="flex flex-col gap-2 p-3">
+  <div className="flex flex-col gap-2 p-3 h-full">
     <p ...>{t.game.howMany}</p>
     <button ... className="shrink-0 w-full py-2 rounded-2xl ...">0</button>
-    <div className="grid grid-cols-4 grid-rows-3 gap-2">
+    <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2">
       {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
         <button
           key={n}
           onClick={() => onSubmit(n)}
-          className="min-h-[44px] py-2 rounded-xl bg-green-500 ..."
+          className="min-h-[44px] rounded-xl bg-green-500 ..."
         >
```

**根拠**:
- `h-full`: 親（PinInput エリア）が `flex-1 min-h-0` になるため、`h-full` で親高さを利用可能
- `flex-1 min-h-0` (グリッド): `minmax(0, 1fr)` で利用可能スペースを3行均等配分
- `py-2` 削除: グリッドセルがボタン高さを決定するため縦パディング不要（`min-h-[44px]` で最小タッチターゲット保証）

### 変更3: `src/components/SetupScreen.tsx`（US3）

**概要**: プレイヤー追加制限を6人から10人に変更。

**変更前後**:

```diff
-  if (players.length >= 6) return
+  if (players.length >= 10) return
```

**変更箇所**: 1行のみ（行番号 ~14 付近の `handleAddPlayer` 関数内）

## Height Budget Verification

| 端末 | dvh | ScoreBoard 固定 | PinInput 獲得 | 固定要素 | グリッド高さ | ボタン高さ/行 |
|------|-----|-----------------|---------------|----------|-------------|--------------|
| iPhone SE (最小) | ~619px | ~328px | 291px | ~112px | ~179px | ~54px (+12%) |
| 一般スマートフォン | ~740px | ~328px | 412px | ~112px | ~300px | ~95px (+98%) |
| 現状 (006後) | any | flex-1 | ~272px 固定 | ~112px | ~160px | ~48px |

*固定要素 = p-3×2(24px) + label(24px) + gap-2×2(16px) + button-0(~48px) = 112px*

**FR-003 検証（4人以下スクロールなし）**:
- 行高さ: py-2(16px) + stacked[text-2xl(32px) + text-sm(20px)] = 68px
- 4行 × 68px = 272px = `h-[272px]` → スクロールなし ✓

## Complexity Tracking

> 本機能は Constitution の複雑さ原則に違反しない。Tracking 不要。

## Implementation Notes

- `grid-rows-3` はデフォルトで `grid-auto-rows: minmax(0, 1fr)` を使用するため、`flex-1 min-h-0` を付与したグリッドが3行均等分割される
- `md:flex-row` のデスクトップレイアウトでは ScoreBoard エリアが横方向 flex-1 となるため、`md:flex-1` で上書きしてデスクトップ動作を完全維持
- `h-full` は親が明示的な高さを持つ場合のみ有効。`flex-1 min-h-0` の親はブラウザが高さを計算するため `h-full` が有効に機能する
