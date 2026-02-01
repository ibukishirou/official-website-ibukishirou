/**
 * 末尾スラッシュ除去スクリプト
 * URLの末尾に/がある場合、/なしのURLにリダイレクト
 */
(function() {
  'use strict';
  
  // 現在のパスを取得
  const path = window.location.pathname;
  
  // ルートパス(/)は除外
  if (path === '/') {
    return;
  }
  
  // 末尾に/がある場合
  if (path.endsWith('/')) {
    // /を除去した新しいURLを作成
    const newPath = path.slice(0, -1);
    const newUrl = window.location.origin + newPath + window.location.search + window.location.hash;
    
    // リダイレクト（履歴を残さない）
    window.history.replaceState(null, '', newUrl);
  }
})();
