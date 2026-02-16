---
rule_category: refactoring
subcategory: classification
priority: high
domain: code_quality
last_updated: 2025-11-06
---

# 変更タイプの分類

**いつ読むべきか:** 変更の種類を判断したいとき

## 構造化データ

```yaml
change_types:
  bug_fix:
    definition: "Corrects incorrect behavior"
    test_requirement: must_add_regression_test
    risk_level: medium
    rollback_priority: high
    
  refactoring:
    definition: "Improves code structure without changing behavior"
    test_requirement: existing_tests_must_pass
    risk_level: low_to_medium
    rollback_priority: low
    
  feature_change:
    definition: "Adds or modifies functionality"
    test_requirement: new_tests_required
    risk_level: high
    rollback_priority: critical
    
  environment_adaptation:
    definition: "Adapts to environment/tool constraints"
    test_requirement: environment_specific_tests
    risk_level: medium
    rollback_priority: medium
    note: "Often should not change core code"
    
classification_flow:
  question: "What type of change is this?"
  decision_tree:
    - if: fixes_incorrect_behavior
      then: bug_fix
    - if: same_behavior_better_code
      then: refactoring
    - if: new_or_changed_functionality
      then: feature_change
    - if: only_fails_in_specific_environment
      then: environment_adaptation
```

## 要点
- バグ修正 / リファクタリング / 機能変更 / 環境対応 に分類
- 各タイプに対するテスト要件とリスク評価を明示

---

> **🔔 検証マーカー**
> 
> ```
> 📖 change-type-classification.md が読み込まれました
> ```
