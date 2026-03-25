/**
 * Live Schedule機能（カレンダー形式）
 * YouTube Data API から配信情報を取得してカレンダー形式で表示
 */

(function() {
  'use strict';

  // 現在表示している日付（JST）
  let currentDate = new Date();
  
  // APIから取得した全配信データ（キャッシュ）
  let allStreams = [];

  /**
   * 日付をYYYY-MM-DD形式に変換（JST）
   * @param {Date} date - 日付オブジェクト
   * @returns {string} YYYY-MM-DD形式の文字列
   */
  function formatDateKey(date) {
    const jstDate = new Date(date.toLocaleString('en-US', { timeZone: API_CONFIG.TIMEZONE }));
    const year = jstDate.getFullYear();
    const month = String(jstDate.getMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 日付をMM.DD形式に変換
   * @param {Date} date - 日付オブジェクト
   * @returns {string} MM.DD形式の文字列
   */
  function formatDateHeader(date) {
    const jstDate = new Date(date.toLocaleString('en-US', { timeZone: API_CONFIG.TIMEZONE }));
    const month = String(jstDate.getMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  }

  /**
   * 時刻をHH:mm形式に変換（JST）
   * @param {string} isoDateString - ISO 8601形式の日時文字列
   * @returns {string} HH:mm形式の時刻文字列
   */
  function formatTime(isoDateString) {
    if (!isoDateString) return '';
    
    const date = new Date(isoDateString);
    const jstDate = new Date(date.toLocaleString('en-US', { timeZone: API_CONFIG.TIMEZONE }));
    
    const hours = String(jstDate.getHours()).padStart(2, '0');
    const minutes = String(jstDate.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  /**
   * カレンダーUIを描画
   */
  function renderCalendar() {
    const container = document.getElementById('live-schedule-container');
    if (!container) return;

    const dateKey = formatDateKey(currentDate);
    const dateHeader = formatDateHeader(currentDate);
    
    // 該当日の配信を検索
    const streamOfDay = allStreams.find(stream => {
      const streamDate = new Date(stream.scheduledStartTime);
      return formatDateKey(streamDate) === dateKey;
    });

    const html = `
      <div class="calendar-wrapper fade-in">
        <!-- 日付ヘッダー -->
        <div class="calendar-header">
          <div class="calendar-date">${dateHeader}</div>
        </div>
        
        <!-- ナビゲーション＋配信情報 -->
        <div class="calendar-body">
          <button class="calendar-nav prev" aria-label="前日">
            <i class="ri-arrow-left-s-line"></i>
            PREV
          </button>
          
          <div class="calendar-content">
            ${streamOfDay ? renderStreamContent(streamOfDay) : renderNoStreamContent()}
          </div>
          
          <button class="calendar-nav next" aria-label="翌日">
            NEXT
            <i class="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // イベントリスナーを設定
    setupEventListeners();

    // フェードインアニメーションを発火
    setTimeout(() => {
      const calendar = container.querySelector('.calendar-wrapper');
      if (calendar) calendar.classList.add('show');
    }, 50);
  }

  /**
   * 配信情報のHTML生成
   * @param {Object} stream - 配信情報
   * @returns {string} HTML文字列
   */
  function renderStreamContent(stream) {
    const isLive = stream.liveStatus === 'live';
    const time = formatTime(stream.scheduledStartTime);
    const videoUrl = `https://www.youtube.com/watch?v=${stream.videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${stream.videoId}/maxresdefault.jpg`;

    return `
      <a href="${videoUrl}" target="_blank" class="stream-card" rel="noopener noreferrer">
        <div class="stream-time">
          ${isLive ? '<span class="live-badge">● 配信中</span>' : `<i class="ri-play-circle-line"></i> ${time}`}
        </div>
        <div class="stream-thumbnail-wrapper">
          <img src="${thumbnailUrl}" alt="${stream.title}" class="stream-thumbnail" loading="lazy">
        </div>
        <div class="stream-title">${stream.title}</div>
      </a>
    `;
  }

  /**
   * 配信なしのHTML生成
   * @returns {string} HTML文字列
   */
  function renderNoStreamContent() {
    return `
      <div class="no-stream">
        <i class="ri-calendar-close-line"></i>
        <p>配信お休み</p>
      </div>
    `;
  }

  /**
   * イベントリスナーを設定
   */
  function setupEventListeners() {
    const prevBtn = document.querySelector('.calendar-nav.prev');
    const nextBtn = document.querySelector('.calendar-nav.next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        renderCalendar();
      });
    }
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
      
      // データをキャッシュ
      if (result.data && result.data.length > 0) {
        allStreams = result.data;
      } else {
        allStreams = [];
      }
      
      // カレンダーを描画
      renderCalendar();
      
    } catch (error) {
      console.error('Live Schedule取得エラー:', error);
      allStreams = [];
      renderCalendar();
    }
  }

  // DOMContentLoaded後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLiveSchedule);
  } else {
    fetchLiveSchedule();
  }
})();
