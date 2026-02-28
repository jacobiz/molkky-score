# Contract: シェアテキスト仕様

**FR-024 準拠** | 形式: UTF-8 プレーンテキスト

---

## フォーマット

```
🎯 Mölkky結果
{順位}位 {名前} {スコア}pt{勝者マーク}
...
({総ターン数}ターン)
```

- 勝者マーク: ` 🏆`（勝者のみ付加）
- 脱落プレイヤー: スコアの代わりに `脱落`（言語設定による）
- 順位: 最終スコア降順。脱落プレイヤーは最下位
- 同スコアは投球順（プレイヤー番号）で決定

---

## 例

```
🎯 Mölkky結果
1位 Alice 50pt 🏆
2位 Bob 32pt
3位 Carol 脱落
(18ターン)
```

---

## 英語モード

```
🎯 Mölkky Results
1st Alice 50pt 🏆
2nd Bob 32pt
3rd Carol eliminated
(18 turns)
```

順位の接尾辞: 1st / 2nd / 3rd / 4th〜（4位以降は th）

---

## 実装メモ

- `navigator.share({ text })` で共有
- `navigator.share` が未定義の場合は `navigator.clipboard.writeText(text)` にフォールバック
- フォールバック後に「クリップボードにコピーしました」トーストを表示
