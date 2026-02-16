import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});

// カスタムマッチャーの追加（必要に応じて）
expect.extend({
  // 将来的なカスタムマッチャーをここに追加
});