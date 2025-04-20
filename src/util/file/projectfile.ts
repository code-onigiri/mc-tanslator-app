import { JsonData, FileComments, translateData } from "./fileop";
import { useGlossaryStore } from "../../component/stores/GlossaryStore";

// プロジェクトファイル形式の定義
export interface ProjectFile {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: {
    translateSource: JsonData | null;
    translateTarget: JsonData | null;
    sourceComments: FileComments | null;
    targetComments: FileComments | null;
    glossary: Array<{ key: string; value: string }>;
  };
  metadata?: {
    sourceLang?: string;
    targetLang?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
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
  const currentState = translateData.getState();
  const glossary = useGlossaryStore.getState().glossary;

  const now = new Date().toISOString();

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
  // 最終更新タイムスタンプを更新
  project.updatedAt = new Date().toISOString();

  // プロジェクトをJSON文字列に変換
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  // ファイル名が提供されていない場合は作成
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = filename || `${safeName}.mctp`;

  // ファイルを保存
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
