---
rule_category: debugging
subcategory: tool_limitation
priority: high
domain: testing
last_updated: 2025-11-06
---

# ツール制約の理解

**いつ読むべきか:** ツール（Playwright, Chrome DevTools）でのみ問題が発生する場合

## 構造化データ

```yaml
tool_limitations:
  playwright_mcp:
    purpose: automation_testing
    limitations:
      - showDirectoryPicker: not_supported
      - file_dialogs: requires_workarounds
      - interactive_ui: limited
    when_to_use: CI/CD_regression_tests
    
  chrome_devtools_mcp:
    purpose: manual_debugging
    limitations:
      - automation: not_primary_purpose
    when_to_use: interactive_exploration
    
decision_when_tool_fails:
  step_1: test_in_normal_browser
  step_2:
    if: works_in_normal_browser
    conclusion: tool_limitation_not_code_bug
  step_3:
    actions:
      - switch_to_different_tool
      - document_limitation
      - do_not_change_code
```

## 要点
- ツールの目的を確認（自動化 vs 手動デバッグ）
- Playwright MCP は自動化向けでファイルダイアログ等は挙動が異なる
- Chrome DevTools は手動検証・デバッグ向け

---

> **🔔 検証マーカー**
> 
> ```
> 📖 tool-limitation.md が読み込まれました
> ```
