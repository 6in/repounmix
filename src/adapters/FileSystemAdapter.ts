/// <reference lib="dom" />
import { FileManager } from '../core/FileManager';
import type { FileNode, FileFilter } from '../types';
import type { MinimalDirectoryHandle, MinimalFileHandle } from '../types/fs-helpers';
import { emptyDirIterator } from '../types/fs-helpers';
import { MIME_TYPES, EXCLUDE_PATTERNS } from '../types';

/**
 * FileManager ↔ 実ファイルシステム の変換アダプター
 */
export class FileSystemAdapter {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private filter: FileFilter = {
    includePatterns: [],
    ignorePatterns: [],
    useDefaultExcludes: true
  };

  /**
   * フィルタ設定を更新
   */
  setFilter(filter: FileFilter): void {
    this.filter = { ...filter };
  }

  /**
   * 現在のフィルタ設定を取得
   */
  getFilter(): FileFilter {
    return { ...this.filter };
  }

  /**
   * フォルダ選択ダイアログを表示
   */
  async selectFolder(): Promise<FileSystemDirectoryHandle | null> {
    // Diagnostic logs to help debug environment differences (localhost vs https)
    try {
      console.debug('[DEBUG] selectFolder called');
      const w = window as unknown as Window & { isSecureContext?: boolean };
      console.debug('[DEBUG] isSecureContext:', w.isSecureContext);
      console.debug('[DEBUG] inIframe:', window.top !== window.self);
      console.debug('[DEBUG] has showDirectoryPicker:', 'showDirectoryPicker' in window);
    } catch {
      // ignore logging errors in exotic environments
    }

    if (!('showDirectoryPicker' in window)) {
      // Provide a more informative error for remote environments
      throw new Error('showDirectoryPicker is not available in this environment. Ensure you are running on a secure context (https or localhost) and not inside a cross-origin iframe.');
    }

    try {
      this.directoryHandle = (await (window as unknown as { showDirectoryPicker?: () => Promise<MinimalDirectoryHandle> }).showDirectoryPicker!()) as unknown as FileSystemDirectoryHandle;
      const handle = this.directoryHandle!;
      await this.verifyPermission(handle, true);
      return handle;
    } catch (error) {
      // ユーザーがキャンセルした場合はnullを返す（エラーは投げない）
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      // その他のエラーは投げる
      throw error;
    }
  }

  /**
   * 実ファイル → FileManager
   */
  async loadToManager(
    manager: FileManager,
    handle: FileSystemDirectoryHandle,
    rootPath: string = ''
  ): Promise<void> {
    this.directoryHandle = handle;
    manager.setRoot(rootPath, handle);
    
    await this.loadDirectory(handle, '', manager);
  }

  /**
   * FileManager → 実ファイル
   */
  async saveFromManager(manager: FileManager): Promise<void> {
    // Prefer directory handle from manager, but fall back to the adapter's selected handle
    let handle = manager.getDirectoryHandle();
    if (!handle && this.directoryHandle) {
      handle = this.directoryHandle;
      // Ensure manager knows about the selected root (use empty path when unknown)
      try {
        manager.setRoot('', handle);
      } catch {
        // ignore if manager doesn't accept the handle for some reason
      }
    }

    if (!handle) {
      throw new Error('No directory selected. Please open a folder first.');
    }

    if (!(await this.verifyPermission(handle, true))) {
      console.debug('[DEBUG] saveFromManager: verifyPermission denied');
      throw new Error('Write permission denied');
    }

    this.directoryHandle = handle;

    const files = manager.getAllFiles();
    console.debug('[DEBUG] saveFromManager: files to process=', files.map(f => ({ path: f.path, status: f.status })));
    
    for (const file of files) {
      console.debug('[DEBUG] saveFromManager: processing file', file.path, 'status=', file.status);
      if (file.status === 'deleted') {
        console.debug('[DEBUG] saveFromManager: deleting', file.path);
        await this.deleteFile(file.path);
      } else if (file.status === 'added' || file.status === 'modified') {
        console.debug('[DEBUG] saveFromManager: writing', file.path);
        await this.writeFile(file.path, file.content);
        file.status = 'unchanged';
      }
    }
  }

