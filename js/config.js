/**
 * API設定ファイル
 * YouTube Data API サーバーの接続情報を管理
 */

const API_CONFIG = {
  // APIサーバーのベースURL
  BASE_URL: 'https://youtube-server-production-f2e2.up.railway.app',
  
  // YouTube チャンネルID
  CHANNEL_ID: 'UChP4FdJdy5tZrUkagu0G1Sw',
  
  // 再生リストID（Songs）
  PLAYLIST_ID: 'PLZ3zQ-nXeOykejXDUSsFUE8Hcf58tz599',
  
  // YouTubeチャンネルURL
  YOUTUBE_CHANNEL_URL: 'https://www.youtube.com/@ibukishirou',
  
  // エンドポイント
  ENDPOINTS: {
    LIVE_SCHEDULE: '/api/live-schedule',
    PLAYLIST: '/api/playlist'
  },
  
  // タイムゾーン設定
  TIMEZONE: 'Asia/Tokyo'
};

// グローバルに公開
window.API_CONFIG = API_CONFIG;
