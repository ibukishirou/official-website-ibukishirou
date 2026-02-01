// SNSリンク読み込みJS
async function loadSNSLinks() {
  try {
    const response = await fetch('/data/links.json');
    const linksData = await response.json();
    
    displaySNSLinks(linksData);
  } catch (error) {
    console.error('SNSリンクの読み込みに失敗しました:', error);
  }
}

function displaySNSLinks(links) {
  const container = document.getElementById('sns-links-container');
  if (!container) return;
  
  const snsConfig = [
    { key: 'youtube', name: 'YouTube', icon: 'ri-youtube-line' },
    { key: 'x_main', name: 'X (Main)', icon: 'ri-twitter-x-line' },
    { key: 'x_sub', name: 'X (Sub)', icon: 'ri-twitter-x-line' },
    { key: 'bluesky', name: 'Bluesky', icon: 'ri-bluesky-line' },
    { key: 'tiktok', name: 'TikTok', icon: 'ri-tiktok-line' },
    { key: 'instagram', name: 'Instagram', icon: 'ri-instagram-line' },
    { key: 'marshmallow', name: 'マシュマロ', icon: 'ri-mail-line' },
    { key: 'booth', name: 'BOOTH', icon: 'ri-shopping-bag-line' },
    { key: 'wishlist', name: 'Wishlist', icon: 'ri-gift-line' }
  ];
  
  container.innerHTML = snsConfig.map(sns => {
    if (links[sns.key]) {
      return `
        <a href="${links[sns.key]}" target="_blank" rel="noopener noreferrer" class="sns-link">
          <div class="sns-icon"><i class="${sns.icon}"></i></div>
          <div class="sns-name">${sns.name}</div>
        </a>
      `;
    }
    return '';
  }).join('');
}

// ページ読み込み時に実行
if (document.getElementById('sns-links-container')) {
  loadSNSLinks();
}
