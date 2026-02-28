# Contract: i18n 文字列キー

**対応言語**: 日本語（`ja`）・英語（`en`）
**実装ファイル**: `src/i18n/ja.ts`, `src/i18n/en.ts`

---

## キー一覧

```typescript
interface Messages {
  // ─ ホーム画面 ─
  home: {
    title: string            // "Mölkky スコア"
    newGame: string          // "新しいゲームを始める"
    resumeGame: string       // "ゲームを再開"
    overwriteConfirm: string // "進行中のゲームが失われます。続けますか？"
    confirmYes: string       // "続ける"
    confirmNo: string        // "キャンセル"
  }

  // ─ セットアップ画面 ─
  setup: {
    title: string            // "プレイヤー設定"
    namePlaceholder: string  // "プレイヤー名（最大10文字）"
    addPlayer: string        // "追加"
    startGame: string        // "ゲーム開始"
    errorMinPlayers: string  // "2人以上のプレイヤーが必要です"
    errorDuplicate: string   // "同じ名前はすでに登録されています"
    errorMaxLength: string   // "プレイヤー名は10文字以内で入力してください"
    orderHint: string        // "ボタンで投球順を変更"
  }

  // ─ ゲーム画面 ─
  game: {
    currentTurn: string      // "{name} のターン"
    score: string            // "スコア"
    remaining: string        // "残り"
    misses: string           // "ミス"
    eliminated: string       // "脱落"
    undo: string             // "やり直し"
    howMany: string          // "何本倒した？"
    whichPin: string         // "どのピン？"
    bustMessage: string      // "バースト！25点にリセット"
    eliminatedMessage: string // "{name} が脱落しました"
    winnerMessage: string    // "{name} の勝利！"
  }

  // ─ 結果画面 ─
  result: {
    title: string            // "ゲーム終了"
    winner: string           // "優勝: {name}"
    totalTurns: string       // "{n} ターン"
    playAgain: string        // "もう一度プレイ"
    newGame: string          // "新しいゲーム"
    share: string            // "結果をシェア"
    sharePrefix: string      // "🎯 Mölkky結果"
    eliminated: string       // "脱落"
    turns: string            // "ターン"
    rankSuffix: (n: number) => string  // "位"（ja）/ ordinal（en）
  }

  // ─ Mölkkout ─
  molkkout: {
    title: string            // "Mölkkout（タイブレーカー）"
    pinSetupGuide: string    // "ピンを以下の順に並べてください: 6-4-12-10-8"
    start: string            // "開始"
    teamTurn: string         // "{team} のターン（{player}）"
    totalScore: string       // "合計: {score}pt"
    winner: string           // "{team} の勝利！"
    overtime: string         // "同点！延長戦"
  }

  // ─ 共通 ─
  common: {
    ok: string               // "OK"
    cancel: string           // "キャンセル"
    copied: string           // "クリップボードにコピーしました"
    language: string         // "言語"
  }
}
```

---

## 実装パターン

```typescript
// src/utils/i18n.ts
export function useTranslation() {
  const { settings } = useGame()
  const messages = settings.language === 'en' ? en : ja
  return { t: messages }
}

// 使用例
const { t } = useTranslation()
<button>{t.home.newGame}</button>
```

プレースホルダー（`{name}`, `{n}` 等）は呼び出し側で文字列置換する：
```typescript
t.game.currentTurn.replace('{name}', player.name)
```
