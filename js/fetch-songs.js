/**
 * Songs セクション
 * YouTube Data API から再生リスト情報を取得して表示
 */

(function() {
  'use strict';

  /**
   * Featured Worksを描画
   * @param {Array} videos - 動画情報の配列
   */
  function renderSongs(videos) {
    const container = document.getElementById('featured-works-container');
    if (!container) return;

    // 逆順に並び替え（最新が先頭）
    const reversedVideos = [...videos].reverse();

    container.innerHTML = reversedVideos.map((video, index) => {
      const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
      
      return `
        <a href="${videoUrl}" target="_blank" class="featured-work-item fade-in" style="animation-delay: ${index * 0.05}s" rel="noopener noreferrer">
          <div class="thumbnail-link">
            <img src="${video.thumbnail}" alt="${video.title}" class="featured-thumbnail" loading="lazy">
          </div>
          <div class="card-content">
            <h3 class="card-title">${video.title}</h3>
          </div>
        </a>
      `;
    }).join('');

    // 画像読み込み完了後、フェードイン開始＆自動スクロール開始
    waitForImagesToLoad(container).then(() => {
      // フェードインアニメーション発火
      setTimeout(() => {
        const items = container.querySelectorAll('.featured-work-item');
        items.forEach(item => item.classList.add('show'));
      }, 50);
      
      // 自動スクロール開始
      if (typeof window.initAutoScroll === 'function') {
        window.initAutoScroll();
      }
    });
  }

  /**
   * 画像の読み込み完了を待つ
   * @param {HTMLElement} container - コンテナ要素
   * @returns {Promise}
   */
  function waitForImagesToLoad(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  }

  /**
   * エラー表示
   */
  function renderError() {
    const container = document.getElementById('featured-works-container');
    if (!container) return;

    container.innerHTML = `
      <div class="error-message">
        <p>動画の読み込みに失敗しました</p>
      </div>
    `;
  }

  /**
   * Songs データを取得
   */
  async function fetchSongs() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLAYLIST}/${API_CONFIG.PLAYLIST_ID}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        renderSongs(result.data);
      } else {
        renderError();
      }
      
    } catch (error) {
      console.error('Songs取得エラー:', error);
      renderError();
    }
  }

  // グローバルに公開（index.htmlから呼び出すため）
  window.loadFeaturedWorks = fetchSongs;

  // DOMContentLoaded後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchSongs);
  } else {
    fetchSongs();
  }
})();
