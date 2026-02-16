import { FileManager } from '../core/FileManager';
import type { FileNode, RepomixFileData } from '../types';
import { getFileTypeConfig } from '../config/fileTypes';

export interface ParseValidationError {
  isValid: boolean;
  error?: string;
  line?: number;
  context?: string;
}

export interface ParseResult {
  success: boolean;
  data?: RepomixFileData[];
  error?: string;
  details?: ParseValidationError;
}

/**
 * FileManager ↔ Repomix XML の変換アダプター
 */
export class RepomixAdapter {
  /**
   * パスを正規化（バックスラッシュをスラッシュに変換）
   * Windows環境でのパス区切り文字の問題に対応
   */
  private static normalizePath(path: string): string {
    // バックスラッシュをスラッシュに変換
    return path.replace(/\\/g, '/');
  }

  /**
   * FileManager → Repomix XML
   */
  static toXML(manager: FileManager): string {
    const files = manager.getAllFiles().filter(f => !f.metadata.isDirectory);
    
    let xml = this.generateXMLHeader();
    xml += this.generateDirectorySection(files);
    xml += '\n<files>\n';
    xml += 'This section contains the contents of the repository\'s files.\n\n';
    
    for (const file of files) {
      xml += '<file path="' + file.path + '">\n';
      xml += file.content;
      xml += '\n</file>\n\n';
    }
    
    xml += '</files>';
    return xml;
  }

