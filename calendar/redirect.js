// /calendar へのアクセスを /schedule にリダイレクト
(function() {
  'use strict';
  
  // 現在のパスが /calendar または /calendar/ の場合、/schedule にリダイレクト
  const currentPath = window.location.pathname;
  
  if (currentPath === '/calendar' || currentPath === '/calendar/') {
    window.location.replace('/schedule');
  }
})();
