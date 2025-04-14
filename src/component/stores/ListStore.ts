import { create } from "zustand";
import {
  JsonData,
  translateData as fileTranslateData,
} from "../../util/file/fileop";
import { useEffect } from "react";

// 選択アイテムの型定義
export interface SelectedItem {
  key: string;
  sourceValue: string;
  targetValue: string;
}

//Zustandストアのinterface
interface ListStoreState {
  translateSource: JsonData | null;
  translateTarget: JsonData | null;
  setTranslateSource: (data: JsonData | null) => void;
  setTranslateTarget: (data: JsonData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  listindex: number;
  setlistindex: (index: number) => void;
}

export const useListStore = create<ListStoreState>((set) => ({
  //翻訳データ
  translateSource: null,
  translateTarget: null,
  setTranslateSource: (data: JsonData | null) => set({ translateSource: data }),
  setTranslateTarget: (data: JsonData | null) => set({ translateTarget: data }),
  //検索
  searchQuery: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  //リスト位置
  listindex: 400,
  setlistindex: (index: number) => set({ listindex: index }),
}));

/**
 * fileTranslateDataからListStoreへデータを同期するカスタムフック
 */
export function useSyncTranslateData() {
  // fileTranslateDataからデータを取得
  const fileSource = fileTranslateData((state) => state.translateSource);
  const fileTarget = fileTranslateData((state) => state.translateTarget);

  // ListStoreからセッター関数を取得
  const setTranslateSource = useListStore((state) => state.setTranslateSource);
  const setTranslateTarget = useListStore((state) => state.setTranslateTarget);

  // fileSourceが変化したらListStoreのtranslateSourceを更新
  useEffect(() => {
    if (fileSource !== null) {
      setTranslateSource(fileSource);
    }
  }, [fileSource, setTranslateSource]);

  // fileTargetが変化したらListStoreのtranslateTargetを更新
  useEffect(() => {
    if (fileTarget !== null) {
      setTranslateTarget(fileTarget);
    }
  }, [fileTarget, setTranslateTarget]);
}
