# Notion管理OS設計 v1

## 目的

四柱推命Webアプリを「計算ツール」から「鑑定業務の管理OS」に拡張する。

初期ゴールは、Webアプリで出した命式結果をNotionへ保存し、鑑定対象・命式・鑑定ログ・検証メモを継続管理できる状態にすること。

## 方針

- 公開WebアプリのブラウザにNotion APIトークンを置かない。
- Notion保存は `ブラウザ -> Render API -> Notion API` の経路にする。
- 実名や個人情報はNotion側に保存し、GitHub・公開ビルド・検証JSONには入れない。
- 最初は鑑定文生成よりも、保存・検索・再検証・ステータス管理を優先する。

## データベース構成

### 1. 鑑定対象DB

顧客または鑑定対象者を管理する中心DB。

| プロパティ | 型 | 内容 |
|---|---|---|
| 名前 | Title | 表示名または管理名 |
| 匿名ID | Text | 公開・検証用に使うID |
| 性別 | Select | 男性 / 女性 / 不明 |
| 生年月日 | Date | 出生日 |
| 出生時刻 | Text | `15:54` / 時刻不明 |
| 出生地 | Text | 住所または地名 |
| 経度 | Number | 計算に使った経度 |
| 経度補正 | Checkbox | 使用有無 |
| 鑑定ステータス | Select | 未着手 / 計算済み / 鑑定中 / 完了 / 要再確認 |
| 最新命式 | Relation | 命式DB |
| 最新鑑定日 | Date | 最後に鑑定した日 |
| メモ | Text | 管理用メモ |

### 2. 命式DB

Webアプリの計算結果を1件ずつ保存するDB。

| プロパティ | 型 | 内容 |
|---|---|---|
| 命式名 | Title | `名前 YYYY-MM-DD` など |
| 鑑定対象 | Relation | 鑑定対象DB |
| 入力JSON | Code / Text | 計算入力 |
| 結果JSON | Code / Text | 計算結果の保存 |
| 年柱 | Text | 例: 庚辰 |
| 月柱 | Text | 例: 辛巳 |
| 日柱 | Text | 例: 丙寅 |
| 時柱 | Text | 例: 丙申 / 時刻不明 |
| 空亡 | Text | 例: 戌亥 |
| 大運開始 | Text | 例: 順行 9歳 |
| パワー | Number | 例: 2 |
| パワー分類 | Select | 身強 / 身弱 / 中庸 |
| 守護神 | Text | 例: 乙・庚 |
| 特殊星数 | Number | 該当数 |
| 検証状態 | Select | 未検証 / 一致 / ズレあり / override / 転記確認 |
| 作成日時 | Created time | 自動 |
| 更新日時 | Last edited time | 自動 |

### 3. 鑑定ログDB

鑑定メモ、判断、追記履歴を保存するDB。

| プロパティ | 型 | 内容 |
|---|---|---|
| ログ名 | Title | 鑑定日・対象名 |
| 鑑定対象 | Relation | 鑑定対象DB |
| 命式 | Relation | 命式DB |
| 鑑定日 | Date | 実施日 |
| ステータス | Select | 下書き / 確認中 / 完了 / 要追記 |
| 主テーマ | Multi-select | 性格 / 仕事 / 恋愛 / 家族 / 健康 / 運勢 |
| 鑑定メモ | Text | 本文 |
| 次回確認 | Date | 後で見直す日 |
| 添付・参照 | Files & media / URL | 紙鑑定書・画像など |

### 4. 検証ログDB

紙鑑定書や講座資料とのズレを管理するDB。

| プロパティ | 型 | 内容 |
|---|---|---|
| 検証名 | Title | ケース名 |
| 命式 | Relation | 命式DB |
| 項目 | Select | 四柱 / 通変星 / 蔵干 / 十二運 / 大運 / パワー / 守護神 / 特殊星 |
| 計算結果 | Text | Webアプリ側 |
| 紙鑑定書 | Text | 正解側 |
| 判定 | Select | 一致 / 暦不足 / ルール差 / override / 転記確認 |
| 優先度 | Select | 高 / 中 / 低 |
| メモ | Text | 判断根拠 |

