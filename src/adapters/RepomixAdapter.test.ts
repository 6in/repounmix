import { describe, it, expect, beforeEach } from 'vitest';
import { RepomixAdapter } from './RepomixAdapter';
import { FileManager } from '../core/FileManager';
import type { FileNode } from '../types';

describe('RepomixAdapter', () => {
  let manager: FileManager;

  beforeEach(() => {
    manager = new FileManager();
  });

  describe('toXML', () => {
    it('単一ファイルをXMLに変換できる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello World',
        metadata: { size: 11, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const xml = RepomixAdapter.toXML(manager);

      expect(xml).toContain('<file path="test.txt">');
      expect(xml).toContain('Hello World');
      expect(xml).toContain('</file>');
    });

    it('複数ファイルをXMLに変換できる', () => {
      const files: FileNode[] = [
        {
          path: 'a.txt',
          mimeType: 'text/plain',
          content: 'Content A',
          metadata: { size: 9, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        },
        {
          path: 'b.txt',
          mimeType: 'text/plain',
          content: 'Content B',
          metadata: { size: 9, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        }
      ];
      files.forEach(f => manager.setFile(f));

      const xml = RepomixAdapter.toXML(manager);

      expect(xml).toContain('<file path="a.txt">');
      expect(xml).toContain('Content A');
      expect(xml).toContain('<file path="b.txt">');
      expect(xml).toContain('Content B');
    });

    it('HTMLタグを含むファイルを正しく変換できる（エスケープなし）', () => {
      const file: FileNode = {
        path: 'index.html',
        mimeType: 'text/html',
        content: '<div>Test & "Quotes"</div>',
        metadata: { size: 26, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const xml = RepomixAdapter.toXML(manager);

      expect(xml).toContain('<div>Test & "Quotes"</div>');
    });

    it('ディレクトリ構造セクションを生成する', () => {
      const file: FileNode = {
        path: 'src/test.ts',
        mimeType: 'text/typescript',
        content: 'const x = 1;',
        metadata: { size: 12, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const xml = RepomixAdapter.toXML(manager);

      expect(xml).toContain('<directory_structure>');
      expect(xml).toContain('src');
      expect(xml).toContain('test.ts');
      expect(xml).toContain('</directory_structure>');
    });

    it('file_summaryセクションを生成する', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'test',
        metadata: { size: 4, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const xml = RepomixAdapter.toXML(manager);

      expect(xml).toContain('<file_summary>');
      expect(xml).toContain('<purpose>');
      expect(xml).toContain('</file_summary>');
    });
  });

  describe('fromXML', () => {
    it('XMLからファイルを復元できる', () => {
      const xml = '<file_summary>\n<purpose>Test</purpose>\n</file_summary>\n\n<directory_structure>\ntest.txt\n</directory_structure>\n\n<files>\n<file path="test.txt">\nHello World\n</file>\n</files>';

      RepomixAdapter.fromXML(xml, manager);

      const file = manager.getFile('test.txt');
      expect(file).toBeDefined();
      expect(file?.content).toBe('Hello World');
      expect(file?.status).toBe('added');
    });

    it('複数ファイルを復元できる', () => {
      const xml = '<files>\n<file path="a.txt">\nContent A\n</file>\n<file path="b.txt">\nContent B\n</file>\n</files>';

      RepomixAdapter.fromXML(xml, manager);

      expect(manager.getAllFiles()).toHaveLength(2);
      expect(manager.getFile('a.txt')?.content).toBe('Content A');
      expect(manager.getFile('b.txt')?.content).toBe('Content B');
    });

    it('HTMLタグを含むファイルを正しく復元できる', () => {
      const xml = '<files>\n<file path="index.html">\n<div>Test & "Quotes"</div>\n</file>\n</files>';

      RepomixAdapter.fromXML(xml, manager);

      const file = manager.getFile('index.html');
      expect(file?.content).toBe('<div>Test & "Quotes"</div>');
    });

    it('空のファイルを復元できる', () => {
      const xml = '<files>\n<file path="empty.txt">\n\n</file>\n</files>';

      RepomixAdapter.fromXML(xml, manager);

      const file = manager.getFile('empty.txt');
      expect(file?.content).toBe('');
    });

    it('MIMEタイプを拡張子から推測する', () => {
      const xml = '<files>\n<file path="test.ts">\nconst x = 1;\n</file>\n<file path="style.css">\nbody { margin: 0; }\n</file>\n</files>';

      RepomixAdapter.fromXML(xml, manager);

      expect(manager.getFile('test.ts')?.mimeType).toBe('text/typescript');
      expect(manager.getFile('style.css')?.mimeType).toBe('text/css');
    });

    it('複数行のコンテンツを正しく復元できる', () => {
      const xml = '<files>\n<file path="multi.txt">\nLine 1\nLine 2\nLine 3\n</file>\n</files>';

      RepomixAdapter.fromXML(xml, manager);

      const file = manager.getFile('multi.txt');
      expect(file?.content).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('ラウンドトリップテスト', () => {
    it('toXML → fromXML で内容が保持される', () => {
      const originalFiles: FileNode[] = [
        {
          path: 'test.txt',
          mimeType: 'text/plain',
          content: 'Hello World',
          metadata: { size: 11, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        },
        {
          path: 'src/index.ts',
          mimeType: 'text/typescript',
          content: 'const x = 1;\nconsole.log(x);',
          metadata: { size: 28, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        }
      ];
      originalFiles.forEach(f => manager.setFile(f));

      const xml = RepomixAdapter.toXML(manager);

      const newManager = new FileManager();
      RepomixAdapter.fromXML(xml, newManager);

      const restoredFiles = newManager.getAllFiles();
      expect(restoredFiles).toHaveLength(2);
      
      originalFiles.forEach(original => {
        const restored = newManager.getFile(original.path);
        expect(restored?.content).toBe(original.content);
        expect(restored?.path).toBe(original.path);
      });
    });

    it('特殊文字を含むファイルでラウンドトリップが成功する', () => {
      const file: FileNode = {
        path: 'special.html',
        mimeType: 'text/html',
        content: '<div class="test">\n  <span>Hello & "World"</span>\n  <!-- Comment -->\n</div>',
        metadata: { size: 80, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const xml = RepomixAdapter.toXML(manager);
      const newManager = new FileManager();
      RepomixAdapter.fromXML(xml, newManager);

      const restored = newManager.getFile('special.html');
      expect(restored?.content).toBe(file.content);
    });
  });

  describe('XMLバリデーション', () => {
    it('空のXMLはエラーを返す', () => {
      const result = RepomixAdapter.fromXML('', manager);
      expect(result.success).toBe(false);
      expect(result.error).toContain('空です');
    });

    it('<files>タグがない場合はエラーを返す', () => {
      const xml = '<file path="test.txt">\nContent\n</file>';
      const result = RepomixAdapter.fromXML(xml, manager);
      expect(result.success).toBe(false);
      expect(result.error).toContain('<files>タグが見つかりません');
    });

    it('</files>閉じタグがない場合はエラーを返す', () => {
      const xml = '<files>\n<file path="test.txt">\nContent\n</file>';
      const result = RepomixAdapter.fromXML(xml, manager);
      expect(result.success).toBe(false);
      expect(result.error).toContain('</files>閉じタグが見つかりません');
    });

    it('<file>タグのバランスが取れていない場合はエラーを返す', () => {
      const xml = '<files>\n<file path="test.txt">\nContent\n</files>';
      const result = RepomixAdapter.fromXML(xml, manager);
      expect(result.success).toBe(false);
      expect(result.error).toContain('タグの数が一致しません');
    });

    it('<file>タグが1つもない場合はエラーを返す', () => {
      const xml = '<files>\n</files>';
      const result = RepomixAdapter.fromXML(xml, manager);
      expect(result.success).toBe(false);
      expect(result.error).toContain('1つも見つかりません');
    });

    it('正しいXMLの場合はsuccessを返す', () => {
      const xml = '<files>\n<file path="test.txt">\nContent\n</file>\n</files>';
      const result = RepomixAdapter.fromXML(xml, manager);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('パースエラーの場合、FileManagerは変更されない', () => {
      // 事前にファイルを設定
      const file: FileNode = {
        path: 'original.txt',
        mimeType: 'text/plain',
        content: 'Original Content',
        metadata: { size: 16, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      // 不正なXMLでfromXMLを実行
      const result = RepomixAdapter.fromXML('<invalid></invalid>', manager);
      
      expect(result.success).toBe(false);
      // FileManagerは元のままであることを確認
      expect(manager.getAllFiles()).toHaveLength(1);
      expect(manager.getFile('original.txt')?.content).toBe('Original Content');
    });
  });
});