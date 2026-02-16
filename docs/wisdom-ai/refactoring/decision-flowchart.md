---
rule_category: refactoring
subcategory: decision_process
priority: high
domain: code_quality
last_updated: 2025-11-06
---

# 変更判断フローチャート

**いつ読むべきか:** 大きな変更を検討しているとき

## 構造化データ

```yaml
decision_flowchart:
  step_1_classify_problem:
    question: "What is the problem?"
    outcomes:
      - feature_not_working
      - performance_issue
      - code_quality_issue
      - environment_specific
      
  step_2_identify_scope:
    question: "Where does it fail?"
    actions:
      - test_all_environments
      - test_normal_case
      - isolate_failure
    classification:
      - if: fails_everywhere
        then: code_issue
      - if: fails_in_specific_environment
        then: environment_issue
        
  step_3_evaluate_minimum_change:
    question: "What is the smallest fix?"
    considerations:
      - can_fix_with_config: prefer_config_change
      - can_fix_with_one_line: prefer_minimal_code_change
      - requires_refactor: evaluate_risk_vs_benefit
      
  step_4_rollback_plan:
    required_before_change: true
    elements:
      - document_current_state
      - identify_rollback_steps
      - prepare_feature_flag_if_needed
      - define_success_criteria
```

## 要点
1. 問題の分類
2. 環境問題かコードか確認
3. 最小変更で対応可能か評価
4. ロールバック計画を用意

---

> **🔔 検証マーカー**
> 
> ```
> 📖 decision-flowchart.md が読み込まれました
> ```
