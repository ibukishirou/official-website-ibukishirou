// SNSリンク・サポートリンク読み込みJS
async function loadLinks() {
  try {
    const response = await fetch('/data/links.json');
    const linksData = await response.json();
    
    displaySNSLinks(linksData);
    displaySupportLinks(linksData);
  } catch (error) {
    console.error('リンクの読み込みに失敗しました:', error);
  }
}

// Social Linksセクションの表示
function displaySNSLinks(links) {
  const container = document.getElementById('sns-links-container');
  if (!container) return;
  
  const snsConfig = [
    { key: 'youtube', name: 'YouTube', icon: 'ri-youtube-line' },
    { key: 'wick', name: 'Wick', icon: 'ri-terminal-window-line', customText: 'W' },
    { key: 'x_main', name: 'X', icon: 'ri-twitter-x-line' },
    { key: 'tiktok', name: 'TikTok', icon: 'ri-tiktok-line' },
    { key: 'instagram', name: 'Instagram', icon: 'ri-instagram-line' },
    { key: 'marshmallow', name: 'マシュマロ', icon: 'ri-mail-line' },
    { key: 'booth', name: 'BOOTH', icon: 'ri-shopping-bag-line' }
  ];
  
  container.innerHTML = snsConfig.map(sns => {
    if (links[sns.key]) {
      // PC/SPでURLを切り替え（Wickの場合）
      let url = links[sns.key];
      if (sns.key === 'wick' && typeof url === 'object' && url !== null) {
        const isPc = window.innerWidth > 960;
        url = isPc ? (url.pc || url.mobile) : (url.mobile || url.pc);
      }
      
      // Wickの場合はカスタムテキスト "W" を表示
      const iconContent = sns.customText 
        ? `<span class="sns-icon-text">${sns.customText}</span>`
        : `<i class="${sns.icon}"></i>`;
      
      return `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="sns-link">
          <div class="sns-icon">${iconContent}</div>
          <div class="sns-name">${sns.name}</div>
        </a>
      `;
    }
    return '';
  }).join('');
}

// Supportセクションの表示
function displaySupportLinks(links) {
  const container = document.getElementById('support-links-container');
  if (!container) return;
  
  const supportConfig = [
    { key: 'wishlist', name: 'Wishlist', icon: 'ri-gift-line' },
    { key: 'paypal', name: 'PayPal', icon: 'ri-paypal-line' }
  ];
  
  container.innerHTML = supportConfig.map(support => {
    if (links[support.key]) {
      return `
        <a href="${links[support.key]}" target="_blank" rel="noopener noreferrer" class="sns-link">
          <div class="sns-icon"><i class="${support.icon}"></i></div>
          <div class="sns-name">${support.name}</div>
        </a>
      `;
    }
    return '';
  }).join('');
}

// ページ読み込み時に実行
if (document.getElementById('sns-links-container') || document.getElementById('support-links-container')) {
  loadLinks();
}
