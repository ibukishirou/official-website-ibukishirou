// 実績読み込みJS（年別表示）
async function loadAchievements() {
  try {
    const response = await fetch('/data/achievements.json');
    const data = await response.json();
    
    // 日付順にソート（新しい順）
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 年別にグループ化
    const itemsByYear = {};
    data.forEach(item => {
      const year = new Date(item.date).getFullYear();
      if (!itemsByYear[year]) {
        itemsByYear[year] = [];
      }
      itemsByYear[year].push(item);
    });
    
    // 年を降順でソート
    const sortedYears = Object.keys(itemsByYear).sort((a, b) => b - a);
    
    displayAchievements(itemsByYear, sortedYears);
  } catch (error) {
    console.error('実績の読み込みに失敗しました:', error);
    const container = document.getElementById('achievements-container');
    if (container) {
      container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 3rem;">実績の読み込みに失敗しました。</p>';
    }
  }
}

function displayAchievements(itemsByYear, sortedYears) {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  
  if (sortedYears.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 3rem;">実績がまだありません。</p>';
    return;
  }
  
  let html = '';
  
  // 年ごとにセクションを生成
  sortedYears.forEach(year => {
    html += `<div class="year-section">`;
    html += `<h3 class="year-title">${year}年</h3>`;
    html += `<div class="achievement-cards">`;
    
    // カード生成
    itemsByYear[year].forEach(item => {
      const date = new Date(item.date);
      const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      
      // client表示ルール: 空文字なら「伊吹しろう オリジナル」、値があれば「{client} 様」
      const clientDisplay = item.client === '' || !item.client 
        ? '伊吹しろう オリジナル' 
        : `${escapeHtml(item.client)} 様`;
      
      html += `
        <div class="achievement-card" onclick="window.open('${item.url}', '_blank', 'noopener,noreferrer')">
          <div class="achievement-card-date">${formattedDate}</div>
          <h5 class="achievement-card-title">${escapeHtml(item.title)}</h5>
          <p class="achievement-card-description">${escapeHtml(item.description)}</p>
          <div class="achievement-card-client">${clientDisplay}</div>
        </div>
      `;
    });
    
    html += `</div>`; // achievement-cards
    html += `</div>`; // year-section
  });
  
  container.innerHTML = html;
}

// HTMLエスケープ関数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ページ読み込み時に実行
if (document.getElementById('achievements-container')) {
  loadAchievements();
}
