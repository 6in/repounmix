/**
 * コア型定義
 */

/**
 * ファイル変更ステータス
 */
export type FileStatus = 'unchanged' | 'modified' | 'added' | 'deleted';

/**
 * ファイルメタデータ
 */
export interface FileMetadata {
  /** ファイルサイズ（バイト） */
  size: number;
  /** 最終更新日時 */
  lastModified: Date;
  /** ディレクトリかどうか */
  isDirectory: boolean;
}

/**
 * ファイル保持オブジェクト
 */
export interface FileNode {
  /** 相対パス（ルートからの相対） */
  path: string;
  
  /** 絶対パス（File System Access API用、オプション） */
  absolutePath?: string;
  
  /** MIMEタイプ */
  mimeType: string;
  
  /** ファイル内容（テキスト） */
  content: string;
  
  /** メタデータ */
  metadata: FileMetadata;
  
  /** 変更状態 */
  status: FileStatus;
}

/**
 * ディレクトリノード
 */
export interface DirectoryNode {
  name: string;
  path: string;
  children: (DirectoryNode | FileNode)[];
  isDirectory: true;
}

/**
 * Repomix XML用のシンプルなファイルデータ
 */
export interface RepomixFileData {
  path: string;
  content: string;
}

/**
 * ファイルフィルタ設定
 */
export interface FileFilter {
  /** 含めるパターン（空の場合はすべて含める） */
  includePatterns: string[];
  /** 除外するパターン */
  ignorePatterns: string[];
  /** デフォルトの除外パターンを使用するか */
  useDefaultExcludes: boolean;
}

/**
 * MIME_TYPESのエクスポート（後方互換性のため）
 * 実際の定義はsrc/config/fileTypes.tsにあります
 */
export { MIME_TYPES } from '../config/fileTypes';

/**
 * 除外すべきディレクトリ・ファイル名のパターン
 */
export const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.vscode',
  '.idea',
  'coverage',
  '.DS_Store',
  'Thumbs.db',
];