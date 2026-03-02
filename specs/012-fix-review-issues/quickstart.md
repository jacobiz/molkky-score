# Quickstart: 012-fix-review-issues 実装ガイド

## 前提

```bash
git checkout 012-fix-review-issues
npm test  # 27件全パスを確認
```

## 実装順序（依存関係順）

### Step 1: i18n キー追加（全ステップの前提）

**対象**: `src/i18n/ja.ts`, `src/i18n/en.ts`, `src/i18n/fi.ts`

`ja.ts` に `setup.moveUp/Down/removePlayer`, `molkkout.errorRequiredFields`, `licenses.*` を追加。
`en.ts` / `fi.ts` は `Messages` 型が自動でコンパイルエラーを出すため、それに従って追加。

```bash
npm run build  # TypeScript エラーがなければ Step 1 完了
```

---

### Step 2: `src/utils/i18n.ts` — lookup object 化

三項演算子を `Record<Language, Messages>` マップに置き換える（research.md 参照）。

```bash
npm test  # 既存テスト通過を確認
```

---

### Step 3: 簡単な単発修正（独立・順不同）

以下は Step 1 完了後に並行して実施可能:

- `src/components/SetupScreen.tsx`:
  - `maxLength={13}` → `maxLength={12}`
  - aria-label 3箇所を `t.setup.moveUp/Down/removePlayer` に変更
  - `handleMoveUp` / `handleMoveDown` を `handleMove(index, direction: -1|1)` に統合

- `src/components/MolkkoutSetupScreen.tsx`:
  - ハードコード日本語エラーを `t.molkkout.errorRequiredFields` に変更

- `src/components/LicensesScreen.tsx`:
  - `useGame()` → `useTranslation()` へ切り替え
  - `isJa` 変数を削除し、すべてのテキストを `t.licenses.*` キー経由に変更

```bash
npm test && npm run build
```

---

### Step 4: `src/utils/storage.ts` — runtime validation

`isValidStoredState` type guard を追加し、`loadState` でキャストの代わりに使用（research.md 参照）。

**TDD手順**（Constitution II 準拠）:
1. `tests/unit/storage.test.ts` を作成しテストを書く（赤）
2. `isValidStoredState` を実装してテストを通す（緑）

```bash
npm test  # storage テスト含めて通過確認
```

---

### Step 5: `src/components/ui/NumberInput.tsx` — 共通コンポーネント作成

`variant` prop で PinInput / MolkkoutInput のスタイルを制御する新コンポーネントを作成。

その後 `PinInput.tsx` / `MolkkoutInput.tsx` を薄いラッパーに変更:

```tsx
// PinInput.tsx 変更後
export function PinInput({ onSubmit }: PinInputProps) {
  return <NumberInput onSubmit={onSubmit} variant="game" />
}

// MolkkoutInput.tsx 変更後
export function MolkkoutInput({ onSubmit }: MolkkoutInputProps) {
  return <NumberInput onSubmit={onSubmit} variant="molkkout" />
}
```

```bash
npm run build  # ビルド確認（目視でゲーム画面 / Mölkkout 画面を確認）
```

---

### Step 6: `src/components/ui/ConfirmDialog.tsx` — アクセシビリティ強化

`role="dialog"`, `aria-modal`, `aria-labelledby`, フォーカストラップ, Escape キー, 背景クリックを実装（research.md 参照）。

**実装チェックリスト**:
- [ ] ダイアログ外コンテナに `onClick={onCancel}` + バブリング防止
- [ ] 内コンテナに `role="dialog"` `aria-modal="true"` `aria-labelledby="confirm-msg"`
- [ ] メッセージ `<p>` に `id="confirm-msg"`
- [ ] キャンセルボタンに `ref={cancelRef}`
- [ ] `useEffect` でフォーカストラップ + Escape キー + `cancelRef.current?.focus()`

```bash
npm test && npm run build
```

---

### Step 7: テスト追加（Constitution II 準拠）

**TDD手順**（各ファイルで先にテスト記述、赤確認後に実装変更）:

#### `tests/unit/molkkoutReducer.test.ts`
- チームローテーション（チーム0→チーム1→チーム0）
- overtime 遷移（全チーム同点 → status: 'overtime'）
- 連続 overtime（overtime → overtime → winner）
- 単独最高スコアチームが winner になる

#### `tests/unit/share.test.ts`
- 全員 active の場合のランキング
- 脱落プレイヤーが末尾に表示される
- winner に 🏆 が付く
- `totalTurns` の置換が正しい

```bash
npm test  # 40件以上通過確認
```

---

## 完了確認

```bash
npm test    # 全テスト通過（40件以上）
npm run build  # TypeScript strict エラーなし
```

手動確認:
- Finnish / English 設定でライセンス画面を開く → Finnish テキスト表示
- SetupScreen でプレイヤー名入力: 12文字で制限される
- ConfirmDialog: キーボードで Tab → キャンセル↔確認のみ、Escape でキャンセル
