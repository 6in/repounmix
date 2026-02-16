# デバッグ戦略ガイドライン

## 目的
効率的なデバッグプロセスを確立し、問題解決までの時間を短縮するためのガイドライン。

---

## 基本原則

### 1. 問題の切り分け
**コード問題 vs 環境問題 vs ツール問題**

問題発生時、まず「どこ」に問題があるかを特定することが最重要。

```
問題発生
  ↓
┌─────────────────────┐
│ 環境・ツールを疑う   │ ← まずココ！
└─────────────────────┘
  ↓
┌─────────────────────┐
│ コードを疑う         │
└─────────────────────┘
```

**理由**: 環境・ツール問題の場合、コードを変更しても解決しない

---

## デバッグフローチャート

### Step 1: 初期診断

```
┌─────────────────────────────────┐
│ 問題が発生した                   │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 以前は動いていたか？             │
└────────┬────────────────────────┘
         │
    Yes  │  No
         │   └→ 実装ミスの可能性
         ↓      (Step 3へ)
┌─────────────────────────────────┐
│ 最近変更したものは？             │
│ - コード                         │
│ - ツール/MCP                     │
│ - 環境変数                       │
│ - 依存関係                       │
└────────┬────────────────────────┘
         │
         ↓
    特定できた？
         │
    Yes  │  No
         │   └→ Step 2へ
         ↓
    その変更を元に戻して確認
```

---

### Step 2: 環境・ツールのチェック

#### 2-1. ブラウザ関連の問題

**チェック項目:**
- [ ] ブラウザのコンソールにエラーはないか？
- [ ] ネットワークタブでリクエストは成功しているか？
- [ ] ブラウザキャッシュの影響はないか？
- [ ] 使用しているブラウザ/MCPの仕様を確認したか？

**確認方法:**
```bash
# キャッシュをクリアして再読み込み
# Chrome: Cmd+Shift+R (macOS) / Ctrl+Shift+R (Windows)

# 開発サーバー再起動
npm run dev
```

**ツール仕様の確認:**
- Playwright MCP → ファイル選択ダイアログを自動インターセプト
- Chrome DevTools MCP → 手動操作可能
- 通常のブラウザ → 全機能正常動作

#### 2-2. 開発サーバー関連の問題

**チェック項目:**
- [ ] 開発サーバーは起動しているか？
- [ ] ポートは正しいか？
- [ ] ホットリロードは動いているか？
- [ ] エラーログはないか？

**確認方法:**
```bash
# サーバー起動確認
curl http://localhost:5173

# プロセス確認
ps aux | grep vite

# 再起動
npm run dev
```

#### 2-3. 依存関係の問題

**チェック項目:**
- [ ] `node_modules`は最新か？
- [ ] package-lock.jsonとの不一致はないか？
- [ ] Node.jsのバージョンは合っているか？

**確認方法:**
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# Node.jsバージョン確認
node --version
```

---

### Step 3: コードのデバッグ

#### 3-1. ログ追加

**ベストプラクティス:**
```typescript
// ❌ 悪い例: 削除し忘れやすい
console.log('test');

// ✅ 良い例: 明示的にマーク
console.log('[DEBUG]', 'FileSystemAdapter.selectFolder called');

// ✅ さらに良い例: デバッグフラグで制御
const DEBUG = import.meta.env.DEV;
if (DEBUG) {
  console.log('[DEBUG]', 'FileSystemAdapter.selectFolder called');
}
```

**コミット前チェック:**
```bash
# デバッグログの検索
grep -r "console.log" src/
grep -r "\[DEBUG\]" src/

# または
git diff | grep "console.log"
```

#### 3-2. ブレークポイント

**ブラウザDevTools:**
1. Sources タブを開く
2. 該当ファイルを探す
3. 行番号をクリックしてブレークポイント設定
4. 変数の値を確認

**VSCode:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

#### 3-3. テストによる検証

**ユニットテスト:**
```bash
# 特定のテストのみ実行
npm test -- FileSystemAdapter.test.ts

# ウォッチモード
npm test -- --watch
```

**統合テスト:**
```bash
# 全テスト実行
npm test
```

---

## 問題パターン別デバッグ方法

### Pattern 1: UI が反応しない

**チェックリスト:**
1. [ ] ブラウザコンソールにエラーはないか？
2. [ ] イベントハンドラーは登録されているか？
3. [ ] 状態（state）は正しく更新されているか？
4. [ ] CSSで要素が隠れていないか？
5. [ ] 非同期処理が完了しているか？

**デバッグ方法:**
```typescript
// イベントハンドラーの確認
const handleClick = () => {
  console.log('[DEBUG] Button clicked');
  // ...
};

