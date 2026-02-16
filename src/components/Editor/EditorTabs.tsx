import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileManager } from '../../core/FileManager';
import { getFileTypeConfig, getMonacoLanguageFromMimeType } from '../../config/fileTypes';
import './Editor.css';

interface EditorTabsProps {
  activeTab: 'file-editor' | 'repomix-xml';
  onTabChange: (tab: 'file-editor' | 'repomix-xml') => void;
  selectedFile: string | null;
  fileManager: FileManager;
  repomixXML: string;
  onRepomixXMLChange: (xml: string) => void;
  onFileChange: (path: string, content: string) => void;
}

export function EditorTabs({
  activeTab,
  onTabChange,
  selectedFile,
  fileManager,
  repomixXML,
  onRepomixXMLChange,
  onFileChange
}: EditorTabsProps) {
  const file = selectedFile ? fileManager.getFile(selectedFile) : null;
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('light');

  // テーマの変更を監視
  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light');
    };

    // 初期テーマを設定
    updateTheme();

    // data-theme属性の変更を監視
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  /**
   * ファイル名からMonaco Editorの言語を取得
   */
  const getLanguageForFile = (fileName: string, mimeType: string): string => {
    // 1. ファイル名から設定を取得
    const config = getFileTypeConfig(fileName);
    if (config.monacoLanguage !== 'plaintext') {
      return config.monacoLanguage;
    }
    
    // 2. MIMEタイプから取得
    const langFromMime = getMonacoLanguageFromMimeType(mimeType);
    if (langFromMime !== 'plaintext') {
      return langFromMime;
    }
    
    // 3. デフォルト
    return 'plaintext';
  };

  return (
    <div className="editor-tabs">
      <div className="tabs-header">
        <button
          className={`tab ${activeTab === 'file-editor' ? 'active' : ''}`}
          onClick={() => onTabChange('file-editor')}
        >
          📝 File Editor
        </button>
        <button
          className={`tab ${activeTab === 'repomix-xml' ? 'active' : ''}`}
          onClick={() => onTabChange('repomix-xml')}
        >
          📦 Repomix XML
        </button>
      </div>
      <div className="editor-content">
        {activeTab === 'file-editor' && (
          <div className="editor-panel">
            {file ? (
              <>
                <div className="editor-file-info">
                  <div className="editor-file-left">
                    <span className="editor-file-path">{file.path}</span>
                    <span className="editor-file-language">
                      {getLanguageForFile(file.path.split('/').pop() || '', file.mimeType)}
                    </span>
                  </div>
                  <span className="editor-file-size">
                    {file.metadata.size.toLocaleString()} bytes
                  </span>
                </div>
                <Editor
                  height="calc(100% - 40px)"
                  language={getLanguageForFile(file.path.split('/').pop() || '', file.mimeType)}
                  value={file.content}
                  onChange={(value) => {
                    if (value !== undefined) {
                      onFileChange(file.path, value);
                    }
                  }}
                  theme={editorTheme}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                  }}
                />
              </>
            ) : (
              <div className="editor-empty">
                <p>📄</p>
                <p>ファイルを選択してください</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'repomix-xml' && (
          <div className="editor-panel">
            <div className="editor-file-info">
              <div className="editor-file-left">
                <span className="editor-file-path">Repomix XML</span>
                <span className="editor-file-language">xml</span>
              </div>
              <span className="editor-file-size">
                {repomixXML.length.toLocaleString()} chars
              </span>
            </div>
            <Editor
              height="calc(100% - 40px)"
              language="xml"
              value={repomixXML || '<!-- Repomix XMLをここに貼り付けてください -->'}
              onChange={(value) => {
                if (value !== undefined) {
                  onRepomixXMLChange(value);
                }
              }}
              theme={editorTheme}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}