# 四柱推命エンジン / Webアプリ

提供された万年暦・鑑定済み命式に合わせることを優先した、四柱推命の計算エンジンと公開用Webアプリです。

## セットアップ

```powershell
npm.cmd install
npm.cmd run test:coverage
```

Webアプリを起動する場合:

```powershell
npm.cmd run dev
```

公開用ビルド:

```powershell
npm.cmd run build:web
```

## Google Maps APIキー

住所検索を使う場合は `.env.local` にブラウザ用APIキーを設定します。

```text
VITE_GOOGLE_MAPS_API_KEY=your_browser_key
```

公開時は必ず以下を設定してください。

- HTTPリファラ制限
- 使用量上限
- 課金設定
- 不要APIの無効化

住所検索時は、入力された住所文字列がGoogleへ送信されます。APIキー未設定時でも、経度を手入力すれば命式計算はできます。

## プライバシー

Webアプリは入力された生年月日・出生時刻・出生地をサーバーへ保存しません。履歴は利用者のブラウザ内 `localStorage` にのみ保存されます。

実名・鑑定済み命式・画像パスを含む検証データは公開しません。

- `data/reference-cases.local.json`: ローカル専用。git管理外。
- `data/reference-cases.json`: ローカル/一時検証用。git管理外。
- `data/reference-cases.example.json`: 公開用の匿名サンプル。

## CLI

```powershell
npm.cmd run chart -- 2000-05-08 15:54 male 133.93
```

経度補正を使わない場合:

```powershell
npm.cmd run chart -- 1971-07-01 05:13 女性 135 --no-correction
```
