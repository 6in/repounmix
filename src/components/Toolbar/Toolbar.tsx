import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './Toolbar.css';

interface ToolbarProps {
  onOpenFolder: () => void;
  onMix: () => void;
  onUnmix: () => void;
  onOpenFilter: () => void;
  onRefresh?: () => void;
  hasFolder: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  chatProvider?: 'ChatGPT' | 'Claude' | 'Gemini' | 'Grok' | null;
  onChatClick?: (provider: 'ChatGPT' | 'Claude' | 'Gemini' | 'Grok') => void;
  onCopyPrompt?: () => void;
}

export function Toolbar({ onOpenFolder, onMix, onUnmix, onOpenFilter, onRefresh, hasFolder, saveStatus, chatProvider, onChatClick, onCopyPrompt }: ToolbarProps) {
  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return '💾 保存中...';
      case 'saved':
        return '✓ 保存済み';
      case 'error':
        return '❌ 保存失敗';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (saveStatus) {
      case 'saving':
        return 'status-saving';
      case 'saved':
        return 'status-saved';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        
        <button onClick={onOpenFolder} className="toolbar-button primary">
          📁 フォルダを開く
        </button>
        <button 
          onClick={onOpenFilter} 
          className="toolbar-button"
          title="ファイルフィルタ設定"
        >
          🔍 フィルタ
        </button>
        <button 
          onClick={onMix} 
          className="toolbar-button"
          disabled={!hasFolder}
          title={!hasFolder ? 'フォルダを開いてください' : 'Mix'}
        >
          🔄 Mix
        </button>
        <button 
          onClick={onUnmix} 
          className="toolbar-button"
          disabled={!hasFolder}
          title={!hasFolder ? 'フォルダを開いてください' : 'Unmix'}
        >
          📥 Unmix
        </button>
        <button
          onClick={onRefresh}
          className="toolbar-button"
          disabled={!hasFolder}
          title={!hasFolder ? 'フォルダを開いてください' : 'Refresh'}
        >
          🔁 Refresh
        </button>
      </div>
      <div className="toolbar-right">
        <div className="chat-group" role="tablist" aria-label="Chat providers">
          <button
            className={`toolbar-button chat-button ${chatProvider === 'ChatGPT' ? 'active' : ''}`}
            onClick={() => onChatClick && onChatClick('ChatGPT')}
            title="Open ChatGPT in a tab"
            type="button"
            aria-pressed={chatProvider === 'ChatGPT'}
          >
            ChatGPT
          </button>
          <button
            className={`toolbar-button chat-button ${chatProvider === 'Claude' ? 'active' : ''}`}
            onClick={() => onChatClick && onChatClick('Claude')}
            title="Open Claude in a tab"
            type="button"
            aria-pressed={chatProvider === 'Claude'}
          >
            Claude
          </button>
          <button
            className={`toolbar-button chat-button ${chatProvider === 'Gemini' ? 'active' : ''}`}
            onClick={() => onChatClick && onChatClick('Gemini')}
            title="Open Gemini in a tab"
            type="button"
            aria-pressed={chatProvider === 'Gemini'}
          >
            Gemini
          </button>
          <button
            className={`toolbar-button chat-button ${chatProvider === 'Grok' ? 'active' : ''}`}
            onClick={() => onChatClick && onChatClick('Grok')}
            title="Open Grok in a tab"
            type="button"
            aria-pressed={chatProvider === 'Grok'}
          >
            Grok
          </button>
          <button
            className={`toolbar-button chat-button prompt-button`}
            onClick={() => onCopyPrompt && onCopyPrompt()}
            title="Repomix仕様プロンプトをクリップボードにコピー"
            type="button"
          >
            プロンプトをコピー
          </button>
        </div>
        <ThemeToggle />
        {saveStatus !== 'idle' && (
          <span className={`save-status ${getStatusClass()}`}>
            {getStatusText()}
          </span>
        )}
        <span className="app-title">RepomixWebTool</span>
      </div>
    </div>
  );
}