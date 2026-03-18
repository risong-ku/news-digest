/**
 * ledge.ai からニュースをスクレイピング
 * @returns {Promise<Array>} { title, summary, url, source } の配列
 */
export async function fetchLedgeAiNews() {
  const articles = [];

  try {
    console.log('📡 Fetching ledge.ai...');
    const response = await fetch('https://ledge.ai/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // 記事を抽出するための正規表現パターン
    // ledge.ai のHTML構造に合わせて調整
    const articlePattern =
      /<a[^>]*href="([^"]*)"[^>]*class="[^"]*article[^"]*"[^>]*>[\s\S]*?<h[2-4][^>]*>([^<]+)<\/h[2-4]>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;

    let match;
    let count = 0;
    const maxArticles = 15; // 最大15件取得

    while ((match = articlePattern.exec(html)) && count < maxArticles) {
      const url = match[1];
      const title = match[2].trim();
      const summary = match[3].trim();

      // 絶対URL に変換
      const absoluteUrl = url.startsWith('http')
        ? url
        : `https://ledge.ai${url}`;

      if (title && summary) {
        articles.push({
          title,
          summary: summary.substring(0, 200),
          url: absoluteUrl,
          source: '🤖 ledge.ai',
        });
        count++;
      }
    }

    // 上位3件まで
    console.log(`✅ ledge.ai: ${articles.length} articles found (3 included)`);
    return articles.slice(0, 3);
  } catch (error) {
    console.error(`❌ Error fetching ledge.ai: ${error.message}`);
    return [];
  }
}
