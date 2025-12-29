// 実績読み込みJS（タグフィルタ機能付き）
let achievementsData = [];
let currentFilter = 'all';

async function loadAchievements() {
  try {
    const response = await fetch('data/achievements.json');
    achievementsData = await response.json();
    
    // 日付順にソート（新しい順）
    achievementsData.sort((a, b) => {
      return new Date(b.release_date) - new Date(a.release_date);
    });
    
    displayAchievements(achievementsData);
    setupFilterButtons();
  } catch (error) {
    console.error('実績の読み込みに失敗しました:', error);
  }
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // アクティブボタンの切り替え
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // フィルタリング
      const filter = button.dataset.filter;
      currentFilter = filter;
      
      if (filter === 'all') {
        displayAchievements(achievementsData);
      } else {
        const filtered = achievementsData.filter(item => 
          item.tags.includes(filter)
        );
        displayAchievements(filtered);
      }
    });
  });
}

function displayAchievements(achievementsArray) {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  
  if (achievementsArray.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 3rem;">該当する実績がありません</p>';
    return;
  }
  
  container.innerHTML = achievementsArray.map(item => {
    const date = new Date(item.release_date);
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    
    // タグのHTML生成（#付きのライトなテキスト表示）
    const tagsHTML = item.tags.map(tag => {
      const tagClass = tag === 'music' ? 'tag-music' : 'tag-infomation';
      const tagLabel = tag === 'music' ? 'music' : 'information';
      return `<span class="achievement-tag ${tagClass}">${tagLabel}</span>`;
    }).join('');
    
    // リンクがある場合とない場合で処理を分ける
    if (item.link && item.link.trim() !== '') {
      return `
        <div class="achievement-item">
          <div class="achievement-date">${formattedDate}</div>
          <div class="achievement-point"></div>
          <div class="achievement-content clickable" data-date="${formattedDate}" data-link="${item.link}">
            <h3 class="achievement-title">${item.title}</h3>
            <p class="achievement-body">${item.body}</p>
            <div class="achievement-tags">${tagsHTML}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="achievement-item">
          <div class="achievement-date">${formattedDate}</div>
          <div class="achievement-point"></div>
          <div class="achievement-content" data-date="${formattedDate}">
            <h3 class="achievement-title">${item.title}</h3>
            <p class="achievement-body">${item.body}</p>
            <div class="achievement-tags">${tagsHTML}</div>
          </div>
        </div>
      `;
    }
  }).join('');
  
  // クリッカブルなコンテンツにクリックイベントを追加
  setTimeout(() => {
    const clickableCards = document.querySelectorAll('.achievement-content.clickable');
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const link = card.dataset.link;
        if (link) {
          window.open(link, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }, 100);
}

// ページ読み込み時に実行
if (document.getElementById('achievements-container')) {
  loadAchievements();
}
