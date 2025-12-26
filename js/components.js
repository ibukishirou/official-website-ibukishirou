// ============================================
// 共通コンポーネント（ヘッダー・フッター）
// ============================================

// ヘッダーHTML
function getHeaderHTML() {
  return `
    <nav>
      <a href="index.html" class="logo" style="text-decoration: none;">
        <img src="assets/img/logo_wolf.webp" alt="伊吹しろう ロゴ">
        <span>伊吹しろう Official Website</span>
      </a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="profile.html">Profile</a></li>
        <li><a href="calendar.html">Calendar</a></li>
        <li><a href="achievements.html">Achievements</a></li>
        <li><a href="goods.html">Goods</a></li>
        <li><a href="guidelines.html">Guidelines</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
      <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  `;
}

// フッターHTML
function getFooterHTML() {
  return `
    <div class="footer-content">
      <div class="footer-section">
        <h3>Navigation</h3>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="calendar.html">Calendar</a></li>
          <li><a href="achievements.html">Achievements</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Information</h3>
        <ul class="footer-links">
          <li><a href="goods.html">Goods</a></li>
          <li><a href="guidelines.html">Fan Guidelines</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Legal</h3>
        <ul class="footer-links">
          <li><a href="terms.html">利用規約</a></li>
          <li><a href="privacy.html">プライバシーポリシー</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 伊吹しろう Official Website. All Rights Reserved.</p>
    </div>
  `;
}

// ヘッダー・フッターを挿入
document.addEventListener('DOMContentLoaded', () => {
  // ヘッダー挿入
  const header = document.querySelector('header');
  if (header && !header.querySelector('nav')) {
    header.innerHTML = getHeaderHTML();
  }
  
  // フッター挿入
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.footer-content')) {
    footer.innerHTML = getFooterHTML();
  }
});
