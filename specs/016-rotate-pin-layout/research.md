# Research: Mölkkout ピン配置図の縦向き表示

**Feature**: 016-rotate-pin-layout
**Date**: 2026-03-06

## 調査サマリー

変更対象は `src/components/ui/PinSetupGuideModal.tsx` の `MolkkoutLayout` コンポーネント単体。
同ファイル内の `RegularLayout` が既に縦向き表示の実装パターンを持つため、
そのパターンを参考に最小限の変更で対応できる。

---

## Decision 1: ピン間の区切り記号

**Decision**: 省略（余白のみ）

**Rationale**: `RegularLayout` でも各行間に区切り記号は使用しておらず、余白（`gap`）のみで
行の分離を表現している。Mölkkout でも同じアプローチを採用することで視覚的一貫性が保たれ、
実装もシンプルになる。

**Alternatives considered**:
- 縦の `|` 記号: 「一直線」感は出るが既存スタイルと不一致
- 点（・）: 同上

---

## Decision 2: 投球ラインインジケーターのスタイル

**Decision**: `RegularLayout` と同一スタイル（`border-t-2 border-dashed border-gray-400` + `▽` マーク）を再利用

**Rationale**: 同一コンポーネント内に既存実装があり、コードの重複なく再利用可能。
両モード間でインジケーターの見た目が統一されることで、ユーザーの認知負荷が下がる。

**Alternatives considered**:
- 矢印＋テキストラベル: 新たなスタイル定義が必要、統一性が下がる
- テキスト中心: 視覚的な「ライン」感が薄くなる

---

## Decision 3: i18n `layoutCaption` の更新

**Decision**: `'配置図（左から）'` → `'配置図（スロワー側から）'`

**Rationale**: 縦向きになると「左から」という表現が不正確になる。`RegularLayout` の
`layoutCaption` と同じフレーズ「スロワー側から」に統一することで、両モードのキャプション
が同じ視点基準になる。対応する `en.ts` / `fi.ts` も同様に更新が必要。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/components/ui/PinSetupGuideModal.tsx` | `MolkkoutLayout` を縦向きに変更（`flex flex-col` + 破線インジケーター追加） |
| `src/i18n/ja.ts` | `pinGuide.molkkout.layoutCaption` を更新 |
| `src/i18n/en.ts` | 同上（英語版） |
| `src/i18n/fi.ts` | 同上（フィンランド語版） |

---

## 非影響範囲

- `RegularLayout`: 変更なし
- ゲームロジック・状態管理: 変更なし
- モーダルの開閉制御: 変更なし
- テスト: UI補助コンポーネントのため追加テスト不要（Constitution II に従い任意）
