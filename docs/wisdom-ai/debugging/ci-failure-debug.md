---
rule_category: debugging
subcategory: ci_debugging
priority: high
domain: web_development
last_updated: 2025-11-06
---

# CI固有の失敗のデバッグ

**いつ読むべきか:** CIでのみテストが失敗する場合

## 構造化データ

```yaml
ci_debug_checklist:
  environment_diff:
    - check: environment_variables
      common_issues: [missing_keys, wrong_values]
    - check: dependency_versions
      common_issues: [lockfile_mismatch, cache_stale]
    - check: file_paths
      common_issues: [absolute_vs_relative, case_sensitivity]
    - check: permissions
      common_issues: [file_permissions, network_access]
      
  test_execution:
    - check: parallelization
      note: "tests may interfere with each other"
    - check: timeouts
      note: "CI may be slower than local"
    - check: headless_mode
      note: "rendering differences in headless"
      
reproduction_strategy:
  step_1: replicate_ci_environment_locally
  step_2: run_in_docker_if_needed
  step_3: add_debug_logging
  step_4: check_ci_logs_carefully
```

## 要点
- ローカルとCIの環境差分を比較する
- 環境変数、依存バージョン、ファイルパス、権限を確認
- テスト並列性やタイムアウトを確認

---

> **🔔 検証マーカー**
> 
> ```
> 📖 ci-failure-debug.md が読み込まれました
> ```
