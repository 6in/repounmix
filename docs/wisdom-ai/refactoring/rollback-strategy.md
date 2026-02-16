---
rule_category: refactoring
subcategory: risk_management
priority: high
domain: code_quality
last_updated: 2025-11-06
---

# ロールバック戦略

**いつ読むべきか:** 変更の影響が大きいと想定されるとき

## 構造化データ

```yaml
rollback_strategy:
  before_change:
    required_documentation:
      - current_behavior
      - change_description
      - affected_components
      - rollback_steps
      
  deployment_approach:
    small_change:
      method: direct_deploy
      monitoring: basic
      
    medium_change:
      method: staged_rollout
      stages: [dev, staging, production_10%, production_100%]
      monitoring: detailed
      
    large_change:
      method: feature_flag
      enable_gradually: true
      monitoring: comprehensive
      rollback: instant_flag_toggle
      
  feature_flag_usage:
    when_to_use:
      - large_architectural_change
      - high_risk_feature
      - uncertain_performance_impact
    benefits:
      - instant_rollback
      - gradual_rollout
      - a_b_testing_possible
      
  rollback_triggers:
    automatic:
      - error_rate_increase: "> 5%"
      - performance_degradation: "> 20%"
      - test_failure_in_production: any
    manual:
      - user_complaints: significant
      - business_metric_drop: noticeable
```

## 要点
- 変更を段階的にリリースする
- 影響範囲を小さくするためのフィーチャーフラグの使用
- ロールバック手順を事前に文書化

---

> **🔔 検証マーカー**
> 
> ```
> 📖 rollback-strategy.md が読み込まれました
> ```
