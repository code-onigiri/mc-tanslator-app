import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TargetFileOpen, SourceFileOpen } from "../util/file/fileopen";
import { FileSaveButton } from "../util/file/filesave";
import { ProjectSaveButton } from "../util/file/projectfile-open-save";
import { InfoDialog } from "../util/dialog";
import { translateData } from "../util/file/fileop";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUntranslatedDialogOpen, setIsUntranslatedDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる - React式
  useEffect(() => {
    // クリックイベントのハンドラー
    const handleClickOutside = (event: MouseEvent) => {
      // メニューが開いていて、かつクリックがメニュー外だった場合
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // イベントリスナーを追加
    document.addEventListener("mousedown", handleClickOutside);

    // クリーンアップ関数
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // 依存配列にisOpenを含める

  // メニュー開閉のトグル
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleReplaceTranslations = () => {
    const sourceData = translateData.getState().translateSource;
    if (sourceData) {
      translateData.setState({ translateTarget: { ...sourceData } });
    }
    setIsDialogOpen(false);
  };

  const handleReplaceUntranslated = () => {
    const sourceData = translateData.getState().translateSource;
    const targetData = translateData.getState().translateTarget;
    if (sourceData && targetData) {
      const updatedTarget = { ...targetData };
      Object.keys(sourceData).forEach((key) => {
        if (!updatedTarget[key] || updatedTarget[key].trim() === "") {
          updatedTarget[key] = sourceData[key];
        }
      });
      translateData.setState({ translateTarget: updatedTarget });
    }
    setIsUntranslatedDialogOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className="mx-2 p-2 hover:bg-base-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center w-8 h-8" // w-10 h-10 から w-8 h-8 に縮小
        aria-expanded={isOpen}
        aria-controls="menu-dropdown"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        {/* ハンバーガーメニュー/バツマークのアニメーション */}
        <div className="relative w-4 h-4 flex justify-center items-center">
          {" "}
          {/* w-6 h-6 から w-4 h-4 に縮小 */}
          {/* 上の線 */}
          <motion.span
            className="absolute h-0.5 bg-current rounded-full w-full"
            initial={false}
            animate={{
              rotate: isOpen ? 45 : 0,
              translateY: isOpen ? 0 : -5, // -8 から -5 に調整
            }}
            transition={{ duration: 0.3 }}
          />
          {/* 真ん中の線 */}
          <motion.span
            className="absolute h-0.5 bg-current rounded-full w-full"
            initial={false}
            animate={{
              opacity: isOpen ? 0 : 1,
              width: isOpen ? 0 : "100%",
            }}
            transition={{ duration: 0.3 }}
          />
          {/* 下の線 */}
          <motion.span
            className="absolute h-0.5 bg-current rounded-full w-full"
            initial={false}
            animate={{
              rotate: isOpen ? -45 : 0,
              translateY: isOpen ? 0 : 5, // 8 から 5 に調整
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="menu-dropdown"
            className="absolute top-full mt-2 p-4 rounded-lg shadow-lg bg-base-200 text-base-content w-64 z-50"
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
            style={{
              transformOrigin: "top right",
            }}
          >
            <div className="space-y-4">
              {/* ファイルを開く関連項目 */}
              <div className="menu-section">
                <h3 className="text-sm font-bold mb-2 text-primary">
                  ファイルを開く
                </h3>
                <div className="pl-1 space-y-2">
                  {/* 翻訳元ファイルを開く */}
                  <div className="menu-item">
                    <p className="text-xs mb-1 opacity-70">
                      翻訳元ファイル (en_us.json など)
                    </p>
                    <SourceFileOpen />
                  </div>
                  {/* 翻訳対象ファイルを開く */}
                  <div className="menu-item">
                    <p className="text-xs mb-1 opacity-70">
                      翻訳対象ファイル (ja_jp.json など)
                    </p>
                    <TargetFileOpen />
                  </div>
                </div>
              </div>

              {/* 区切り線 */}
              <div className="h-px bg-base-300 w-full"></div>

              {/* ファイル保存セクション */}
              <div className="menu-section">
                <h3 className="text-sm font-bold mb-2 text-primary">
                  ファイルを保存
                </h3>
                <div className="pl-1 space-y-2">
                  {/* 翻訳元ファイルを保存 */}
                  <div className="menu-item">
                    <p className="text-xs mb-1 opacity-70">
                      翻訳元ファイルを保存
                    </p>
                    <FileSaveButton isSource={true} className="w-full" />
                  </div>

                  {/* 翻訳対象ファイルを保存 */}
                  <div className="menu-item">
                    <p className="text-xs mb-1 opacity-70">
                      翻訳対象ファイルを保存
                    </p>
                    <FileSaveButton
                      isSource={false}
                      className="w-full btn-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="menu-section">
                <ProjectSaveButton />
              </div>

              {/* 翻訳文を原文に置き換えるボタン */}
              <div className="menu-section">
                <h3 className="text-sm font-bold mb-2 text-primary">翻訳操作</h3>
                <div className="pl-1 space-y-2">
                  <button
                    className="btn btn-warning w-full"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    翻訳文を原文に置き換える
                  </button>
                  <button
                    className="btn btn-warning w-full"
                    onClick={() => setIsUntranslatedDialogOpen(true)}
                  >
                    未翻訳文を原文に置き換える
                  </button>
                </div>
              </div>

              {/* 確認ダイアログ */}
              <InfoDialog
                title="確認"
                message="翻訳文をすべて原文に置き換えます。よろしいですか？"
                okmessage="置き換える"
                onClose={() => setIsDialogOpen(false)}
                onOk={handleReplaceTranslations}
                isOpen={isDialogOpen}
              />
              <InfoDialog
                title="確認"
                message="未翻訳文を原文に置き換えます。よろしいですか？"
                okmessage="置き換える"
                onClose={() => setIsUntranslatedDialogOpen(false)}
                onOk={handleReplaceUntranslated}
                isOpen={isUntranslatedDialogOpen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
