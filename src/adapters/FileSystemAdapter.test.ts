import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemAdapter } from './FileSystemAdapter';
import { FileManager } from '../core/FileManager';

const createMockFileSystemAPI = () => {
  const mockFile = {
    text: vi.fn().mockResolvedValue('Mock content'),
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
    getDirectoryHandle: vi.fn().mockImplementation(() => {
      return Promise.resolve(mockDirectoryHandle);
    }),
    removeEntry: vi.fn().mockResolvedValue(undefined),
    queryPermission: vi.fn().mockResolvedValue('granted'),
    requestPermission: vi.fn().mockResolvedValue('granted')
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = {
    showDirectoryPicker: vi.fn().mockResolvedValue(mockDirectoryHandle)
  };

  return { mockFileHandle, mockDirectoryHandle, mockFile };
};

describe('FileSystemAdapter', () => {
  let adapter: FileSystemAdapter;
  let manager: FileManager;

  beforeEach(() => {
    adapter = new FileSystemAdapter();
    manager = new FileManager();
    createMockFileSystemAPI();
  });

  describe('selectFolder', () => {
    it('フォルダ選択ダイアログを表示できる', async () => {
      const handle = await adapter.selectFolder();
      expect(handle).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).showDirectoryPicker).toHaveBeenCalled();
    });

    it('権限を確認する', async () => {
      const handle = await adapter.selectFolder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((handle as any).queryPermission).toHaveBeenCalled();
    });
  });

  describe('loadToManager', () => {
    it('ファイルをFileManagerに読み込める', async () => {
      const handle = await adapter.selectFolder();
      expect(handle).not.toBeNull();
      await adapter.loadToManager(manager, handle!, '/root');

      const files = manager.getAllFiles();
      expect(files.length).toBeGreaterThan(0);
      expect(files[0].content).toBe('Mock content');
      expect(files[0].status).toBe('unchanged');
    });

    it('ルートパスを設定する', async () => {
      const handle = await adapter.selectFolder();
      expect(handle).not.toBeNull();
      await adapter.loadToManager(manager, handle!, '/test-root');

      expect(manager.getRootPath()).toBe('/test-root');
    });
  });

  describe('saveFromManager', () => {
    it('追加されたファイルを保存できる', async () => {
      await adapter.selectFolder();
      
      manager.setFile({
        path: 'new.txt',
        mimeType: 'text/plain',
        content: 'New content',
        metadata: { size: 11, lastModified: new Date(), isDirectory: false },
        status: 'added'
      });

      await adapter.saveFromManager(manager);
      
      expect(manager.getFile('new.txt')?.status).toBe('unchanged');
    });

    it('変更されたファイルを保存できる', async () => {
      await adapter.selectFolder();
      
      manager.setFile({
        path: 'modified.txt',
        mimeType: 'text/plain',
        content: 'Modified content',
        metadata: { size: 16, lastModified: new Date(), isDirectory: false },
        status: 'modified'
      });

      await adapter.saveFromManager(manager);
      
      expect(manager.getFile('modified.txt')?.status).toBe('unchanged');
    });

    it('削除マークされたファイルを削除できる', async () => {
      await adapter.selectFolder();
      
      manager.setFile({
        path: 'deleted.txt',
        mimeType: 'text/plain',
        content: 'To be deleted',
        metadata: { size: 13, lastModified: new Date(), isDirectory: false },
        status: 'deleted'
      });

      await expect(adapter.saveFromManager(manager)).resolves.not.toThrow();
    });

    it('フォルダが選択されていない場合はエラー', async () => {
      manager.setFile({
        path: 'test.txt',
        mimeType: 'text/plain',
        content: 'content',
        metadata: { size: 7, lastModified: new Date(), isDirectory: false },
        status: 'added'
      });

      await expect(adapter.saveFromManager(manager)).rejects.toThrow('No directory selected');
    });
  });
});