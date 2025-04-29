// ファイル保存ボタンのコンポーネント
// 翻訳元または翻訳対象のデータを保存するためのUIを提供
import React from "react";
import { translateData, saveAsJson, saveAsLang } from "./fileop";

interface FileSaveProps {
  isSource?: boolean; // 翻訳元データを保存するかどうか
  className?: string; // ボタンの追加クラス名
}

export function FileSaveButton({
  isSource = false,
  className = "",
}: FileSaveProps) {
  const [isOpen, setIsOpen] = React.useState(false); // モーダルの表示状態
  const [filename, setFilename] = React.useState(isSource ? "en_us" : "ja_jp"); // デフォルトのファイル名
  const [fileFormat, setFileFormat] = React.useState<"json" | "lang">("json"); // ファイル形式

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // 保存処理を実行
  const handleSave = () => {
    const store = translateData.getState(); // Zustandストアからデータを取得
    const data = isSource ? store.translateSource : store.translateTarget; // 翻訳元または翻訳対象データ
    const comments = isSource ? store.sourceComments : store.targetComments; // コメントデータ

    if (!data) {
      alert("保存するデータがありません");
      return;
    }

    const finalFilename = `${filename}.${fileFormat}`;

    if (fileFormat === "json") {
      saveAsJson(data, finalFilename); // JSON形式で保存
    } else {
      saveAsLang(data, comments, finalFilename); // Lang形式で保存
    }

    closeModal();
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`btn ${className}`}
        disabled={
          !translateData.getState()[
            isSource ? "translateSource" : "translateTarget"
          ]
        }
      >
        {isSource ? "ソース" : "ターゲット"}保存
      </button>

      {/* モーダルダイアログ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">ファイル保存</h3>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">ファイル名</span>
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="input input-bordered w-full"
                placeholder="例: ja_jp"
              />
            </div>

            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">ファイル形式</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={fileFormat}
                onChange={(e) =>
                  setFileFormat(e.target.value as "json" | "lang")
                }
              >
                <option value="json">JSON形式 (.json)</option>
                <option value="lang">Lang形式 (.lang)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={closeModal} className="btn">
                キャンセル
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 翻訳元と翻訳対象の保存ボタンをまとめたコンポーネント
export function FileSaveButtonGroup() {
  return (
    <div className="flex space-x-2">
      <FileSaveButton isSource={true} className="btn-sm" />
      <FileSaveButton isSource={false} className="btn-sm btn-primary" />
    </div>
  );
}
