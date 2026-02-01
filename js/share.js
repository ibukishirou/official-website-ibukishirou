// シェアボタン機能（改修版）
(function() {
  let linksData = null;
  let shareMenuExpanded = false;

  // links.jsonをロード
  async function loadLinks() {
    try {
      const response = await fetch('/data/links.json');
      linksData = await response.json();
    } catch (error) {
      console.error('Failed to load links.json:', error);
      // フォールバック用のデフォルトリンク
      linksData = {
        youtube: 'https://www.youtube.com/@ibukishirou?sub_confirmation=1',
        x_main: 'https://x.com/ibukishirou'
      };
    }
  }

  // シェアボタンのHTML（初期状態）
  const shareButtonsHTML = `
    <div class="share-buttons">
      <!-- 展開されるシェアオプション（初期は非表示、左側に横一列表示） -->
      <div class="share-menu" style="display: none;">
        <a href="#" class="share-btn share-option line" title="LINEでシェア" aria-label="LINEでシェア">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.365 9.863c.349 0 .63.285.63.631c0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63c0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63c0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596c-.064.021-.133.031-.199.031c-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629c-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595c.06-.023.136-.033.194-.033c.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63c.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63c.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63c.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63c0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608c.391.082.923.258 1.058.59c.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645c1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </a>
        <a href="#" class="share-btn share-option twitter-share" title="Xでシェア" aria-label="Xでシェア">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a href="#" class="share-btn share-option bluesky-share" title="Blueskyでシェア" aria-label="Blueskyでシェア">
          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M 60.901 37.747 C 88.061 58.137 117.273 99.482 127.999 121.666 C 138.727 99.482 167.938 58.137 195.099 37.747 C 214.696 23.034 246.45 11.651 246.45 47.874 C 246.45 55.109 242.302 108.648 239.869 117.34 C 231.413 147.559 200.6 155.266 173.189 150.601 C 221.101 158.756 233.288 185.766 206.966 212.776 C 156.975 264.073 135.115 199.905 129.514 183.464 C 128.487 180.449 128.007 179.038 127.999 180.238 C 127.992 179.038 127.512 180.449 126.486 183.464 C 120.884 199.905 99.024 264.073 49.033 212.776 C 22.711 185.766 34.899 158.756 82.81 150.601 C 55.4 155.266 24.587 147.559 16.13 117.34 C 13.697 108.648 9.55 55.109 9.55 47.874 C 9.55 11.651 41.304 23.034 60.901 37.747 Z" fill="white"/>
          </svg>
        </a>
        <a href="#" class="share-btn share-option url-copy" title="URLをコピー" aria-label="URLをコピー">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z" />
          </svg>
        </a>
      </div>
      <div class="share-main-buttons">
        <!-- YouTube遷移ボタン -->
        <a href="#" class="share-btn youtube" title="YouTubeへ" aria-label="YouTubeへ" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
        <!-- X遷移ボタン -->
        <a href="#" class="share-btn twitter" title="Xへ" aria-label="Xへ" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <!-- シェアメニュートグルボタン -->
        <a href="#" class="share-btn share-toggle" title="シェアメニュー" aria-label="シェアメニューを開く">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
        </a>
      </div>
    </div>
  `;
  
  // ページ読み込み時にシェアボタンを追加
  async function initShareButtons() {
    // links.jsonをロード
    await loadLinks();
    
    // bodyの最後にシェアボタンを追加
    document.body.insertAdjacentHTML('beforeend', shareButtonsHTML);
    
    // YouTubeボタンのリンク設定
    const youtubeBtn = document.querySelector('.share-btn.youtube');
    if (youtubeBtn && linksData) {
      youtubeBtn.href = linksData.youtube;
    }
    
    // Xボタンのリンク設定
    const twitterBtn = document.querySelector('.share-btn.twitter');
    if (twitterBtn && linksData) {
      twitterBtn.href = linksData.x_main;
    }
    
    // トグルボタンにイベントリスナーを設定
    const toggleBtn = document.querySelector('.share-btn.share-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', handleToggleMenu);
    }
    
    // シェアオプションボタンにイベントリスナーを設定
    const shareOptions = document.querySelectorAll('.share-option');
    shareOptions.forEach(btn => {
      btn.addEventListener('click', handleShare);
    });
  }
  
  // シェアメニューの開閉
  function handleToggleMenu(e) {
    e.preventDefault();
    e.stopPropagation(); // イベントバブリングを防ぐ
    
    const shareMenu = document.querySelector('.share-menu');
    const toggleBtn = document.querySelector('.share-btn.share-toggle');
    
    if (!shareMenu || !toggleBtn) return;
    
    shareMenuExpanded = !shareMenuExpanded;
    
    if (shareMenuExpanded) {
      // メニューを表示
      shareMenu.style.display = 'flex';
      toggleBtn.setAttribute('aria-label', 'シェアメニューを閉じる');
      toggleBtn.classList.add('active'); // アクティブクラスを追加
      
      // アニメーション効果（左からスライドイン）
      const options = shareMenu.querySelectorAll('.share-option');
      options.forEach((option, index) => {
        option.style.animation = `slideInFromLeft 0.3s ease forwards ${index * 0.05}s`;
        option.style.opacity = '0';
      });
      
      // 外側クリックでメニューを閉じる処理を追加
      setTimeout(() => {
        document.addEventListener('click', closeMenuOnOutsideClick);
      }, 100);
    } else {
      closeShareMenu();
    }
  }
  
  // シェアメニューを閉じる
  function closeShareMenu() {
    const shareMenu = document.querySelector('.share-menu');
    const toggleBtn = document.querySelector('.share-btn.share-toggle');
    
    if (!shareMenu) return;
    
    shareMenuExpanded = false;
    
    // メニューを非表示（左へスライドアウト）
    const options = shareMenu.querySelectorAll('.share-option');
    options.forEach((option, index) => {
      option.style.animation = `slideOutToLeft 0.3s ease forwards ${index * 0.05}s`;
    });
    
    setTimeout(() => {
      shareMenu.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', 'シェアメニューを開く');
        toggleBtn.classList.remove('active'); // アクティブクラスを削除
      }
    }, 300);
    
    // 外側クリックイベントを削除
    document.removeEventListener('click', closeMenuOnOutsideClick);
  }
  
  // 外側をクリックしたときにメニューを閉じる
  function closeMenuOnOutsideClick(e) {
    const shareButtons = document.querySelector('.share-buttons');
    
    // シェアボタン領域外をクリックした場合
    if (shareButtons && !shareButtons.contains(e.target)) {
      closeShareMenu();
    }
  }
  
  // シェア処理
  function handleShare(e) {
    e.preventDefault();
    
    const currentUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    
    if (this.classList.contains('twitter-share')) {
      // Xでシェア
      const twitterUrl = `https://twitter.com/intent/tweet?text=${pageTitle}&url=${currentUrl}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    } else if (this.classList.contains('bluesky-share')) {
      // Blueskyでシェア
      const blueskyUrl = `https://bsky.app/intent/compose?text=${pageTitle}+${currentUrl}`;
      window.open(blueskyUrl, '_blank', 'width=600,height=600');
    } else if (this.classList.contains('line')) {
      // LINEシェア
      const lineUrl = `https://social-plugins.line.me/lineit/share?url=${currentUrl}`;
      window.open(lineUrl, '_blank', 'width=600,height=400');
    } else if (this.classList.contains('url-copy')) {
      // URLをクリップボードにコピー
      const shareText = window.location.href;
      copyToClipboard(shareText);
      showNotification('URLをコピーしました');
    }
  }
  
  // クリップボードにコピー
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      // フォールバック
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
  
  // 通知表示
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(210, 105, 30, 0.95);
      color: #f5f5f5;
      padding: 1.5rem 2rem;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      font-family: 'Noto Sans JP', sans-serif;
      text-align: center;
      max-width: 90%;
      animation: fadeIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2500);
  }
  
  // アニメーション用CSS追加
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -60%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translate(-50%, -50%); }
      to { opacity: 0; transform: translate(-50%, -40%); }
    }
    @keyframes slideInFromLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes slideOutToLeft {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-20px);
      }
    }
  `;
  document.head.appendChild(style);
  
  // DOMContentLoaded後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareButtons);
  } else {
    initShareButtons();
  }
})();
