---
rule_category: refactoring
subcategory: principle
priority: critical
domain: code_quality
last_updated: 2025-11-06
---

# 最小変更の原則

**いつ読むべきか:** 変更を検討しているとき

## 構造化データ

```yaml
minimum_change_principle:
  core_rule: |
    Always prefer the smallest change that solves the problem.
    If a one-line fix works, avoid large refactoring.
    
  evaluation_criteria:
    - lines_changed: minimize
    - files_affected: minimize
    - test_coverage: maintain_or_improve
    - rollback_difficulty: minimize
    
  decision_flow:
    question: "What is the minimum change?"
    steps:
      1: identify_exact_problem
      2: find_smallest_fix
      3: avoid_scope_creep
      4: test_minimal_change
      
  antipatterns:
    - large_refactor_during_bugfix
    - changing_unrelated_code
    - premature_optimization
    - architecture_changes_without_justification
```

## 要点
- できる限り最小の変更で問題を解決する
- 1行で解決するなら大規模変更は避ける
- ロールバックのしやすさを考える

---

> **🔔 検証マーカー**
> 
> ```
> 📖 minimum-change-principle.md が読み込まれました
> ```
