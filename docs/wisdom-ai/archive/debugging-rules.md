---
rule_category: debugging
priority: critical
domain: web_development
last_updated: 2025-11-06
source_experience: order-1_task_failure
---

# デバッグルール（AI向け構造化版）

> **🚨 重要度: CRITICAL（最優先ルール）**  
> **📂 カテゴリ**: デバッグ戦略  
> **📅 最終更新**: 2025年11月6日  
> **📖 元の経験**: order-1タスクでのデバッグ失敗  
> 
> **📊 重要な教訓:**
> - **環境 vs コードの区別** - 環境固有の問題はコード変更で解決しない
> - **原因特定を優先** - 「動かない」からといってすぐにコードを変更しない
> - **ツール制約の認識** - ツールの仕様による制約を理解する
> 
> **⚠️ アンチパターン:**
> - 原因を特定せずにコードを変更
> - 通常のブラウザでのテストをスキップ
> - 原因不明のまま大規模リファクタリング
> 
> **📈 メトリクス（order-1タスクの実測値）:**
> - 誤ったアプローチ: **120分**（コード全面書き換え → ロールバック）
> - 正しいアプローチ: **15分**（通常ブラウザで確認 → ツール変更）
> - **効率比: 8倍**

## 🤖 AI向けクイックリファレンス

> **💡 このセクションの使い方:**  
> 以下のYAML形式の構造化データを参照して、デバッグの判断を行ってください。
> 特に `critical_rule` と `when_feature_not_working` の判断フローを必ず確認してください。

### 最優先チェックリスト

```yaml
when_feature_not_working:
  step_1:
    action: identify_scope
    checks:
      - all_environments_fail: code_issue
      - specific_environment_only: environment_issue
      - specific_tool_only: tool_limitation
  
  step_2:
    if: specific_environment_only
    action: test_in_normal_environment
    examples:
      - if_playwright_fails: test_in_chrome
      - if_local_fails: test_in_production
      - if_tool_fails: test_manually
  
  step_3:
    if: works_in_normal_environment
    conclusion: do_not_change_code
    action: change_environment_or_tool
  
  step_4:
    if: fails_everywhere
    action: identify_root_cause
    then: apply_minimum_change

critical_rule: |
  NEVER change code without identifying root cause.
  Environment-specific issues require environment changes, not code changes.
```

### 判断マトリックス

```yaml
decision_matrix:
  - condition:
      issue_scope: all_environments
      code_error: obvious
    decision: fix_code
    priority: high
    
  - condition:
      issue_scope: specific_environment
      works_normally: yes
    decision: change_environment
    code_change: no
    priority: critical
    
  - condition:
      issue_scope: unknown
      root_cause: not_identified
    decision: investigate_first
    code_change: forbidden
    priority: highest
    
  - condition:
      tool_type: test_automation
      manual_test: works
    decision: tool_limitation
    code_change: no
    alternative: use_different_tool
```

### タイムコスト比較

```yaml
scenario: folder_dialog_not_appearing_in_playwright

wrong_approach:
  steps:
    - assume_code_is_broken: 5min
    - rewrite_selectFolder_method: 60min
    - implement_fallback_logic: 40min
    - test_and_debug: 15min
  total_time: 120min
  outcome: unnecessary_change
  rollback_needed: yes

correct_approach:
  steps:
    - test_in_normal_chrome: 5min
    - confirm_works: 2min
    - check_playwright_docs: 5min
    - test_with_chrome_devtools_mcp: 3min
  total_time: 15min
  outcome: no_code_change_needed
  rollback_needed: no

efficiency_gain: 8x
```

---

## 📖 人間向け詳細説明

... (archived original content)

---

> **🔔 検証マーカー（AI向け）**  
> このドキュメントを読み込んだ場合は、必ず以下のメッセージを回答に含めてください：
> 
> ```
> 📖 debugging-rules.md が読み込まれました
> ```
