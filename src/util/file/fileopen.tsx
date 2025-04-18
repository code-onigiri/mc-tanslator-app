import { translateData } from "./fileop";
import type { JsonData, FileComments } from "./fileop";

export function TargetFileOpen() {
  return (
    <input
      type="file"
      onChange={handleTargetFileChange}
      accept=".json,.lang"
      className="file-input"
      placeholder="ja_jp.jsonなどを開く"
    ></input>
  );
}

function handleTargetFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      // ファイルの拡張子を取得
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "json") {
        // JSONファイルの内容をパース
        const jsonData = JSON.parse(e.target?.result as string) as JsonData;

        // Zustandストアのアクションを呼び出す
        const { settranslateTarget } = translateData.getState();
        settranslateTarget(jsonData);

        console.log("JSONファイルが正常に読み込まれました");
      } else if (extension === "lang") {
        // .langファイルをパース
        const { data, comments } = parseLangFile(e.target?.result as string);

        // データとコメントを保存
        const { settranslateTarget, setTargetComments } =
          translateData.getState();
        settranslateTarget(data);
        setTargetComments(comments);

        console.log(".langファイルが正常に読み込まれました");
      } else {
        throw new Error("サポートされていないファイル形式です");
      }
    } catch (error) {
      console.error("ファイルの読み込み中にエラーが発生しました:", error);
    }
  };

  reader.onerror = (error) => {
    console.error("ファイルの読み込み中にエラーが発生しました:", error);
  };

  reader.readAsText(file);
}

export function SourceFileOpen() {
  return (
    <input
      type="file"
      onChange={handleSourceFileChange}
      accept=".json,.lang"
      className="file-input"
      placeholder="en_us.jsonなどを開く"
    ></input>
  );
}

function handleSourceFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      // ファイルの拡張子を取得
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "json") {
        // JSONファイルの内容をパース
        const jsonData = JSON.parse(e.target?.result as string) as JsonData;

        // Zustandストアのアクションを呼び出す
        const { settranslateSource } = translateData.getState();
        settranslateSource(jsonData);

        console.log("JSONファイルが正常に読み込まれました");
      } else if (extension === "lang") {
        // .langファイルをパース
        const { data, comments } = parseLangFile(e.target?.result as string);

        // データとコメントを保存
        const { settranslateSource, setSourceComments } =
          translateData.getState();
        settranslateSource(data);
        setSourceComments(comments);

        console.log(".langファイルが正常に読み込まれました");
      } else {
        throw new Error("サポートされていないファイル形式です");
      }
    } catch (error) {
      console.error("ファイルの読み込み中にエラーが発生しました:", error);
    }
  };

  reader.onerror = (error) => {
    console.error("ファイルの読み込み中にエラーが発生しました:", error);
  };

  reader.readAsText(file);
}

/**
 * .langファイルをパースしてデータとコメントを返す関数
 * @param content .langファイルの内容
 * @returns {data: JsonData, comments: FileComments} パースされたデータとコメント
 */
function parseLangFile(content: string): {
  data: JsonData;
  comments: FileComments;
} {
  const data: JsonData = {};
  const comments: FileComments = {};

  // 行ごとに分割
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 空行はスキップ
    if (line === "") continue;

    // コメント行の処理
    if (line.startsWith("#")) {
      // コメントを保存
      // コメントの関連付け方法:
      // 1. 直後にキーが続く場合はそのキーに関連付ける
      // 2. それ以外は通し番号で保存
      const commentContent = line.substring(1).trim();

      // 次の行がキー=値の形式かチェック
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      const isNextLineKeyValue =
        nextLine && nextLine.includes("=") && !nextLine.startsWith("#");

      if (isNextLineKeyValue) {
        // 次の行のキーを取得
        const nextKey = nextLine.substring(0, nextLine.indexOf("=")).trim();
        comments[`key:${nextKey}`] = commentContent;
      } else {
        // 通し番号でコメントを保存
        comments[`line:${i}`] = commentContent;
      }

      continue;
    }

    // key=valueの形式をパース
    const separatorIndex = line.indexOf("=");
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();

      data[key] = value;
    }
  }

  return { data, comments };
}
