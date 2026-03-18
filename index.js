import { fetchRssNews } from './scripts/fetch-rss.js';
import { fetchLedgeAiNews } from './scripts/fetch-ledge-ai.js';
import { postToSlack } from './scripts/post-slack.js';

/**
 * メインエントリーポイント
 */
async function main() {
  console.log('🚀 News Digest starting...\n');

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  try {
    // 1. RSS ニュース取得（AI ニュース + 一般ニュース）
    const rssArticles = await fetchRssNews();

    // 2. ledge.ai ニュース取得（スクレイピング）
    const ledgeAiArticles = await fetchLedgeAiNews();

    // 3. 全ニュースをマージ
    const allArticles = [...ledgeAiArticles, ...rssArticles];

    // 4. Slack に投稿
    if (allArticles.length > 0) {
      await postToSlack(slackWebhookUrl, allArticles);
    } else {
      console.log('⚠️ No articles found');
    }

    console.log('\n✅ News Digest completed');
  } catch (error) {
    console.error(`\n❌ Error in main: ${error.message}`);
    process.exit(1);
  }
}

main();
