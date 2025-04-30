// プロジェクトファイルの保存と読み込みを管理するコンポーネント
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  createProjectFile,
  loadProjectFile,
  saveProjectFile,
  isValidProjectFile,
} from "./projectfile";
import { InfoDialog } from "../dialog"; // 共通ダイアログをインポート

// プロジェクト保存ボタンのコンポーネント
export function ProjectSaveButton() {
  const [projectName, setProjectName] = useState<string>(""); // プロジェクト名の状態
  const [showNameDialog, setShowNameDialog] = useState<boolean>(false); // ダイアログ表示状態

  // プロジェクト名入力ダイアログを表示
  const handleProjectSave = () => {
    setShowNameDialog(true);
  };

  // プロジェクトファイルを実際に保存
  const saveProject = () => {
    if (!projectName.trim()) {
      toast.error("プロジェクト名を入力してください");
      return;
    }

    try {
      const projectFile = createProjectFile(projectName); // プロジェクトファイルを作成
      saveProjectFile(projectFile); // ファイルを保存
      toast.success("プロジェクトを保存しました");
      setShowNameDialog(false);
      setProjectName("");
    } catch (error) {
      console.error("プロジェクト保存エラー:", error);
      toast.error("プロジェクトの保存に失敗しました");
    }
  };

  // プロジェクトファイルを読み込む
  const handleProjectLoad = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mctp,application/json";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      try {
        const text = await file.text();
        const projectData = JSON.parse(text);

        if (!isValidProjectFile(projectData)) {
          toast.error("無効なプロジェクトファイル形式です");
          return;
        }

        loadProjectFile(projectData); // プロジェクトデータを読み込み
        toast.success(`プロジェクト "${projectData.name}" を読み込みました`);
      } catch (error) {
        console.error("プロジェクト読み込みエラー:", error);
        toast.error("プロジェクトの読み込みに失敗しました");
      }
    };

    input.click();
  };

  return (
    <>
      <h3 className="text-sm font-bold mb-2 text-primary">プロジェクト</h3>
      <div className="pl-1 space-y-2">
        <div className="menu-item">
          <p className="text-xs mb-1 opacity-70">プロジェクト操作</p>
          <div className="flex gap-2">
            <button
              onClick={handleProjectLoad}
              className="btn btn-sm flex-1"
              aria-label="プロジェクトを読み込む"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              読み込み
            </button>
            <button
              onClick={handleProjectSave}
              className="btn btn-sm flex-1 btn-primary"
              aria-label="プロジェクトを保存する"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 共通ダイアログコンポーネントを使用 */}
      <ProjectNameDialog
        isOpen={showNameDialog}
        onClose={() => setShowNameDialog(false)}
        projectName={projectName}
        setProjectName={setProjectName}
        onSave={saveProject}
      />
    </>
  );
}

// プロジェクト名入力ダイアログを共通化
interface ProjectNameDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  projectName: string; // プロジェクト名
  setProjectName: (name: string) => void; // プロジェクト名を設定する関数
  onSave: () => void; // 保存処理を実行する関数
}

function ProjectNameDialog({
  isOpen,
  onClose,
  projectName,
  setProjectName,
  onSave,
}: ProjectNameDialogProps) {
  // InfoDialogをカスタマイズして表示
  return (
    <InfoDialog
      title="プロジェクト名を入力"
      isOpen={isOpen}
      onClose={onClose}
      okmessage="保存"
      onOk={onSave}
      message={
        <>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="My Minecraft Translation Project"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onClose();
            }}
          />
        </>
      }
    />
  );
}
