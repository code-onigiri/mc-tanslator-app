import { create } from "zustand";
import { translateData as fileTranslateData } from "../../util/file/fileop";
import { useEffect } from "react";

// 選択アイテムの型定義
export interface item {
  key: string;
  sourceValue: string;
  targetValue: string;
}

interface listData {
  list: item[];
}

//Zustandストアのinterface
interface ListStoreState {
  translate: listData | null;
  setTranslate: (data: listData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  replaceQuery: string;
  setReplaceQuery: (query: string) => void;
  listindex: number;
  setlistindex: (index: number) => void;
  // 確認しながら置き換え用の追加プロパティ
  isConfirmReplaceMode: boolean; 
  setConfirmReplaceMode: (isMode: boolean) => void;
  replaceItems: item[];
  setReplaceItems: (items: item[]) => void;
  currentReplaceIndex: number;
  setCurrentReplaceIndex: (index: number) => void;
}

export const useListStore = create<ListStoreState>((set) => ({
  //翻訳データ
  translate: null,
  setTranslate: (data: listData | null) => set({ translate: data }),
  //検索
  searchQuery: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  //置き換え時のクエリ
  replaceQuery: "",
  setReplaceQuery: (query: string) => set({ replaceQuery: query }),
  //リスト位置
  listindex: 400,
  setlistindex: (index: number) => set({ listindex: index }),
  // 確認しながら置き換え用の状態
  isConfirmReplaceMode: false,
  setConfirmReplaceMode: (isMode: boolean) => set({ isConfirmReplaceMode: isMode }),
  replaceItems: [],
  setReplaceItems: (items: item[]) => set({ replaceItems: items }),
  currentReplaceIndex: 0,
  setCurrentReplaceIndex: (index: number) => set({ currentReplaceIndex: index }),
}));

/**
 * fileTranslateDataからListStoreへデータを同期するカスタムフック
 */
export function useSyncTranslateData() {
  // fileTranslateDataからデータを取得
  const fileSource = fileTranslateData((state) => state.translateSource);
  const fileTarget = fileTranslateData((state) => state.translateTarget);

  // ListStoreからセッター関数を取得
  const setTranslate = useListStore((state) => state.setTranslate);

  useEffect(() => {
    if (fileSource !== null && fileTarget !== null) {
      // sourceのkeyをベースにリストを生成
      const translatedList: item[] = [];

      // sourceのすべてのキーに対して処理
      Object.keys(fileSource).forEach((key) => {
        const sourceValue = fileSource[key];
        // targetに対応するキーがあるかチェック
        const targetValue = fileTarget[key] || "";

        // リストアイテムを追加
        translatedList.push({
          key,
          sourceValue,
          targetValue,
        });
      });

      // 生成したリストをセット
      setTranslate({ list: translatedList });
    }
  }, [fileSource, fileTarget, setTranslate]);
}
