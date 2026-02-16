---
rule_category: "process-improvement/release-management"
priority: "high"
domain: "release-management"
source: "docs/reflectors/feature-order-2-reflection-2025-11-07.md"
last_updated: "2025-11-07"
helpful_count: 0
harmful_count: 0
---

# リリースフロー自動化: 安全機構の組み込み

**いつ読むべきか:** 手動リリース手順をスクリプト化する時、リリースミスを防ぎたい時

## 構造化データ
```yaml
lesson:
  context: "手動リリースでミスが発生しやすい（main で実行、タグ忘れ、ビルド忘れなど）"
  problem: "手順が複雑で、ミスが起きやすく、後戻りが困難"
  root_cause: "自動化されておらず、チェック機構もない"
  solution: |
    リリーススクリプトに以下の安全機構を組み込む:
    - main/master ブランチでの実行を禁止
    - 作業ツリーのクリーンチェック
    - テストの自動実行
    - 一連のフロー（version bump, tag, push, build, merge）を自動化
    - オプションで各ステップを抑止可能（--no-push, --no-merge）
  principle: "自動化スクリプトは「何をしてはいけないか」を明示的にチェックすることで安全性が向上する"
  applicability: |
    - Git を使ったリリースフロー
    - npm, standard-version を使ったバージョン管理
    - 手動手順が複雑で、ミスが発生しやすいプロジェクト
  
  metadata:
    source: "docs/reflectors/feature-order-2-reflection-2025-11-07.md"
    extracted_date: "2025-11-07"
    keywords: [release-automation, git, standard-version, safety-checks, shell-script]
    feedback_signal: "execution_success"
```

## 要点
- **安全機構を組み込む:** main での実行禁止、作業ツリーチェック、テスト実行を必須化
- **柔軟性を確保:** --no-push, --no-merge オプションでドライラン可能

## 詳細

### 背景
手動リリースは手順が多く、ミスが発生しやすい。特に main ブランチでの誤操作や、タグ・ビルドの忘れは後戻りが困難。

### 問題の症状
- main ブランチで誤って release を実行してしまう
- 作業ツリーに未コミットの変更があるまま release を実行
- テストを実行せずに release してしまう
- タグを push し忘れる、ビルドを忘れる

### 根本原因
- 自動化されていない
- チェック機構がない
- 手順が複雑で、人間の記憶に依存している

### 解決策（具体的手順）

#### 1. リリーススクリプトの作成

**release.sh の例:**
```bash
#!/usr/bin/env bash
set -euo pipefail

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 安全機構1: main での実行を禁止
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
  echo "Error: Cannot run release on '$CURRENT_BRANCH' branch" >&2
  exit 1
fi

# 安全機構2: 作業ツリーのクリーンチェック
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: Working tree is not clean" >&2
  exit 1
fi

# 安全機構3: テスト実行
if npm run | grep -q " test"; then
  npm test || { echo "Tests failed"; exit 1; }
fi

# リリースフロー
npm run release  # standard-version でversion bump & tag

# オプション処理
if [[ $NO_PUSH -eq 0 ]]; then
  git push origin HEAD --follow-tags
fi

npm run build

if [[ $DO_MERGE -eq 1 ]]; then
  git checkout main
  git pull --ff-only origin main
  git merge --no-ff "$CURRENT_BRANCH"
  git push origin main
  git checkout "$CURRENT_BRANCH"
fi
```

#### 2. 実行方法
```zsh
# 通常実行（push と main マージを含む）
./release.sh

# ドライラン（push と merge を行わない）
./release.sh --no-push --no-merge
```

### 教訓
リリースフローの自動化は、「何をしてはいけないか」を明示的にチェックすることで安全性が向上する。手順を自動化するだけでなく、ミスを防ぐ機構を組み込むことが重要。

### 適用場面
- Git を使ったリリースフロー
- npm, standard-version, semantic-release などを使ったバージョン管理
- 手動手順が複雑で、ミスが発生しやすいプロジェクト
- CI/CD パイプラインの前段階としてローカルで使用

### 応用
- CI で同様のチェックを実行（main への直接 push 禁止など）
- GitHub Actions でタグ push をトリガーに自動デプロイ
- pre-commit hook でテスト・lint を強制実行

---
> 📖 リリースフロー自動化の Wisdom が読み込まれました