  /**
   * Repomix XML → FileManager
   */
  static fromXML(xml: string, manager: FileManager): ParseResult {
    // 一部のAIがタグを "\<file\>" のようにバックスラッシュでエスケープして返すことがある。
    // その場合は自動でアンエスケープしてから検証・パースする。
    const looksEscaped = xml.includes('\\<files\\>') || xml.includes('\\<file') || xml.includes('\\</files\\>');
    if (looksEscaped) {
      // 安全に '\<' および '\>' を '<' / '>' に置換（正規表現でのエスケープが扱いにくいため split/join を使用）
      xml = xml.split('\\<').join('<').split('\\>').join('>');
      // ログはデバッグ用途（ブラウザコンソールへの出力）
  console.info('RepomixAdapter: detected escaped tags and unescaped them before parsing.');
    }

    // 改行コードを正規化（WindowsのCRLFに対応）
    const normalizedXml = xml.replace(/\r\n/g, '\n');

    // まず構造の検証
    const validation = this.validateXML(normalizedXml);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        details: validation
      };
    }

    // XMLをパース
    const parseResult = this.parseRepomixXML(normalizedXml);
    if (!parseResult.success) {
      return parseResult;
    }

    const fileData = parseResult.data!;
    
    // ファイルデータをFileManagerに追加
    for (const data of fileData) {
      // パスを正規化（バックスラッシュ→スラッシュ）
      const normalizedPath = this.normalizePath(data.path);
      const config = getFileTypeConfig(normalizedPath.split('/').pop() || '');
      
      const fileNode: FileNode = {
        path: normalizedPath,
        mimeType: config.mimeType,
        content: data.content,
        metadata: {
          size: data.content.length,
          lastModified: new Date(),
          isDirectory: false
        },
        status: 'added'
      };
      
      manager.setFile(fileNode);
    }

    return { success: true, data: fileData };
  }

  /**
   * Repomix XMLのバリデーション
   */
  private static validateXML(xml: string): ParseValidationError {
    // 基本的な構造チェック
    if (!xml || xml.trim().length === 0) {
      return {
        isValid: false,
        error: 'XMLが空です'
      };
    }

    // <files>タグの存在チェック
    const filesStartMatch = xml.match(/<files>/i);
    if (!filesStartMatch) {
      return {
        isValid: false,
        error: '<files>タグが見つかりません。Repomix形式のXMLか確認してください。'
      };
    }

    const filesEndMatch = xml.match(/<\/files>/i);
    if (!filesEndMatch) {
      return {
        isValid: false,
        error: '</files>閉じタグが見つかりません。'
      };
    }

    // <file>タグのバランスチェック
    const fileOpenTags = xml.match(/<file path="[^"]*">/g) || [];
    const fileCloseTags = xml.match(/<\/file>/g) || [];
    
    if (fileOpenTags.length !== fileCloseTags.length) {
      return {
        isValid: false,
        error: `<file>タグの数が一致しません（開始: ${fileOpenTags.length}, 終了: ${fileCloseTags.length}）`,
        context: `最初の<file>タグ: ${fileOpenTags[0] || 'なし'}`
      };
    }

    if (fileOpenTags.length === 0) {
      return {
        isValid: false,
        error: '<file>タグが1つも見つかりません。ファイル情報が含まれていない可能性があります。'
      };
    }

    return { isValid: true };
  }

  /**
   * Repomix XML解析（正規表現ベース）
   */
  private static parseRepomixXML(xml: string): ParseResult {
    const filePattern = /<file path="([^"]+)">(?:\r?\n)?([\s\S]*?)(?:\r?\n)?<\/file>/g;
    const files: RepomixFileData[] = [];
    
    let match;
    while ((match = filePattern.exec(xml)) !== null) {
      files.push({
        path: match[1],
        content: match[2]
      });
    }

    if (files.length === 0) {
      // パターンにマッチしない場合、より詳細なエラーを返す
      const firstFileTag = xml.match(/<file[^>]*>/i);
      if (firstFileTag) {
        const lines = xml.substring(0, xml.indexOf(firstFileTag[0]) + firstFileTag[0].length).split('\n');
        return {
          success: false,
          error: '<file>タグの形式が正しくありません。path属性があるか、閉じタグが正しいか確認してください。',
          details: {
            isValid: false,
            error: '形式エラー',
            line: lines.length,
            context: firstFileTag[0]
          }
        };
      }
    }
    
    return { success: true, data: files };
  }

  /**
   * XMLヘッダー生成
   */
  private static generateXMLHeader(): string {
    return '<file_summary>\n' +
      '<purpose>\n' +
      'This file contains a packed representation of the entire repository\'s contents.\n' +
      'It is designed to be easily consumable by AI systems for analysis, code review,\n' +
      'or other automated processes.\n' +
      '</purpose>\n\n' +
      '<file_format>\n' +
      'The content is organized as follows:\n' +
      '1. This summary section\n' +
      '2. Repository information\n' +
      '3. Directory structure\n' +
      '4. Repository files (if enabled)\n' +
      '5. Multiple file entries, each consisting of:\n' +
      '  - File path as an attribute\n' +
      '  - Full contents of the file\n' +
      '</file_format>\n\n' +
      '<usage_guidelines>\n' +
      '- This file should be treated as read-only. Any changes should be made to the\n' +
      '  original repository files, not this packed version.\n' +
      '- When processing this file, use the file path to distinguish\n' +
      '  between different files in the repository.\n' +
      '- Be aware that this file may contain sensitive information. Handle it with\n' +
      '  the same level of security as you would the original repository.\n' +
      '</usage_guidelines>\n\n' +
      '<notes>\n' +
      '- Some files may have been excluded based on .gitignore rules and Repomix\'s configuration\n' +
      '- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files\n' +
      '- Files matching patterns in .gitignore are excluded\n' +
      '- Files matching default ignore patterns are excluded\n' +
      '- Files are sorted by Git change count (files with more changes are at the bottom)\n' +
      '</notes>\n\n' +
      '</file_summary>\n\n';
  }

  /**
   * ディレクトリ構造セクション生成
   */
  private static generateDirectorySection(files: FileNode[]): string {
    const structure = this.buildDirectoryStructure(files);
    return '<directory_structure>\n' + structure + '\n</directory_structure>\n';
  }

  /**
   * ディレクトリ構造を文字列として構築
   */
  private static buildDirectoryStructure(files: FileNode[]): string {
    const tree = new Map<string, Set<string>>();
    
    for (const file of files) {
      const parts = file.path.split('/');
      
      for (let i = 0; i < parts.length; i++) {
        const dir = parts.slice(0, i).join('/');
        const item = parts[i];
        
        if (!tree.has(dir)) {
          tree.set(dir, new Set());
        }
        tree.get(dir)!.add(item);
      }
    }

    const lines: string[] = [];
    const sortedDirs = Array.from(tree.keys()).sort();
    
    for (const dir of sortedDirs) {
      const items = Array.from(tree.get(dir)!).sort();
      const indent = '  '.repeat(dir.split('/').filter(p => p).length);
      
      for (const item of items) {
        lines.push(indent + item);
      }
    }

    return lines.join('\n');
  }
}