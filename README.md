# 伊吹しろう Official Website

## 概要

VTuber「伊吹しろう」の公式Webサイト。
プロフィール、実績、カレンダー、グッズ、ガイドライン、FAQ等の情報を提供。

URL: https://ulric.jp

## 技術スタック

- HTML5/CSS3/JavaScript（Vanilla、フレームワークなし）
- PWA対応（Service Worker）
- 静的サイト（サーバーサイド処理なし）
- JSONファイルによるデータ管理
- GitHub Pages ホスティング

### 実装機能

- SEO対策（OGP、構造化データ、sitemap.xml、robots.txt）
- PWA（Service Worker、オフライン対応、ホーム画面追加、アプリインストール）
- レスポンシブデザイン（PC/タブレット/スマートフォン）
- パンくずリスト自動生成
- ソーシャルシェア機能
- ローディングアニメーション

### デザイン仕様

- プライマリカラー: `#8B0000` (ダークレッド)
- セカンダリカラー: `#5C8B8B` (ダークシアン)
- アクセントカラー: `#CD5C5C` (インディアンレッド)
- 背景色: `#0a0a0a` (ブラック)
- テキスト: `#e0e0e0` (ライトグレー)
- フォント: Noto Serif JP（明朝体）、Noto Sans JP（ゴシック体）

## 開発・メンテナンス時の重要ルール

### Git ワークフロー

```
main ブランチを最新化
  ↓
feature/xxx ブランチを作成
  ↓
開発・修正作業
  ↓
コミット（変更の度に必ずコミット）
  ↓
mainブランチの最新を取得・マージ
  ↓
全コミットをsquash（1つにまとめる）
  ↓
プッシュ
  ↓
Pull Request作成
```

### 新規HTMLページ追加時の必須対応

1. `<head>` 内に以下を追加:

```html
<!-- PWA Meta Tags -->
<meta name="theme-color" content="#8B0000">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="伊吹しろう">

<!-- Favicon -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

2. `</body>` 直前に追加:

```html
<script src="js/components.js"></script>
<script src="js/loading.js"></script>
<script src="js/breadcrumb.js"></script>
<script src="js/sw-register.js"></script>
```

3. `sitemap.xml` に新規URLを追加

4. `sw.js` の `STATIC_ASSETS` 配列に新規HTMLファイルを追加

5. Service Workerのバージョンを更新（後述）

### Service Worker更新時のルール

ファイル: `sw.js`

1. **バージョン番号を必ず変更**:

```javascript
const CACHE_VERSION = 'v1.0.1'; // 変更前: v1.0.0
```

2. **キャッシュ対象ファイルリスト更新**:

新規ファイル追加時は `STATIC_ASSETS` 配列に追加:

```javascript
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/new-page.html', // 新規追加
  '/css/style.css',
  // ...
];
```

3. **バージョン更新タイミング**:
- 新規HTMLページ追加時
- CSS/JavaScriptファイル追加時
- 重要な画像ファイル追加時
- キャッシュ戦略変更時

### 画像ファイル追加時のルール

- WebP形式を優先使用
- `alt` 属性必須（SEO対策）
- ファイル名: 小文字英数字とハイフン、アンダースコアのみ
- 配置場所: `/assets/img/` または `/assets/goods/`

### CSS/JavaScript更新時

- 大きな変更を行った場合は Service Worker のバージョンを更新
- `sw.js` のキャッシュ対象リストを確認

### データファイル（JSON）管理

- `/data/*.json` でコンテンツデータを管理
- 主要データファイル:
  - `calendar.json` - イベントカレンダー（定期配信、特別イベント）
  - `achievements.json` - 実績・年表データ
  - `works.json` - 制作物情報
  - `goods.json` - グッズ情報
  - `links.json` - ソーシャルリンク
  - `faq.json` - よくある質問
  - `guidelines.json` - ファンガイドライン

### ディレクトリ構造

```
/
├── *.html                 # 各ページHTMLファイル
├── sw.js                  # Service Worker
├── site.webmanifest       # PWA Manifest
├── sitemap.xml
├── robots.txt
├── /css/                  # スタイルシート
├── /js/                   # JavaScript
│   ├── sw-register.js    # Service Worker登録
│   └── ...
├── /data/                 # JSONデータ
├── /assets/
│   ├── /img/             # 画像ファイル
│   │   ├── icon-192x192.png  # PWA用アイコン
│   │   ├── icon-512x512.png  # PWA用アイコン
│   │   └── ...
│   └── /goods/           # グッズ画像
```

### PWA関連の重要事項

- Service Workerは HTTPS 環境必須（localhost除く）
- キャッシュ戦略: Network First with Cache Fallback
- オフライン対応: 静的アセットは自動キャッシュ
- アイコンサイズ: 192x192、512x512（マスカブル対応）
- manifest の theme_color: `#8B0000`

### SEO関連の必須項目

各HTMLページに必須:
- `<title>` タグ
- `<meta name="description">`
- OGPタグ（og:title, og:description, og:image, og:url）
- Twitter Cardタグ
- 構造化データ（JSON-LD形式）
- `<link rel="canonical">`
