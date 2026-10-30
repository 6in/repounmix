import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepomixCore } from './RepomixCore';

const setupMockFileSystem = () => {
  const mockFile = {
    text: vi.fn().mockResolvedValue('Test content'),
    size: 12,
    lastModified: Date.now(),
    type: 'text/plain',
    name: 'test.txt'
  };

  const mockFileHandle = {
    kind: 'file',
    name: 'test.txt',
    getFile: vi.fn().mockResolvedValue(mockFile),
    createWritable: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    })
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDirectoryHandle: any = {
    kind: 'directory',
    name: 'test-dir',
    values: vi.fn().mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield mockFileHandle;
      }
    }),
    getFileHandle: vi.fn().mockResolvedValue(mockFileHandle),
    getDirectoryHandle: vi.fn(),
    removeEntry: vi.fn().mockResolvedValue(undefined),
    queryPermission: vi.fn().mockResolvedValue('granted'),
    requestPermission: vi.fn().mockResolvedValue('granted')
  };
  
  // Set up circular reference after declaration
  mockDirectoryHandle.getDirectoryHandle.mockResolvedValue(mockDirectoryHandle);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = {
    showDirectoryPicker: vi.fn().mockResolvedValue(mockDirectoryHandle)
  };
};

describe('RepomixCore（統合テスト）', () => {
  let core: RepomixCore;

  beforeEach(() => {
    core = new RepomixCore();
    setupMockFileSystem();
  });

  describe('openFolder', () => {
    it('フォルダを開いてファイルを読み込める', async () => {
      await core.openFolder();

      const manager = core.getFileManager();
      const files = manager.getAllFiles();
      
      expect(files.length).toBeGreaterThan(0);
      expect(files[0].content).toBe('Test content');
    });
  });

  describe('mix', () => {
    it('FileManagerの内容をXMLに変換できる', () => {
      const manager = core.getFileManager();
      manager.setFile({
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      });

      const xml = core.mix();
      
      expect(xml).toContain('<file_summary>');
      expect(xml).toContain('<directory_structure>');
      expect(xml).toContain('<file path="test.txt">');
      expect(xml).toContain('Hello');
      expect(xml).toContain('</file>');
    });

    it('複数ファイルをXMLに変換できる', () => {
      const manager = core.getFileManager();
      manager.setFile({
        path: 'a.txt',
        mimeType: 'text/plain',
        content: 'Content A',
        metadata: { size: 9, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      });
      manager.setFile({
        path: 'b.txt',
        mimeType: 'text/plain',
        content: 'Content B',
        metadata: { size: 9, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      });

      const xml = core.mix();
      
      expect(xml).toContain('<file path="a.txt">');
      expect(xml).toContain('Content A');
      expect(xml).toContain('<file path="b.txt">');
      expect(xml).toContain('Content B');
    });
  });

  describe('unmix', () => {
    it('XMLをFileManagerに読み込める', async () => {
      const xml = '<files>\n<file path="restored.txt">\nRestored content\n</file>\n</files>';

      const result = await core.unmix(xml);

      expect(result.success).toBe(true);
      const manager = core.getFileManager();
      const file = manager.getFile('restored.txt');
      expect(file?.content).toBe('Restored content');
      expect(file?.status).toBe('unchanged');
    });

    it('複数ファイルを復元できる', async () => {
      const xml = '<files>\n<file path="file1.txt">\nContent 1\n</file>\n<file path="file2.txt">\nContent 2\n</file>\n</files>';

      const result = await core.unmix(xml);

      expect(result.success).toBe(true);
      const manager = core.getFileManager();
      expect(manager.getFile('file1.txt')?.content).toBe('Content 1');
      expect(manager.getFile('file2.txt')?.content).toBe('Content 2');
    });

    it('不正なXMLの場合はエラーを返す', async () => {
      const xml = '<invalid></invalid>';

      const result = await core.unmix(xml);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('<files>タグが見つかりません');
    });

    it('パースエラー時はFileManagerを変更しない', async () => {
      // 事前にファイルを設定
      const manager = core.getFileManager();
      manager.setFile({
        path: 'original.txt',
        mimeType: 'text/plain',
        content: 'Original',
        metadata: { size: 8, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      });

      const xml = '<invalid></invalid>';
      const result = await core.unmix(xml);

      expect(result.success).toBe(false);
      // 元のファイルは保持されていることを確認
      expect(manager.getFile('original.txt')?.content).toBe('Original');
    });
  });

  describe('エンドツーエンドフロー', () => {
    it('openFolder → mix → unmix のフルフローが動作する', async () => {
      await core.openFolder();

      const xml = core.mix();
      expect(xml).toContain('<files>');

      const newCore = new RepomixCore();
      await newCore.unmix(xml);

      const manager = newCore.getFileManager();
      const files = manager.getAllFiles();
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('clear', () => {
    it('状態をクリアできる', () => {
      const manager = core.getFileManager();
      manager.setFile({
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'Hello',
        metadata: { size: 5, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      });

      core.clear();

      expect(manager.getAllFiles()).toHaveLength(0);
    });
  });

  describe('getFileManager', () => {
    it('FileManagerインスタンスを取得できる', () => {
      const manager = core.getFileManager();
      expect(manager).toBeDefined();
      expect(typeof manager.setFile).toBe('function');
      expect(typeof manager.getFile).toBe('function');
    });
  });
});