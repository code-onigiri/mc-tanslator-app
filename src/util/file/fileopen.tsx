import { translateData } from "./fileop";
import type { JsonData } from "./fileop";

export function TargetFileOpen() {
  return (
    <input
      type="file"
      onChange={handleTargetFileChange}
      accept=".json,.lang"
      className="file-input"
      placeholder="en_us.jsonなどを開く"
    ></input>
  );
}

function handleTargetFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (file?.type === "application/json") {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // JSONファイルの内容をパース
        const jsonData = JSON.parse(e.target?.result as string) as JsonData;

        // Zustandストアのアクションを呼び出す
        const { settranslateTarget } = translateData.getState();
        settranslateTarget(jsonData);

        console.log("JSONファイルが正常に読み込まれました");
      } catch (error) {
        console.error("JSONファイルの読み込み中にエラーが発生しました:", error);
      }
    };

    reader.onerror = (error) => {
      console.error("JSONファイルの読み込み中にエラーが発生しました:", error);
    };

    reader.readAsText(file);
  }
}

export function SourceFileOpen() {
  return (
    <input
      type="file"
      onChange={handleSourceFileChange}
      accept=".json,.lang"
      className="file-input"
      placeholder="ja_jp.jsonなどを開く"
    ></input>
  );
}

function handleSourceFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (file?.type === "application/json") {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // JSONファイルの内容をパース
        const jsonData = JSON.parse(e.target?.result as string) as JsonData;

        // Zustandストアのアクションを呼び出す
        const { settranslateSource } = translateData.getState();
        settranslateSource(jsonData);

        console.log("JSONファイルが正常に読み込まれました");
      } catch (error) {
        console.error("JSONファイルの読み込み中にエラーが発生しました:", error);
      }
    };

    reader.onerror = (error) => {
      console.error("JSONファイルの読み込み中にエラーが発生しました:", error);
    };

    reader.readAsText(file);
  }
}
