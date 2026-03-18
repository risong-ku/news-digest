import Parser from 'rss-parser';

const parser = new Parser();

const RSS_FEEDS = [
  { name: '🤖 Dev.to (AI)', url: 'https://dev.to/feed/tag/ai' },
  { name: '🤖 Dev.to (Machine Learning)', url: 'https://dev.to/feed/tag/machinelearning' },
  { name: '🤖 Towards Data Science', url: 'https://towardsdatascience.com/feed' },
  { name: '🤖 ArXiv (AI)', url: 'https://rss.arxiv.org/rss/cs.ai' },
  { name: '🤖 Hacker News (AI)', url: 'https://hnrss.org/newest?q=AI+LLM&count=10' },
  { name: '📰 Google News (日本)', url: 'https://news.google.com/rss?gl=JP&hl=ja' },
  { name: '📰 Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss' },
];

// Slack チャンネル RSS フィードは現在アクセス不可のため、将来的な改善時に追加予定
const SLACK_FEEDS = [];

/**
 * RSS フィードから過去24時間のニュース・Slack メッセージを取得
 * @returns {Promise<Array>} { title, summary, url, source } の配列
 */
export async function fetchRssNews() {
  const articles = [];
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 一般 RSS フィード取得
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`📡 Fetching RSS: ${feed.name}...`);
      const result = await parser.parseURL(feed.url);

      const recentItems = result.items.filter(item => {
        const pubDate = new Date(item.pubDate);
        return pubDate >= oneDayAgo;
      });

      for (const item of recentItems) {
        articles.push({
          title: item.title,
          summary: item.contentSnippet || item.summary || '',
          url: item.link,
          source: feed.name,
        });
      }

      console.log(`✅ ${feed.name}: ${recentItems.length} articles found`);
    } catch (error) {
      console.error(`❌ Error fetching ${feed.name}: ${error.message}`);
    }
  }

  // Slack チャンネル RSS フィード取得
  for (const feed of SLACK_FEEDS) {
    try {
      console.log(`📡 Fetching Slack: ${feed.name}...`);
      const result = await parser.parseURL(feed.url);

      const recentItems = result.items.filter(item => {
        const pubDate = new Date(item.pubDate);
        return pubDate >= oneDayAgo;
      });

      for (const item of recentItems) {
        articles.push({
          title: item.title,
          summary: item.contentSnippet || item.summary || '',
          url: item.link,
          source: feed.name,
        });
      }

      console.log(`✅ ${feed.name}: ${recentItems.length} messages found`);
    } catch (error) {
      console.error(`❌ Error fetching ${feed.name}: ${error.message}`);
    }
  }

  return articles;
}
