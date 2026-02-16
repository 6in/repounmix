# ACE サブモジュール運用ポリシー

この文書は、`ace` サブモジュール（ACE Wisdom Framework）の取り扱いと運用ルールを明文化します。目的は、サブモジュール更新時の混乱を防ぎ、開発・リリース双方での再現性と効率を両立することです。

※ 注意: このファイルはドラフトです。コミットは行わず、内容をレビューした上で `feature/order-3` 上でコミットしてください。

---

## 1. 適用範囲
- 親リポジトリ: `repomix-web-tool`
- サブモジュール: `ace/`（ACE Wisdom Framework）
- 対象読者: 開発者、リリースエンジニア、CI 管理者

## 2. 基本方針（サマリ）
- ACE は **開発用ツール/ドキュメント群** であり、親プロジェクトの本番バイナリではない。したがって通常は **development（ブランチ追従）** 運用を採用する。
- ただし、本番・リリース時に「明示的に安定参照する必要がある場合」は、サブモジュールをタグでピン（明示的チェックアウト）する運用を行う。
- 親リポはサブモジュールの「特定コミットSHA」を参照するため、技術的再現性は常に確保される（タグは人間向けのラベルであり便宜的に使う）。

## 3. 用語定義
- ピン（pin）: サブモジュールを特定のタグ/コミットにチェックアウトして親コミットとして記録すること
- 追従（track）: サブモジュールの開発ブランチ（例: `main`）を定期的に取り込む運用

## 4. 運用ルール（詳細）

### 4.1 開発フェーズ（デフォルト）
- 開発中は `ace` を **追従** で運用する。
- 更新手順（手動）:
  1. `cd ace`
  2. `git fetch origin`
  3. `git checkout main` (または追跡したいブランチ)
  4. `git pull origin main`
  5. `cd ..`
  6. `git add ace` && `git commit -m "chore: update ace submodule to latest main"` (※あなたの判断でコミット)
- CIでは明示的にサブモジュールを初期化/更新する（例: `git submodule update --init --recursive --remote`）

### 4.2 リリース／安定参照フェーズ
- ACE 側でリリース準備が完了したら ACE リポジトリで注釈付きタグ（例: `v2.3`）を作成する。
- 親リポ側で安定参照したい場合は、該当のリリースブランチ（例: `release/*` または `feature/*`）でサブモジュールをそのタグにチェックアウトしてコミットする。

推奨コマンド:
```bash
cd ace
git fetch origin --tags
git checkout v2.3
cd ..
git add ace
# その後コミット・PRを作成
```

**重要:** タグ固定は運用上の便宜であり、技術的に必須ではありません（親コミットが参照するSHAで再現可能）。

### 4.3 緊急ロールバック
- v2.x に致命的問題があれば、親リポで以前の安定SHA（または以前のタグ）に戻してコミットし、PR→マージ手順でロールバックする。
- ロールバック手順は CHANGELOG と併せてチームに通知すること。

## 5. CI の取り扱い（推奨スニペット）
- GitLab CI のジョブでサブモジュールの最新を取得する例:
```yaml
before_script:
  - git submodule sync --recursive
  - git submodule update --init --recursive --remote
```
- 注意: `--remote` は .gitmodules に設定した branch を参照して最新を取りに行きます。運用上慎重に使用してください。

## 6. PR / MR テンプレ（サブモジュール更新時）
- タイトル例: `chore: update ace submodule to v2.3` もしくは `chore: pin ace submodule to v2.3`
- 本文に最低限含めるもの:
  - 変更理由（簡潔）
  - ACE CHANGELOG の要約（主要な変更点）
  - テスト手順（CI が通ること、ローカルでの簡易確認コマンド）
  - 影響範囲（親プロジェクトに与える影響）

## 7. 自動化案（任意）
- 将来: ACE 側でタグが作られたら自動で親側に MR を作る bot を用意すると人的ミスを減らせます。
- 実装ヒント: GitLab の API + GitHub/GitLab actions あるいはシンプルな CI job を用いる。

## 8. 付録: 参考コマンド
- サブモジュール初期化（ローカル）
```bash
git submodule sync --recursive
git submodule update --init --recursive
```
- サブモジュールを最新ブランチで更新
```bash
git submodule update --remote --merge
```

---

## 改定履歴
- 2025-11-07: ドラフト作成（内容: development をデフォルトにする運用、タグ固定は運用オプション）

---

*このファイルはドラフトです。内容確認後、`feature/order-3` でコミットしてください。*