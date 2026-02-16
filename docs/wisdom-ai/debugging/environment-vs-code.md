---
rule_category: debugging
subcategory: root_cause_identification
priority: critical
domain: web_development
last_updated: 2025-11-06
---

# 環境 vs コード

**いつ読むべきか:** 特定の環境でのみ問題が発生する場合

## 構造化データ

```yaml
critical_rule: |
  NEVER change code without identifying root cause.
  Environment-specific issues require environment changes, not code changes.

decision_flow:
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
```

## 要点
- まず通常のブラウザで再現するか確認する
- 全環境で再現するかでコード問題か環境問題か判定する
- 環境固有の問題は環境側で対処（設定/ツール）

---

> **🔔 検証マーカー**
> 
> ```
> 📖 environment-vs-code.md が読み込まれました
> ```
