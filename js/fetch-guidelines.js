// ガイドラインデータの読み込みと表示
async function loadGuidelines() {
  try {
    const response = await fetch('/data/guidelines.json');
    const guidelinesData = await response.json();
    
    const container = document.getElementById('guidelines-container');
    
    guidelinesData.forEach(section => {
      // セクションHTML生成
      const sectionHTML = `
        <div class="guideline-section">
          <h2>${section.title}</h2>
          <ul>
            ${section.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
      
      container.insertAdjacentHTML('beforeend', sectionHTML);
    });
  } catch (error) {
    console.error('ガイドラインの読み込みに失敗しました:', error);
  }
}

// ページ読み込み時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGuidelines);
} else {
  loadGuidelines();
}
