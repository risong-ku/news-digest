import Parser from 'rss-parser';

const parser = new Parser();

const RSS_FEEDS = [
  { name: '🤖 ledge.ai', url: 'https://ledge.ai/feed/' },
  { name: '🤖 Hacker News (AI)', url: 'https://hnrss.org/newest?q=AI+LLM&count=10' },
  { name: '🤖 Product Hunt', url: 'https://www.producthunt.com/feed' },
  { name: '📰 Google News (日本)', url: 'https://news.google.com/rss?gl=JP&hl=ja' },
  { name: '📰 Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss' },
];

const SLACK_FEEDS = [
  { name: '💬 Slack: matsuokenllmcommunity #06_ai-news', url: 'https://matsuokenllmcommunity.slack.com/feeds/channel/C07AP5J9UJC/latest.rss' },
  { name: '💬 Slack: matsuokenllmcommunity #07_arxiv_interpreter', url: 'https://matsuokenllmcommunity.slack.com/feeds/channel/C0749LLK8R3/latest.rss' },
  { name: '💬 Slack: jdlacommunity (C02SC8DRRDG)', url: 'https://jdlacommunity.slack.com/feeds/channel/C02SC8DRRDG/latest.rss' },
  { name: '💬 Slack: jdlacommunity (C02REH1V7QW)', url: 'https://jdlacommunity.slack.com/feeds/channel/C02REH1V7QW/latest.rss' },
];

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
