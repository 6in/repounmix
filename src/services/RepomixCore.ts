import { FileManager } from '../core/FileManager';
import type { FileNode } from '../types';
import { RepomixAdapter } from '../adapters/RepomixAdapter';
import { FileSystemAdapter } from '../adapters/FileSystemAdapter';
import type { FileFilter } from '../types';

/**
 * Repomix Web Tool のコアサービス
 * すべての機能を統合して提供
 */
export class RepomixCore {
  private fileManager: FileManager;
  private fileSystemAdapter: FileSystemAdapter;

  constructor() {
    this.fileManager = new FileManager();
    this.fileSystemAdapter = new FileSystemAdapter();
  }

  /**
   * フィルタ設定を更新
   */
  setFilter(filter: FileFilter): void {
    this.fileSystemAdapter.setFilter(filter);
  }

  /**
   * 現在のフィルタ設定を取得
   */
  getFilter(): FileFilter {
    return this.fileSystemAdapter.getFilter();
  }

  /**
   * フォルダを開く
   */
  async openFolder(): Promise<void> {
    // フォルダ選択を先に実行(キャンセル時は何もしない)
    const handle = await this.fileSystemAdapter.selectFolder();
    
    // キャンセルされた場合は何もしない
    if (!handle) {
      return;
    }
    
    // フォルダ選択成功後にクリア
    this.fileManager.clear();
    
    await this.fileSystemAdapter.loadToManager(this.fileManager, handle, '/');
    
    // 空のフォルダの場合、プレースホルダーファイルを作成
    if (this.fileManager.getAllFiles().length === 0) {
      console.log('Empty folder detected, creating placeholder file');
      const placeholderContent = 'このフォルダは空です。\nファイルを追加してください。';
      const placeholder: FileNode = {
        path: '/空のフォルダです.txt',
        content: placeholderContent,
        mimeType: 'text/plain',
        metadata: {
          size: placeholderContent.length,
          lastModified: new Date(),
          isDirectory: false
        },
        status: 'added'
      };

      // FileManager の既存 API を使って登録
      this.fileManager.setFile(placeholder);

      // プレースホルダーファイルをディスクにも保存
      await this.fileSystemAdapter.saveFromManager(this.fileManager);
    }
  }

  /**
   * Mix: FileManager → Repomix XML
   */
  mix(): string {
    return RepomixAdapter.toXML(this.fileManager);
  }

  /**
   * Unmix: Repomix XML → FileManager → 実ファイル
   */
  async unmix(xml: string): Promise<{ success: boolean; error?: string }> {
    // まずバリデーションのみ実行(FileManagerは変更しない)
  const tempManager = new FileManager();
  console.debug('[DEBUG] RepomixCore.unmix: start parsing XML');
  const validationResult: { success: boolean; error?: string } = RepomixAdapter.fromXML(xml, tempManager) as unknown as { success: boolean; error?: string };
  console.debug('[DEBUG] RepomixCore.unmix: parse result ->', validationResult);
    
    if (!validationResult.success) {
      // パースエラーの場合、元の状態を保持
      return {
        success: false,
        error: validationResult.error || 'XMLのパースに失敗しました'
      };
    }

    // パース成功後の安全な処理順:
    // 1) ディレクトリハンドルがあれば、まず tempManager の内容をディスクへ直接書き出す(既存ファイルを不用意に削除しないため)
    // 2) 書き出し後に FileManager をクリアしてディスクから読み込み直す

    const adapterHandle = this.fileSystemAdapter.getDirectoryHandle();
    if (adapterHandle) {
      // tempManager に読み込まれたファイルをディスクへ書き出す
      try {
        console.debug('[DEBUG] RepomixCore.unmix: adapterHandle present, attempting to write tempManager to disk');
        // Temporarily set manager root so saveFromManager can function
        tempManager.setRoot('/', adapterHandle);
        // Mark all temp files as 'added' so saveFromManager writes them
        for (const f of tempManager.getAllFiles()) {
          f.status = 'added';
        }
        console.debug('[DEBUG] RepomixCore.unmix: invoking saveFromManager, file count=', tempManager.getFileCount());
        await this.fileSystemAdapter.saveFromManager(tempManager);
        console.debug('[DEBUG] RepomixCore.unmix: saveFromManager completed');
        
        // ディスクへの書き出しが成功したら、FileManagerをクリアしてディスクから再読み込み
        this.fileManager.clear();
        console.debug('[DEBUG] RepomixCore.unmix: loading from disk into FileManager');
        await this.fileSystemAdapter.loadToManager(this.fileManager, adapterHandle, '/');
        console.debug('[DEBUG] RepomixCore.unmix: loadToManager completed, fileCount=', this.fileManager.getFileCount());
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('[ERROR] RepomixCore.unmix: failed to write parsed files to disk or reload from disk', error);
        console.error('[ERROR] Stack:', errorStack);
        
        // Fall back to applying to FileManager below without disk sync
        this.fileManager.clear();
        const handle = this.fileSystemAdapter.getDirectoryHandle();
        if (handle) {
          this.fileManager.setRoot('/', handle);
        }
        RepomixAdapter.fromXML(xml, this.fileManager);
        for (const f of this.fileManager.getAllFiles()) {
          f.status = 'unchanged';
        }
        
        // エラーをログに記録するが、部分的な成功を返す
        console.warn(
          '[WARNING] RepomixCore.unmix: Files were not persisted to disk but were loaded into FileManager. ' +
          'Error: ' + errorMsg
        );
      }
    } else {
      // ディレクトリハンドルがない場合は、FileManagerにのみ適用
      this.fileManager.clear();
      RepomixAdapter.fromXML(xml, this.fileManager);
      for (const f of this.fileManager.getAllFiles()) {
        f.status = 'unchanged';
      }
    }
    
    return { success: true };
  }

  /**
   * 変更を保存（自動保存用）
   */
  async saveChanges(): Promise<void> {
    await this.fileSystemAdapter.saveFromManager(this.fileManager);
  }

  /**
   * FileManagerを取得（UI用）
   */
  getFileManager(): FileManager {
    return this.fileManager;
  }

  /**
   * 状態をクリア
   */
  clear(): void {
    this.fileManager.clear();
  }

  /**
   * ディスク上の状態と FileManager を差分同期する（フィルタ適用済み）
   */
  async refreshFromDisk(): Promise<{ added: number; modified: number; deleted: number }> {
    return await this.fileSystemAdapter.refreshFromDisk(this.fileManager, this.fileManager.getRootPath() || '');
  }
}