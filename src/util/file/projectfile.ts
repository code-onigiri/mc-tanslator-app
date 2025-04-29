import { JsonData, FileComments, translateData } from "./fileop";
import { useGlossaryStore } from "../../component/stores/GlossaryStore";

// プロジェクトファイルの形式を定義
// プロジェクトのメタデータや翻訳データを含む構造体
export interface ProjectFile {
  version: string; // プロジェクトファイルのバージョン
  name: string; // プロジェクト名
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
  data: {
    translateSource: JsonData | null; // 翻訳元データ
    translateTarget: JsonData | null; // 翻訳対象データ
    sourceComments: FileComments | null; // 翻訳元のコメント
    targetComments: FileComments | null; // 翻訳対象のコメント
    glossary: Array<{ key: string; value: string }>; // 用語集
  };
  metadata?: {
    sourceLang?: string; // 翻訳元の言語
    targetLang?: string; // 翻訳対象の言語
    description?: string; // プロジェクトの説明
    tags?: string[]; // タグ
    [key: string]: any; // その他のメタデータ
  };
}

/**
 * 現在のデータからプロジェクトファイルを作成する
 * @param projectName プロジェクト名
 * @param metadata 追加のメタデータ
 * @returns ProjectFile オブジェクト
 */
export function createProjectFile(
  projectName: string,
  metadata?: ProjectFile["metadata"],
): ProjectFile {
  const currentState = translateData.getState(); // Zustandストアから現在の状態を取得
  const glossary = useGlossaryStore.getState().glossary; // 用語集を取得

  const now = new Date().toISOString(); // 現在の日時をISO形式で取得

  return {
    version: "1.0.0",
    name: projectName,
    createdAt: now,
    updatedAt: now,
    data: {
      translateSource: currentState.translateSource,
      translateTarget: currentState.translateTarget,
      sourceComments: currentState.sourceComments,
      targetComments: currentState.targetComments,
      glossary: glossary,
    },
    metadata: metadata || {
      sourceLang: "en",
      targetLang: "ja",
      description: "",
      tags: [],
    },
  };
}

/**
 * プロジェクトファイルを保存する
 * @param project 保存するプロジェクトデータ
 * @param filename オプションのファイル名（デフォルトはプロジェクト名）
 */
export function saveProjectFile(project: ProjectFile, filename?: string): void {
  project.updatedAt = new Date().toISOString(); // 最終更新タイムスタンプを更新

  const jsonString = JSON.stringify(project, null, 2); // プロジェクトをJSON文字列に変換
  const blob = new Blob([jsonString], { type: "application/json" });

  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, "_"); // ファイル名を安全な形式に変換
  const fileName = filename || `${safeName}.mctp`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * プロジェクトファイルを読み込み、アプリケーションの状態を更新する
 * @param projectFile プロジェクトファイルデータ
 */
export function loadProjectFile(projectFile: ProjectFile): void {
  const {
    translateSource,
    translateTarget,
    sourceComments,
    targetComments,
    glossary,
  } = projectFile.data;

  // 翻訳データストアを更新
  if (translateSource) {
    translateData.getState().settranslateSource(translateSource);
  }

  if (translateTarget) {
    translateData.getState().settranslateTarget(translateTarget);
  }

  if (sourceComments) {
    translateData.getState().setSourceComments(sourceComments);
  }

  if (targetComments) {
    translateData.getState().setTargetComments(targetComments);
  }

  // 用語集ストアを更新
  if (glossary && glossary.length > 0) {
    useGlossaryStore.getState().setGlossary(glossary);
  }
}

/**
 * プロジェクトファイルの形式を検証する
 * @param data 検証するデータ
 * @returns 有効なプロジェクトファイルの場合はtrue
 */
export function isValidProjectFile(data: any): data is ProjectFile {
  return (
    data &&
    typeof data === "object" &&
    typeof data.version === "string" &&
    typeof data.name === "string" &&
    typeof data.createdAt === "string" &&
    typeof data.updatedAt === "string" &&
    data.data &&
    typeof data.data === "object"
  );
}
