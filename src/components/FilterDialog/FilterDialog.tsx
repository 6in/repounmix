import { useState } from 'react';
import type { FileFilter } from '../../types';
import './FilterDialog.css';

interface FilterDialogProps {
  filter: FileFilter;
  onApply: (filter: FileFilter) => void;
  onClose: () => void;
}

export function FilterDialog({ filter, onApply, onClose }: FilterDialogProps) {
  const [includePatterns, setIncludePatterns] = useState(filter.includePatterns.join('\n'));
  const [ignorePatterns, setIgnorePatterns] = useState(filter.ignorePatterns.join('\n'));
  const [useDefaultExcludes, setUseDefaultExcludes] = useState(filter.useDefaultExcludes);

  const handleApply = () => {
    const newFilter: FileFilter = {
      includePatterns: includePatterns
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0),
      ignorePatterns: ignorePatterns
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0),
      useDefaultExcludes
    };
    onApply(newFilter);
    onClose();
  };

  const handlePreset = (preset: 'typescript' | 'javascript' | 'python' | 'all') => {
    switch (preset) {
      case 'typescript':
        setIncludePatterns('**/*.ts\n**/*.tsx\n**/*.json');
        setIgnorePatterns('**/*.test.ts\n**/*.spec.ts\n**/*.test.tsx');
        break;
      case 'javascript':
        setIncludePatterns('**/*.js\n**/*.jsx\n**/*.json');
        setIgnorePatterns('**/*.test.js\n**/*.spec.js');
        break;
      case 'python':
        setIncludePatterns('**/*.py\n**/*.yaml\n**/*.yml');
        setIgnorePatterns('**/*_test.py\ntest_*.py');
        break;
      case 'all':
        setIncludePatterns('');
        setIgnorePatterns('');
        break;
    }
  };

  const handleCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUseDefaultExcludes(e.currentTarget.checked);
  };

  const handleIncludeChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setIncludePatterns(e.currentTarget.value);
  };

  const handleIgnoreChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setIgnorePatterns(e.currentTarget.value);
  };

  return (
    <div className="filter-dialog-overlay" onClick={onClose}>
      <div className="filter-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="filter-dialog-header">
          <h2>ファイルフィルタ設定</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="filter-dialog-content">
          <div className="filter-section">
            <label>
              <input
                type="checkbox"
                checked={useDefaultExcludes}
                onChange={handleCheckboxChange}
              />
              デフォルトの除外パターンを使用 (node_modules, .git など)
            </label>
          </div>

          <div className="filter-section">
            <h3>プリセット</h3>
            <div className="preset-buttons">
              <button onClick={() => handlePreset('typescript')}>TypeScript</button>
              <button onClick={() => handlePreset('javascript')}>JavaScript</button>
              <button onClick={() => handlePreset('python')}>Python</button>
              <button onClick={() => handlePreset('all')}>すべて</button>
            </div>
          </div>

          <div className="filter-section">
            <h3>含めるパターン (Include)</h3>
            <p className="filter-help">
              1行に1パターン。空の場合はすべて含めます。<br/>
              例: <code>**/*.ts</code>, <code>src/**</code>
            </p>
            <textarea
              value={includePatterns}
              onChange={handleIncludeChange}
              placeholder="**/*.ts&#10;**/*.tsx"
              rows={5}
            />
          </div>

          <div className="filter-section">
            <h3>除外するパターン (Ignore)</h3>
            <p className="filter-help">
              1行に1パターン。<br/>
              例: <code>**/*.test.ts</code>, <code>docs/**</code>
            </p>
            <textarea
              value={ignorePatterns}
              onChange={handleIgnoreChange}
              placeholder="**/*.test.ts&#10;**/*.spec.ts"
              rows={5}
            />
          </div>

          <div className="filter-info">
            <h4>パターン記法</h4>
            <ul>
              <li><code>*</code> - 任意の文字列（/ を除く）</li>
              <li><code>**</code> - 任意のディレクトリ階層</li>
              <li><code>?</code> - 任意の1文字</li>
              <li><code>*.ts</code> - すべての .ts ファイル</li>
              <li><code>src/**/*.ts</code> - src 配下のすべての .ts ファイル</li>
            </ul>
          </div>
        </div>

        <div className="filter-dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            キャンセル
          </button>
          <button className="apply-button" onClick={handleApply}>
            適用
          </button>
        </div>
      </div>
    </div>
  );
}
