# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.0.1 (2025-11-07)


### Features

* Add RepomixAdapter for XML conversion and implement FileManager for file management ([4066731](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/4066731730c87991a90762beb7da5e702fb8ca51))
* **chat:** add default chat provider URLs and open provider pages on chat button click ([30e94d6](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/30e94d6ed67b8d9f958d7e19dc9c50f34d380490))
* Enhance file tree management and sorting ([7ada7f6](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/7ada7f6450cc628e88aab49ff832c51582c6423a))
* FileSystemAdapterのディレクトリ選択機能を改善し、型定義を整理 ([00915d7](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/00915d7bde4ffa8c4a67550fa1335d4f52b5671e))
* **fs:** create placeholder file for empty directories and add to manager ([be666c8](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/be666c8bcef3b4ab547267142130b0e0baeac536))
* **mix:** copy generated Repomix XML to clipboard and show toast ([5b24fa7](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/5b24fa7d07ecc37396ad24470b4d9e467ee465ea))
* Monaco Editorのミニマップ表示を有効化 ([d473020](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/d473020a114d40216f72493f2b4f92644a3b6fee))
* **order-2:** add debug logs to FileSystemAdapter and RepomixCore to trace permissions and UNMIX save flow ([8d9d267](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/8d9d267af65771044ed1f07d4de249857c088928))
* Repomix Web Toolのドキュメントを追加し、FileSystemAdapterとRepomixCoreの機能を強化 ([93f6a8e](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/93f6a8e9d1c2c4dd86b36f222046090e4eda01aa))
* RepomixCoreのラウンドトリップテストを追加 ([0a8df4c](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/0a8df4c5e1bd52ecca3106bf1a478ab76af9a31a))
* RepomixCoreの統合テストを追加 ([1696044](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/16960441941e551361c43b72b75d99361a8198ab))
* RepomixWebToolのファイル管理機能を追加し、UIを改善 ([62ee8d7](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/62ee8d70d66c5a7998bc56c7b06db798f03a3447))
* **toolbar:** add chat provider toggle group and focusable browser tabs (feature/focus-chat-tab) ([80f56f8](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/80f56f83dbab53c9ee7e5642f4585c87f4799532))
* **ui:** add 'copy Repomix prompt' button to toolbar and clipboard handler in App ([6aec473](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/6aec473a52c818550b1c005235806e2982ac52c0))
* **unmix:** add diff-based refreshFromDisk and Refresh toolbar button ([9410579](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/9410579ff0e3826718cea9b493c6107db488d06d))
* Unmix実行前に確認ダイアログを追加 ([5ee14f5](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/5ee14f597f7c87b203a5501517035afadbd306d9))
* Unmix処理にXMLパース検証機能を追加 ([49a371c](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/49a371c530367cc9a29c481f23e3056587420107))
* Viteの設定でbaseパスを'/repounmix/'に設定 ([772b91e](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/772b91ef3645977ebe9eb7d33b66905706d29ce8))
* ドラッグ可能なスプリッタでファイルツリーとエディタの幅を調整可能に ([227a98f](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/227a98f9a1f3826254049a74123a5c9ea9a27d54))
* ファイルフィルタ機能を追加 ([e03d7f2](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/e03d7f2b80a5f9c132a774e66c0d6507f96a4b0e))
* フォルダ選択ダイアログのデバッグログを追加し、エラーメッセージを改善 ([25813c2](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/25813c2c2bb924081f65c1debdace712d2774e38))
* ライト・ダークモード切替機能を追加 ([a70318f](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/a70318f3838ae18b8988a326c3b8c01075197e75))
* リリース用のシンプルなローカルヘルパースクリプトを追加 ([cc5019d](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/cc5019df2a69965bd1f96d8ca9190c104c28f1bd))
* 空のフォルダにプレースホルダーファイルを作成する機能を追加 ([ada383a](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/ada383adf8beac9eabf4f77bcd513c7eb2c2fbf3))


### Bug Fixes

* **core:** refreshFromDisk after unmix to reconcile disk files into FileManager ([84d6a23](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/84d6a23f373663d4451d02d4fdc1f28e167144da))
* **repomix:** unescape backslash-escaped tags before parsing (handle AI-escaped output) ([2866531](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/2866531a26c16050d534d6bb1fa1222bbe2ba3a9))
* Repomixプロンプトの説明文を明確化 ([2e4d58b](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/2e4d58b1846deac76543ddaf8901cd4115bd7f13))
* **unmix:** write parsed files to disk before clearing manager to avoid deleted-state UI ([0b6913a](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/0b6913ab10d1a9f1fd4c239192b821c007056317))
* ファイルツリーのソート機能を修正 ([4c35c04](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/4c35c044f294c4952a53ec29d96532db2b8a342a))
* フィルタ機能のパターンマッチングを修正 ([132eb81](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/132eb815e4b134aa6ec297fb310ba8e803240d91))
* フォルダ選択キャンセル時にツリーノードがクリアされる問題を修正 ([134169a](https://gitlab.nasa.future.co.jp/ohya/repomix-web-tool/commit/134169a28448aa3110a88806b6b6e37509270001))
