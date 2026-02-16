import { describe, it, expect, beforeEach } from 'vitest';
import { FileManager } from './FileManager';
import type { FileNode } from '../types';

describe('FileManager', () => {
  let manager: FileManager;

  beforeEach(() => {
    manager = new FileManager();
  });

  describe('setFile', () => {
    it('新規ファイルを追加できる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: {
          size: 5,
          lastModified: new Date(),
          isDirectory: false
        },
        status: 'unchanged'
      };

      manager.setFile(file);
      const result = manager.getFile('test.txt');
      expect(result).toBeDefined();
      expect(result?.status).toBe('added');
    });

    it('既存ファイルを更新すると status が modified になる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const updated = { ...file, content: 'World', status: 'unchanged' as const };
      manager.setFile(updated);

      const result = manager.getFile('test.txt');
      expect(result?.status).toBe('modified');
      expect(result?.content).toBe('World');
    });

    it('同じ内容で更新しても status は unchanged のまま', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);
      
      const existing = manager.getFile('test.txt')!;
      existing.status = 'unchanged';
      
      manager.setFile({ ...file });

      expect(manager.getFile('test.txt')?.status).toBe('unchanged');
    });
  });

  describe('getFile', () => {
    it('存在しないファイルは undefined を返す', () => {
      expect(manager.getFile('nonexistent.txt')).toBeUndefined();
    });

    it('追加したファイルを取得できる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      const result = manager.getFile('test.txt');
      expect(result?.content).toBe('Hello');
    });
  });

  describe('getAllFiles', () => {
    it('すべてのファイルを取得できる', () => {
      const files: FileNode[] = [
        {
          path: 'a.txt',
          mimeType: 'text/plain',
          content: 'A',
          metadata: { size: 1, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        },
        {
          path: 'b.txt',
          mimeType: 'text/plain',
          content: 'B',
          metadata: { size: 1, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        }
      ];

      files.forEach(f => manager.setFile(f));
      expect(manager.getAllFiles()).toHaveLength(2);
    });

    it('空の場合は空配列を返す', () => {
      expect(manager.getAllFiles()).toEqual([]);
    });
  });

  describe('deleteFile', () => {
    it('ファイルを削除マークできる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      manager.deleteFile('test.txt');
      expect(manager.getFile('test.txt')?.status).toBe('deleted');
    });

    it('存在しないファイルを削除しても何も起こらない', () => {
      expect(() => manager.deleteFile('nonexistent.txt')).not.toThrow();
    });
  });

  describe('getModifiedFiles', () => {
    it('変更されたファイルのみ取得できる', () => {
      // 1. 最初にファイルを追加
      const file1: FileNode = {
        path: 'unchanged.txt',
        mimeType: 'text/plain',
        content: 'A',
        metadata: { size: 1, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      const file2: FileNode = {
        path: 'modified.txt',
        mimeType: 'text/plain',
        content: 'B',
        metadata: { size: 1, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };

      manager.setFile(file1);
      manager.setFile(file2);

      // 2. 両方のstatusを'unchanged'にリセット（初期状態を模擬）
      manager.getFile('unchanged.txt')!.status = 'unchanged';
      manager.getFile('modified.txt')!.status = 'unchanged';

      // 3. file2を変更（内容を変えて再度setFile）
      const updatedFile2 = { ...file2, content: 'B modified' };
      manager.setFile(updatedFile2);

      // 4. 検証
      const modifiedFiles = manager.getModifiedFiles();
      expect(modifiedFiles).toHaveLength(1);
      expect(modifiedFiles[0].path).toBe('modified.txt');
      expect(modifiedFiles[0].status).toBe('modified');
    });

    it('変更がない場合は空配列を返す', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'A',
        metadata: { size: 1, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);
      
      const existing = manager.getFile('test.txt')!;
      existing.status = 'unchanged';

      expect(manager.getModifiedFiles()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('すべてのデータをクリアできる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manager.setRoot('/root', {} as any);

      manager.clear();

      expect(manager.getAllFiles()).toHaveLength(0);
      expect(manager.getFile('test.txt')).toBeUndefined();
      expect(manager.getRootPath()).toBe('');
    });
  });

  describe('buildTree', () => {
    it('ファイルからディレクトリツリーを構築できる', () => {
      const files: FileNode[] = [
        {
          path: 'src/index.ts',
          mimeType: 'text/typescript',
          content: 'code',
          metadata: { size: 4, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        },
        {
          path: 'src/utils/helper.ts',
          mimeType: 'text/typescript',
          content: 'helper',
          metadata: { size: 6, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        },
        {
          path: 'README.md',
          mimeType: 'text/markdown',
          content: 'readme',
          metadata: { size: 6, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        }
      ];

      files.forEach(f => manager.setFile(f));
      const tree = manager.buildTree();

      expect(tree.isDirectory).toBe(true);
      expect(tree.children.length).toBeGreaterThan(0);
    });
  });

  describe('hasFile', () => {
    it('ファイルの存在を確認できる', () => {
      const file: FileNode = {
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      };
      manager.setFile(file);

      expect(manager.hasFile('test.txt')).toBe(true);
      expect(manager.hasFile('nonexistent.txt')).toBe(false);
    });
  });

  describe('getAllPaths', () => {
    it('すべてのパスを取得できる', () => {
      const files: FileNode[] = [
        {
          path: 'a.txt',
          mimeType: 'text/plain',
          content: 'A',
          metadata: { size: 1, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        },
        {
          path: 'b.txt',
          mimeType: 'text/plain',
          content: 'B',
          metadata: { size: 1, lastModified: new Date(), isDirectory: false },
          status: 'unchanged'
        }
      ];

      files.forEach(f => manager.setFile(f));
      const paths = manager.getAllPaths();

      expect(paths).toContain('a.txt');
      expect(paths).toContain('b.txt');
      expect(paths).toHaveLength(2);
    });
  });
});