// ============================================
// Service Worker登録スクリプト
// ============================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // 更新があるかチェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA] New Service Worker found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しいService Workerがインストールされた
              console.log('[PWA] New content available, please refresh');
              
              // 必要に応じてユーザーに通知
              if (confirm('新しいバージョンが利用可能です。ページを更新しますか？')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
    
    // Service Workerが更新された時の処理
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

// PWAインストール促進
let deferredPrompt;
const installButton = document.getElementById('pwa-install-button');

window.addEventListener('beforeinstallprompt', (e) => {
  // デフォルトのインストールプロンプトを抑制
  e.preventDefault();
  deferredPrompt = e;
  
  // インストールボタンがある場合は表示
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
});

// PWAとしてインストール済みかチェック
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed');
  deferredPrompt = null;
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// スタンドアロンモードで起動しているかチェック
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
  console.log('[PWA] Running in standalone mode');
  document.body.classList.add('pwa-standalone');
}
