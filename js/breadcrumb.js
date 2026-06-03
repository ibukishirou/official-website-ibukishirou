/**
 * Breadcrumb Navigation Generator
 * SEO最適化用パンくずリスト自動生成スクリプト
 */

(function() {
  'use strict';

  // ページ情報のマッピング（英語表記でスタイリッシュに）
  const pageMap = {
    '/': { title: 'Home', icon: '🏠' },
    '/index.html': { title: 'Home', icon: '🏠' },
    '/profile': { title: 'Profile', icon: '👤' },
    '/schedule': { title: 'Schedule', icon: '📅' },
    '/achievements': { title: 'Achievements', icon: '🏆' },
    '/goods': { title: 'Goods', icon: '🛍️' },
    '/guidelines': { title: 'Guidelines', icon: '📋' },
    '/faq': { title: 'FAQ', icon: '❓' },
    '/contact': { title: 'Contact', icon: '📧' },
    '/terms': { title: 'Terms of Service', icon: '📜' },
    '/privacy': { title: 'Privacy Policy', icon: '🔒' },
    '/company': { title: 'Company', icon: '🏢' },
    '/commercial': { title: 'Commercial Transaction Act', icon: '📄' }
  };

  /**
   * パンくずリストを生成
   */
  function generateBreadcrumb() {
    // 現在のパスを取得（末尾スラッシュを除去）
    let currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath.endsWith('/')) {
      currentPath = currentPath.slice(0, -1);
    }
    
    // ホームページの場合はパンくずリストを表示しない
    if (currentPath === '/' || currentPath === '/index.html') {
      return;
    }

    // パンくずリスト要素を作成
    const breadcrumbNav = document.createElement('nav');
    breadcrumbNav.className = 'breadcrumb';
    breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');

    const breadcrumbList = document.createElement('ol');
    breadcrumbList.className = 'breadcrumb-list';

    // 構造化データ用
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": []
    };

    // ホームアイテムを追加
    const homeItem = createBreadcrumbItem({
      name: pageMap['/'].title,
      url: '/',
      position: 1,
      isLast: false
    });
    breadcrumbList.appendChild(homeItem.element);
    breadcrumbSchema.itemListElement.push(homeItem.schema);

    // 現在のページアイテムを追加
    const currentPage = pageMap[currentPath];
    if (currentPage) {
      const currentItem = createBreadcrumbItem({
        name: currentPage.title,
        url: currentPath,
        position: 2,
        isLast: true
      });
      breadcrumbList.appendChild(currentItem.element);
      breadcrumbSchema.itemListElement.push(currentItem.schema);
    }

    breadcrumbNav.appendChild(breadcrumbList);

    // 構造化データを追加
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(scriptTag);

    // ヘッダーの後に挿入
    const header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(breadcrumbNav, header.nextSibling);
    } else {
      document.body.insertBefore(breadcrumbNav, document.body.firstChild);
    }
  }

  /**
   * パンくずリストアイテムを作成
   */
  function createBreadcrumbItem({ name, url, position, isLast }) {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item' + (isLast ? ' active' : '');

    if (isLast) {
      // 最後のアイテム（現在のページ）
      li.setAttribute('aria-current', 'page');
      li.textContent = name;
    } else {
      // リンクアイテム
      const link = document.createElement('a');
      link.href = url;
      link.textContent = name;
      li.appendChild(link);

      // セパレーターを追加
      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
      separator.setAttribute('aria-hidden', 'true');
      separator.textContent = '›';
      li.appendChild(separator);
    }

    // 構造化データ
    const schemaItem = {
      "@type": "ListItem",
      "position": position,
      "name": name,
      "item": window.location.origin + url
    };

    return {
      element: li,
      schema: schemaItem
    };
  }

  /**
   * DOMContentLoaded時に実行
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateBreadcrumb);
  } else {
    generateBreadcrumb();
  }
})();
