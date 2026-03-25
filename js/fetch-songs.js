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
    console.log('[renderSongs] 呼び出されました, videos.length:', videos.length);
    const container = document.getElementById('featured-works-container');
    
    if (!container) {
      console.error('[renderSongs] featured-works-container が見つかりません');
      return;
    }
    
    console.log('[renderSongs] コンテナ要素:', container);

    // 逆順に並び替え（最新が先頭）
    const reversedVideos = [...videos].reverse();
    console.log('[renderSongs] 逆順ソート完了, reversedVideos.length:', reversedVideos.length);

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
    
    console.log('[renderSongs] HTML生成完了, container.innerHTML.length:', container.innerHTML.length);
    console.log('[renderSongs] 生成されたアイテム数:', container.querySelectorAll('.featured-work-item').length);

    // 画像読み込み完了後、フェードイン開始＆自動スクロール開始
    waitForImagesToLoad(container).then(() => {
      console.log('[renderSongs] 画像読み込み完了');
      // フェードインアニメーション発火
      setTimeout(() => {
        const items = container.querySelectorAll('.featured-work-item');
        console.log('[renderSongs] フェードイン開始, items.length:', items.length);
        items.forEach(item => item.classList.add('show'));
        console.log('[renderSongs] フェードイン完了');
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
      console.log('[fetch-songs.js] 実行開始');
      
      // API_CONFIG の存在チェック
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG) {
        console.error('[fetch-songs.js] API_CONFIG が読み込まれていません');
        renderError();
        return;
      }
      
      console.log('[fetch-songs.js] API_CONFIG:', API_CONFIG);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLAYLIST}/${API_CONFIG.PLAYLIST_ID}`;
      console.log('[fetch-songs.js] API URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[fetch-songs.js] API レスポンス:', result);
      
      if (result.data && result.data.length > 0) {
        console.log(`[fetch-songs.js] ${result.data.length}件の動画を取得しました`);
        console.log('[fetch-songs.js] renderSongs() を呼び出します');
        renderSongs(result.data);
        console.log('[fetch-songs.js] renderSongs() 完了');
      } else {
        console.warn('[fetch-songs.js] 動画データが空です, result:', result);
        renderError();
      }
      
    } catch (error) {
      console.error('[fetch-songs.js] Songs取得エラー:', error);
      console.error('[fetch-songs.js] エラースタック:', error.stack);
      renderError();
    }
  }

  // グローバルに公開（index.htmlから呼び出すため）
  window.loadFeaturedWorks = fetchSongs;

  // デバッグ用: スクリプトが読み込まれたことを即座に表示
  console.log('[fetch-songs.js] ==================== スクリプト読み込み開始 ====================');
  const testContainer = document.getElementById('featured-works-container');
  if (testContainer) {
    testContainer.innerHTML = '<p style="color: yellow; padding: 2rem; text-align: center;">⚠️ fetch-songs.js が読み込まれました。データ取得中...</p>';
    console.log('[fetch-songs.js] テストメッセージを表示しました');
  } else {
    console.error('[fetch-songs.js] featured-works-container が見つかりません（スクリプト読み込み時）');
  }
  
  // 実行タイミングの改善
  console.log('[fetch-songs.js] スクリプト読み込み完了, readyState:', document.readyState);
  
  // ページ読み込み完了を確実に待つ
  if (document.readyState === 'loading') {
    console.log('[fetch-songs.js] DOMContentLoaded を待機中...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[fetch-songs.js] DOMContentLoaded イベント発火');
      fetchSongs();
    });
  } else {
    console.log('[fetch-songs.js] DOM already loaded, 即座に実行');
    // DOMがすでに読み込まれている場合は即座に実行
    fetchSongs();
  }
})();
