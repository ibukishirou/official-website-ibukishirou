# PWA実装ガイド

## 📱 Progressive Web App（PWA）について

このWebサイトはPWA（Progressive Web App）に対応しており、以下の機能を提供します。

---

## ✨ 主な機能

### 1. オフライン対応
- ネットワーク接続がなくてもコンテンツを閲覧可能
- Service Workerによる自動キャッシュ管理

### 2. ホーム画面に追加
- スマートフォンのホーム画面にアイコンを追加
- アプリのようにワンタップで起動

### 3. スタンドアロンモード
- ブラウザのUIなしで起動
- 没入感のある閲覧体験

### 4. 高速読み込み
- キャッシュ戦略による高速なページ表示
- ネットワーク負荷の軽減

---

## 🔧 技術仕様

### Service Worker（`sw.js`）

#### キャッシュバージョン
```javascript
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `ibukishirou-${CACHE_VERSION}`;
```

#### キャッシュ戦略

**Network First with Cache Fallback**
- HTML/CSS/JavaScript: 最新版を優先、失敗時はキャッシュ
- 画像/フォント: キャッシュ優先で高速表示

#### キャッシュ対象
- 全HTMLページ
- CSS/JavaScriptファイル
- 主要画像（ロゴ、アイコン）
- Web App Manifest

### Web App Manifest（`site.webmanifest`）

```json
{
  "name": "伊吹しろう Official Website",
  "short_name": "伊吹しろう",
  "description": "VTuber 伊吹しろう 公式サイト",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0a0a0a",
  "theme_color": "#8B0000",
  "categories": ["entertainment", "lifestyle"],
  "icons": [
    {
      "src": "/assets/img/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/img/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 🧪 動作確認方法

### 1. Service Worker登録確認

**Chrome DevTools**
1. F12キーでDevToolsを開く
2. `Application` タブを選択
3. `Service Workers` セクションで登録状態を確認

**コンソールログ**
```
[PWA] Service Worker registered: https://ulric.jp/
```

### 2. キャッシュ確認

**Chrome DevTools**
1. `Application` > `Cache Storage`
2. `ibukishirou-v1.0.0` キャッシュを確認
3. キャッシュされたリソースのリストを表示

### 3. オフラインテスト

**手順**
1. ページを一度表示してキャッシュを作成
2. DevTools > `Network` > `Offline` にチェック
3. ページをリロードして表示確認

### 4. PWAスコア確認

**Lighthouse**
1. DevTools > `Lighthouse` タブ
2. `Progressive Web App` を選択
3. `Analyze page load` を実行
4. PWAスコアを確認（90点以上が目標）

### 5. インストールテスト

**デスクトップ（Chrome）**
1. アドレスバー右端の「インストール」ボタンをクリック
2. 確認ダイアログで「インストール」を選択
3. スタンドアロンウィンドウで起動確認

**スマートフォン（Chrome/Safari）**
1. メニュー > 「ホーム画面に追加」を選択
2. ホーム画面にアイコンが追加されることを確認
3. アイコンタップで起動確認

---

## 🔄 更新とメンテナンス

### Service Workerの更新

バージョンを更新する場合:

1. `sw.js` の `CACHE_VERSION` を変更
```javascript
const CACHE_VERSION = 'v1.0.1'; // 新バージョン
```

2. 変更をデプロイ

3. ユーザーが次回アクセス時に自動更新

### キャッシュのクリア

**プログラム的にクリア**
```javascript
// Service Workerにメッセージを送信
navigator.serviceWorker.controller.postMessage({
  type: 'CLEAR_CACHE'
});
```

**手動でクリア**
- Chrome DevTools > Application > Clear storage

---

## 📊 パフォーマンス指標

### 期待される改善

- **初回表示**: 通常通り
- **2回目以降**: 50-70%高速化（キャッシュ効果）
- **オフライン**: 完全動作
- **Lighthouse PWAスコア**: 90点以上

### ネットワークリクエスト削減

- キャッシュヒット率: 80%以上
- 帯域幅削減: 約60-70%

---

## 🚨 トラブルシューティング

### Service Workerが登録されない

**原因**
- HTTPSでない（localhostを除く）
- ブラウザがService Workerに対応していない

**解決方法**
1. HTTPSを確認
2. ブラウザをアップデート
3. コンソールエラーを確認

### キャッシュが更新されない

**原因**
- Service Workerのバージョンが同じ
- ブラウザキャッシュの問題

**解決方法**
1. `CACHE_VERSION` を変更
2. ハードリロード（Ctrl+Shift+R）
3. DevToolsでキャッシュを手動削除

### オフラインで一部のページが表示されない

**原因**
- Service Workerの `STATIC_ASSETS` に未登録

**解決方法**
1. `sw.js` の `STATIC_ASSETS` 配列に追加
2. バージョンを更新してデプロイ

---

## 📚 参考リンク

- [MDN - Progressive Web Apps](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [Google - Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/ja/docs/Web/Manifest)

---

## 🎯 今後の拡張案

### Phase 2
- [ ] Push通知機能
- [ ] バックグラウンド同期
- [ ] オフライン時のフォーム送信キュー

### Phase 3
- [ ] アプリショートカット
- [ ] Share Target API
- [ ] File System Access API

---

## 📝 変更履歴

### v1.0.0 (2024-12-26)
- Service Worker初回実装
- PWA基本機能実装
- 192x192、512x512アイコン追加
- マニフェストファイル拡張
- 全ページにPWAメタタグ追加
