# コード品質ガイドライン

## 目的
保守性・可読性・テスタビリティの高いコードを書くためのガイドライン。

---

## 基本原則

### 1. 責務の明確化（Single Responsibility Principle）

各レイヤー・クラス・関数は**1つの責務**のみを持つべき。

#### 悪い例: 責務が混在
```typescript
// ❌ FileSystemAdapterが複数の責務を持つ
class FileSystemAdapter {
  async openFolder() {
    // フォルダ選択
    const handle = await window.showDirectoryPicker();
    
    // ファイル読み込み
    await this.loadFiles(handle);
    
    // 空フォルダ検出
    if (this.files.length === 0) {
      // プレースホルダー作成
      this.createPlaceholder();
    }
    
    // UIの更新 ← これは別レイヤーの責務
    this.updateUI();
  }
}
```

#### 良い例: 責務を分離
```typescript
// ✅ 各レイヤーが明確な責務を持つ

// アダプター: ファイルシステムとの橋渡し
class FileSystemAdapter {
  async selectFolder(): Promise<FileSystemDirectoryHandle | null> {
    return await window.showDirectoryPicker();
  }
  
  async loadToManager(manager: FileManager, handle: FileSystemDirectoryHandle) {
    // ファイル読み込みのみ
  }
}

// コアサービス: ビジネスロジック
class RepomixCore {
  async openFolder(): Promise<void> {
    const handle = await this.adapter.selectFolder();
    await this.adapter.loadToManager(this.manager, handle);
    
    // 空フォルダ検出とプレースホルダー作成
    if (this.manager.getAllFiles().length === 0) {
      this.createPlaceholder();
    }
  }
}

// UI: ユーザーインターフェース
function App() {
  const handleOpenFolder = async () => {
    await core.openFolder();
    setRefreshKey(prev => prev + 1); // UI更新
  };
}
```

---

### 2. レイヤーアーキテクチャ

```
┌─────────────────────────┐
│   UI Layer (React)      │ ← ユーザーインターフェース
├─────────────────────────┤
│   Service Layer         │ ← ビジネスロジック
│   (RepomixCore)         │
├─────────────────────────┤
│   Adapter Layer         │ ← 外部システムとの橋渡し
│   (FileSystemAdapter)   │
├─────────────────────────┤
│   Core Layer            │ ← ドメインモデル
│   (FileManager)         │
└─────────────────────────┘
```

**各レイヤーの責務:**

#### UI Layer
- ユーザー入力の受け取り
- 画面の表示・更新
- イベントハンドリング

#### Service Layer
- ビジネスロジックの実装
- 複数のアダプター/コアの統合
- ワークフローの制御

#### Adapter Layer
- 外部システム（ファイルシステム、API）との通信
- データフォーマットの変換
- 技術的な詳細の隠蔽

#### Core Layer
- ドメインモデルの定義
- データ構造の管理
- ビジネスルールの実装

---

### 3. 重複の排除（DRY: Don't Repeat Yourself）

#### 悪い例: 同じロジックが複数箇所に
```typescript
// ❌ FileSystemAdapter.loadDirectoryで空フォルダ検出
if (visible.length === 0) {
  manager.setFile({
    path: '空のフォルダです.txt',
    content: 'このフォルダは空です。'
  });
}

// ❌ RepomixCore.openFolderでも空フォルダ検出
if (this.fileManager.getAllFiles().length === 0) {
  this.fileManager.setFile({
    path: '空のフォルダです.txt',
    content: 'このフォルダは空です。'
  });
}
```

#### 良い例: ロジックを1箇所に集約
```typescript
// ✅ FileSystemAdapter.loadDirectoryでのみ処理
class FileSystemAdapter {
  private async loadDirectory(dirHandle, currentPath, manager) {
    // ...
    if (visible.length === 0) {
      this.createPlaceholderFile(dirHandle, currentPath, manager);
    }
  }
  
  private async createPlaceholderFile(dirHandle, currentPath, manager) {
    const placeholderName = '空のフォルダです.txt';
    const content = 'このフォルダは空です。';
    // ... 実装
  }
}
```

---

## デバッグログの管理

### 1. ログレベルの明確化

```typescript
// ✅ ログレベルを明示
console.log('[DEBUG]', 'Detailed information for debugging');
console.info('[INFO]', 'General information');
console.warn('[WARN]', 'Warning message');
console.error('[ERROR]', 'Error occurred');
```

### 2. 環境に応じた出力制御

```typescript
// ✅ 開発環境のみログ出力
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('[DEBUG] FileSystemAdapter.selectFolder called');
}

// または、デバッグ用のヘルパー関数
const debug = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log('[DEBUG]', ...args);
  }
};

debug('FileSystemAdapter.selectFolder called');
```

### 3. 構造化ログ

```typescript
// ✅ オブジェクトを使って構造化
console.log('[DEBUG]', {
  method: 'selectFolder',
  timestamp: Date.now(),
  params: { /* ... */ },
  result: { /* ... */ }
});
```

### 4. コミット前チェック

```bash
# デバッグログの検索
git diff | grep -E "console\.(log|debug|info)" | grep -v "\[DEBUG\]"

# または、pre-commitフックで自動チェック
# .husky/pre-commit
#!/bin/sh
if git diff --cached | grep -E "console\.log\(" | grep -v "\[DEBUG\]"; then
  echo "Error: Found console.log without [DEBUG] prefix"
  exit 1
fi
```

---

## エラーハンドリング

### 1. エラーは適切に処理する

