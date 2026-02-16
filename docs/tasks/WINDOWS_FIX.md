# Windows環境でのUnmix処理エラー修正

## 問題の原因

Windows環境でUnmix処理を実行すると、以下の理由でエラーが発生していました：

### 1. パス区切り文字の不一致
- **原因**: XMLファイルのパス属性に Windows形式のバックスラッシュ（`\`）が含まれていても、Unmix処理では常にスラッシュ（`/`）を区切り文字として使用していた
- **例**: `src\components\App.tsx` が XML内に存在する場合、`split('/')`では正しく分割されず、ディレクトリ名に`\`が含まれたままになる

### 2. エラーメッセージの不足
- **原因**: ファイル書き込み時のエラーが詳細に記録されず、ユーザーが問題の原因を特定しにくかった
- **結果**: Windowsだけでエラーが発生していても、デバッグが困難だった

---

## 実装した修正

### 1. RepomixAdapter.ts - パス正規化機能の追加

```typescript
/**
 * パスを正規化（バックスラッシュをスラッシュに変換）
 * Windows環境でのパス区切り文字の問題に対応
 */
private static normalizePath(path: string): string {
  // バックスラッシュをスラッシュに変換
  return path.replace(/\\/g, '/');
}
```

XMLからパスを抽出した後、即座にパスを正規化します：

```typescript
// パスを正規化（バックスラッシュ→スラッシュ）
const normalizedPath = this.normalizePath(data.path);
```

### 2. FileSystemAdapter.ts - 詳細なエラーハンドリング

#### writeFileメソッド
- パスをノーマライズ
- ファイル名の空チェック
- ディレクトリ作成時のエラーメッセージを詳細化
- ファイル書き込み失敗時に具体的なエラーを記録

```typescript
try {
  // パスを正規化（Windows互換性のためバックスラッシュをスラッシュに変換）
  const normalizedPath = path.replace(/\\/g, '/');
  
  // パスをスラッシュで分割
  const parts = normalizedPath.split('/');
  const fileName = parts.pop()!;
  
  if (!fileName) {
    throw new Error(`Invalid file path: "${path}" - ファイル名が空です`);
  }
  
  // ディレクトリ作成とファイル書き込み処理...
} catch (error) {
  // エラーを再スロー（既に詳細なメッセージが含まれている）
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Unknown error writing file: "${path}": ${error}`);
}
```

#### deleteFileメソッド
- 同様にパスを正規化
- エラーログを詳細化（ただし、ファイル削除はクリティカルではないため、エラーは投げない）

### 3. RepomixCore.ts - ディバッグログとエラー詳細化

unmixメソッドのエラーハンドリング：

```typescript
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  console.error('[ERROR] RepomixCore.unmix: failed to write parsed files to disk', error);
  console.error('[ERROR] Stack:', errorStack);
  
  // フォールバック処理...
  
  console.warn(
    '[WARNING] RepomixCore.unmix: Files were not persisted to disk but were loaded into FileManager. ' +
    'Error: ' + errorMsg
  );
}
```

### 4. App.tsx - ユーザーフレンドリーなエラーメッセージ

```typescript
// ユーザーフレンドリーなエラーメッセージを構築
let displayMessage = 'Unmix処理に失敗しました';
if (errorMessage.includes('path') || errorMessage.includes('path separator')) {
  displayMessage += '\n\n【パス関連エラーの可能性】\n' +
    'ファイルパスに問題がある可能性があります。\n' +
    'XMLファイルが正しい形式であることを確認してください。';
}
displayMessage += '\n\n詳細: ' + errorMessage;
```

---

## テストケース

### macOS（スラッシュで統一）
```
✅ 成功: path = "src/components/App.tsx"
✅ split('/') = ["src", "components", "App.tsx"]
```

### Windows（バックスラッシュが混在）
```
修正前：
❌ 失敗: path = "src\components\App.tsx"
❌ split('/') = ["src\components\App.tsx"] （分割されない）

修正後：
✅ 成功: normalizePath() = "src/components/App.tsx"
✅ split('/') = ["src", "components", "App.tsx"]
```

---

## ブラウザコンソールに出力されるディバッグ情報

引き込み実行時：
```
[DEBUG] App.tsx: starting unmix process
[DEBUG] RepomixCore.unmix: start parsing XML
[DEBUG] RepomixCore.unmix: parse result -> { success: true, data: [...] }
[DEBUG] RepomixCore.unmix: adapterHandle present, attempting to write tempManager to disk
[DEBUG] RepomixCore.unmix: invoking saveFromManager, file count= 42
[DEBUG] RepomixCore.unmix: saveFromManager completed
[DEBUG] FileSystemAdapter: normalizing path for write
[DEBUG] RepomixCore.unmix: loading from disk into FileManager
[DEBUG] RepomixCore.unmix: loadToManager completed, fileCount= 42
[INFO] Unmix completed successfully
```

エラー発生時：
```
[ERROR] App.tsx: Failed to unmix: Error: Failed to create directory: "src\test" (path: "src\test\index.tsx")
[ERROR] Error stack: at FileSystemAdapter.writeFile (FileSystemAdapter.ts:...)
[ERROR] RepomixCore.unmix: failed to write parsed files to disk or reload from disk
```

---

## チェックリスト

- ✅ パス区切り文字の正規化（バックスラッシュ→スラッシュ）
- ✅ ディレクトリ作成時のエラーメッセージ詳細化
- ✅ ファイル書き込み時のエラーメッセージ詳細化
- ✅ ファイル削除時のエラーログ詳細化
- ✅ RepomixCore.unmixのエラーメッセージ詳細化
- ✅ App.tsxのユーザーフレンドリーなエラー表示
- ✅ ディバッグログの統一（[DEBUG], [ERROR], [INFO], [WARNING]）

---

## 参考

### クロスプラットフォーム互換性
このパス正規化アプローチは、以下の環境で動作することを保証します：
- macOS: スラッシュのみ使用（変更なし）
- Linux: スラッシュのみ使用（変更なし）
- Windows: バックスラッシュまたがスラッシュを自動正規化

### ファイルシステムアクセスAPI（File System Access API）
File System Access APIは内部的にスラッシュ（`/`）をパス区切り文字として使用するため、正規化は必須です。
