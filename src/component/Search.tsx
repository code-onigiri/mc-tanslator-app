import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useListStore } from "./stores/ListStore";
import { CheckDialog, InfoDialog } from "../util/dialog";
import { item } from "./stores/ListStore";
import { translateData as fileTranslateData } from "../util/file/fileop";
import { useediter } from "./stores/EditerStore";
import toast from "react-hot-toast";
import { eventBus, REPLACE_EVENTS } from "../util/eventBus";

export function Search() {
  const [isopenchangewindow, setopenchangewindow] = useState(false);
  const [replaceText, setReplaceText] = useState("");
  const [isBulkReplaceDialogOpen, setIsBulkReplaceDialogOpen] = useState(false);
  const [replaceResult, setReplaceResult] = useState<{
    count: number;
    isOpen: boolean;
  }>({ count: 0, isOpen: false });
  // 確認置き換え用の状態
  const [isConfirmReplaceDialogOpen, setIsConfirmReplaceDialogOpen] = useState(false);
  const [replacedItems, setReplacedItems] = useState<{[key: string]: string}>({});

  // トランスレートデータとセッター
  const translateData = useListStore((state) => state.translate);
  const setTranslate = useListStore((state) => state.setTranslate);
  const searchQuery = useListStore((state) => state.searchQuery);
  const setSearchQuery = useListStore((state) => state.setSearchQuery);
  
  // ListStoreの置き換え関連の状態
  const replaceQuery = useListStore((state) => state.replaceQuery);
  const setReplaceQuery = useListStore((state) => state.setReplaceQuery);
  const setConfirmReplaceMode = useListStore((state) => state.setConfirmReplaceMode);
  const replaceItems = useListStore((state) => state.replaceItems);
  const setReplaceItems = useListStore((state) => state.setReplaceItems);
  const currentReplaceIndex = useListStore((state) => state.currentReplaceIndex);
  const setCurrentReplaceIndex = useListStore((state) => state.setCurrentReplaceIndex);
  
  // EditerStoreからステートとセッターを取得
  const isReplaceMode = useediter((state) => state.isReplaceMode);
  const setReplaceMode = useediter((state) => state.setReplaceMode);
  const setIndexInReplaceMode = useediter((state) => state.setIndexInReplaceMode);
  const setkey = useediter((state) => state.setkey);
  const setsourcevalue = useediter((state) => state.setSourceValue);
  const settargetvalue = useediter((state) => state.setTargetValue);

  const changewindows = () => setopenchangewindow(!isopenchangewindow);

  // イベントリスナーを設定
  useEffect(() => {
    eventBus.on(REPLACE_EVENTS.SKIP_CURRENT, skipCurrentReplace);
    eventBus.on(REPLACE_EVENTS.REPLACE_CURRENT, replaceCurrentItem);
    eventBus.on(REPLACE_EVENTS.CANCEL_REPLACE_MODE, cancelReplaceMode);

    return () => {
      // コンポーネントのクリーンアップ時にリスナーを削除
      eventBus.off(REPLACE_EVENTS.SKIP_CURRENT);
      eventBus.off(REPLACE_EVENTS.REPLACE_CURRENT);
      eventBus.off(REPLACE_EVENTS.CANCEL_REPLACE_MODE);
    };
  }, [currentReplaceIndex, replaceItems, searchQuery, replaceText]);

  // 置き換え用アイテムを取得する処理
  useEffect(() => {
    if (isReplaceMode && replaceItems.length > 0) {
      // 現在のインデックスのアイテムをEditerに送る
      const currentItem = replaceItems[currentReplaceIndex];
      if (currentItem) {
        setkey(currentItem.key);
        setsourcevalue(currentItem.sourceValue);
        settargetvalue(currentItem.targetValue);
        setIndexInReplaceMode(currentReplaceIndex);
      }
    }
  }, [isReplaceMode, replaceItems, currentReplaceIndex]);

  // 確認しながら置き換えモードを開始する関数
  const startConfirmReplace = () => {
    if (!translateData || !translateData.list || !searchQuery.trim() || !replaceText) {
      toast.error("検索語と置換語の両方が必要です");
      return;
    }

    // 置換対象のアイテムを検索
    const itemsToReplace = translateData.list.filter(item => 
      item.targetValue && item.targetValue.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (itemsToReplace.length === 0) {
      toast.error("置換対象のテキストが見つかりませんでした");
      return;
    }

    // デバッグ出力
    console.log("確認置き換え開始:", { 
      searchQuery, 
      replaceText, 
      itemCount: itemsToReplace.length 
    });
    
    // 置換対象アイテムを保存
    setReplaceItems(itemsToReplace);
    setCurrentReplaceIndex(0);
    setReplacedItems({});
    
    // 置換モードをオン
    setConfirmReplaceMode(true);
    setReplaceMode(true);
    setReplaceQuery(replaceText);
    
    // 最初のアイテムをすぐに表示
    if (itemsToReplace.length > 0) {
      const currentItem = itemsToReplace[0];
      setkey(currentItem.key);
      setsourcevalue(currentItem.sourceValue);
      settargetvalue(currentItem.targetValue);
      setIndexInReplaceMode(0);
    }
  };

  // 置換処理をスキップする関数
  const skipCurrentReplace = () => {
    // 現在の選択位置を確認
    const currentIndex = currentReplaceIndex;
    
    if (currentIndex < replaceItems.length - 1) {
      // 次のアイテムへ
      setCurrentReplaceIndex(currentIndex + 1);
      
      // 次のアイテムの情報をエディタに設定
      const nextItem = replaceItems[currentIndex + 1];
      setkey(nextItem.key);
      setsourcevalue(nextItem.sourceValue);
      settargetvalue(nextItem.targetValue);
      setIndexInReplaceMode(currentIndex + 1);
    } else {
      // 最後のアイテムなら確認ダイアログを表示
      setIsConfirmReplaceDialogOpen(true);
    }
  };

  // 現在のアイテムを置換する関数
  const replaceCurrentItem = () => {
    const currentIndex = currentReplaceIndex;
    const currentItem = replaceItems[currentIndex];
    
    if (currentItem && currentItem.targetValue) {
      // 置換処理を実行
      const newValue = currentItem.targetValue.replace(
        new RegExp(searchQuery, "gi"), 
        replaceText // replaceQueryではなくreplaceTextを使用
      );

      console.log("置換実行:", {
        key: currentItem.key,
        before: currentItem.targetValue,
        after: newValue,
        searchText: searchQuery,
        replaceText: replaceText
      });

      // 置換結果を保存
      setReplacedItems(prev => ({
        ...prev,
        [currentItem.key]: newValue
      }));

      // EditerのtargetValueも更新
      settargetvalue(newValue);

      // 次のアイテムに進む処理
      if (currentIndex < replaceItems.length - 1) {
        // 次のアイテムへ
        setCurrentReplaceIndex(currentIndex + 1);
        
        // 次のアイテムの情報をエディタに設定
        const nextItem = replaceItems[currentIndex + 1];
        setkey(nextItem.key);
        setsourcevalue(nextItem.sourceValue);
        settargetvalue(nextItem.targetValue);
        setIndexInReplaceMode(currentIndex + 1);
      } else {
        // 最後のアイテムなら確認ダイアログを表示
        setIsConfirmReplaceDialogOpen(true);
      }
    }
  };

  // 置換モードをキャンセルする関数
  const cancelReplaceMode = (showToast = true) => {
    setReplaceMode(false);
    setReplaceItems([]);
    setCurrentReplaceIndex(0);
    setReplacedItems({});
    setReplaceQuery("");
    if (showToast) {
      toast.success("置換をキャンセルしました");
    }
  };

  // 最終的に置換を適用する関数
  const applyReplacements = () => {
    if (Object.keys(replacedItems).length === 0) {
      toast.success("変更がありませんでした");
      setIsConfirmReplaceDialogOpen(false);
      cancelReplaceMode();
      return;
    }

    // ファイルオブジェクトを取得
    const fileTargetData = fileTranslateData.getState().translateTarget;
    if (!fileTargetData) {
      toast.error("翻訳ターゲットデータが見つかりません");
      return;
    }

    // 変更を適用
    const updatedTargetData = { ...fileTargetData };
    Object.entries(replacedItems).forEach(([key, value]) => {
      updatedTargetData[key] = value;
    });

    // データを更新
    fileTranslateData.getState().settranslateTarget(updatedTargetData);

    // ListStoreも更新
    if (translateData && translateData.list) {
      const updatedList = translateData.list.map(item => {
        if (replacedItems[item.key]) {
          return {
            ...item,
            targetValue: replacedItems[item.key]
          };
        }
        return item;
      });
      setTranslate({ list: updatedList });
    }

    // 置換モードを終了（トーストメッセージは表示しない）
    setIsConfirmReplaceDialogOpen(false);
    cancelReplaceMode(false); // トーストを表示しないようにfalseを渡す
    toast.success(`${Object.keys(replacedItems).length}件の置換を適用しました`);
  };

  // 一括置き換えを実行する関数
  const executeBulkReplace = () => {
    if (!translateData || !translateData.list || !searchQuery.trim() || !replaceText) {
      toast.error("検索語と置換語の両方が必要です");
      return;
    }

    let count = 0;
    const changedItems: {[key: string]: string} = {};
    const newList = translateData.list.map((item: item) => {
      // ターゲット値に検索クエリが含まれる場合に置換
      if (item.targetValue && item.targetValue.includes(searchQuery)) {
        const newTargetValue = item.targetValue.replace(
          new RegExp(searchQuery, "gi"), 
          replaceText
        );
        
        // 変更があった場合にカウント
        if (newTargetValue !== item.targetValue) {
          count++;
          changedItems[item.key] = newTargetValue;
          
          return {
            ...item,
            targetValue: newTargetValue,
          };
        }
      }
      return item;
    });

    // 更新があった場合のみデータを更新
    if (count > 0) {
      setTranslate({ list: newList });
      
      // ファイルデータも更新
      const fileTargetData = fileTranslateData.getState().translateTarget;
      if (fileTargetData) {
        const updatedTargetData = { ...fileTargetData };
        Object.entries(changedItems).forEach(([key, value]) => {
          updatedTargetData[key] = value;
        });
        fileTranslateData.getState().settranslateTarget(updatedTargetData);
      }
      
      setReplaceResult({ count: count, isOpen: true });
    } else {
      setReplaceResult({ count: 0, isOpen: true });
    }
  };

  // 置き換え確認ダイアログを表示する関数
  const showConfirmDialog = () => {
    if (!searchQuery.trim()) {
      setReplaceResult({ count: 0, isOpen: true });
      return;
    }
    setIsBulkReplaceDialogOpen(true);
  };

  return (
    <div className="card rounded-md">
      <div className="flex flex-row items-center">
        <label className="m-2 input" style={{ width: "90%" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              console.log("検索クエリ変更:", e.target.value);
              setSearchQuery(e.target.value);
            }}
          />
        </label>
        <button className="btn btn-square mr-2" onClick={changewindows}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
            <path
              fillRule="evenodd"
              d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
            />
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {isopenchangewindow && (
          <motion.div
            className="flex flex-col mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: {
                duration: 0.15,
              },
            }}
          >
            <label className="mx-2 input" style={{ width: "90%" }}>
              <input
                type="text"
                placeholder="Replace..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </label>
            <div className="flex justify-end mr-2 mt-2 gap-2">
              <button
                className="btn btn-sm"
                onClick={startConfirmReplace}
                disabled={!searchQuery.trim() || !replaceText.trim()}
              >
                確認置き換え
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={showConfirmDialog}
                disabled={!searchQuery.trim() || !replaceText.trim()}
              >
                一括置き換え
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 一括置き換え確認ダイアログ */}
      <CheckDialog
        title="一括置き換えの確認"
        message={
          <div>
            <p>
              「<span className="font-bold text-primary">{searchQuery}</span>
              」を 「
              <span className="font-bold text-accent">{replaceText}</span>」に
              一括置き換えします。
            </p>
            <p className="mt-2 text-sm text-warning">
              この操作は元に戻せません。続行しますか？
            </p>
          </div>
        }
        cancelmessage="キャンセル"
        okmessage="置き換え実行"
        onCancel={() => setIsBulkReplaceDialogOpen(false)}
        onOk={() => {
          executeBulkReplace();
          setIsBulkReplaceDialogOpen(false);
        }}
        onClose={() => setIsBulkReplaceDialogOpen(false)}
        isOpen={isBulkReplaceDialogOpen}
      />

      {/* 置き換え結果ダイアログ */}
      <InfoDialog
        title="置き換え結果"
        message={
          replaceResult.count > 0 ? (
            <div>
              <p>
                「<span className="font-bold text-primary">{searchQuery}</span>
                」を 「
                <span className="font-bold text-accent">{replaceText}</span>」に
                <span className="font-bold"> {replaceResult.count}件 </span>
                置き換えました。
              </p>
            </div>
          ) : (
            <div>
              <p className="text-warning">
                {!searchQuery.trim()
                  ? "検索語が入力されていません。"
                  : "置き換え可能なテキストが見つかりませんでした。"}
              </p>
            </div>
          )
        }
        okmessage="OK"
        onClose={() => setReplaceResult({ ...replaceResult, isOpen: false })}
        isOpen={replaceResult.isOpen}
      />

      {/* 確認置き換え最終確認ダイアログ */}
      <CheckDialog
        title="置き換えの適用"
        message={
          <div>
            <p>
              「<span className="font-bold text-primary">{searchQuery}</span>
              」を 「
              <span className="font-bold text-accent">{replaceText}</span>」に
              <span className="font-bold"> {Object.keys(replacedItems).length}件 </span>
              置き換えます。
            </p>
            <p className="mt-2">この変更を適用しますか？</p>
          </div>
        }
        cancelmessage="キャンセル"
        okmessage="適用"
        onCancel={() => {
          setIsConfirmReplaceDialogOpen(false);
          cancelReplaceMode();
        }}
        onOk={applyReplacements}
        onClose={() => setIsConfirmReplaceDialogOpen(false)}
        isOpen={isConfirmReplaceDialogOpen}
      />
    </div>
  );
}
