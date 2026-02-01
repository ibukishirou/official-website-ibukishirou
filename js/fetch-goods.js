// グッズ読み込みJS
async function loadGoods() {
  try {
    const response = await fetch('/data/goods.json');
    const goodsData = await response.json();
    
    displayGoods(goodsData);
  } catch (error) {
    console.error('グッズの読み込みに失敗しました:', error);
  }
}

function displayGoods(goodsArray) {
  const container = document.getElementById('goods-container');
  if (!container) return;
  
  if (goodsArray.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">現在販売中のグッズはありません</p>';
    return;
  }
  
  container.innerHTML = goodsArray.map(item => {
    const availableClass = item.available ? '' : 'sold-out';
    const soldOutOverlay = !item.available ? '<div class="sold-out-overlay">Sold Out</div>' : '';
    
    // availableがfalseの場合はdivタグを使用（リンク無効化）
    if (!item.available) {
      return `
        <div class="card goods-card ${availableClass}" style="cursor: not-allowed;">
          <div class="goods-image-wrapper">
            <img src="${item.thumbnail}" alt="${item.name}" class="card-image" onerror="if(!this.dataset.failed){this.dataset.failed='1';this.src='assets/img/placeholder.webp';}else{this.style.display='none';}">
            ${soldOutOverlay}
          </div>
          <div class="card-content">
            <h3 class="card-title">${item.name}</h3>
          </div>
        </div>
      `;
    }
    
    // availableがtrueの場合は通常のリンク
    return `
      <a href="${item.link}" target="_blank" class="card goods-card ${availableClass}">
        <div class="goods-image-wrapper">
          <img src="${item.thumbnail}" alt="${item.name}" class="card-image" onerror="if(!this.dataset.failed){this.dataset.failed='1';this.src='assets/img/placeholder.webp';}else{this.style.display='none';}">
          ${soldOutOverlay}
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.name}</h3>
        </div>
      </a>
    `;
  }).join('');
}

// ページ読み込み時に実行
if (document.getElementById('goods-container')) {
  loadGoods();
}
