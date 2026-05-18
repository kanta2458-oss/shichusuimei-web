# Notion DB作成手順

この手順は、四柱推命WebアプリからNotion管理OSへ保存するためのMVP構成です。

## 作るもの

最初に作るDBは2つです。

1. 鑑定対象DB
2. 命式DB

後続で、鑑定ログDB・検証ログDB・タスクDBを追加します。

## 1. 親ページを作る

Notionで新規ページを作成します。

ページ名:

```text
四柱推命 管理OS
```

## 2. 鑑定対象DBを作る

親ページ内でTable databaseを作成します。

DB名:

```text
鑑定対象DB
```

プロパティ:

| 名前 | 型 | 選択肢 |
|---|---|---|
| 名前 | Title | - |
| 匿名ID | Text | - |
| 性別 | Select | 男性, 女性, 不明 |
| 生年月日 | Date | - |
| 出生時刻 | Text | - |
| 出生地 | Text | - |
| 経度 | Number | - |
| 経度補正 | Checkbox | - |
| 鑑定ステータス | Select | 未着手, 計算済み, 鑑定中, 完了, 要再確認 |
| 最新鑑定日 | Date | - |
| メモ | Text | - |

命式DB作成後に追加するRelation:

| 名前 | 型 | 接続先 |
|---|---|---|
| 命式 | Relation | 命式DB |

## 3. 命式DBを作る

同じ親ページ内でTable databaseを作成します。

DB名:

```text
命式DB
```

プロパティ:

| 名前 | 型 | 選択肢 |
|---|---|---|
| 命式名 | Title | - |
| 入力JSON | Text | - |
| 結果JSON | Text | - |
| 年柱 | Text | - |
| 月柱 | Text | - |
| 日柱 | Text | - |
| 時柱 | Text | - |
| 空亡 | Text | - |
| 大運開始 | Text | - |
| パワー | Number | - |
| パワー分類 | Select | 身強, 身弱, 中庸 |
| 守護神 | Text | - |
| 特殊星数 | Number | - |
| 検証状態 | Select | 未検証, 一致, ズレあり, override, 転記確認 |

鑑定対象DB作成後に追加するRelation:

| 名前 | 型 | 接続先 |
|---|---|---|
| 鑑定対象 | Relation | 鑑定対象DB |

## 4. 推奨ビュー

### 鑑定対象DB

ビュー:

- すべて
- 鑑定中
- 要再確認
- 完了

フィルタ例:

```text
鑑定ステータス = 鑑定中
```

### 命式DB

ビュー:

- すべて
- 未検証
- ズレあり
- override

フィルタ例:

```text
検証状態 = ズレあり
```

## 5. Integration接続

Notion APIで保存するには、Notion Integrationを作成して、親ページまたは各DBに接続します。

手順:

1. Notionの `Settings -> Connections` からIntegrationを作る。
2. Internal Integration Tokenを控える。
3. `四柱推命 管理OS` ページ右上の `...` からConnectionsにIntegrationを追加する。
4. 鑑定対象DBと命式DBのURLまたはIDを控える。

Render環境変数:

```env
NOTION_TOKEN=secret_xxx
NOTION_CLIENTS_DATABASE_ID=鑑定対象DBのID
NOTION_CHARTS_DATABASE_ID=命式DBのID
```

## 6. 次に実装するもの

Notion側のDBができたら、Webアプリに本実装します。

- `POST /api/notion/charts`
- `Notionに保存` ボタン
- 保存後のNotionページURL表示
- 保存失敗時のエラー表示

## 注意

- NotionトークンをGitHubやブラウザに入れない。
- 実名・住所・鑑定メモは公開リポジトリに入れない。
- 最初は鑑定対象DBと命式DBだけで十分。