  /**
   * ディレクトリを再帰的に読み込み
   */
  private async loadDirectory(
    dirHandle: FileSystemDirectoryHandle,
    currentPath: string,
    manager: FileManager
  ): Promise<void> {
    const minimalHandle = dirHandle as unknown as MinimalDirectoryHandle;
    // Collect entries first so we can determine if the directory is effectively empty
  // Use any here because the runtime entries are various host-provided handle objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: Array<{ name: string; kind: 'file' | 'directory'; entry: any }> = [];
    for await (const entry of (minimalHandle.values?.() ?? emptyDirIterator())) {
      entries.push({ name: entry.name, kind: entry.kind, entry });
    }

    // Determine visible entries after applying filters
    const visible = entries.filter(e => {
      const path = currentPath ? `${currentPath}/${e.name}` : e.name;
      if (e.kind === 'directory') {
        return !this.shouldExcludeDirectory(e.name);
      }
      return !this.shouldExcludeFile(path, e.name);
    });

    // If no visible entries, create a placeholder file so the UI shows the folder
    if (visible.length === 0) {
      const placeholderName = '空のフォルダです.txt';
      const placeholderPath = currentPath ? `${currentPath}/${placeholderName}` : placeholderName;
      const content = 'このフォルダは空です。';

      // Add to manager immediately
      manager.setFile({
        path: placeholderPath,
        absolutePath: placeholderPath,
        mimeType: 'text/plain',
        content,
        metadata: { size: content.length, lastModified: new Date(), isDirectory: false },
        status: 'added'
      });

      // Try to write to disk if we have permission
      try {
        if (await this.verifyPermission(dirHandle, true)) {
          const fh = await dirHandle.getFileHandle(placeholderName, { create: true });
          const writable = await fh.createWritable();
          await writable.write(content);
          await writable.close();

          // Mark as unchanged now that it's persisted
          const f = manager.getFile(placeholderPath);
          if (f) {
            f.status = 'unchanged';
            f.metadata.size = content.length;
            f.metadata.lastModified = new Date();
          }
          console.log(`Placeholder created: ${placeholderPath}`);
        }
      } catch {
        console.warn('Failed to write placeholder file');
      }
    }

    // Process visible entries
    for (const e of visible) {
      const entry = e.entry;
      const path = currentPath ? currentPath + '/' + entry.name : entry.name;

      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        const minimalFileHandle = fileHandle as unknown as MinimalFileHandle;
        const file = await minimalFileHandle.getFile!();

        // ファイルサイズチェック
        if (file.size > this.maxFileSize) {
          console.warn(`File too large (${file.size} bytes): ${path}`);
          continue;
        }

        // テキストファイルかどうか判定
        if (this.isTextFile(file, entry.name)) {
          try {
            const content = await file.text();

            const fileNode: FileNode = {
              path,
              absolutePath: path,
              mimeType: this.detectMimeType(entry.name, file.type),
              content,
              metadata: {
                size: file.size,
                lastModified: new Date(file.lastModified),
                isDirectory: false
              },
              status: 'unchanged'
            };

            manager.setFile(fileNode);
            const addedFile = manager.getFile(path);
            if (addedFile) {
              addedFile.status = 'unchanged';
            }
          } catch (error) {
            console.error(`Failed to read file: ${path}`, error);
          }
        } else {
          console.log(`Skipped non-text file: ${path}`);
        }
      } else if (entry.kind === 'directory') {
        const subDirHandle = entry as FileSystemDirectoryHandle;
        await this.loadDirectory(subDirHandle, path, manager);
      }
    }
  }

  /**
   * ファイル書き込み（ディレクトリ自動作成）
   */
  private async writeFile(path: string, content: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory handle available');
    }
    
    try {
      // パスを正規化（Windows互換性のためバックスラッシュをスラッシュに変換）
      const normalizedPath = path.replace(/\\/g, '/');
      
      // パスをスラッシュで分割
      const parts = normalizedPath.split('/');
      const fileName = parts.pop()!;
      
      if (!fileName) {
        throw new Error(`Invalid file path: "${path}" - ファイル名が空です`);
      }
      
      let currentHandle = this.directoryHandle;
      
      // ディレクトリを再帰的に作成
      for (const part of parts) {
        if (part && part.trim()) {
          try {
            currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
          } catch (error) {
            throw new Error(
              `Failed to create directory: "${part}" (path: "${normalizedPath}")\n` +
              `Error: ${(error as Error).message}`
            );
          }
        }
      }
      
      try {
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        console.log(`File written: ${normalizedPath}`);
      } catch (error) {
        throw new Error(
          `Failed to write file: "${fileName}" (fullPath: "${normalizedPath}")\n` +
          `Error: ${(error as Error).message}`
        );
      }
    } catch (error) {
      // エラーを再スロー（既に詳細なメッセージが含まれている）
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unknown error writing file: "${path}": ${error}`);
    }
  }

  /**
   * ファイル削除
   */
  private async deleteFile(path: string): Promise<void> {
    if (!this.directoryHandle) return;
    
    try {
      // パスを正規化（Windows互換性のためバックスラッシュをスラッシュに変換）
      const normalizedPath = path.replace(/\\/g, '/');
      
      const parts = normalizedPath.split('/');
      const fileName = parts.pop()!;
      
      if (!fileName) {
        console.warn(`Invalid file path for deletion: "${path}"`);
        return;
      }
      
      let currentHandle = this.directoryHandle;
      for (const part of parts) {
        if (part && part.trim()) {
          try {
            currentHandle = await currentHandle.getDirectoryHandle(part);
          } catch {
            // ディレクトリが存在しない場合は何もしない
            return;
          }
        }
      }
      
      try {
        await currentHandle.removeEntry(fileName);
        console.log(`File deleted: ${normalizedPath}`);
      } catch {
        // ファイルが存在しない場合は無視
        console.warn(`File not found for deletion: ${normalizedPath}`);
      }
    } catch (error) {
      console.error(`Error deleting file "${path}":`, error);
      // ファイル削除の失敗は致命的ではないため、エラーは投げない
    }
  }

  /**
   * ディレクトリを除外すべきかチェック（デフォルト除外のみ）
   */
  private shouldExcludeDirectory(name: string): boolean {
    // デフォルトの除外パターンを使用する場合のみ
    if (this.filter.useDefaultExcludes) {
      // ドットで始まる隠しディレクトリ
      if (name.startsWith('.')) {
        return true;
      }
      
      // 除外パターンに一致
      if (EXCLUDE_PATTERNS.includes(name)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * ファイルを除外すべきかチェック（フルフィルタ適用）
   */
  private shouldExcludeFile(fullPath: string, name: string): boolean {
    // includeパターンがある場合、マッチしないものは除外
    if (this.filter.includePatterns.length > 0) {
      if (!this.matchesAnyPattern(fullPath, this.filter.includePatterns)) {
        return true;
      }
    }
    
    // ignoreパターンにマッチするものは除外
    if (this.matchesAnyPattern(fullPath, this.filter.ignorePatterns)) {
      return true;
    }
    
    // デフォルトの除外パターンを使用する場合
    if (this.filter.useDefaultExcludes) {
      // ドットで始まる隠しファイル（.gitignoreなど一部例外を除く）
      if (name.startsWith('.') && !this.isAllowedDotFile(name)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * パターンマッチング（シンプルなglob対応）
   */
  private matchesAnyPattern(path: string, patterns: string[]): boolean {
    return patterns.some(pattern => this.matchPattern(path, pattern));
  }

  /**
   * 単一パターンのマッチング
   * 対応パターン: *, **, ?, 固定文字列
   */
  private matchPattern(path: string, pattern: string): boolean {
    // 空パターンは何もマッチしない
    if (!pattern) return false;
    
    // パターンを正規表現に変換
    let regexPattern = pattern
      .replace(/\./g, '\\.')           // . をエスケープ
      .replace(/\*\*/g, '|||DOUBLESTAR|||')  // ** を一時的に置き換え
      .replace(/\*/g, '[^/]*')         // * を [^/]* に（同一階層内の任意の文字列）
      .replace(/\|\|\|DOUBLESTAR\|\|\|/g, '.*') // ** を .* に戻す（任意の階層）
      .replace(/\?/g, '[^/]');         // ? を [^/] に（1文字）
    
    // 先頭処理
    if (pattern.startsWith('/')) {
      // 絶対パス的な指定（先頭から一致）
      regexPattern = '^' + regexPattern.substring(1);
    } else if (pattern.includes('/')) {
      // 相対パス的な指定（どこかに出現）
      regexPattern = '(^|/)' + regexPattern;
    } else {
      // ファイル名のみの指定（パスのどこかに出現）
      regexPattern = '(^|/)' + regexPattern;
    }
    
    // 末尾処理
    if (pattern.endsWith('/')) {
      // ディレクトリ指定
      regexPattern += '(/|$)';
    } else {
      // ファイルまたはディレクトリ
      regexPattern += '$';
    }
    
    const regex = new RegExp(regexPattern);
    const result = regex.test(path);
    
    // デバッグログ
    console.log(`Pattern: ${pattern}, Path: ${path}, Match: ${result}`);
    
    return result;
  }

  /**
   * 許可されたドットファイルかチェック
   */
  private isAllowedDotFile(name: string): boolean {
    const allowedDotFiles = [
      '.gitignore',
      '.editorconfig',
      '.eslintrc',
      '.prettierrc',
      '.env',
      '.env.example',
      '.nvmrc',
      '.npmrc',
    ];
    return allowedDotFiles.includes(name) || name.endsWith('rc.json') || name.endsWith('rc.js');
  }

  /**
   * 権限確認・要求
   */
  private async verifyPermission(
    handle: FileSystemDirectoryHandle,
    readWrite: boolean
  ): Promise<boolean> {
    const options: { mode?: 'read' | 'readwrite' } = {
      mode: readWrite ? 'readwrite' : 'read'
    };
    
    const minimalHandle = handle as unknown as MinimalDirectoryHandle;
    try {
      console.debug('[DEBUG] verifyPermission: mode=', options.mode);
      console.debug('[DEBUG] verifyPermission: has queryPermission=', !!minimalHandle.queryPermission);
      console.debug('[DEBUG] verifyPermission: has requestPermission=', !!minimalHandle.requestPermission);
    } catch (e) {
      // ignore
    }

    if (!minimalHandle.queryPermission || !minimalHandle.requestPermission) {
      // If methods are missing, assume host provides access (older browsers / polyfills)
      console.debug('[DEBUG] verifyPermission: permission APIs not present, assuming allowed');
      return true;
    }

    try {
      const q = await minimalHandle.queryPermission(options);
      console.debug('[DEBUG] verifyPermission: queryPermission ->', q);
      if (q === 'granted') return true;

      const r = await minimalHandle.requestPermission(options);
      console.debug('[DEBUG] verifyPermission: requestPermission ->', r);
      if (r === 'granted') return true;
    } catch {
      console.warn('[DEBUG] verifyPermission: permission check/request threw');
      // fall through to deny
    }

    return false;
  }

  /**
   * テキストファイルかどうか判定（改良版）
   */
  private isTextFile(file: File, fileName: string): boolean {
    // 1. MIMEタイプによる判定
    if (file.type && file.type.startsWith('text/')) {
      return true;
    }
    
    // 2. 拡張子による判定
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && ext in MIME_TYPES) {
      return true;
    }
    
    // 3. 特殊なファイル名（拡張子なし）
    const specialFiles = [
      'Makefile',
      'Dockerfile',
      'Rakefile',
      'Gemfile',
      'Procfile',
      'LICENSE',
      'README',
      'CHANGELOG',
      'CONTRIBUTING',
    ];
    
    const fileNameUpper = fileName.toUpperCase();
    if (specialFiles.some(sf => fileNameUpper.startsWith(sf))) {
      return true;
    }
    
    // 4. 小さいファイル（1KB未満）はテキストの可能性が高い
    if (file.size < 1024) {
      return true;
    }
    
    return false;
  }

  /**
   * MIMEタイプ検出（改良版）
   */
  private detectMimeType(fileName: string, fileMimeType?: string): string {
    // 1. ブラウザーが検出したMIMEタイプを優先
    if (fileMimeType && fileMimeType !== 'application/octet-stream') {
      return fileMimeType;
    }
    
    // 2. 拡張子による判定
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && ext in MIME_TYPES) {
      return MIME_TYPES[ext];
    }
    
    // 3. 特殊なファイル名
    const fileNameLower = fileName.toLowerCase();
    if (fileNameLower === 'makefile') return 'text/x-makefile';
    if (fileNameLower === 'dockerfile') return 'text/x-dockerfile';
    if (fileNameLower === 'gemfile') return 'text/x-ruby';
    if (fileNameLower.startsWith('readme')) return 'text/markdown';
    if (fileNameLower === 'license') return 'text/plain';
    
    return 'text/plain';
  }

  /**
   * 現在のdirectoryHandleを取得
   */
  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }

  /**
   * ディスク上の現在状態と FileManager を比較し、差分を反映する
   * - フィルタは this.filter を参照して適用される
   * - 追加/変更/削除を検出して manager を更新する
   */
  async refreshFromDisk(manager: import('../core/FileManager').FileManager, rootPath: string = ''): Promise<{ added: number; modified: number; deleted: number }> {
    const handle = manager.getDirectoryHandle() || this.directoryHandle;
    if (!handle) {
      throw new Error('No directory handle available for refresh');
    }

    // 権限確認
    if (!(await this.verifyPermission(handle, false))) {
      throw new Error('Read permission denied');
    }

    const seen = new Set<string>();
    let added = 0, modified = 0, deleted = 0;

    // 再帰的に走査して現在のディスク状態を収集し、managerと比較
    const walk = async (dirHandle: FileSystemDirectoryHandle, currentPath: string) => {
      const minimal = dirHandle as unknown as import('../types/fs-helpers').MinimalDirectoryHandle;
      for await (const entry of (minimal.values?.() ?? (async function*(){})())) {
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (entry.kind === 'directory') {
          if (this.shouldExcludeDirectory(entry.name)) continue;
          await walk(entry as FileSystemDirectoryHandle, path);
        } else {
          // ファイル
          if (this.shouldExcludeFile(path, entry.name)) continue;

          const fileHandle = entry as FileSystemFileHandle;
          const minimalFile = fileHandle as unknown as import('../types/fs-helpers').MinimalFileHandle;
          const file = await minimalFile.getFile!();
          seen.add(path);

          const existing = manager.getFile(path);
          const isText = this.isTextFile(file, entry.name);
          if (!isText) continue;

          const content = await file.text();

          if (!existing) {
            manager.setFile({
              path,
              absolutePath: path,
              mimeType: this.detectMimeType(entry.name, file.type),
              content,
              metadata: { size: file.size, lastModified: new Date(file.lastModified), isDirectory: false },
              status: 'added'
            });
            added++;
          } else if (existing.content !== content) {
            manager.setFile({ ...existing, content });
            modified++;
          }
        }
      }
    };

    await walk(handle, rootPath.replace(/\/$/, ''));

    // manager に存在するがディスク上に存在しないファイルを削除マーク
    for (const f of manager.getAllFiles()) {
      if (!seen.has(f.path)) {
        if (f.status !== 'deleted') {
          manager.deleteFile(f.path);
          deleted++;
        }
      }
    }

    return { added, modified, deleted };
  }
}