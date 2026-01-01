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
  
  // タグごとの色定義
  const filterColors = {
    'infomation': 'rgb(255, 69, 0)',
    'music': 'rgb(130, 130, 255)',
    'video': 'rgb(34, 139, 34)',
    'all': '#D2691E' // var(--color-secondary)の実際の値
  };
  
  // ホバー時の背景色（透明度を追加）
  const getHoverColor = (filter) => {
    const colors = {
      'infomation': 'rgba(255, 69, 0, 0.2)',
      'music': 'rgba(130, 130, 255, 0.2)',
      'video': 'rgba(34, 139, 34, 0.2)',
      'all': 'rgba(210, 105, 30, 0.2)'
    };
    return colors[filter] || 'rgba(210, 105, 30, 0.2)';
  };
  
  // 初期状態でALLボタンをアクティブに設定
  const allButton = document.querySelector('.filter-btn[data-filter="all"]');
  if (allButton) {
    allButton.style.backgroundColor = filterColors['all'];
    allButton.style.borderColor = filterColors['all'];
  }
  
  filterButtons.forEach(button => {
    const filter = button.dataset.filter;
    
    // ホバーイベント
    button.addEventListener('mouseenter', () => {
      if (!button.classList.contains('active')) {
        button.style.backgroundColor = getHoverColor(filter);
        button.style.borderColor = filterColors[filter];
        button.style.color = 'var(--color-text)';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (!button.classList.contains('active')) {
        button.style.backgroundColor = '';
        button.style.borderColor = '';
        button.style.color = '';
      }
    });
    
    // クリックイベント
    button.addEventListener('click', () => {
      // アクティブボタンの切り替え
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      });
      button.classList.add('active');
      
      // フィルタリング
      currentFilter = filter;
      
      // アクティブボタンの色を設定
      const color = filterColors[filter];
      button.style.backgroundColor = color;
      button.style.borderColor = color;
      
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
    
    // タグのHTML生成（色分け対応）
    const tagsHTML = item.tags.map(tag => {
      let tagClass = 'tag-infomation';
      let tagLabel = 'information';
      
      if (tag === 'music') {
        tagClass = 'tag-music';
        tagLabel = 'music';
      } else if (tag === 'video') {
        tagClass = 'tag-video';
        tagLabel = 'video';
      } else if (tag === 'infomation') {
        tagClass = 'tag-infomation';
        tagLabel = 'information';
      }
      
      return `<span class="achievement-tag ${tagClass}">${tagLabel}</span>`;
    }).join('');
    
    // リンクがある場合とない場合で処理を分ける
    if (item.link && item.link.trim() !== '') {
      return `
        <div class="achievement-item">
          <div class="achievement-date">${formattedDate}</div>
          <div class="achievement-point"></div>
          <div class="achievement-content clickable" data-link="${item.link}">
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
          <div class="achievement-content">
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
