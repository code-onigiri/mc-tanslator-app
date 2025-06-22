import { create } from "zustand";

// カラーコード表示モードの型定義
export type ColorCodeDisplayMode = 'show' | 'hide' | 'plain';

// レイアウト方向の型定義
export type LayoutDirection = 'left-right' | 'right-left';

// daisyUIテーマの型定義（35テーマ対応）
export type DaisyUITheme =
  | 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate'
  | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden'
  | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe'
  | 'black' | 'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business'
  | 'acid' | 'lemonade' | 'night' | 'coffee' | 'winter' | 'dim'
  | 'nord' | 'sunset' | 'caramellatte' | 'abyss' | 'silk';

// 設定ストアの型定義
interface SettingsStoreState {
  // レイアウト設定
  layoutDirection: LayoutDirection;
  setLayoutDirection: (direction: LayoutDirection) => void;
  
  // テーマ設定
  currentTheme: DaisyUITheme;
  setCurrentTheme: (theme: DaisyUITheme) => void;
  
  // カラーコード表示設定
  colorCodeDisplayMode: ColorCodeDisplayMode;
  setColorCodeDisplayMode: (mode: ColorCodeDisplayMode) => void;
  
  // 設定の初期化
  initializeSettings: () => void;
  
  // 設定のリセット
  resetSettings: () => void;
}

// デフォルト設定値
const DEFAULT_SETTINGS = {
  layoutDirection: 'left-right' as LayoutDirection,
  currentTheme: 'light' as DaisyUITheme,
  colorCodeDisplayMode: 'show' as ColorCodeDisplayMode,
};

// LocalStorageキー
const STORAGE_KEYS = {
  layoutDirection: 'mc-translator-layout-direction',
  currentTheme: 'mc-translator-theme',
  colorCodeDisplayMode: 'mc-translator-colorcode-mode',
};

// LocalStorageから設定値を読み込む関数
function loadSettingFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// LocalStorageに設定値を保存する関数
function saveSettingToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('設定の保存に失敗しました:', error);
  }
}

// テーマを適用する関数
function applyTheme(theme: DaisyUITheme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  // 初期状態（ローカルストレージから読み込み）
  layoutDirection: DEFAULT_SETTINGS.layoutDirection,
  currentTheme: DEFAULT_SETTINGS.currentTheme,
  colorCodeDisplayMode: DEFAULT_SETTINGS.colorCodeDisplayMode,

  // レイアウト方向の設定
  setLayoutDirection: (direction: LayoutDirection) => {
    saveSettingToStorage(STORAGE_KEYS.layoutDirection, direction);
    set({ layoutDirection: direction });
  },

  // テーマの設定
  setCurrentTheme: (theme: DaisyUITheme) => {
    saveSettingToStorage(STORAGE_KEYS.currentTheme, theme);
    applyTheme(theme);
    set({ currentTheme: theme });
  },

  // カラーコード表示モードの設定
  setColorCodeDisplayMode: (mode: ColorCodeDisplayMode) => {
    saveSettingToStorage(STORAGE_KEYS.colorCodeDisplayMode, mode);
    set({ colorCodeDisplayMode: mode });
  },

  // 設定の初期化（アプリ起動時に呼び出し）
  initializeSettings: () => {
    const layoutDirection = loadSettingFromStorage(STORAGE_KEYS.layoutDirection, DEFAULT_SETTINGS.layoutDirection);
    const currentTheme = loadSettingFromStorage(STORAGE_KEYS.currentTheme, DEFAULT_SETTINGS.currentTheme);
    const colorCodeDisplayMode = loadSettingFromStorage(STORAGE_KEYS.colorCodeDisplayMode, DEFAULT_SETTINGS.colorCodeDisplayMode);

    // テーマを適用
    applyTheme(currentTheme);

    set({
      layoutDirection,
      currentTheme,
      colorCodeDisplayMode,
    });
  },

  // 設定のリセット
  resetSettings: () => {
    // LocalStorageから削除
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // デフォルト値に戻す
    applyTheme(DEFAULT_SETTINGS.currentTheme);
    set({
      layoutDirection: DEFAULT_SETTINGS.layoutDirection,
      currentTheme: DEFAULT_SETTINGS.currentTheme,
      colorCodeDisplayMode: DEFAULT_SETTINGS.colorCodeDisplayMode,
    });
  },
}));

