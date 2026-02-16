---
rule_category: "process-improvement/deployment"
priority: "critical"
domain: "deployment"
source: "docs/reflectors/feature-order-2-reflection-2025-11-07.md"
last_updated: "2025-11-07"
helpful_count: 0
harmful_count: 0
---

# デプロイ後のビルド識別: バージョン埋め込み

**いつ読むべきか:** SPA のデプロイ時、キャッシュによる「古いビルドが表示される」問題に対処する時

## 構造化データ
```yaml
lesson:
  context: "本番環境で「古い動作」が見られるが、原因がキャッシュか新しいコードの問題かが不明"
  problem: "デプロイしたビルドのバージョンやコミットが確認できず、何が動いているか分からない"
  root_cause: "ビルド成果物にバージョン情報が埋め込まれていない"
  solution: |
    ビルド時に以下を埋め込む:
    - package.json の version
    - git commit の短縮 SHA
    - ビルド時刻
    これらを document.title と console に出力し、ブラウザで即座に確認可能にする
  principle: "SPA では Service Worker やブラウザキャッシュによる混乱が頻発する。ビルド識別子の埋め込みは必須。"
  applicability: |
    - Vite, webpack などのビルドツールを使用する SPA
    - Service Worker を使用するアプリ
    - CDN や aggressive caching を使用する環境
  
  metadata:
    source: "docs/reflectors/feature-order-2-reflection-2025-11-07.md"
    extracted_date: "2025-11-07"
    keywords: [deployment, version-embedding, cache-busting, vite, spa]
    feedback_signal: "execution_success"
```

## 要点
- **ビルド時に埋め込み:** Vite の `define` で __APP_VERSION__, __APP_COMMIT__, __BUILD_TIME__ を注入
- **ブラウザで即座確認:** document.title と console.debug で出力し、デプロイ後すぐに確認可能

## 詳細

### 背景
SPA では Service Worker やブラウザキャッシュにより、新しいコードをデプロイしても「古いビルド」が表示され続けることがある。何が動いているかを確認する手段がないと、問題の切り分けが困難。

### 問題の症状
- デプロイ後も古い動作が見られる
- 「キャッシュのせいか、コードのバグか」が判断できない
- ユーザーからの報告で「どのバージョンが動いているか」が不明

### 根本原因
- ビルド成果物にバージョン情報が含まれていない
- ブラウザで動作中のコードが「いつのビルドか」を確認する手段がない

### 解決策（具体的手順）

#### 1. Vite でビルド時定数を定義

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import pkg from './package.json';

const COMMIT = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
})();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(COMMIT),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
```

#### 2. エントリーポイントで出力

**src/main.tsx:**
```typescript
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;
declare const __BUILD_TIME__: string;

try {
  const ver = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const commit = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'local';
  document.title = `${document.title} — v${ver} (${commit})`;
  console.debug('App version:', ver, commit, typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '');
} catch {
  // ignore
}
```

#### 3. 確認方法
- **ブラウザタブのタイトル:** `App Name — v1.2.3 (abc1234)` のように表示される
- **開発者ツールのコンソール:** `App version: 1.2.3 abc1234 2025-11-07T10:30:00.000Z`

### 教訓
SPA のデプロイでは「何が動いているか」を確認できる仕組みが必須。ビルド時にバージョン情報を埋め込み、ブラウザで即座に確認可能にする。

### 適用場面
- Vite, webpack, Rollup などのビルドツールを使用する SPA
- Service Worker を使用するアプリ（キャッシュ制御が複雑）
- CDN や aggressive caching を使用する環境
- ユーザーからの報告で「どのバージョンが動いているか」を確認したい時

### 応用
- CI で環境変数からビルド番号やデプロイ時刻を注入
- Sentry などのエラートラッキングツールにバージョン情報を送信
- index.html に meta タグでバージョンを埋め込む（HTML レベルでの確認）

---
> 📖 デプロイ後のビルド識別 Wisdom が読み込まれました
