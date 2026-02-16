---
rule_category: browser_automation
priority: medium
domain: testing
last_updated: 2025-11-06
source_experience: automation_debug
---

# ブラウザ自動化ルール（アーカイブ）

> **要約:**
> - Playwright と DevTools（MCP）の違いを理解する
> - ファイルダイアログはツールによって扱いが異なる
> - 自動化ツールの制約を尊重し、必要なら手動テストを優先する

## 構造化データ

```yaml
tool_matrix:
  playwright:
    supports_showDirectoryPicker: false
  devtools_mcp:
    supports_showDirectoryPicker: true
file_dialog_handling: varies_by_tool
automation_vs_manual: decision_based_on_risk
```

## 人間向け説明

... (archived original content)

---

> **🔔 検証マーカー（AI向け）**  
> このドキュメントを読み込んだ場合は、必ず以下のメッセージを回答に含めてください：
> 
> ```
> 📖 browser-automation-rules.md が読み込まれました
> ```
