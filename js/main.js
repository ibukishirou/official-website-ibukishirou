// ============================================
// VTuber 伊吹しろう 公式サイト - メインJS
// ============================================

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

  setTimeout(() => {
    if (container.scrollWidth <= container.clientWidth) {
      console.warn('⚠️  No scrollable content. Retrying in 500ms...');
      setTimeout(() => initAutoScroll(), 500);
      return;
    }

    console.log('✅ Starting auto-scroll');

    let isPausedByUser = false;
    let isWaitingAtEnd = false;
    let isReturningToStart = false;
    const scrollSpeed = 0.5;
    const pauseDuration = 3000;
    const returnDuration = 800;

    // ============================================
    // ドラッグ操作用オーバーレイを作成
    // ============================================
    // 既存のオーバーレイがあれば削除（二重初期化防止）
    const existingOverlay = container.querySelector('.drag-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'drag-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      cursor: grab;
    `;

    container.style.position = 'relative';
    container.appendChild(overlay);

    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let dragDistance = 0;

    overlay.addEventListener('mousedown', (e) => {
      isDragging = true;
      isPausedByUser = true;
      dragStartX = e.clientX;
      dragStartScrollLeft = container.scrollLeft;
      dragDistance = 0;
      overlay.style.cursor = 'grabbing';
      e.preventDefault();
      console.log('🟢 dragstart', dragStartX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX;
      dragDistance = Math.abs(delta);
      container.scrollLeft = dragStartScrollLeft - delta;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;

      isDragging = false;
      overlay.style.cursor = 'grab';

      // ドラッグ距離が5px未満はクリックとみなす
      if (dragDistance < 5) {
        overlay.style.pointerEvents = 'none';
        const el = document.elementFromPoint(e.clientX, e.clientY);
        overlay.style.pointerEvents = '';

        if (el) {
          const link = el.closest('a');
          if (link && link.href) {
            window.open(link.href, link.target || '_blank');
          }
        }
      }

      setTimeout(() => {
        isPausedByUser = false;
      }, 1500);
    });

    // ホバー中は自動スクロール停止
    overlay.addEventListener('mouseenter', () => {
      if (!isDragging) isPausedByUser = true;
    });
    overlay.addEventListener('mouseleave', () => {
      if (!isDragging) isPausedByUser = false;
      if (isDragging) {
        isDragging = false;
        overlay.style.cursor = 'grab';
      }
    });

    // タッチ操作（スマホ用）
    container.addEventListener('touchstart', () => {
      isPausedByUser = true;
    }, { passive: true });
    container.addEventListener('touchend', () => {
      setTimeout(() => { isPausedByUser = false; }, 1500);
    }, { passive: true });
    container.addEventListener('touchcancel', () => {
      isPausedByUser = false;
    }, { passive: true });

    // ============================================
    // 自動スクロール
    // ============================================
    function scroll() {
      if (!isPausedByUser && !isWaitingAtEnd && !isReturningToStart) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        container.scrollLeft += scrollSpeed;

        if (container.scrollLeft >= maxScrollLeft - 1) {
          isWaitingAtEnd = true;

          setTimeout(() => {
            isWaitingAtEnd = false;
            isReturningToStart = true;

            container.style.scrollBehavior = 'smooth';
            container.scrollLeft = 0;

            setTimeout(() => {
              container.style.scrollBehavior = 'auto';
              isReturningToStart = false;
            }, returnDuration);

          }, pauseDuration);
        }
      }

      requestAnimationFrame(scroll);
    }

    requestAnimationFrame(scroll);
  }, 100);
};
