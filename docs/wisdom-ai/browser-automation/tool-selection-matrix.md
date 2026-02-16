---
rule_category: browser_automation
subcategory: tool_selection
priority: medium
domain: testing
last_updated: 2025-11-06
---

# ツール選択マトリックス

**いつ読むべきか:** テスト自動化ツールを選ぶ必要があるとき

## 構造化データ

```yaml
selection_matrix:
  purpose:
    automation:
      primary_tool: playwright
      backup: devtools_if_needed
    manual_debug:
      primary_tool: devtools
      
  operation_type:
    file_dialog:
      playwright: limited
      devtools: supported
    form_input:
      playwright: excellent
      devtools: excellent
    network_inspection:
      playwright: good
      devtools: excellent
      
decision_tree:
  - if: primary_purpose == automation
    then: start_with_playwright
  - if: file_dialogs_required
    then: consider_devtools
  - if: interactive_debugging_needed
    then: use_devtools
```

## 要点
- 目的(自動化/手動) × 操作の種類(ファイル選択/入力/ネットワーク) で選択
- 自動化が主目的なら Playwright
- 手動デバッグやインタラクティブ操作なら DevTools

---

> **🔔 検証マーカー**
> 
> ```
> 📖 tool-selection-matrix.md が読み込まれました
> ```
