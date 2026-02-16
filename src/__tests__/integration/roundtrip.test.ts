import { describe, it, expect } from 'vitest';
import { RepomixCore } from '../../services/RepomixCore';
import { RepomixAdapter } from '../../adapters/RepomixAdapter';
import type { FileNode } from '../../types';

describe('ラウンドトリップテスト（実際のRepomix XMLとの互換性）', () => {
  it('複雑なファイル構造でラウンドトリップが成功する', () => {
    const core = new RepomixCore();
    const manager = core.getFileManager();

    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        mimeType: 'text/typescript',
        content: 'import { App } from "./App";\n\nconst app = new App();',
        metadata: { size: 50, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      },
      {
        path: 'src/components/Button.tsx',
        mimeType: 'text/typescript',
        content: 'export const Button = () => <button>Click</button>;',
        metadata: { size: 52, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      },
      {
        path: 'public/index.html',
        mimeType: 'text/html',
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Test & "App"</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
        metadata: { size: 120, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      },
      {
        path: 'README.md',
        mimeType: 'text/markdown',
        content: '# Test Project\n\nThis is a **test** project with `code`.',
        metadata: { size: 55, lastModified: new Date(), isDirectory: false },
        status: 'unchanged'
      }
    ];

    files.forEach(f => manager.setFile(f));

    const xml = core.mix();

    const newCore = new RepomixCore();
    const newManager = newCore.getFileManager();
    
    RepomixAdapter.fromXML(xml, newManager);

    const restoredFiles = newManager.getAllFiles();
    expect(restoredFiles).toHaveLength(files.length);

    files.forEach(original => {
      const restored = newManager.getFile(original.path);
      expect(restored).toBeDefined();
      expect(restored?.content).toBe(original.content);
      expect(restored?.path).toBe(original.path);
      expect(restored?.mimeType).toBe(original.mimeType);
    });
  });

  it('特殊文字を含むファイルでラウンドトリップが成功する', () => {
    const core = new RepomixCore();
    const manager = core.getFileManager();

    const specialFile: FileNode = {
      path: 'special.html',
      mimeType: 'text/html',
      content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Test & "Quotes" <Tags></title>\n</head>\n<body>\n  <div class="test">\n    <span>Hello & World</span>\n    <!-- Comment with <tags> -->\n    <script>\n      const x = 1 < 2 && 3 > 2;\n      console.log("Test & \'Quotes\'");\n    </script>\n  </div>\n</body>\n</html>',
      metadata: { size: 300, lastModified: new Date(), isDirectory: false },
      status: 'unchanged'
    };

    manager.setFile(specialFile);

    const xml = core.mix();

    const newCore = new RepomixCore();
    RepomixAdapter.fromXML(xml, newCore.getFileManager());

    const restored = newCore.getFileManager().getFile('special.html');
    expect(restored?.content).toBe(specialFile.content);
  });

  it('空ファイルでラウンドトリップが成功する', () => {
    const core = new RepomixCore();
    const manager = core.getFileManager();

    manager.setFile({
      path: 'empty.txt',
      mimeType: 'text/plain',
      content: '',
      metadata: { size: 0, lastModified: new Date(), isDirectory: false },
      status: 'unchanged'
    });

    const xml = core.mix();

    const newCore = new RepomixCore();
    RepomixAdapter.fromXML(xml, newCore.getFileManager());

    const restored = newCore.getFileManager().getFile('empty.txt');
    expect(restored?.content).toBe('');
  });

  it('深いディレクトリ構造でラウンドトリップが成功する', () => {
    const core = new RepomixCore();
    const manager = core.getFileManager();

    const deepFile: FileNode = {
      path: 'src/components/ui/buttons/primary/PrimaryButton.tsx',
      mimeType: 'text/typescript',
      content: 'export const PrimaryButton = () => <button>Primary</button>;',
      metadata: { size: 60, lastModified: new Date(), isDirectory: false },
      status: 'unchanged'
    };

    manager.setFile(deepFile);

    const xml = core.mix();

    const newCore = new RepomixCore();
    RepomixAdapter.fromXML(xml, newCore.getFileManager());

    const restored = newCore.getFileManager().getFile(deepFile.path);
    expect(restored?.content).toBe(deepFile.content);
  });
});