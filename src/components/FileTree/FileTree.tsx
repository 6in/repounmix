import { FileManager } from '../../core/FileManager';
import { FileTreeNode } from './FileTreeNode';
import './FileTree.css';

interface FileTreeProps {
  fileManager: FileManager;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  hasFolder: boolean;
}

export function FileTree({ fileManager, selectedFile, onFileSelect, hasFolder }: FileTreeProps) {
  if (!hasFolder) {
    return (
      <div className="file-tree">
        <div className="file-tree-empty">
          <p>📁</p>
          <p>フォルダを開いてください</p>
        </div>
      </div>
    );
  }

  const tree = fileManager.buildTree();
  const fileCount = fileManager.getFileCount();

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-title">ファイル</span>
        <span className="file-tree-count">{fileCount}個</span>
      </div>
      <div className="file-tree-content">
        <FileTreeNode
          node={tree}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          level={0}
        />
      </div>
    </div>
  );
}