# Data Model: URLベースの言語ルーティング

## 変更なし: 既存エンティティ

本機能は新しいデータエンティティを導入しない。永続データの変更もない。

### 既存の Language 型（変更なし）

```
Language = 'ja' | 'en' | 'fi'
```

### 既存の Settings 型（変更なし）

```
Settings {
  language: Language
}
```

### URL パラメータの定義（新規・非永続）

| パラメータ名 | 型 | 有効値 | 省略時の挙動 |
|---|---|---|---|
| `lang` | string | `'en'` / `'fi'` / `'ja'` | localStorage → ブラウザ言語検出 |

- `?lang=ja` は有効だが、日本語はデフォルトのため URL には付与しない（クリーン URL）
- 無効値（例: `?lang=zh`）は無視し、フォールバックロジックへ進む

## 言語解決の優先順位

```
URL ?lang パラメータ（有効値のみ）
  ↓ なし or 無効
localStorage の保存値
  ↓ なし
navigator.language によるブラウザ言語検出（既存 detectLocale() ロジック）
```
