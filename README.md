# MC-Translator-App

[MC-Translator-App](https://mc-tanslator-app.vercel.app/)

MinecraftのリソースパックやMODの翻訳作業を効率化するためのデスクトップWebアプリです。直感的なUIで翻訳・置き換え・用語集管理・プロジェクト保存などが行えます。

---

## 主な機能

- **置き換え機能**: 原文・翻訳文の一括置換や、確認しながらの個別置換が可能
- **リスト表示**: 翻訳対象テキストをリストで管理し、検索・フィルタリングも対応
- **機械翻訳内蔵**: Google翻訳APIを利用した自動翻訳
- **プロジェクトファイル機能**: 作業状態や用語集を含めて保存・復元
- **用語集管理**: 独自の用語集を作成し、翻訳時に参照・自動置換
- **多様なファイル形式対応**: .json, .lang 形式の入出力
- **コメント保持**: .langファイルのコメントも保持・編集可能

---

## スクリーンショット

![画面1](image/image1)

![画面2](image/image2)

![画面3](image/image3)

![画面4](image/image4)
---

## インストール方法

1. このリポジトリをクローンします

```sh
git clone https://github.com/code-onigiri/mc-translator-app.git
cd mc-translator-app
```

2. 必要なパッケージをインストールします

```sh
bun install
```

3. アプリケーションを起動します

```sh
bun run dev
```

4. ブラウザで `http://localhost:5173` へアクセスします

---

## 使い方

1. **プロジェクトファイルを作成または開く**
   - プロジェクトファイルには翻訳データ・用語集・コメントなど全て保存されます。
2. **翻訳元/翻訳対象ファイルを選択**
   - Minecraftの`en_us.json`や`ja_jp.lang`などを読み込みます。
3. **翻訳・置き換え・用語集管理**
   - 検索や置換、機械翻訳、用語集の自動適用が可能です。
   - 置き換えは一括・個別確認モードを選べます。
4. **翻訳結果を保存**
   - .json/.lang形式でエクスポートできます。
   - プロジェクトファイルとしても保存可能です。

---

## ディレクトリ構成（抜粋）

```
src/
  component/    ... UIコンポーネント
  util/         ... ファイル操作・状態管理
  page/         ... 画面エントリ
api/            ... サーバーサイドAPI (翻訳用)
```

---

## コントリビュート

1. Issue・Pull Request歓迎です。
2. バグ報告・機能提案はGitHub Issueへお願いします。
3. コード修正時は`bun lint`でLintを通してください。

---

## ライセンス

MIT License

---

## 作者

[code-onigiri](https://github.com/code-onigiri)


