import { create } from "zustand";

interface editer {
  key: string;
  sourcevalue: string;
  targetvalue: string;
  tags: string[];
  setkey: (key: string) => void;
  setSourceValue: (sourcevalue: string) => void;
  setTargetValue: (targetvalue: string) => void;
  setTags: (tags: string[]) => void;
  isReplaceMode?: boolean;
  setReplaceMode: (isReplaceMode: boolean) =>void;
  indexInReplaceMode: number;
  setIndexInReplaceMode: (index:number) => void;
  
  // エディター設定関連の状態
  activeTab: 'glossary' | 'translator' | 'ai-translator';
  setActiveTab: (tab: 'glossary' | 'translator' | 'ai-translator') => void;
  
  // カラーコードツールバーの表示状態（設定から初期化）
  showColorCodeToolbar: boolean;
  setShowColorCodeToolbar: (show: boolean) => void;
  
  // ナビゲーション機能
  navigateToNext: () => boolean; // 次の項目に移動、移動できた場合true
  navigateToPrev: () => boolean; // 前の項目に移動、移動できた場合true
}

export const useediter = create<editer>((set) => ({
  key: "none",
  sourcevalue: "none",
  targetvalue: "none",
  tags: [],
  setkey: (key: string) => set(() => ({ key: key })),
  setSourceValue: (sourcevalue: string) =>
    set(() => ({
      sourcevalue,
    })),
  setTargetValue: (targetvalue: string) => set(() => ({ targetvalue })),
  setTags: (tags: string[]) => set(() => ({ tags })),
  isReplaceMode: false,
  setReplaceMode: (isReplaceMode: boolean) => set(() => ({ isReplaceMode })),
  indexInReplaceMode: 0,
  setIndexInReplaceMode: (index: number) => set(() => ({ indexInReplaceMode: index })),
  
  // エディター設定関連の初期状態
  activeTab: 'glossary',
  setActiveTab: (tab: 'glossary' | 'translator' | 'ai-translator') => set(() => ({ activeTab: tab })),
  
  showColorCodeToolbar: false,
  setShowColorCodeToolbar: (show: boolean) => set(() => ({ showColorCodeToolbar: show })),
  
  // ナビゲーション機能（他のストアとの連携が必要なため、現在はスタブ実装）
  navigateToNext: () => {
    // 実際の実装は他のストア（ListStore）との連携が必要
    // この部分は後でEditerコンポーネント内で実装
    return false;
  },
  
  navigateToPrev: () => {
    // 実際の実装は他のストア（ListStore）との連携が必要
    // この部分は後でEditerコンポーネント内で実装
    return false;
  },
}));
