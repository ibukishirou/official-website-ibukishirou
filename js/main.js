// ============================================
// VTuber 伊吹しろう 公式サイト - メインJS
// ============================================

console.log('[main.js] スクリプト読み込み開始');

// ハンバーガーメニュー
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    
    // メニューリンククリック時にメニューを閉じる
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
});

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// スクロールアニメーション
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// アニメーション対象要素にスタイルを適用
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('.card, .news-item, .faq-item, .profile-container');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
});

// YouTube埋め込み用サムネイル取得
function getYouTubeThumbnail(url) {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
}

function extractYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// YouTube埋め込みリンク生成
function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
}

// スクロールインジケーター制御
document.addEventListener('DOMContentLoaded', () => {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  if (scrollIndicator) {
    setTimeout(() => {
      if (window.scrollY === 0) {
        scrollIndicator.classList.add('visible');
      }
    }, 3000);
    
    window.addEventListener('scroll', () => {
      if (window.scrollY === 0) {
        scrollIndicator.classList.remove('hidden');
        scrollIndicator.classList.add('visible');
      } else {
        scrollIndicator.classList.remove('visible');
        scrollIndicator.classList.add('hidden');
      }
    });
  }
});

// ============================================
// YouTube ループ再生の保険（IFrame Player API）
// ============================================

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let heroPlayer;

function onYouTubeIframeAPIReady() {
  const iframe = document.getElementById('hero-video');
  if (!iframe) return;

  heroPlayer = new YT.Player('hero-video', {
    events: {
      onStateChange: function(event) {
        if (event.data === YT.PlayerState.ENDED) {
          heroPlayer.seekTo(0);
          heroPlayer.playVideo();
        }
      }
    }
  });
}

// ============================================
// Featured Works 自動スクロール＆ドラッグ操作
// ============================================

window.initAutoScroll = function initAutoScroll() {
  const container = document.getElementById('featured-works-container');
  if (!container) {
    console.error('❌ Container not found');
    return;
  }

  console.log('🚀 initAutoScroll called');

  // 少し待ってから初期化（画像読み込み完了を確実にする）
  setTimeout(() => {
    console.log('📊 Container scroll info:', {
      scrollWidth: container.scrollWidth,
      clientWidth: container.clientWidth,
      hasScroll: container.scrollWidth > container.clientWidth
    });

    if (container.scrollWidth <= container.clientWidth) {
      console.warn('⚠️  No scrollable content yet. Retrying in 500ms...');
      setTimeout(() => initAutoScroll(), 500);
      return;
    }

    console.log('✅ Starting auto-scroll initialization');

    // スクロール状態管理
    let isPausedByUser = false;
    let isReturningToStart = false;
    let animationFrameId = null;
    
    // スクロール設定
    const scrollSpeed = 0.5; // ピクセル/フレーム
    const returnAnimationDuration = 800; // ミリ秒

    // ============================================
    // PCドラッグ操作
    // ============================================
    let isDragging = false;
    let hasMoved = false; // ドラッグで実際に移動したか
    let startX = 0;
    let scrollLeft = 0;

    container.style.cursor = 'grab';

    const handleMouseDown = (e) => {
      isDragging = true;
      hasMoved = false;
      isPausedByUser = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      console.log('🖱️ Mouse down');
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      
      // 5px以上移動したらドラッグと判定
      if (Math.abs(walk) > 5) {
        hasMoved = true;
        container.scrollLeft = scrollLeft - walk;
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = 'grab';
      
      // ドラッグで移動していない場合はクリックとして扱う（リンク遷移を許可）
      if (hasMoved) {
        console.log('🖱️ Drag ended, resuming in 1.5s');
        e.preventDefault(); // リンク遷移を防ぐ
        
        // 1.5秒後に自動スクロール再開
        setTimeout(() => {
          isPausedByUser = false;
          console.log('▶️ Auto-scroll resumed');
        }, 1500);
      } else {
        console.log('🖱️ Click detected (no drag movement)');
        // クリックの場合は即座に自動スクロール再開
        isPausedByUser = false;
      }
    };

    const handleMouseLeave = () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';
        setTimeout(() => {
          isPausedByUser = false;
        }, 1500);
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    // ============================================
    // SPタッチ操作（ネイティブスクロール使用）
    // ============================================
    // タッチスクロールは一時停止不要（ページ遷移と競合するため）
    // ネイティブの横スクロールをそのまま使用

    // ============================================
    // 自動スクロールループ
    // ============================================
    function autoScrollLoop() {
      if (!isPausedByUser && !isReturningToStart) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        // 終端に到達したか確認
        if (currentScroll >= maxScroll - 1) {
          console.log('🔄 Reached end, returning to start');
          isReturningToStart = true;

          // smoothアニメーションで先頭に戻る
          container.style.scrollBehavior = 'smooth';
          container.scrollLeft = 0;

          // アニメーション完了後にフラグをリセット
          setTimeout(() => {
            container.style.scrollBehavior = 'auto';
            isReturningToStart = false;
            console.log('✅ Returned to start');
          }, returnAnimationDuration);
        } else {
          // 通常の自動スクロール
          container.scrollLeft += scrollSpeed;
        }
      }

      animationFrameId = requestAnimationFrame(autoScrollLoop);
    }

    // 自動スクロール開始
    console.log('▶️ Starting auto-scroll loop');
    autoScrollLoop();

    // クリーンアップ用（必要に応じて）
    window.stopAutoScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        console.log('⏹️ Auto-scroll stopped');
      }
    };

  }, 200);
};

console.log('[main.js] window.initAutoScroll 定義完了, typeof:', typeof window.initAutoScroll);
