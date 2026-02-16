# RepomixWebTool

**Web上でRepomixを実行し、AIが生成したコードを瞬時にローカルに展開するツール**

## 概要

RepomixWebToolは、Web上のAIチャット（ChatGPT、Claude等）とローカルファイルシステムを、Repomix形式で完全に連携させるブラウザアプリケーションです。

### 主な機能

- **Mix**: ローカルフォルダ → Repomix XML形式に変換
- **Unmix**: Repomix XML → ローカルフォルダに自動展開
- **ブラウザ完結**: サーバー不要、完全クライアントサイド動作
- **Monaco Editor統合**: VS Codeと同じエディタエンジン

## クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# カバレッジ確認
npm run test:coverage
```

## プロジェクト状況

### ✅ Phase 1: コア機能（完了）
- FileManager
- RepomixAdapter
- FileSystemAdapter
- RepomixCore
- 単体テスト（カバレッジ85%以上）
- 統合テスト
- ラウンドトリップテスト

### 🚧 Phase 2: UI実装（次のフェーズ）
- 基本レイアウト
- Toolbarコンポーネント
- FileTreeコンポーネント
- EditorTabsコンポーネント
- Monaco Editor統合

## ドキュメント

完全な引き継ぎドキュメントは`specs/`ディレクトリにあります：

- `specs/1.concept.md` - プロジェクトのコンセプト
- `specs/2.requirements.md` - 要件定義
- `specs/3.architecture.md` - アーキテクチャ設計
- `specs/4.goal.md` - 最終目標
- `specs/5.implementation-status.md` - 実装状況
- `specs/6.next-steps.md` - 次のステップ
- `specs/7.technical-decisions.md` - 技術的決定事項
- `specs/8.testing-strategy.md` - テスト戦略

## 技術スタック

- **フロントエンド**: React.js 19 + TypeScript 5
- **エディタ**: Monaco Editor
- **テスト**: Vitest + Testing Library
- **ファイルアクセス**: File System Access API
- **対象ブラウザ**: Chrome 86+, Edge 86+

## 次のステップ

Phase 2のUI実装を開始してください。詳細は`specs/6.next-steps.md`を参照してください。

## ライセンス

MIT

## 作者

Human + AI Collaboration