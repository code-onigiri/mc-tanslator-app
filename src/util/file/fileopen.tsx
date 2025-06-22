// ファイルを開くためのコンポーネント
// 翻訳元または翻訳対象のデータを読み込むUIを提供
import React, { useState } from "react";
import { translateData } from "./fileop";
import type { JsonData, FileComments } from "./fileop";
import { previewUpdate, updateSourceData, UpdateOptions } from "./fileUpdate";
import { UpdateDiff, isEmptyDiff } from "./updateDiff";
import UpdateDialog from "../../component/UpdateDialog";
import toast from "react-hot-toast";

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
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateDiff, setUpdateDiff] = useState<UpdateDiff>({
    added: [],
    deleted: [],
    modified: [],
    unchanged: []
  });
  const [newSourceData, setNewSourceData] = useState<JsonData | null>(null);
  const [newSourceComments, setNewSourceComments] = useState<FileComments | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSourceFileChange(
      event,
      setShowUpdateDialog,
      setUpdateDiff,
      setNewSourceData,
      setNewSourceComments
    );
  };

  const handleUpdateConfirm = async (options: UpdateOptions) => {
    if (!newSourceData) return;

    setIsUpdating(true);
    try {
      const result = updateSourceData(newSourceData, newSourceComments, options);
      
      if (result.success) {
        toast.success(`翻訳元ファイルを更新しました: ${result.summary}`);
        setShowUpdateDialog(false);
        
        // フォームをリセット
        setNewSourceData(null);
        setNewSourceComments(null);
        setUpdateDiff({
          added: [],
          deleted: [],
          modified: [],
          unchanged: []
        });
      } else {
        toast.error(`更新に失敗しました: ${result.error || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("更新処理中にエラーが発生しました:", error);
      toast.error("更新処理中にエラーが発生しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdateDialog(false);
    setNewSourceData(null);
    setNewSourceComments(null);
    setUpdateDiff({
      added: [],
      deleted: [],
      modified: [],
      unchanged: []
    });
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileSelect}
        accept=".json,.lang"
        className="file-input"
        placeholder="en_us.jsonなどを開く"
      />
      
      <UpdateDialog
        isOpen={showUpdateDialog}
        onClose={handleUpdateCancel}
        onConfirm={handleUpdateConfirm}
        diff={updateDiff}
        isLoading={isUpdating}
      />
    </>
  );
}

// 翻訳元ファイルの変更イベントを処理
function handleSourceFileChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setShowUpdateDialog: (show: boolean) => void,
  setUpdateDiff: (diff: UpdateDiff) => void,
  setNewSourceData: (data: JsonData | null) => void,
  setNewSourceComments: (comments: FileComments | null) => void
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let jsonData: JsonData;
      let comments: FileComments | null = null;

      if (extension === "json") {
        jsonData = JSON.parse(e.target?.result as string) as JsonData;
      } else if (extension === "lang") {
        const parsed = parseLangFile(e.target?.result as string);
        jsonData = parsed.data;
        comments = parsed.comments;
      } else {
        throw new Error("サポートされていないファイル形式です");
      }

      // 既存データがあるかチェック
      const currentSourceData = translateData.getState().translateSource;
      
      if (currentSourceData) {
        // 既存データがある場合は差分チェック
        const diff = previewUpdate(jsonData);
        
        if (isEmptyDiff(diff)) {
          // 差分がない場合は直接更新
          const { settranslateSource, setSourceComments } = translateData.getState();
          settranslateSource(jsonData);
          if (comments) {
            setSourceComments(comments);
          }
          toast.success("翻訳元ファイルを読み込みました（変更なし）");
        } else {
          // 差分がある場合は確認ダイアログを表示
          setUpdateDiff(diff);
          setNewSourceData(jsonData);
          setNewSourceComments(comments);
          setShowUpdateDialog(true);
        }
      } else {
        // 初回読み込みの場合は直接設定
        const { settranslateSource, setSourceComments } = translateData.getState();
        settranslateSource(jsonData);
        if (comments) {
          setSourceComments(comments);
        }
        toast.success("翻訳元ファイルを読み込みました");
      }
      
    } catch (error) {
      console.error("ファイルの読み込み中にエラーが発生しました:", error);
      toast.error("ファイルの読み込みに失敗しました");
    }
  };

  reader.onerror = (error) => {
    console.error("ファイルの読み込み中にエラーが発生しました:", error);
    toast.error("ファイルの読み込みに失敗しました");
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
