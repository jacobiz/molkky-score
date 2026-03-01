# Implementation Plan: Shuffle Player Order

**Branch**: `005-shuffle-order` | **Date**: 2026-03-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-shuffle-order/spec.md`

## Summary

プレイヤー登録画面（SetupScreen）のプレイヤーリストヘッダ行に「🔀 シャッフル」ボタンを追加する。タップすると Fisher-Yates アルゴリズムでプレイヤー配列をランダムに並び替える。データモデル・reducer に変更なし。変更ファイルは `SetupScreen.tsx` と i18n の2ファイルのみ。

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode 有効）
**Primary Dependencies**: React 19, TailwindCSS v4（追加ライブラリなし）
**Storage**: N/A
**Testing**: Vitest（UI コンポーネント変更のみのため新規テスト不要）
**Target Platform**: モバイルブラウザ（iOS / Android）、PWA
**Project Type**: モバイルファースト Web アプリ
**Performance Goals**: ボタンタップから順番更新まで 100ms 以内（SC-001）
**Constraints**: 外部ライブラリ追加なし（Constitution 原則 I）
**Scale/Scope**: プレイヤー最大6人（Fisher-Yates の計算量は無視できるレベル）

## Constitution Check

| 原則 | 判定 | 備考 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | 外部ライブラリなし。`Math.random()` のみ使用。変更ファイル3本のみ |
| II. テストファースト | ✅ PASS | UI コンポーネント変更 → テストは任意（MAY）。新規テスト不要 |
| III. モバイルファースト | ✅ PASS | タッチ最適化ボタン（既存スタイルに準拠） |

**Constitution Gate**: PASS — 全原則に適合。Complexity Tracking 不要。

## Project Structure

### Documentation (this feature)

```text
specs/005-shuffle-order/
├── plan.md              ← このファイル
├── research.md          ← Phase 0 完了
├── data-model.md        ← Phase 1 完了
├── contracts/
│   └── i18n-keys.md     ← Phase 1 完了
└── tasks.md             ← /speckit.tasks で生成
```

### Source Code（変更対象のみ）

```text
src/
├── i18n/
│   ├── ja.ts            ← setup.shuffle キー追加
│   └── en.ts            ← setup.shuffle キー追加
└── components/
    └── SetupScreen.tsx  ← handleShuffle 関数 + シャッフルボタン追加
```

## Implementation Design

### SetupScreen への変更

**handleShuffle 関数**（コンポーネント内に追加）:
```typescript
function handleShuffle() {
  setPlayers(prev => {
    const result = [...prev]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  })
}
```

**ボタン配置**（`orderHint` の行を flex 化）:
```tsx
{/* Player list header: hint + shuffle */}
<div className="flex items-center justify-between px-1">
  <p className="text-xs text-gray-500">{t.setup.orderHint}</p>
  <button
    onClick={handleShuffle}
    className="text-sm px-3 py-1 rounded-lg border border-gray-200 text-gray-600 bg-white active:bg-gray-100"
  >
    🔀 {t.setup.shuffle}
  </button>
</div>
```

### 表示条件

- `players.length >= 2` のときのみ表示（FR-001 / FR-005）
- 既存の `players.length > 0` ブロック内に収まるため、0人・1人時は自動的に非表示

## Complexity Tracking

> Constitution 違反なし — 記入不要
