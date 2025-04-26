import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useListStore } from "./stores/ListStore";
import { CheckDialog, InfoDialog } from "../util/dialog";
import { item } from "./stores/ListStore";

export function Search() {
  const [isopenchangewindow, setopenchangewindow] = useState(false);
  const [replaceText, setReplaceText] = useState("");
  const [isBulkReplaceDialogOpen, setIsBulkReplaceDialogOpen] = useState(false);
  const [replaceResult, setReplaceResult] = useState<{
    count: number;
    isOpen: boolean;
  }>({ count: 0, isOpen: false });

  // トランスレートデータとセッター
  const translateData = useListStore((state) => state.translate);
  const setTranslate = useListStore((state) => state.setTranslate);
  const searchQuery = useListStore((state) => state.searchQuery);
  const setSearchQuery = useListStore((state) => state.setSearchQuery);

  const changewindows = () => setopenchangewindow(!isopenchangewindow);

  // 一括置き換えを実行する関数
  const executeBulkReplace = () => {
    if (
      !translateData ||
      !translateData.list ||
      !searchQuery.trim() ||
      !replaceText
    ) {
      return;
    }

    let count = 0;
    const newList = translateData.list.map((item: item) => {
      // ターゲット値のいずれかに検索クエリが含まれる場合に置換
      const newTargetValue = item.targetValue
        ? item.targetValue.replace(new RegExp(searchQuery, "gi"), replaceText)
        : "";

      // 変更があった場合にカウント
      if (newTargetValue !== item.targetValue) {
        count++;
      }

      return {
        ...item,
        targetValue: newTargetValue,
      };
    });

    // 更新があった場合のみデータを更新
    if (count > 0) {
      setTranslate({ list: newList });
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
            className="flex flex-col mb-2" // row から col に変更
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
              {" "}
              <button
                className="btn btn-sm"
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
    </div>
  );
}
