import type { FileNode, DirectoryNode } from '../types';

/**
 * ファイル保持・管理クラス
 * メモリ上でファイルを管理し、実ファイルへの直接操作を避ける
 */
export class FileManager {
  private files: Map<string, FileNode> = new Map();
  private rootPath: string = '';
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  /**
   * ルートパスとディレクトリハンドルを設定
   */
  setRoot(path: string, handle: FileSystemDirectoryHandle): void {
    this.rootPath = path;
    this.directoryHandle = handle;
  }

  /**
   * ルートパスを取得
   */
  getRootPath(): string {
    return this.rootPath;
  }

  /**
   * ディレクトリハンドルを取得
   */
  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }

  /**
   * ファイルを追加・更新
   * 既存ファイルとの比較により自動的にステータスを設定
   */
  setFile(fileNode: FileNode): void {
    const existing = this.files.get(fileNode.path);
    
    if (!existing) {
      // 新規ファイル
      fileNode.status = 'added';
    } else if (existing.content !== fileNode.content) {
      // 内容が変更された
      fileNode.status = 'modified';
    } else {
      // 変更なし
      fileNode.status = existing.status;
    }
    
    this.files.set(fileNode.path, fileNode);
  }

  /**
   * ファイルを取得
   */
  getFile(path: string): FileNode | undefined {
    return this.files.get(path);
  }

  /**
   * すべてのファイルを取得
   */
  getAllFiles(): FileNode[] {
    return Array.from(this.files.values());
  }

  /**
   * ファイルを削除マーク
   * 実際の削除は行わず、statusをdeletedに設定
   */
  deleteFile(path: string): void {
    const file = this.files.get(path);
    if (file) {
      file.status = 'deleted';
    }
  }

  /**
   * 変更されたファイルのみ取得
   */
  getModifiedFiles(): FileNode[] {
    return this.getAllFiles().filter(f => f.status !== 'unchanged');
  }

  /**
   * ファイル数を取得
   */
  getFileCount(): number {
    return this.files.size;
  }

  /**
   * ディレクトリツリーを構築
   */
  buildTree(): DirectoryNode {
    const root: DirectoryNode = {
      name: this.rootPath || '/',
      path: '',
      children: [],
      isDirectory: true
    };

    const allFiles = this.getAllFiles();
    
    for (const file of allFiles) {
      this.addToTree(root, file);
    }

    // ツリー全体をソート
    this.sortTree(root);

    return root;
  }

  /**
   * ツリーを再帰的にソート（ディレクトリ優先、名前順）
   */
  private sortTree(node: DirectoryNode): void {
    node.children.sort((a, b) => {
      const aIsDir = 'isDirectory' in a && a.isDirectory;
      const bIsDir = 'isDirectory' in b && b.isDirectory;
      
      // ディレクトリを先に
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      
      // 名前を取得（ディレクトリはnameプロパティ、ファイルはpathからファイル名を抽出）
      const aName = 'name' in a ? a.name : (a.path.split('/').pop() || '');
      const bName = 'name' in b ? b.name : (b.path.split('/').pop() || '');
      
      // 同じ種類なら名前順（大文字小文字を区別しない、自然順）
      return aName.localeCompare(bName, undefined, { 
        sensitivity: 'base',
        numeric: true 
      });
    });

    // 子ディレクトリも再帰的にソート
    for (const child of node.children) {
      if ('isDirectory' in child && child.isDirectory) {
        this.sortTree(child as DirectoryNode);
      }
    }
  }

  /**
   * ツリーにファイルを追加（内部ヘルパー）
   */
  private addToTree(root: DirectoryNode, file: FileNode): void {
    const parts = file.path.split('/').filter(p => p.length > 0);
    let current = root;

    // ディレクトリ部分を処理
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const path = parts.slice(0, i + 1).join('/');
      
      let child = current.children.find(
        c => ('isDirectory' in c) && c.isDirectory && ('name' in c) && c.name === part
      ) as DirectoryNode | undefined;

      if (!child) {
        child = {
          name: part,
          path,
          children: [],
          isDirectory: true
        };
        current.children.push(child);
      }

      current = child;
    }

    // ファイルを追加
    if (parts.length > 0) {
      current.children.push(file);
    }
  }

  /**
   * すべてクリア
   */
  clear(): void {
    this.files.clear();
    this.rootPath = '';
    this.directoryHandle = null;
  }

  /**
   * ファイルが存在するかチェック
   */
  hasFile(path: string): boolean {
    return this.files.has(path);
  }

  /**
   * パスのリストを取得
   */
  getAllPaths(): string[] {
    return Array.from(this.files.keys());
  }
}