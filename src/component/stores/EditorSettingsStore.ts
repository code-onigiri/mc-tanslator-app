import { create } from "zustand";

// エディター設定の型定義
interface EditorSettingsState {
  // フォントサイズ設定（px）
  fontSize: number;
  setFontSize: (size: number) => void;
  
  // サイドバー設定
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  defaultSidebarTab: 'glossary' | 'translator' | 'ai-translator';
  setDefaultSidebarTab: (tab: 'glossary' | 'translator' | 'ai-translator') => void;
  
  // エディター内要素表示設定
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
  colorCodeToolbarDefaultVisible: boolean;
  setColorCodeToolbarDefaultVisible: (visible: boolean) => void;
  tagEditAreaVisible: boolean;
  setTagEditAreaVisible: (visible: boolean) => void;
  
  // 設定の初期化とリセット
  initializeEditorSettings: () => void;
  resetEditorSettings: () => void;
}

// デフォルト設定値
const DEFAULT_EDITOR_SETTINGS = {
  fontSize: 16,
  sidebarVisible: true,
  sidebarWidth: 33, // パーセンテージ
  defaultSidebarTab: 'glossary' as const,
  showLineNumbers: false,
  colorCodeToolbarDefaultVisible: false,
  tagEditAreaVisible: true,
};

// LocalStorageキー
const EDITOR_STORAGE_KEYS = {
  fontSize: 'mc-translator-editor-font-size',
  sidebarVisible: 'mc-translator-editor-sidebar-visible',
  sidebarWidth: 'mc-translator-editor-sidebar-width',
  defaultSidebarTab: 'mc-translator-editor-default-sidebar-tab',
  showLineNumbers: 'mc-translator-editor-show-line-numbers',
  colorCodeToolbarDefaultVisible: 'mc-translator-editor-colorcode-toolbar-default',
  tagEditAreaVisible: 'mc-translator-editor-tag-area-visible',
};

// LocalStorageから設定値を読み込む関数
function loadEditorSettingFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// LocalStorageに設定値を保存する関数
function saveEditorSettingToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('エディター設定の保存に失敗しました:', error);
  }
}

export const useEditorSettingsStore = create<EditorSettingsState>((set) => ({
  // 初期状態
  fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
  sidebarVisible: DEFAULT_EDITOR_SETTINGS.sidebarVisible,
  sidebarWidth: DEFAULT_EDITOR_SETTINGS.sidebarWidth,
  defaultSidebarTab: DEFAULT_EDITOR_SETTINGS.defaultSidebarTab,
  showLineNumbers: DEFAULT_EDITOR_SETTINGS.showLineNumbers,
  colorCodeToolbarDefaultVisible: DEFAULT_EDITOR_SETTINGS.colorCodeToolbarDefaultVisible,
  tagEditAreaVisible: DEFAULT_EDITOR_SETTINGS.tagEditAreaVisible,

  // フォントサイズ設定
  setFontSize: (size: number) => {
    const clampedSize = Math.max(12, Math.min(24, size)); // 12-24pxに制限
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.fontSize, clampedSize);
    set({ fontSize: clampedSize });
  },

  // サイドバー表示設定
  setSidebarVisible: (visible: boolean) => {
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.sidebarVisible, visible);
    set({ sidebarVisible: visible });
  },

  // サイドバー幅設定
  setSidebarWidth: (width: number) => {
    const clampedWidth = Math.max(25, Math.min(50, width)); // 25-50%に制限
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.sidebarWidth, clampedWidth);
    set({ sidebarWidth: clampedWidth });
  },

  // デフォルトサイドバータブ設定
  setDefaultSidebarTab: (tab: 'glossary' | 'translator' | 'ai-translator') => {
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.defaultSidebarTab, tab);
    set({ defaultSidebarTab: tab });
  },

  // 行番号表示設定
  setShowLineNumbers: (show: boolean) => {
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.showLineNumbers, show);
    set({ showLineNumbers: show });
  },

  // カラーコードツールバーデフォルト表示設定
  setColorCodeToolbarDefaultVisible: (visible: boolean) => {
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.colorCodeToolbarDefaultVisible, visible);
    set({ colorCodeToolbarDefaultVisible: visible });
  },

  // タグ編集エリア表示設定
  setTagEditAreaVisible: (visible: boolean) => {
    saveEditorSettingToStorage(EDITOR_STORAGE_KEYS.tagEditAreaVisible, visible);
    set({ tagEditAreaVisible: visible });
  },

  // 設定の初期化（アプリ起動時に呼び出し）
  initializeEditorSettings: () => {
    const fontSize = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.fontSize, DEFAULT_EDITOR_SETTINGS.fontSize);
    const sidebarVisible = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.sidebarVisible, DEFAULT_EDITOR_SETTINGS.sidebarVisible);
    const sidebarWidth = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.sidebarWidth, DEFAULT_EDITOR_SETTINGS.sidebarWidth);
    const defaultSidebarTab = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.defaultSidebarTab, DEFAULT_EDITOR_SETTINGS.defaultSidebarTab);
    const showLineNumbers = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.showLineNumbers, DEFAULT_EDITOR_SETTINGS.showLineNumbers);
    const colorCodeToolbarDefaultVisible = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.colorCodeToolbarDefaultVisible, DEFAULT_EDITOR_SETTINGS.colorCodeToolbarDefaultVisible);
    const tagEditAreaVisible = loadEditorSettingFromStorage(EDITOR_STORAGE_KEYS.tagEditAreaVisible, DEFAULT_EDITOR_SETTINGS.tagEditAreaVisible);

    set({
      fontSize,
      sidebarVisible,
      sidebarWidth,
      defaultSidebarTab,
      showLineNumbers,
      colorCodeToolbarDefaultVisible,
      tagEditAreaVisible,
    });
  },

  // 設定のリセット
  resetEditorSettings: () => {
    // LocalStorageから削除
    Object.values(EDITOR_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // デフォルト値に戻す
    set({
      fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
      sidebarVisible: DEFAULT_EDITOR_SETTINGS.sidebarVisible,
      sidebarWidth: DEFAULT_EDITOR_SETTINGS.sidebarWidth,
      defaultSidebarTab: DEFAULT_EDITOR_SETTINGS.defaultSidebarTab,
      showLineNumbers: DEFAULT_EDITOR_SETTINGS.showLineNumbers,
      colorCodeToolbarDefaultVisible: DEFAULT_EDITOR_SETTINGS.colorCodeToolbarDefaultVisible,
      tagEditAreaVisible: DEFAULT_EDITOR_SETTINGS.tagEditAreaVisible,
    });
  },
}));


// エディター設定のUIオプション
export const FONT_SIZE_OPTIONS = {
  min: 12,
  max: 24,
  step: 1,
};

export const SIDEBAR_WIDTH_OPTIONS = {
  min: 25,
  max: 50,
  step: 5,
};

export const SIDEBAR_TAB_OPTIONS: { value: 'glossary' | 'translator' | 'ai-translator'; label: string }[] = [
  { value: 'glossary', label: '用語集' },
  { value: 'translator', label: '翻訳機能' },
  { value: 'ai-translator', label: 'AI翻訳' },
];