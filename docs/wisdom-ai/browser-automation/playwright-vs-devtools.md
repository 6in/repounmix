---
rule_category: browser_automation
subcategory: tool_comparison
priority: medium
domain: testing
last_updated: 2025-11-06
---

# Playwright vs Chrome DevTools

**いつ読むべきか:** ツール選択で迷ったとき

## 構造化データ

```yaml
tool_comparison:
  playwright_mcp:
    purpose: automated_testing
    use_case: CI/CD, regression tests
    file_dialog: limited_support
    
  devtools_mcp:
    purpose: manual_debugging
    use_case: interactive_exploration
    file_dialog: full_support

selection_criteria:
  - if: need_automation
    then: prefer_playwright
  - if: need_file_dialogs
    then: use_devtools
  - if: debugging_ui
    then: use_devtools
```

## 要点
- Playwright MCP は自動化テスト向け
- Chrome DevTools MCP は手動デバッグ向け
- ツールの目的に合わせて選択する

---

> **🔔 検証マーカー**
> 
> ```
> 📖 playwright-vs-devtools.md が読み込まれました
> ```