// 利用可能なテーマのリスト（UI表示用）- 35テーマ対応
export const AVAILABLE_THEMES: { value: DaisyUITheme; label: string; description: string }[] = [
  { value: 'light', label: 'ライト', description: '明るい標準テーマ' },
  { value: 'dark', label: 'ダーク', description: '暗い標準テーマ' },
  { value: 'cupcake', label: 'カップケーキ', description: 'ピンク系の可愛いテーマ' },
  { value: 'bumblebee', label: 'バンブルビー', description: '黄色と黒のハチ風テーマ' },
  { value: 'emerald', label: 'エメラルド', description: '鮮やかな緑系テーマ' },
  { value: 'corporate', label: 'コーポレート', description: 'ビジネス向けの洗練されたテーマ' },
  { value: 'synthwave', label: 'シンセウェーブ', description: '80年代風ネオンテーマ' },
  { value: 'retro', label: 'レトロ', description: '懐かしい復古風テーマ' },
  { value: 'cyberpunk', label: 'サイバーパンク', description: 'ネオン系の未来的なテーマ' },
  { value: 'valentine', label: 'バレンタイン', description: 'ロマンチックなピンクテーマ' },
  { value: 'halloween', label: 'ハロウィン', description: 'オレンジと黒のホラーテーマ' },
  { value: 'garden', label: 'ガーデン', description: '自然の緑系テーマ' },
  { value: 'forest', label: 'フォレスト', description: '深い森の緑テーマ' },
  { value: 'aqua', label: 'アクア', description: '水色系の爽やかなテーマ' },
  { value: 'lofi', label: 'ローファイ', description: '落ち着いたパステルテーマ' },
  { value: 'pastel', label: 'パステル', description: '柔らかい色合いのテーマ' },
  { value: 'fantasy', label: 'ファンタジー', description: '幻想的な紫系テーマ' },
  { value: 'wireframe', label: 'ワイヤーフレーム', description: 'シンプルな線画風テーマ' },
  { value: 'black', label: 'ブラック', description: 'モノクロの黒テーマ' },
  { value: 'luxury', label: 'ラグジュアリー', description: '高級感のある金系テーマ' },
  { value: 'dracula', label: 'ドラキュラ', description: 'ダークで鮮やかなテーマ' },
  { value: 'cmyk', label: 'CMYK', description: '印刷色系のテーマ' },
  { value: 'autumn', label: 'オータム', description: '秋の色合いのテーマ' },
  { value: 'business', label: 'ビジネス', description: 'プロフェッショナルなテーマ' },
  { value: 'acid', label: 'アシッド', description: '鮮やかな蛍光色テーマ' },
  { value: 'lemonade', label: 'レモネード', description: '黄色系の爽やかなテーマ' },
  { value: 'night', label: 'ナイト', description: '夜空のような暗いテーマ' },
  { value: 'coffee', label: 'コーヒー', description: '茶色系の温かいテーマ' },
  { value: 'winter', label: 'ウィンター', description: '冬の白と青のテーマ' },
  { value: 'dim', label: 'ディム', description: '薄暗い落ち着いたテーマ' },
  { value: 'nord', label: 'ノード', description: '北欧風の青系テーマ' },
  { value: 'sunset', label: 'サンセット', description: '夕焼けのようなオレンジテーマ' },
  { value: 'caramellatte', label: 'キャラメルラテ', description: 'キャラメル色の温かいテーマ' },
  { value: 'abyss', label: 'アビス', description: '深海のような深い暗色テーマ' },
  { value: 'silk', label: 'シルク', description: '絹のような滑らかなテーマ' },
];

// カラーコード表示モードの選択肢（UI表示用）
export const COLOR_CODE_DISPLAY_OPTIONS: { value: ColorCodeDisplayMode; label: string; description: string }[] = [
  { value: 'show', label: '表示', description: 'カラーコードを表示し、色も適用' },
  { value: 'hide', label: '非表示', description: '色のみ適用、カラーコードは非表示' },
  { value: 'plain', label: 'プレーン', description: 'カラーコードも含めてプレーンテキスト表示' },
];

// レイアウト方向の選択肢（UI表示用）
export const LAYOUT_DIRECTION_OPTIONS: { value: LayoutDirection; label: string; description: string }[] = [
  { value: 'left-right', label: 'リスト左・エディター右', description: 'リストを左側、エディターを右側に配置' },
  { value: 'right-left', label: 'エディター左・リスト右', description: 'エディターを左側、リストを右側に配置' },
];