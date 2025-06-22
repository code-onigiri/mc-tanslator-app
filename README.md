# MC-Translator-App

[MC-Translator-App](https://mc-tanslator-app.vercel.app/)

MinecraftリソースパックやMODの翻訳を効率化するWebアプリです。翻訳、置換、用語集管理、プロジェクト保存ができます。

---

## 主な機能

- 一括・個別置換
- リスト管理・検索・フィルタ
- 自動翻訳（Google翻訳API）
- プロジェクト保存・復元
- 用語集管理・自動適用
- .json/.lang形式対応
- コメント保持・編集

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

1. プロジェクトファイルを作成または開く
2. 翻訳元/対象ファイルを選択
3. 翻訳・置換・用語集管理を実行
4. 結果を保存・エクスポート

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


