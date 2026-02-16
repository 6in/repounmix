---
rule_category: browser_automation
subcategory: test_strategy
priority: medium
domain: testing
last_updated: 2025-11-06
---

# 自動化 vs 手動テスト

**いつ読むべきか:** テスト設計時に自動化の範囲を決めるとき

## 構造化データ

```yaml
test_strategy:
  manual_appropriate:
    - file_dialog_operations
    - visual_design_review
    - exploratory_testing
    - one_time_verification
    
  automation_appropriate:
    - regression_tests
    - api_integration
    - form_validation
    - repeated_workflows
    
decision_based_on_risk:
  high_risk_feature:
    manual_test: required
    automation_test: optional_supplement
  low_risk_feature:
    manual_test: optional
    automation_test: preferred
    
tool_recommendation:
  if_manual_needed: use_devtools_mcp
  if_automation_needed: use_playwright
```

## 要点
- 手動で検証すべきものは手動で行い、自動化でカバーする範囲を限定する
- ファイルダイアログ等の手動操作が必要なケースは DevTools を検討

---

> **🔔 検証マーカー**
> 
> ```
> 📖 automation-vs-manual.md が読み込まれました
> ```
