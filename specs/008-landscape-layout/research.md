# Research: 横画面レイアウト最適化（タブレット対応）

**Feature**: 008-landscape-layout
**Date**: 2026-03-01

---

## Decision 1: PinInput 幅の決め方

**Decision**: `md:w-80`（320px 固定）を `md:w-2/5`（画面幅の40%）に変更する。

**Rationale**:
- 40% は常に 50% 上限（FR-002）を満たす
- 主要ターゲット端末（iPad 横画面: 1024px）で 410px → 現状比 +28%
- 1280px では 512px → 現状比 +60%
- `md:flex-none` を維持したまま `md:w-80` を `md:w-2/5` に置き換えるのみ（1クラス変更）
- Constitution I（シンプルさ優先）に適合

**幅計算**:

| 画面幅 | 現在 (w-80) | 変更後 (w-2/5) | 増加率 |
|--------|-------------|----------------|--------|
| 768px | 320px | 307px | -4%（許容範囲：768px 横画面は稀） |
| 1024px | 320px | 410px | +28% |
| 1180px | 320px | 472px | +48% |
| 1280px | 320px | 512px | +60% |
| 1920px | 320px | 768px | +140% |

768px での -4%（307px vs 320px）について:
- iPad mini 横画面は 1024px。768px 横画面は物理的に稀なユースケース
- ScoreBoard も残余スペース（461px）を確保できており表示崩れなし
- 許容範囲と判断（min-w-80 追加は2クラス変更となり不要な複雑さを導入）

**Alternatives considered**:
- `md:w-1/2`: 常に 50%（= "最大で画面の中央" を常に使用）。"もう少し" の表現と若干乖離、かつ ScoreBoard が 50% に縮小されナローになりすぎる可能性 → rejected
- `md:min-w-80 md:w-2/5`: 768px での -4% を防げるが 2クラス変更、実用上の差異が小さい → rejected
- `md:w-[clamp(320px,40vw,50vw)]`: 完璧な計算だが任意値クラス（Constitution I 違反傾向） → rejected
- `md:w-[40vw]`: w-2/5 と等価だが任意値クラス → rejected（標準クラス優先）

---

## Decision 2: 変更対象ファイル

**Decision**: `src/components/GameScreen/index.tsx` の 1箇所のみ変更。

**Rationale**:
- PinInput ラッパー（line 73）: `md:w-80` → `md:w-2/5`
- ScoreBoard エリアは `md:flex-1` のまま変更不要（残余 60% を自動取得）
- `PinInput.tsx` 自体は変更不要（親から幅が提供されるため）
- `SetupScreen.tsx`・`MolkkoutScreen/` は対象外（FR-004 / Assumptions）

---

## Decision 3: テスト方針

**Decision**: 新規ユニットテスト不要。既存 27件がパスすることで SC-005 を確認。

**Rationale**: 純粋な CSS クラス変更（1クラス）のため Constitution II に基づきテスト過剰。
目視確認（SC-001〜SC-004）が主な検証手段。

---

## Summary Table

| US | ファイル | 変更 |
|----|---------|------|
| US1 | `GameScreen/index.tsx` | `md:w-80` → `md:w-2/5` |
