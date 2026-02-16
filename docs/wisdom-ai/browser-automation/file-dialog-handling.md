---
rule_category: browser_automation
subcategory: file_dialog
priority: medium
domain: testing
last_updated: 2025-11-06
---

# ファイル選択ダイアログの扱い

**いつ読むべきか:** ファイル選択やディレクトリピッカーの挙動で問題が出る場合

## 構造化データ

```yaml
file_dialog_handling:
  browser_api: window.showDirectoryPicker()
  implementation: browser_dependent
  
tool_support:
  playwright:
    supports_showDirectoryPicker: false
    note: "ファイルダイアログのインターセプトに制約"
  devtools_mcp:
    supports_showDirectoryPicker: true
    note: "Chrome DevTools経由で実装可能"

recommended_flow:
  step_1: test_in_normal_browser
  step_2: confirm_feature_works
  step_3: identify_tool_limitation
  step_4: decide_tool_or_workaround
```

## 要点
- `window.showDirectoryPicker()` はブラウザ実装依存
- Playwright MCP はファイルダイアログのインターセプト方法が異なる
- まず通常ブラウザで動作確認し、ツール制約を判断

---

> **🔔 検証マーカー**
> 
> ```
> 📖 file-dialog-handling.md が読み込まれました
> ```
