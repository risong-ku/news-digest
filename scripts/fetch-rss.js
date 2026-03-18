import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 5000, // 5秒でタイムアウト
  customFields: {
    item: ['content', 'summary'],
  },
});

const RSS_FEEDS = [
  { name: '🤖 Dev.to (AI)', url: 'https://dev.to/feed/tag/ai' },
  { name: '🤖 Dev.to (Machine Learning)', url: 'https://dev.to/feed/tag/machinelearning' },
  { name: '🤖 Towards Data Science', url: 'https://towardsdatascience.com/feed' },
  { name: '🤖 ArXiv (AI)', url: 'https://rss.arxiv.org/rss/cs.ai' },
  { name: '🤖 Hacker News (AI)', url: 'https://hnrss.org/newest?q=AI+LLM&count=10' },
  { name: '🤖 Papers with Code', url: 'https://rss.paperswithcode.com/newest' },
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
      const result = await Promise.race([
        parser.parseURL(feed.url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Feed fetch timeout')), 10000)
        ),
      ]);

      // 最大20件まで処理（パフォーマンス向上）
      const limitedItems = result.items.slice(0, 20);
      const recentItems = limitedItems.filter(item => {
        const pubDate = new Date(item.pubDate);
        return pubDate >= oneDayAgo;
      });

      // AI系ニュースは3件、一般ニュースは5件まで
      const isAISource = feed.name.startsWith('🤖');
      const limit = isAISource ? 3 : 5;

      for (const item of recentItems.slice(0, limit)) {
        articles.push({
          title: item.title || 'No title',
          summary: (item.contentSnippet || item.summary || '').substring(0, 200), // 最大200文字
          url: item.link || '',
          source: feed.name,
        });
      }

      console.log(`✅ ${feed.name}: ${recentItems.length} articles found (${recentItems.length > limit ? limit + ' included' : 'all included'})`);
    } catch (error) {
      console.error(`❌ Error fetching ${feed.name}: ${error.message}`);
    }
  }

  // Slack チャンネル RSS フィード取得（現在は空）
  for (const feed of SLACK_FEEDS) {
    try {
      console.log(`📡 Fetching Slack: ${feed.name}...`);
      const result = await Promise.race([
        parser.parseURL(feed.url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Feed fetch timeout')), 10000)
        ),
      ]);

      const limitedItems = result.items.slice(0, 20);
      const recentItems = limitedItems.filter(item => {
        const pubDate = new Date(item.pubDate);
        return pubDate >= oneDayAgo;
      });

      for (const item of recentItems.slice(0, 5)) {
        articles.push({
          title: item.title || 'No title',
          summary: (item.contentSnippet || item.summary || '').substring(0, 200),
          url: item.link || '',
          source: feed.name,
        });
      }

      console.log(`✅ ${feed.name}: ${recentItems.length} messages found (${recentItems.length > 5 ? '5 included' : 'all included'})`);
    } catch (error) {
      console.error(`❌ Error fetching ${feed.name}: ${error.message}`);
    }
  }

  return articles;
}
