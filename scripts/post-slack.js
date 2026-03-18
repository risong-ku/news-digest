/**
 * Slack Webhook でニュースダイジェストを投稿
 * @param {string} webhookUrl - Slack Incoming Webhook URL
 * @param {Array} articles - 記事配列（RSS + Slack）
 * @returns {Promise<void>}
 */
export async function postToSlack(webhookUrl, articles) {
  if (!webhookUrl) {
    console.error('❌ SLACK_WEBHOOK_URL is not set');
    return;
  }

  const blocks = buildSlackMessage(articles);

  try {
    console.log('📤 Posting to Slack...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('✅ Posted to Slack successfully');
  } catch (error) {
    console.error(`❌ Error posting to Slack: ${error.message}`);
  }
}

/**
 * Slack Block Kit フォーマットのメッセージを構築
 * @param {Array} articles - すべての記事（RSS + Slack）
 * @returns {Array} Slack blocks
 */
function buildSlackMessage(articles) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📰 本日のニュースダイジェスト',
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `更新: <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toLocaleString('ja-JP')}>`,
        },
      ],
    },
  ];

  // ソース別にグループ化
  const groupedBySource = {};
  for (const article of articles) {
    const sourceGroup = article.source.split('|')[0].trim(); // ソースのカテゴリ部分
    if (!groupedBySource[sourceGroup]) {
      groupedBySource[sourceGroup] = [];
    }
    groupedBySource[sourceGroup].push(article);
  }

  // ソース別セクション
  let isFirst = true;
  for (const [source, items] of Object.entries(groupedBySource)) {
    if (!isFirst) {
      blocks.push({ type: 'divider' });
    }
    isFirst = false;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${source}*`,
      },
    });

    for (const article of items.slice(0, 5)) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${article.title}*\n${article.summary}\n<${article.url}|詳細を見る>`,
        },
      });
    }
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: '自動生成 | <https://github.com/risong-ku/news-digest|news-digest>',
      },
    ],
  });

  return blocks;
}
