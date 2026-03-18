# News Digest

毎朝複数のニュースソースを自動集約して Slack に通知するシステム。

## 機能

- **AI関連ニュース**: ledge.ai, Hacker News, Product Hunt から RSS 取得
- **日本国内メディア**: Google News（日本）、Yahoo!ニュース から RSS 取得
- **Slack チャンネル監視**: 複数 Slack Workspace のチャンネルを RSS フィードで自動取得
- **Slack 通知**: 毎日朝6時半（JST）に自動配信
- **無料**: API キー不要、完全無料で運用（GitHub Actions）

## セットアップ

### 1. Slack Incoming Webhook URL を取得

**Slack Incoming Webhook URL**
- https://api.slack.com/messaging/webhooks にアクセス
- 新しいアプリを作成（または既存アプリに追加）
- **Incoming Webhooks** を有効化
- チャンネルを選択して URL を生成

### 2. GitHub Secrets に登録

リポジトリの **Settings → Secrets and variables → Actions** から以下を追加：

- `SLACK_WEBHOOK_URL`: Slack Incoming Webhook URL

### 3. 動作確認

GitHub Actions → **News Digest** ワークフロー → **Run workflow** をクリック（手動実行）

Slack に通知が届けば成功です。

## ローカル実行

開発時にローカルで実行する場合：

```bash
npm install
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... npm start
```

## ファイル構成

```
.
├── .github/workflows/digest.yml    # GitHub Actions ワークフロー
├── scripts/
│   ├── fetch-rss.js               # RSS フィード取得
│   ├── fetch-perplexity.js        # Perplexity API 連携
│   └── post-slack.js              # Slack 通知
├── index.js                       # メインエントリーポイント
├── package.json
└── .env.example
```

## トラブルシューティング

**Slack に通知が届かない場合**
- `SLACK_WEBHOOK_URL` が正しいか確認
- GitHub Actions のログでエラーをチェック

**RSS フィードが取得できない場合**
- RSS フィードの URL が有効か確認（ブラウザで直接アクセス）
- Slack チャンネル RSS フィードは「公開チャンネル」である必要があります

## カスタマイズ

### スケジュール変更

`.github/workflows/digest.yml` の `cron` を編集：

```yaml
cron: '30 21 * * *'  # この部分を変更
```

[Cron 式リファレンス](https://crontab.guru/)

### RSS フィード追加

`scripts/fetch-rss.js` の `RSS_FEEDS` 配列に追加：

```javascript
{ name: 'ソース名', url: 'フィードURL' }
```

### 記事数調整

`scripts/post-slack.js` で `.slice(0, 5)` の数字を変更（デフォルト 5件）
