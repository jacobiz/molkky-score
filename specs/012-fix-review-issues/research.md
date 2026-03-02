# Research: コードレビュー残課題の対処

**Feature**: 012-fix-review-issues
**Date**: 2026-03-02

---

## 1. React フォーカストラップの実装パターン（外部ライブラリなし）

**Decision**: `useEffect` + `useRef` + `querySelectorAll('button')` による自前フォーカストラップ

**Rationale**:
- Constitution I「追加ライブラリ最小限」に準拠するため focus-trap-react 等の外部ライブラリは使わない
- ConfirmDialog のフォーカス対象はキャンセルボタンと確認ボタンの2つのみで、動的変化がない固定構成
- `querySelectorAll('button')` による取得で十分（input や a タグは存在しない）
- `keydown` イベントを `document` にアタッチし、クリーンアップ関数で確実に解除する

**Implementation pattern**:
```tsx
const dialogRef = useRef<HTMLDivElement>(null)
const cancelRef = useRef<HTMLButtonElement>(null)

useEffect(() => {
  cancelRef.current?.focus()  // 開いた瞬間にキャンセルボタンへフォーカス

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') { onCancel(); return }
    if (e.key !== 'Tab') return

    const buttons = dialogRef.current?.querySelectorAll<HTMLElement>('button') ?? []
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (!first || !last) return

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [onCancel])
```

**Alternatives considered**:
- `focus-trap-react` ライブラリ: Constitution I 違反（外部依存追加）のため却下
- `inert` 属性による背景の無効化: ブラウザサポートは広いが、ダイアログ内フォーカスのみの要件には過剰

---

## 2. i18n lookup オブジェクトパターン

**Decision**: `Record<Language, Messages>` の定数マップで三項演算子を置き換える

**Rationale**:
- TypeScript が `Language` 型のすべての値に対する網羅性を保証する
- 新言語追加時はマップに1エントリ追加するだけで完結
- ランタイムコストゼロ（オブジェクト参照はモジュールロード時に解決）

**Implementation pattern**:
```ts
import type { Messages } from '../i18n/ja'

const messages: Record<Language, Messages> = { ja, en, fi }

export function useTranslation() {
  const { state } = useGame()
  return { t: messages[state.settings.language] }
}
```

**Alternatives considered**:
- 三項演算子のまま維持: 将来の言語追加で読みにくさが増す、spec FR-011 要件に反する

---

## 3. Vitest + jsdom での localStorage テストパターン

**Decision**: `vi.stubGlobal` / `localStorage.clear()` を各テスト前に実行してクリーンな状態を保証する

**Rationale**:
- Vitest の `jsdom` 環境では `localStorage` はデフォルトで利用可能
- `beforeEach(() => localStorage.clear())` でテスト間の状態漏れを防止
- JSON.parse のエラーは `vi.spyOn(JSON, 'parse').mockImplementation(() => { throw new Error() })` で注入可能

**Test structure for storage.ts**:
```ts
beforeEach(() => localStorage.clear())

test('バージョン不一致は null を返す', () => {
  localStorage.setItem('molkky-score-v2', JSON.stringify({ version: 1 }))
  expect(loadState()).toBeNull()
  expect(localStorage.getItem('molkky-score-v2')).toBeNull()  // 削除確認
})

test('不正な型のデータは null を返す', () => {
  localStorage.setItem('molkky-score-v2', JSON.stringify({ version: 2, settings: 'INVALID' }))
  expect(loadState()).toBeNull()
})
```

**Alternatives considered**:
- `vi.stubGlobal('localStorage', ...)` で完全モック: `jsdom` のネイティブ実装が十分なため不要

---

## 4. PinInput / MolkkoutInput 共通化の設計

**Decision**: `variant: 'game' | 'molkkout'` prop を持つ `NumberInput` コンポーネントを `src/components/ui/` に作成

**Difference analysis** (PinInput vs MolkkoutInput):

| 要素 | PinInput | MolkkoutInput |
|------|----------|---------------|
| コンテナ padding | `p-3` | `p-4` |
| コンテナ gap | `gap-2` | `gap-3` |
| 0ボタン padding | `py-2` | `py-4` |
| テキストサイズ | `text-2xl` | `text-xl` |
| グリッド maxHeight | なし | `max-h-[280px]` |
| グリッドボタン padding | なし | `py-4` |

`variant` prop でこれらの差異をすべて制御できる。

**Alternatives considered**:
- 個別 className props: 差分が6項目あり prop 数が多くなりすぎる
- 完全分離のまま維持: DRY 違反が続き、FR-010 要件に反する

---

## 5. loadState の実行時バリデーション深さ

**Decision**: `version` フィールドの一致 + `settings` が object かどうかのみ検証する（最小バリデーション）

**Rationale**:
- FR-012 で「最低限の型チェック」と明示されている
- `game` / `molkkoutGame` オブジェクトの深いバリデーションはコスト対効果が低い（スキーマバージョンで管理済み）
- 既存の `version !== SCHEMA_VERSION` チェックが主要な破損ケースをカバー
- settings が `null` や文字列の場合のクラッシュを防ぐために `settings` の型チェックを追加

**Validation function**:
```ts
function isValidStoredState(value: unknown): value is StoredState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (v.version !== SCHEMA_VERSION) return false
  if (typeof v.settings !== 'object' || v.settings === null) return false
  return true
}
```

**Alternatives considered**:
- Zod などのスキーマバリデーション: 外部依存追加になり Constitution I 違反
- 完全深部バリデーション: YAGNI; スキーマバージョン管理で十分
