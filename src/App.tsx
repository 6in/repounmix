import { useState, useRef, useEffect } from 'react';
import { chatProviderUrls } from './config/chatProviders';
import { RepomixCore } from './services/RepomixCore';
import { Toolbar } from './components/Toolbar/Toolbar';
import { FileTree } from './components/FileTree/FileTree';
import { EditorTabs } from './components/Editor/EditorTabs';
import { FilterDialog } from './components/FilterDialog/FilterDialog';
import type { FileFilter } from './types';
import './App.css';

function App() {
  const [core] = useState(() => new RepomixCore());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'file-editor' | 'repomix-xml'>('file-editor');
  const [repomixXML, setRepomixXML] = useState<string>('');
  const [hasFolder, setHasFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [info, setInfo] = useState<string | null>(null);
  const [chatTab, setChatTab] = useState<'ChatGPT' | 'Claude' | 'Gemini' | 'Grok' | null>(null);
  const chatWindowRef = useRef<Record<string, Window | null>>({});
  // chatProviderUrls is statically imported from src/config/chatProviders
  const [refreshKey, setRefreshKey] = useState(0); // ファイルツリー再描画用
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const draggingRef = useRef(false);
  const startXRef = useRef<number | null>(null);
  const startWidthRef = useRef<number>(leftWidth);

  const handleOpenFolder = async () => {
    try {
      setError(null);
      await core.openFolder();
      
      // openFolderがキャンセルされた場合は何もしない（returnされる）
      // 成功した場合のみ以下を実行
      const files = core.getFileManager().getAllFiles();
      if (files.length > 0) {
        setHasFolder(true);
        setSelectedFile(null);
        setSaveStatus('idle');
        setRefreshKey(prev => prev + 1); // ファイルツリーを強制再描画
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
      setError('フォルダを開けませんでした: ' + (error as Error).message);
    }
  };

  const handleOpenFilter = () => {
    setShowFilterDialog(true);
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      setSaveStatus('saving');
      const result = await core.refreshFromDisk();
      // 簡易的なフィードバック
      setSaveStatus('saved');
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setSaveStatus('idle'), 2000);
      console.log('Refresh result', result);
    } catch (err) {
      console.error('Refresh failed', err);
      setError('リフレッシュに失敗しました: ' + (err as Error).message);
      setSaveStatus('error');
    }
  };

  const handleApplyFilter = (filter: FileFilter) => {
    core.setFilter(filter);
    setShowFilterDialog(false);
  };

  const handleMix = async () => {
    try {
      setError(null);
      const xml = core.mix();
      setRepomixXML(xml);
      setActiveTab('repomix-xml');

      // Try to copy to clipboard
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(xml);
          setInfo('Repomix XMLをクリップボードにコピーしました');
        } else {
          setInfo('クリップボードにコピーできませんでした: ブラウザが対応していません');
        }
      } catch (err) {
        console.warn('clipboard write failed', err);
        setInfo('クリップボードへのコピーに失敗しました');
      }

      // 自動的に情報表示を消す
      setTimeout(() => setInfo(null), 3000);

      // クリップボード完了後1秒で、選択されているチャットタブにフォーカス
      if (chatTab) {
        setTimeout(() => {
          const win = chatWindowRef.current[chatTab];
          try {
            if (win && !win.closed) {
              win.focus();
            } else {
              const url = chatProviderUrls?.[chatTab] || '';
              chatWindowRef.current[chatTab] = window.open(url, chatTab);
              chatWindowRef.current[chatTab]?.focus();
            }
          } catch (e) {
            console.warn('focus failed', e);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to mix:', error);
      setError('Mix処理に失敗しました: ' + (error as Error).message);
    }
  };

  // Repomix仕様を説明するプロンプト（クリップボードにコピーするため）
  const repomixPrompt = `# Repomix形式での出力指示

ファイルを生成する場合は、以下のようなフォーマット(Repomix形式)のXMLで出力してください。

## 出力形式の仕様

### 基本構造
<file_summary>
<purpose>
[このファイルセットの目的を簡潔に記述]
</purpose>
</file_summary>

<directory_structure>
src/
  components/
    Button.tsx
    Input.tsx
  utils/
    helpers.ts
README.md
</directory_structure>

<files>

<file path="src/components/Button.tsx">
[ファイルの完全な内容]
</file>

<file path="src/components/Input.tsx">
[ファイルの完全な内容]
</file>

<file path="src/utils/helpers.ts">
[ファイルの完全な内容]
</file>

<file path="README.md">
[ファイルの完全な内容]
</file>

</files>`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(repomixPrompt);
      setInfo('Repomixプロンプトをクリップボードにコピーしました');
      setTimeout(() => setInfo(null), 3000);
    } catch (e) {
      console.warn('clipboard write failed', e);
      setInfo('プロンプトのコピーに失敗しました');
      setTimeout(() => setInfo(null), 3000);
    }
  };

  const handleChatClick = (provider: 'ChatGPT' | 'Claude' | 'Gemini' | 'Grok') => {
    // Toggle selection: 同名が選ばれていれば解除
    const isSelected = chatTab === provider;
    const newVal = isSelected ? null : provider;
    setChatTab(newVal);

    if (newVal) {
      // すでにWindow参照があるか確認して焦点を当てる。なければ新しいタブを開く
      try {
        const existing = chatWindowRef.current[provider];
        if (existing && !existing.closed) {
          existing.focus();
        } else {
          const url = chatProviderUrls?.[provider] || '';
          chatWindowRef.current[provider] = window.open(url, provider);
          chatWindowRef.current[provider]?.focus();
        }
      } catch (e) {
        console.warn('Failed to open chat tab', e);
      }
    }
  };

  const handleUnmix = async () => {
    // 確認ダイアログを表示
    const confirmed = window.confirm(
      'Repomix XMLの内容でファイルを復元します。\n' +
      '既存のファイルは上書きされます。\n\n' +
      '実行してよろしいですか？'
    );
    
    if (!confirmed) {
      return; // キャンセルされた場合は何もしない
    }

    try {
      setError(null);
      setSaveStatus('saving');
      console.debug('[DEBUG] App.tsx: starting unmix process');
      const result = await core.unmix(repomixXML);
      console.debug('[DEBUG] App.tsx: unmix result ->', result);
      
      if (!result.success) {
        // パースエラーの場合
        const errorMessage = 'Unmix処理に失敗しました: ' + result.error;
        setError(errorMessage);
        setSaveStatus('error');
        console.error('[ERROR] Unmix parse error:', result.error);
        return;
      }
      
      setSaveStatus('saved');
      setSelectedFile(null);
      setActiveTab('file-editor');
      setRefreshKey(prev => prev + 1); // ファイルツリーを更新
      
      console.info('[INFO] Unmix completed successfully');
      // 3秒後にステータスをリセット
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('[ERROR] Failed to unmix:', error);
      console.error('[ERROR] Error stack:', errorStack);
      
      // ユーザーフレンドリーなエラーメッセージを構築
      let displayMessage = 'Unmix処理に失敗しました';
      if (errorMessage.includes('path') || errorMessage.includes('path separator')) {
        displayMessage += '\n\n【パス関連エラーの可能性】\n' +
          'ファイルパスに問題がある可能性があります。\n' +
          'XMLファイルが正しい形式であることを確認してください。';
      }
      displayMessage += '\n\n詳細: ' + errorMessage;
      
      setError(displayMessage);
      setSaveStatus('error');
    }
  };

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    setActiveTab('file-editor');
  };

  const handleFileChange = async (path: string, content: string) => {
    const file = core.getFileManager().getFile(path);
    if (file) {
      core.getFileManager().setFile({ ...file, content });
      
      // 自動保存（デバウンス付き）
      try {
        setSaveStatus('saving');
        await core.saveChanges();
        setSaveStatus('saved');
        
        // 2秒後にステータスをリセット
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save:', error);
        setSaveStatus('error');
        setError('ファイルの保存に失敗しました: ' + (error as Error).message);
      }
    }
  };

  const onSplitterMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
    document.body.style.userSelect = 'none';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current || startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    const newWidth = Math.max(200, Math.min(800, startWidthRef.current + dx));
    setLeftWidth(newWidth);
  };

  const onMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startXRef.current = null;
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [leftWidth]);

  return (
    <div className="app">
      <Toolbar
        onOpenFolder={handleOpenFolder}
        onMix={handleMix}
        onUnmix={handleUnmix}
        onOpenFilter={handleOpenFilter}
        onRefresh={handleRefresh}
        hasFolder={hasFolder}
        saveStatus={saveStatus}
        chatProvider={chatTab}
        onChatClick={handleChatClick}
        onCopyPrompt={handleCopyPrompt}
      />
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      {/* Toast container (Top-Right) */}
      <div className="toast-container" aria-live="polite">
        {info && (
          <div className="toast">
            {info}
          </div>
        )}
      </div>
      {showFilterDialog && (
        <FilterDialog
          filter={core.getFilter()}
          onApply={handleApplyFilter}
          onClose={() => setShowFilterDialog(false)}
        />
      )}
      <div className="main-content">
        <div className="left-pane" style={{ width: leftWidth }}>
          <FileTree
            key={refreshKey}
            fileManager={core.getFileManager()}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            hasFolder={hasFolder}
          />
        </div>

        <div 
          className="splitter" 
          onMouseDown={onSplitterMouseDown}
          role="separator" 
          aria-orientation="vertical"
        />

        <div className="right-pane">
          <EditorTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedFile={selectedFile}
            fileManager={core.getFileManager()}
            repomixXML={repomixXML}
            onRepomixXMLChange={setRepomixXML}
            onFileChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;