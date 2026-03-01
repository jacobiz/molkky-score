# Research: Shuffle Player Order

**Date**: 2026-03-01 | **Branch**: `005-shuffle-order`

## 1. シャッフルアルゴリズム

**Decision**: Fisher-Yates (Knuth) shuffle — インプレース実装

**Rationale**:
- 全並び替えが等確率で生成される（偏りなし）
- O(n) 時間 / O(1) 追加空間
- `Math.random()` で実装可能（外部ライブラリ不要）
- `players` は最大6要素の配列なのでパフォーマンス問題ゼロ

**Alternatives considered**:
- `players.sort(() => Math.random() - 0.5)` → 分布が不均一（rejected）
- `crypto.getRandomValues()` → 暗号品質の乱数だが、ゲームUI用途では過剰（rejected、YAGNI）

**Implementation pattern**:
```
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
```

---

## 2. ボタン配置

**Decision**: プレイヤーリストのヘッダ行（`orderHint` と同じ行）右端に小さなボタンを配置

**Rationale**:
- 「順番を変える」という操作の文脈に近い位置
- `orderHint` テキストの行を `flex justify-between` にするだけで追加レイアウト不要
- 上へ／下へボタンと同じセクションに収まり、機能的なまとまりが生まれる

**Alternatives considered**:
- フッターのゲーム開始ボタン横に配置 → 「ゲーム開始」と並ぶと操作の文脈が異なる（rejected）
- プレイヤーリスト下部に全幅ボタン → 過大な存在感（rejected）

---

## 3. 実装スコープ確認

**Decision**: `SetupScreen.tsx` のローカル state で完結、gameReducer への変更不要

**Rationale**:
- `players: string[]` は `SetupScreen` のローカル state であり、ゲーム開始時に `START_GAME` action 経由で渡される
- シャッフルは画面ローカルの操作（ゲーム開始前の UI 操作）なので reducer 変更不要
- `START_GAME` はすでに `playerNames: string[]` を受け取る設計

---

## 4. i18n キー

**Decision**: `setup.shuffle` キーを追加

**Rationale**:
- 既存の `setup.*` キー群と一貫した構造
- ja: `"🔀 シャッフル"` / en: `"🔀 Shuffle"`（絵文字込みで直感的）

**Alternatives considered**:
- 絵文字をコンポーネント側に書く → 004 の経験から、アイコンは i18n 文字列に含める方針と整合しないため、ここでは絵文字は JSX 側に書く（i18n はラベルテキストのみ）
- 実際の判断: 絵文字 `🔀` は JSX 内に直接記述し、i18n キーはラベル文字列のみ（`"シャッフル"` / `"Shuffle"`）とする

---

## 5. Constitution 適合確認

| 原則 | 判定 | 理由 |
|------|------|------|
| I. シンプルさ優先 | ✅ | 外部ライブラリなし、3行の関数追加のみ |
| II. テストファースト | ✅ | UI コンポーネント変更のみ → テストは任意（MAY） |
| III. モバイルファースト | ✅ | タッチ操作最適化済みのボタンを追加 |
