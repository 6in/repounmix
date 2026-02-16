import { useState } from 'react';
import type { DirectoryNode, FileNode } from '../../types';

interface FileTreeNodeProps {
  node: DirectoryNode | FileNode;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  level: number;
}

// 型ガード関数
function isDirectoryNode(node: DirectoryNode | FileNode): node is DirectoryNode {
  return 'isDirectory' in node && node.isDirectory === true;
}

export function FileTreeNode({ node, selectedFile, onFileSelect, level }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 最初の2階層は展開

  if (isDirectoryNode(node)) {
    const dirNode = node;
    
    return (
      <div className="directory-node">
        <div 
          className="directory-header"
          style={{ paddingLeft: `${level * 16}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="directory-icon">{isExpanded ? '📂' : '📁'}</span>
          <span className="directory-name">{dirNode.name || '/'}</span>
          <span className="directory-arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="directory-children">
            {dirNode.children.map((child, index) => {
              // keyの生成
              const childKey = isDirectoryNode(child)
                ? `${dirNode.path}/${child.name}-${index}`
                : child.path;
              return (
                <FileTreeNode
                  key={childKey}
                  node={child}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                  level={level + 1}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const fileNode = node as FileNode;
  const isSelected = fileNode.path === selectedFile;
  const fileName = fileNode.path.split('/').pop() || fileNode.path;

  return (
    <div
      className={`file-node ${isSelected ? 'selected' : ''}`}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={() => onFileSelect(fileNode.path)}
    >
      <span className="file-icon">📄</span>
      <span className="file-name">{fileName}</span>
      {fileNode.status !== 'unchanged' && (
        <span className={`file-status status-${fileNode.status}`}>
          {fileNode.status === 'modified' && 'M'}
          {fileNode.status === 'added' && 'A'}
          {fileNode.status === 'deleted' && 'D'}
        </span>
      )}
    </div>
  );
}