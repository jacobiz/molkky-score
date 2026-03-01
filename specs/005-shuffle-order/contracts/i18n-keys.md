# Contract: i18n 追加キー（005-shuffle-order）

**実装ファイル**: `src/i18n/ja.ts`, `src/i18n/en.ts`

既存の `setup` セクションに以下を追加する。

---

## 追加キー

```typescript
// setup セクションへの追加
setup: {
  // ... 既存キー ...
  shuffle: string
  // ja: "シャッフル"  en: "Shuffle"
}
```

---

## 実装パターン

```typescript
// ja.ts
setup: {
  shuffle: 'シャッフル',
}

// en.ts
setup: {
  shuffle: 'Shuffle',
}
```

---

## 使用例

```typescript
// SetupScreen.tsx
<button onClick={handleShuffle}>
  🔀 {t.setup.shuffle}
</button>
```
