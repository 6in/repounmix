import { useEffect, useState } from 'react';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // ローカルストレージから取得、なければライトテーマ
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  });

  useEffect(() => {
    // テーマを適用
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-toggle-container">
      <button
        className={`theme-toggle ${theme}`}
        onClick={toggleTheme}
        aria-label="テーマ切替"
        title={theme === 'light' ? 'ダークモードに切替' : 'ライトモードに切替'}
      >
        <span className="toggle-track">
          <span className="toggle-thumb">
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </span>
      </button>
    </div>
  );
}
