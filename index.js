import { fetchRssNews } from './scripts/fetch-rss.js';
import { postToSlack } from './scripts/post-slack.js';

/**
 * メインエントリーポイント
 */
async function main() {
  console.log('🚀 News Digest starting...\n');

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  try {
    // 1. RSS ニュース取得（一般ニュース + Slack チャンネル）
    const articles = await fetchRssNews();

    // 2. Slack に投稿
    if (articles.length > 0) {
      await postToSlack(slackWebhookUrl, articles);
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