// 状態の確認
useEffect(() => {
  console.log('[DEBUG] State updated:', state);
}, [state]);
```

---

### Pattern 2: API/ファイル操作が失敗する

**チェックリスト:**
1. [ ] 権限はあるか？（読み取り・書き込み）
2. [ ] パスは正しいか？（相対パス vs 絶対パス）
3. [ ] ファイル/ディレクトリは存在するか？
4. [ ] 非同期処理のエラーハンドリングはあるか？

**デバッグ方法:**
```typescript
try {
  const handle = await window.showDirectoryPicker();
  console.log('[DEBUG] Directory handle:', handle);
  
  const permission = await handle.queryPermission({ mode: 'readwrite' });
  console.log('[DEBUG] Permission status:', permission);
  
  // ...
} catch (error) {
  console.error('[DEBUG] Error:', error);
  console.error('[DEBUG] Error name:', (error as Error).name);
  console.error('[DEBUG] Error message:', (error as Error).message);
}
```

---

### Pattern 3: テストが失敗する

**チェックリスト:**
1. [ ] テスト環境は正しくセットアップされているか？
2. [ ] モックは正しく設定されているか？
3. [ ] 非同期処理の待機は十分か？
4. [ ] テストの実行順序に依存していないか？

**デバッグ方法:**
```typescript
// テストにログを追加
it('should do something', async () => {
  console.log('[TEST] Starting test');
  
  const result = await doSomething();
  console.log('[TEST] Result:', result);
  
  expect(result).toBe(expected);
});
```

---

### Pattern 4: 状態管理の問題（React）

**チェックリスト:**
1. [ ] 状態の初期値は正しいか？
2. [ ] 状態の更新は非同期か同期か理解しているか？
3. [ ] useEffectの依存配列は正しいか？
4. [ ] 無限ループになっていないか？

**デバッグ方法:**
```typescript
// React DevToolsを使用
// または
useEffect(() => {
  console.log('[DEBUG] State changed:', state);
}, [state]);

// 状態の更新を追跡
const [state, setState] = useState(initialValue);
const setStateWithLog = (newState) => {
  console.log('[DEBUG] Updating state:', { old: state, new: newState });
  setState(newState);
};
```

---

## デバッグツール活用

### 1. ブラウザDevTools

**Console:**
- エラーメッセージ
- ログ出力
- インタラクティブなコード実行

**Network:**
- APIリクエストの確認
- レスポンスの内容確認
- タイミングの確認

**Sources:**
- ブレークポイント
- ステップ実行
- 変数の確認

**Application:**
- LocalStorage/SessionStorage
- Cookies
- Service Workers

### 2. React DevTools

**Components:**
- コンポーネントツリー
- Props/Stateの確認
- 再レンダリングの追跡

**Profiler:**
- パフォーマンス計測
- レンダリング時間の分析

### 3. VSCode

**デバッガー:**
- ブレークポイント
- ステップ実行
- 変数の確認

**拡張機能:**
- Error Lens: エラーをインラインで表示
- Console Ninja: console.logの出力を強化

---

## アンチパターン

### ❌ すぐにコードを変更する

```typescript
// ❌ 悪い例: 問題を理解せずに変更
async selectFolder() {
  // 動かない... input要素に変えよう！
  const input = document.createElement('input');
  // ...
}
```

**問題点:**
- 根本原因を理解していない
- 不要な変更を追加してしまう
- 後で元に戻すのが大変

**正しいアプローチ:**
1. ツール/環境の仕様を確認
2. コンソールログで動作を追跡
3. 最小限の変更で問題を切り分け
4. 原因が特定できてから修正

---

### ❌ エラーを無視する

```typescript
// ❌ 悪い例: エラーを握りつぶす
try {
  await doSomething();
} catch (error) {
  // 何もしない
}
```

**問題点:**
- エラーの原因がわからない
- デバッグが困難になる

**正しいアプローチ:**
```typescript
// ✅ 良い例: エラーをログに出力
try {
  await doSomething();
} catch (error) {
  console.error('[ERROR] Failed to do something:', error);
  throw error; // または適切に処理
}
```

---

### ❌ デバッグログを残したまま

```typescript
// ❌ 悪い例: デバッグログが本番コードに残る
console.log('test');
console.log(data);
```

**問題点:**
- 本番環境でログが出力される
- パフォーマンスに影響
- セキュリティリスク

**正しいアプローチ:**
```typescript
// ✅ 良い例: 開発環境のみ
const DEBUG = import.meta.env.DEV;
if (DEBUG) {
  console.log('[DEBUG] Data:', data);
}
```

---

## チェックリスト

### デバッグ開始時
- [ ] 問題を再現できるか？
- [ ] エラーメッセージはあるか？
- [ ] 最近の変更は何か？
- [ ] ブラウザコンソールを確認した

### 原因調査時
- [ ] 環境・ツールの仕様を確認した
- [ ] ログを追加して動作を追跡した
- [ ] 最小限のコードで再現できるか試した
- [ ] 代替手段を試した

### 修正後
- [ ] テストが通るか確認した
- [ ] デバッグログを削除した
- [ ] 関連する箇所に影響がないか確認した
- [ ] ドキュメントを更新した

---

## 参考資料

- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Debugging JavaScript - MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_went_wrong)

---

## 更新履歴

- 2025-11-06: 初版作成（order-1タスクの経験から）
