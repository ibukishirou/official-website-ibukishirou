// グローバル変数としてFAQデータを保持
let allFaqData = [];

// FAQ JSONデータの読み込みと表示
async function loadFAQ() {
  try {
    const response = await fetch('/data/faq.json');
    allFaqData = await response.json();
    
    renderFAQItems(allFaqData);
    
    // 検索機能を初期化
    initFAQSearch();
    
  } catch (error) {
    console.error('FAQデータの読み込みに失敗しました:', error);
  }
}

// FAQアイテムを描画
function renderFAQItems(faqData) {
  const faqList = document.querySelector('.faq-list');
  if (!faqList) return;
  
  faqList.innerHTML = '';
  
  if (faqData.length === 0) {
    faqList.innerHTML = '<div class="faq-no-results">検索条件に一致する質問が見つかりませんでした。</div>';
    return;
  }
  
  faqData.forEach((item, index) => {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';
    faqItem.dataset.question = item.question;
    faqItem.dataset.answer = item.answer;
    
    // テンプレート部分を検出・分離
    let answerContent = item.answer;
    const templateMatch = item.answer.match(/(■ イラスト内容.*)/s);
    
    if (templateMatch) {
      const templateText = templateMatch[1];
      const beforeTemplate = item.answer.substring(0, item.answer.indexOf(templateMatch[1]));
      
      answerContent = `
        ${beforeTemplate}
        <div class="template-box">
          <button class="copy-template-btn" onclick="copyTemplate(this)">コピー</button>
          <pre>${templateText}</pre>
        </div>
      `;
    }
    
    faqItem.innerHTML = `
      <div class="faq-question">
        <h3>${item.question}</h3>
        <span class="faq-icon">▼</span>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-content">
          ${answerContent}
        </div>
      </div>
    `;
    
    faqList.appendChild(faqItem);
  });
  
  // アコーディオン機能を初期化
  initFAQAccordion();
}

// FAQ アコーディオン機能（開閉どちらも0.5秒のアニメーション）
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const answerContent = item.querySelector('.faq-answer-content');
    
    // 初期状態で高さを0に設定
    answer.style.height = '0px';
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // 他のアイテムを閉じる
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherContent = otherItem.querySelector('.faq-answer-content');
          
          // 閉じる前に実際の高さを取得して設定（autoから数値に変換）
          const currentHeight = otherAnswer.scrollHeight;
          otherAnswer.style.height = currentHeight + 'px';
          
          // 次のフレームで0に設定してアニメーション発火
          requestAnimationFrame(() => {
            otherAnswer.style.height = '0px';
          });
          
          otherItem.classList.remove('active');
        }
      });
      
      // クリックしたアイテムをトグル
      if (isActive) {
        // 閉じる - height: autoの場合は実際の高さを取得
        const currentHeight = answer.scrollHeight;
        answer.style.height = currentHeight + 'px';
        
        // 次のフレームで0に設定してアニメーション発火
        requestAnimationFrame(() => {
          answer.style.height = '0px';
        });
        
        item.classList.remove('active');
      } else {
        // 開く - 実際のコンテンツ高さを取得
        const contentHeight = answerContent.scrollHeight;
        answer.style.height = contentHeight + 'px';
        item.classList.add('active');
        
        // アニメーション終了後に高さをautoに設定（レスポンシブ対応）
        setTimeout(() => {
          if (item.classList.contains('active')) {
            answer.style.height = 'auto';
          }
        }, 500);
      }
    });
    
    // ウィンドウリサイズ時の対応
    window.addEventListener('resize', () => {
      if (item.classList.contains('active')) {
        answer.style.height = 'auto';
      }
    });
  });
}

// テンプレートコピー機能
function copyTemplate(button) {
  const templateBox = button.closest('.template-box');
  const templatePre = templateBox.querySelector('pre');
  
  // HTMLを取得して<br>を改行に変換
  const html = templatePre.innerHTML;
  const textWithBreaks = html.replace(/<br\s*\/?>/gi, '\n');
  
  // HTMLタグを削除
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = textWithBreaks;
  const templateText = tempDiv.textContent || tempDiv.innerText;
  
  navigator.clipboard.writeText(templateText).then(() => {
    showCopyNotification();
  }).catch(err => {
    console.error('コピーに失敗しました:', err);
  });
}

// コピー成功通知を表示（share.jsと同じ仕様）
function showCopyNotification() {
  // 既存の通知があれば削除
  const existing = document.querySelector('.copy-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.textContent = 'コピーしました';
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(210, 105, 30, 0.95);
    color: var(--color-text);
    padding: 1.5rem 2rem;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    font-family: var(--font-secondary);
    text-align: center;
    animation: fadeIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

// FAQ検索機能を初期化
function initFAQSearch() {
  const searchInput = document.getElementById('faq-search-input');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      // 検索ボックスが空の場合は全て表示
      renderFAQItems(allFaqData);
    } else {
      // 検索条件に一致するFAQをフィルタリング
      const filteredData = allFaqData.filter(item => {
        const question = item.question.toLowerCase();
        const answer = item.answer.toLowerCase();
        
        // タイトル（question）または本文（answer）に部分一致
        return question.includes(searchTerm) || answer.includes(searchTerm);
      });
      
      renderFAQItems(filteredData);
    }
  });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', loadFAQ);
