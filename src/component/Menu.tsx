import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TargetFileOpen, SourceFileOpen } from "../util/file/fileopen";
import { FileSaveButton } from "../util/file/filesave";
import { ProjectSaveButton } from "../util/file/projectfile-open-save";
import { InfoDialog } from "../util/dialog";
import { translateData } from "../util/file/fileop";

// カスタムChevronDownアイコン
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

interface DropdownMenuProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function DropdownMenu({ title, children, className = "" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-0.5 px-1.5 py-1 text-xs font-medium text-base-content hover:bg-base-300 rounded transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${title}メニューを${isOpen ? "閉じる" : "開く"}`}
      >
        <span className="whitespace-nowrap">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-3 h-3 flex-shrink-0"
        >
          <ChevronDownIcon className="w-3 h-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 top-full mt-1 w-64 sm:w-72 bg-base-200 border border-base-300 rounded shadow-xl z-50 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.2,
              },
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.95,
              transition: {
                duration: 0.15,
                ease: "easeInOut",
              },
            }}
            style={{
              transformOrigin: "top left",
            }}
          >
            <div className="p-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileMenu() {
  return (
    <div className="space-y-2">
      {/* ファイルを開く関連項目 */}
      <div className="menu-section">
        <h3 className="text-xs font-bold mb-1 text-primary border-b border-primary/20 pb-0.5">
          ファイルを開く
        </h3>
        <div className="space-y-1">
          {/* 翻訳元ファイルを開く */}
          <div className="menu-item p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
            <p className="text-[10px] mb-0.5 opacity-70">
              翻訳元 (en_us.json など)
            </p>
            <SourceFileOpen />
          </div>
          {/* 翻訳対象ファイルを開く */}
          <div className="menu-item p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
            <p className="text-[10px] mb-0.5 opacity-70">
              翻訳対象 (ja_jp.json など)
            </p>
            <TargetFileOpen />
          </div>
        </div>
      </div>

      {/* 区切り線 */}
      <div className="h-px bg-gradient-to-r from-transparent via-base-300 to-transparent w-full"></div>

      {/* ファイル保存セクション */}
      <div className="menu-section">
        <h3 className="text-xs font-bold mb-1 text-primary border-b border-primary/20 pb-0.5">
          ファイルを保存
        </h3>
        <div className="space-y-1">
          {/* 翻訳元ファイルを保存 */}
          <div className="menu-item p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
            <p className="text-[10px] mb-0.5 opacity-70">
              翻訳元ファイルを保存
            </p>
            <FileSaveButton isSource={true} className="w-full btn-xs" />
          </div>

          {/* 翻訳対象ファイルを保存 */}
          <div className="menu-item p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
            <p className="text-[10px] mb-0.5 opacity-70">
              翻訳対象ファイルを保存
            </p>
            <FileSaveButton
              isSource={false}
              className="w-full btn-primary btn-xs"
            />
          </div>
        </div>
      </div>

      {/* プロジェクトファイル保存 */}
      <div className="menu-section p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
        <ProjectSaveButton />
      </div>
    </div>
  );
}

function OtherMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUntranslatedDialogOpen, setIsUntranslatedDialogOpen] = useState(false);

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
    <>
      <div className="space-y-2">
        {/* 翻訳操作セクション */}
        <div className="menu-section">
          <h3 className="text-xs font-bold mb-1 text-primary border-b border-primary/20 pb-0.5">翻訳操作</h3>
          <div className="space-y-1">
            <div className="p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
              <button
                className="btn btn-warning w-full btn-xs text-[10px] hover:btn-warning/80 transition-all duration-200"
                onClick={() => setIsDialogOpen(true)}
              >
                翻訳文→原文
              </button>
            </div>
            <div className="p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
              <button
                className="btn btn-warning w-full btn-xs text-[10px] hover:btn-warning/80 transition-all duration-200"
                onClick={() => setIsUntranslatedDialogOpen(true)}
              >
                未翻訳→原文
              </button>
            </div>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="h-px bg-gradient-to-r from-transparent via-base-300 to-transparent w-full"></div>
        
        <div className="menu-section">
          <h3 className="text-xs font-bold mb-1 text-primary border-b border-primary/20 pb-0.5">ツール</h3>
          <div className="space-y-1">
            <div className="p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
              <button
                className="btn btn-ghost w-full btn-xs text-[10px] justify-start opacity-50 cursor-not-allowed"
                disabled
              >
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  設定
                </span>
              </button>
            </div>
            <div className="p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200">
              <button
                className="btn btn-ghost w-full btn-xs text-[10px] justify-start opacity-50 cursor-not-allowed"
                disabled
              >
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ヘルプ
                </span>
              </button>
            </div>
          </div>
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
    </>
  );
}

// メニュー設定の型定義（将来的な拡張用）
interface MenuConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  visible?: boolean;
}

// メニュー設定（新しいメニューを追加する際はここに追加）
const menuConfigs: MenuConfig[] = [
  {
    id: "file",
    title: "File",
    component: FileMenu,
    visible: true,
  },
  {
    id: "other",
    title: "その他",
    component: OtherMenu,
    visible: true,
  },
  // 将来的なメニューの例（コメントアウト）
  // {
  //   id: "edit",
  //   title: "編集",
  //   component: EditMenu,
  //   visible: true,
  // },
  // {
  //   id: "view",
  //   title: "表示",
  //   component: ViewMenu,
  //   visible: true,
  // },
];

export default function Menu() {
  const visibleMenus = menuConfigs.filter(menu => menu.visible !== false);

  return (
    <nav className="flex items-center space-x-0.5" role="menubar">
      {visibleMenus.map((menu) => {
        const MenuComponent = menu.component;
        return (
          <DropdownMenu
            key={menu.id}
            title={menu.title}
            className="flex-shrink-0"
          >
            <MenuComponent />
          </DropdownMenu>
        );
      })}
    </nav>
  );
}

// 新しいメニューカテゴリを追加するためのヘルパー関数
export const addMenuCategory = (config: MenuConfig) => {
  menuConfigs.push(config);
};
