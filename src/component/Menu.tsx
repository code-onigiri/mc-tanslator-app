import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
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
            className="absolute top-full mt-2 p-4 rounded-lg shadow-lg bg-base-200 text-base-content w-48 z-50"
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
            <div className="space-y-2">
              <div className="menu-item p-2 hover:bg-base-300 rounded-md transition-colors">
                メニュー項目 1
              </div>
              <div className="menu-item p-2 hover:bg-base-300 rounded-md transition-colors">
                メニュー項目 2
              </div>
              <div className="menu-item p-2 hover:bg-base-300 rounded-md transition-colors">
                メニュー項目 3
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
