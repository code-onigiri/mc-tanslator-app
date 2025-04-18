import { create } from "zustand";

export interface JsonData {
  [key: string]: string;
}

// ファイルのコメントを保存するための型
export interface FileComments {
  [key: string]: string; // キーはコメント番号や位置の識別子、値はコメント内容
}

interface translateDataType {
  translateSource: JsonData | null;
  translateTarget: JsonData | null;
  // コメントを保存するプロパティ
  sourceComments: FileComments | null;
  targetComments: FileComments | null;
  settranslateSource: (data: JsonData) => void;
  settranslateTarget: (data: JsonData) => void;
  setSourceComments: (comments: FileComments) => void;
  setTargetComments: (comments: FileComments) => void;
}

const translateData = create<translateDataType>()((set) => ({
  translateSource: null,
  translateTarget: null,
  sourceComments: null,
  targetComments: null,
  gettranslateSource: () =>
    translateData.getState().translateSource
      ? null
      : translateData.getState().translateSource,
  gettranslateTarget: () =>
    translateData.getState().translateTarget
      ? null
      : translateData.getState().translateTarget,
  settranslateSource: (data: JsonData) =>
    set(() => ({ translateSource: data })),
  settranslateTarget: (data: JsonData) =>
    set(() => ({ translateTarget: data })),
  setSourceComments: (comments: FileComments) =>
    set(() => ({ sourceComments: comments })),
  setTargetComments: (comments: FileComments) =>
    set(() => ({ targetComments: comments })),
}));

export { translateData };

/**
 * JSONデータをファイルとして保存する
 * @param data 保存するJSONデータ
 * @param filename ファイル名
 */
export function saveAsJson(data: JsonData, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  saveFile(blob, filename);
}

/**
 * データを.lang形式でファイルとして保存する
 * @param data 保存するデータ
 * @param comments コメントデータ（オプション）
 * @param filename ファイル名
 */
export function saveAsLang(
  data: JsonData,
  comments: FileComments | null,
  filename: string,
): void {
  // .langファイルの内容を構築
  let content = "";

  // データをキーでソート
  const sortedKeys = Object.keys(data).sort();

  for (const key of sortedKeys) {
    // キーに関連するコメントがあれば追加
    if (comments && comments[`key:${key}`]) {
      content += `# ${comments[`key:${key}`]}\n`;
    }

    // key=value形式で追加
    content += `${key}=${data[key]}\n`;
  }

  // 行番号に関連するコメントを追加（ファイルの最後に追加）
  if (comments) {
    const lineCommentKeys = Object.keys(comments)
      .filter((key) => key.startsWith("line:"))
      .sort();

    if (lineCommentKeys.length > 0) {
      content += "\n# その他のコメント\n";
      for (const commentKey of lineCommentKeys) {
        content += `# ${comments[commentKey]}\n`;
      }
    }
  }

  const blob = new Blob([content], { type: "text/plain" });
  saveFile(blob, filename);
}

/**
 * ブラウザでファイルを保存する
 * @param blob 保存するデータBLOB
 * @param filename ファイル名
 */
function saveFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  // リンクを非表示で追加してクリック
  document.body.appendChild(a);
  a.click();

  // クリーンアップ
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
