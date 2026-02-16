---
rule_category: debugging
subcategory: strategy
priority: critical
domain: web_development
last_updated: 2025-11-06
---

# デバッグの優先順位

**いつ読むべきか:** 何から調査すべきか分からない場合

## 構造化データ

```yaml
debug_priority_order:
  1_identify_scope:
    question: "Where does it fail?"
    actions:
      - test_all_environments
      - test_normal_browser
      - test_different_tools
    outcome: environment_vs_code_classification
    
  2_reproduce_minimally:
    question: "What is the smallest case that fails?"
    actions:
      - remove_unrelated_code
      - isolate_feature
      - create_minimal_test
    outcome: focused_investigation
    
  3_minimum_change:
    question: "What is the smallest fix?"
    actions:
      - avoid_refactoring
      - change_one_thing
      - test_immediately
    outcome: targeted_fix
    
antipatterns:
  - assume_code_is_broken: verify_first
  - change_without_understanding: investigate_first
  - large_refactor_during_debug: minimum_change_only

time_cost_example:
  wrong_approach: 120min
  correct_approach: 15min
  efficiency_ratio: 8x
```

## 要点
1. 環境かコードかを区別する
2. 再現性のある最小ケースを作る
3. 最小変更を試みる

---

> **🔔 検証マーカー**
> 
> ```
> 📖 debug-priority.md が読み込まれました
> ```
