/**
 * Live Schedule機能
 * YouTube Data API から次回配信情報を取得して表示
 */

(function() {
  'use strict';

  /**
   * 日時をJSTフォーマット（MM.DD HH:mm）に変換
   * @param {string} isoDateString - ISO 8601形式の日時文字列
   * @returns {string} フォーマット済みの日時文字列
   */
  function formatToJST(isoDateString) {
    if (!isoDateString) return '';
    
    const date = new Date(isoDateString);
    
    // JSTに変換（UTC+9）
    const jstDate = new Date(date.toLocaleString('en-US', { timeZone: API_CONFIG.TIMEZONE }));
    
    const month = String(jstDate.getMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getDate()).padStart(2, '0');
    const hours = String(jstDate.getHours()).padStart(2, '0');
    const minutes = String(jstDate.getMinutes()).padStart(2, '0');
    
    return `${month}.${day} ${hours}:${minutes}`;
  }

  /**
   * Live Scheduleセクションを描画
   * @param {Object} stream - ライブ配信情報
   */
  function renderLiveSchedule(stream) {
    const container = document.getElementById('live-schedule-container');
    if (!container) return;

    const isLive = stream.liveStatus === 'live';
    const scheduledTime = formatToJST(stream.scheduledStartTime);
    const videoUrl = `https://www.youtube.com/watch?v=${stream.videoId}`;
    
    // maxresdefault.jpg を使用（高解像度サムネイル）
    const thumbnailUrl = `https://img.youtube.com/vi/${stream.videoId}/maxresdefault.jpg`;
    
    container.innerHTML = `
      <a href="${videoUrl}" target="_blank" class="live-schedule-card fade-in" rel="noopener noreferrer">
        <div class="live-thumbnail-wrapper">
          <img src="${thumbnailUrl}" alt="${stream.title}" class="live-thumbnail">
          ${isLive ? '<div class="now-on-air-badge">NOW ON AIR</div>' : ''}
        </div>
        <div class="live-info">
          <h3 class="live-title">${stream.title}</h3>
          <p class="live-datetime">
            <i class="ri-calendar-line"></i>
            ${isLive ? '配信中' : scheduledTime}
          </p>
        </div>
      </a>
    `;
    
    // フェードインアニメーションを発火
    setTimeout(() => {
      const card = container.querySelector('.live-schedule-card');
      if (card) card.classList.add('show');
    }, 50);
  }

  /**
   * 配信予定なしの表示
   */
  function renderNoSchedule() {
    const container = document.getElementById('live-schedule-container');
    if (!container) return;

    container.innerHTML = `
      <div class="no-schedule fade-in">
        <p class="no-schedule-text">配信予定が登録されていません</p>
        <a href="${API_CONFIG.YOUTUBE_CHANNEL_URL}" target="_blank" class="channel-link-button" rel="noopener noreferrer">
          <i class="ri-youtube-line"></i>
          YouTubeチャンネルへ
        </a>
      </div>
    `;
    
    // フェードインアニメーションを発火
    setTimeout(() => {
      const noSchedule = container.querySelector('.no-schedule');
      if (noSchedule) noSchedule.classList.add('show');
    }, 50);
  }

  /**
   * Live Schedule データを取得
   */
  async function fetchLiveSchedule() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_SCHEDULE}/${API_CONFIG.CHANNEL_ID}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        // 最も近い配信（配信中または次回予定）を表示
        renderLiveSchedule(result.data[0]);
      } else {
        renderNoSchedule();
      }
      
    } catch (error) {
      console.error('Live Schedule取得エラー:', error);
      renderNoSchedule();
    }
  }

  // DOMContentLoaded後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLiveSchedule);
  } else {
    fetchLiveSchedule();
  }
})();
