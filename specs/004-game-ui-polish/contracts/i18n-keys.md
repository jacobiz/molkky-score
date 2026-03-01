# Contract: i18n 追加キー（004-game-ui-polish）

**実装ファイル**: `src/i18n/ja.ts`, `src/i18n/en.ts`

既存の `src/i18n/ja.ts` `Messages` 型に以下を追加する。

---

## 追加キー

```typescript
// game セクションへの追加
game: {
  // ... 既存キー ...
  throwCount: (n: number) => string
  // ja: "${n}投目"  en: "${ordinal(n)} throw"
}
```

## 更新キー（絵文字追加）

```typescript
game: {
  bustMessage: string
  // ja: "💥 バースト！25点にリセット"  en: "💥 Bust! Reset to 25"

  eliminatedMessage: string
  // ja: "❌ {name} が脱落しました"  en: "❌ {name} is eliminated"
}
```

---

## 実装パターン

```typescript
// ja.ts
game: {
  throwCount: (n: number) => `${n}投目`,
  bustMessage: '💥 バースト！25点にリセット',
  eliminatedMessage: '❌ {name} が脱落しました',
}

// en.ts
game: {
  throwCount: (n: number) => `${ordinal(n)} throw`,
  bustMessage: '💥 Bust! Reset to 25',
  eliminatedMessage: '❌ {name} is eliminated',
}
```

---

## 使用例

```typescript
// GameScreen/index.tsx
const throwCount = game.turnHistory
  .filter(t => t.playerId === currentPlayer.id).length + 1
<p>{t.game.throwCount(throwCount)}</p>
```