### 5. タスクDB

改善作業・未確認項目を管理するDB。

| プロパティ | 型 | 内容 |
|---|---|---|
| タスク名 | Title | 作業名 |
| 種別 | Select | 実装 / 検証 / 資料化 / UI / Notion |
| ステータス | Select | 未着手 / 進行中 / 完了 / 保留 |
| 優先度 | Select | 高 / 中 / 低 |
| 関連命式 | Relation | 命式DB |
| 関連検証 | Relation | 検証ログDB |
| 期限 | Date | 任意 |
| メモ | Text | 詳細 |

## Notionページテンプレート

### 鑑定対象ページ

- 基本情報
- 最新命式サマリ
- 鑑定ステータス
- 関連命式一覧
- 鑑定ログ一覧
- 検証ログ一覧
- 次に見ること

### 命式ページ

- 入力情報
- 命式表
- 空亡・大運・パワー・守護神
- 特殊星
- 大運表
- 流年運
- 紙鑑定書との差分
- 鑑定メモ

## WebアプリからNotionへ保存する流れ

1. Webアプリで命式を計算する。
2. `Notionに保存` ボタンを押す。
3. ブラウザがRender APIへ計算結果を送る。
4. Render APIがNotion APIトークンを使ってNotion DBへ保存する。
5. NotionページURLをWebアプリに返す。
6. Webアプリに `Notionで開く` を表示する。

## Render API案

### `POST /api/notion/charts`

命式をNotionへ保存する。

リクエスト:

```json
{
  "client": {
    "displayName": "山田太郎",
    "anonymousId": "case-001"
  },
  "input": {
    "birthDate": "2000-05-08",
    "birthTime": "15:54",
    "gender": "male",
    "birthPlace": {
      "label": "岡山県岡山市南区千鳥町",
      "longitude": 133.93
    },
    "timezone": "Asia/Tokyo",
    "useLocationCorrection": true
  },
  "result": {
    "pillars": {},
    "voidBranches": "戌亥",
    "luckStart": {},
    "luckPillars": [],
    "annualFortunes": [],
    "powerScore": {},
    "guardianDeity": {},
    "specialStars": {}
  }
}
```

レスポンス:

```json
{
  "ok": true,
  "notionPageUrl": "https://www.notion.so/..."
}
```

## 環境変数

Render側に置く。

```env
NOTION_TOKEN=secret_xxx
NOTION_CLIENTS_DATABASE_ID=xxx
NOTION_CHARTS_DATABASE_ID=xxx
NOTION_READINGS_DATABASE_ID=xxx
NOTION_VALIDATIONS_DATABASE_ID=xxx
NOTION_TASKS_DATABASE_ID=xxx
```

## MVP範囲

最初に作る範囲:

1. 鑑定対象DB
2. 命式DB
3. Webアプリの `Notionに保存` ボタン
4. Render API `POST /api/notion/charts`
5. 保存後にNotionページURLを表示

後回し:

- 鑑定ログDBの自動生成
- 検証ログDBの自動分類
- タスクDB連携
- Notionページ内の高度なブロック整形
- 鑑定文生成

## セキュリティ

- Notion APIトークンはブラウザに出さない。
- 実名・住所・鑑定メモはGitHubに入れない。
- 公開サイトのlocalStorageには最小限の履歴だけを保存する。
- Notion保存時はユーザーに保存内容を明示する。
- 将来的に他人も使う場合は、認証を追加する。

## 次の実装ステップ

1. Notion側に `鑑定対象DB` と `命式DB` を作る。
2. DB IDを取得する。
3. RenderにNotion用環境変数を追加する。
4. APIサーバーを追加する。
5. Webアプリに `Notionに保存` ボタンを追加する。
6. 1件保存してNotionページの見え方を確認する。