```typescript
// ❌ 悪い例: エラーを無視
try {
  await doSomething();
} catch {
  // 何もしない
}

// ✅ 良い例: エラーをログに記録して適切に処理
try {
  await doSomething();
} catch (error) {
  console.error('[ERROR] Failed to do something:', error);
  // エラーを再スローするか、適切に処理
  if (error instanceof SpecificError) {
    // 特定のエラーの処理
  } else {
    throw error; // 予期しないエラーは再スロー
  }
}
```

### 2. エラーメッセージは具体的に

```typescript
// ❌ 悪い例: 情報が不足
throw new Error('Failed');

// ✅ 良い例: 詳細な情報を含む
throw new Error(`Failed to write file: ${path}. ${error.message}`);
```

### 3. ユーザーフレンドリーなエラー表示

```typescript
// ✅ UIで表示するエラーメッセージ
try {
  await core.openFolder();
} catch (error) {
  console.error('[ERROR]', error); // 開発者向け詳細ログ
  setError('フォルダを開けませんでした。もう一度お試しください。'); // ユーザー向けメッセージ
}
```

---

## テスト容易性

### 1. 依存性の注入

```typescript
// ❌ 悪い例: 依存関係がハードコード
class RepomixCore {
  private adapter = new FileSystemAdapter(); // ハードコード
  
  async openFolder() {
    await this.adapter.selectFolder();
  }
}

// ✅ 良い例: 依存性を注入
class RepomixCore {
  constructor(
    private adapter: FileSystemAdapter = new FileSystemAdapter()
  ) {}
  
  async openFolder() {
    await this.adapter.selectFolder();
  }
}

// テスト時にモックを注入可能
const mockAdapter = new MockFileSystemAdapter();
const core = new RepomixCore(mockAdapter);
```

### 2. 純粋関数を優先

```typescript
// ❌ 悪い例: 副作用がある
let count = 0;
function increment() {
  count++; // グローバル状態を変更
  return count;
}

// ✅ 良い例: 純粋関数
function increment(count: number): number {
  return count + 1;
}
```

### 3. テスタブルな設計

```typescript
// ✅ 小さな関数に分割
class FileSystemAdapter {
  // パブリック: テストしやすい
  async selectFolder(): Promise<FileSystemDirectoryHandle | null> {
    return await this.callDirectoryPicker();
  }
  
  // プライベート: 内部実装
  private async callDirectoryPicker() {
    return await window.showDirectoryPicker();
  }
}

// テスト
it('should select folder', async () => {
  const adapter = new FileSystemAdapter();
  const handle = await adapter.selectFolder();
  expect(handle).toBeDefined();
});
```

---

## コード可読性

### 1. 意図を伝える命名

```typescript
// ❌ 悪い例: 意味不明な名前
const d = new Date();
const x = files.filter(f => f.status === 'a');

// ✅ 良い例: 意図が明確
const currentDate = new Date();
const addedFiles = files.filter(file => file.status === 'added');
```

### 2. マジックナンバーを避ける

```typescript
// ❌ 悪い例
if (file.size > 10485760) {
  // ...
}

// ✅ 良い例
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  // ...
}
```

### 3. コメントは「なぜ」を説明

```typescript
// ❌ 悪い例: コードを説明（冗長）
// ファイルを追加する
files.push(newFile);

// ✅ 良い例: 理由を説明
// 空のフォルダを視覚化するためにプレースホルダーファイルを追加
files.push(placeholderFile);
```

---

## TypeScript活用

### 1. 型定義を活用

```typescript
// ❌ 悪い例: anyを使う
function processFile(file: any) {
  return file.content.toUpperCase();
}

// ✅ 良い例: 適切な型定義
interface FileNode {
  path: string;
  content: string;
  mimeType: string;
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
}

function processFile(file: FileNode): string {
  return file.content.toUpperCase();
}
```

### 2. ユニオン型で状態を表現

```typescript
// ✅ 状態を型で表現
type FileStatus = 'added' | 'modified' | 'deleted' | 'unchanged';

interface FileNode {
  path: string;
  status: FileStatus; // 不正な値を防ぐ
}
```

### 3. 型ガード

```typescript
// ✅ 型ガードで型を絞り込む
function isFileNode(node: FileNode | DirectoryNode): node is FileNode {
  return 'content' in node;
}

if (isFileNode(node)) {
  // nodeはFileNode型として扱われる
  console.log(node.content);
}
```

---

## パフォーマンス

### 1. 不要な再レンダリングを避ける（React）

```typescript
// ❌ 悪い例: 毎回新しいオブジェクトを作成
function Parent() {
  return <Child config={{ theme: 'dark' }} />; // 毎回再レンダリング
}

// ✅ 良い例: useMemoで最適化
function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <Child config={config} />;
}
```

### 2. 大きなリストの最適化

```typescript
// ✅ 仮想スクロールを使用
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={files.length}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>{files[index].path}</div>
  )}
</FixedSizeList>
```

---

## チェックリスト

### コーディング時
- [ ] 責務は明確か？
- [ ] レイヤーアーキテクチャに従っているか？
- [ ] 重複したロジックはないか？
- [ ] 適切な型定義を使っているか？
- [ ] エラーハンドリングは適切か？

### コミット前
- [ ] デバッグログを削除したか？
- [ ] テストは通るか？
- [ ] 型エラーはないか？
- [ ] Linterのエラーはないか？
- [ ] コメントは適切か？

### レビュー時
- [ ] 命名は明確か？
- [ ] テストはあるか？
- [ ] パフォーマンスの問題はないか？
- [ ] セキュリティの問題はないか？
- [ ] ドキュメントは更新されているか？

---

## 参考資料

- [Clean Code (Robert C. Martin)](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Best Practices](https://react.dev/learn/thinking-in-react)

---

## 更新履歴

- 2025-11-06: 初版作成（order-1タスクの経験から）
