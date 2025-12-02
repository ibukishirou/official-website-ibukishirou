// SNSリンク読み込みJS
async function loadSNSLinks() {
  try {
    const response = await fetch('data/links.json');
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
    { key: 'youtube', name: 'YouTube', icon: 'youtube' },
    { key: 'x_main', name: 'X (Main)', icon: 'twitter' },
    { key: 'x_sub', name: 'X (Sub)', icon: 'twitter' },
    { key: 'tiktok', name: 'TikTok', icon: 'music' },
    { key: 'instagram', name: 'Instagram', icon: 'instagram' },
    { key: 'marshmallow', name: 'マシュマロ', icon: 'mail' },
    { key: 'booth', name: 'BOOTH', icon: 'shopping-bag' },
    { key: 'wishlist', name: 'Wishlist', icon: 'gift' }
  ];
  
  container.innerHTML = snsConfig.map(sns => {
    if (links[sns.key]) {
      return `
        <a href="${links[sns.key]}" target="_blank" rel="noopener noreferrer" class="sns-link">
          <div class="sns-icon"><i data-lucide="${sns.icon}"></i></div>
          <div class="sns-name">${sns.name}</div>
        </a>
      `;
    }
    return '';
  }).join('');
  
  // Lucide Icons を初期化
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// ページ読み込み時に実行
if (document.getElementById('sns-links-container')) {
  loadSNSLinks();
}
