# Quickstart: URLベースの言語ルーティング実装ガイド

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/utils/i18n.ts` | `getLangFromUrl()` 追加 |
| `src/context/GameContext.tsx` | 初期化時のURL参照 + 言語変化時のURL更新 |
| `index.html` | hreflang タグの href を `?lang=XX` 付き URL に更新 |
| `tests/unit/i18n.test.ts` | `getLangFromUrl()` のユニットテスト追加 |

## ステップ 1: `getLangFromUrl()` の追加（`src/utils/i18n.ts`）

URL から有効な言語コードを取得する。無効・欠落の場合は `null` を返す。

```typescript
export function getLangFromUrl(): Language | null {
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang')
  if (lang === 'ja' || lang === 'en' || lang === 'fi') return lang
  return null
}
```

## ステップ 2: 初期化ロジックの更新（`src/context/GameContext.tsx`）

`useReducer` の initializer で URL パラメータを優先する。

```typescript
// 変更前
const saved = loadState()
if (!saved) return { ...init, settings: { language: detectLocale() } }
return { ...init, ...saved }

// 変更後
const saved = loadState()
const urlLang = getLangFromUrl()
if (!saved) return { ...init, settings: { language: urlLang ?? detectLocale() } }
return { ...init, settings: { ...saved.settings, language: urlLang ?? saved.settings.language } }
```

## ステップ 3: 言語変化時の URL 更新（`src/context/GameContext.tsx`）

言語が変わるたびに URL を `history.replaceState` で更新する。

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  if (state.settings.language === 'ja') {
    params.delete('lang')
  } else {
    params.set('lang', state.settings.language)
  }
  const newSearch = params.toString()
  const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
  history.replaceState(null, '', newUrl)
}, [state.settings.language])
```

## ステップ 4: index.html の hreflang 更新

```html
<!-- 変更前 -->
<link rel="alternate" hreflang="en" href="https://jacobiz.github.io/molkky-score/" />
<link rel="alternate" hreflang="fi" href="https://jacobiz.github.io/molkky-score/" />

<!-- 変更後 -->
<link rel="alternate" hreflang="en" href="https://jacobiz.github.io/molkky-score/?lang=en" />
<link rel="alternate" hreflang="fi" href="https://jacobiz.github.io/molkky-score/?lang=fi" />
```

## ステップ 5: ユニットテスト

`getLangFromUrl()` に対してユニットテストを追加する（`tests/unit/i18n.test.ts`）。

テストケース:
- `?lang=en` → `'en'` を返す
- `?lang=fi` → `'fi'` を返す
- `?lang=ja` → `'ja'` を返す
- `?lang=zh` → `null` を返す
- パラメータなし → `null` を返す
- `?lang=` → `null` を返す

## 動作確認

```bash
# 開発サーバー起動
npm run dev

# 以下 URL で動作確認
# http://localhost:5173/molkky-score/?lang=en  → 英語表示
# http://localhost:5173/molkky-score/?lang=fi  → フィンランド語表示
# 言語セレクターで切替 → アドレスバーの ?lang= が更新されること
# 日本語選択 → ?lang パラメータが消えること

# ユニットテスト
npm test
```
