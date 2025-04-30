// ファイルを開くためのコンポーネント
// 翻訳元または翻訳対象のデータを読み込むUIを提供
import { translateData } from "./fileop";
import type { JsonData, FileComments } from "./fileop";

// 翻訳対象ファイルを開くコンポーネント
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

// 翻訳対象ファイルの変更イベントを処理
function handleTargetFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase(); // ファイル拡張子を取得

      if (extension === "json") {
        const jsonData = JSON.parse(e.target?.result as string) as JsonData; // JSONをパース
        const { settranslateTarget } = translateData.getState();
        settranslateTarget(jsonData); // Zustandストアを更新
        console.log("JSONファイルが正常に読み込まれました");
      } else if (extension === "lang") {
        const { data, comments } = parseLangFile(e.target?.result as string); // .langファイルをパース
        const { settranslateTarget, setTargetComments } = translateData.getState();
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

// 翻訳元ファイルを開くコンポーネント
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

// 翻訳元ファイルの変更イベントを処理
function handleSourceFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase(); // ファイル拡張子を取得

      if (extension === "json") {
        const jsonData = JSON.parse(e.target?.result as string) as JsonData; // JSONをパース
        const { settranslateSource } = translateData.getState();
        settranslateSource(jsonData); // Zustandストアを更新
        console.log("JSONファイルが正常に読み込まれました");
      } else if (extension === "lang") {
        const { data, comments } = parseLangFile(e.target?.result as string); // .langファイルをパース
        const { settranslateSource, setSourceComments } = translateData.getState();
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

  const lines = content.split("\n"); // 行ごとに分割

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "") continue; // 空行はスキップ

    if (line.startsWith("#")) {
      const commentContent = line.substring(1).trim(); // コメント内容を取得
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      const isNextLineKeyValue =
        nextLine && nextLine.includes("=") && !nextLine.startsWith("#");

      if (isNextLineKeyValue) {
        const nextKey = nextLine.substring(0, nextLine.indexOf("=")).trim();
        comments[`key:${nextKey}`] = commentContent; // 次のキーに関連付け
      } else {
        comments[`line:${i}`] = commentContent; // 通し番号で保存
      }

      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      data[key] = value; // key=value形式をパース
    }
  }

  return { data, comments };
}
