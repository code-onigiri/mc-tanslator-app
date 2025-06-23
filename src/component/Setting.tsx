import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import GeminiSettings from "./GeminiSettings";
import ColorCodeText from "./ColorCodeText";
import EditorSettings from "./EditorSettings";
import {
  useSettingsStore,
  AVAILABLE_THEMES,
  COLOR_CODE_DISPLAY_OPTIONS,
  LAYOUT_DIRECTION_OPTIONS
} from "./stores/SettingsStore";

// 設定項目の型定義
interface SettingItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
  category: 'ai' | 'general' | 'advanced';
}

// 設定項目の定義
const settingItems: SettingItem[] = [
  {
    id: 'gemini',
    name: 'Gemini AI',
    description: 'API設定とプロンプト管理',
    category: 'ai',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M8.5 6.5a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V9H10a.5.5 0 0 0 0-1H8.5V6.5z"/>
      </svg>
    )
  },
  {
    id: 'appearance',
    name: '外観',
    description: 'テーマとUI設定',
    category: 'general',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8z"/>
      </svg>
    )
  },
  {
    id: 'editor',
    name: 'エディター',
    description: 'エディター設定とカスタマイズ',
    category: 'general',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293L2.5 6.5l.94.94a1 1 0 0 1 .293.708v.07a1 1 0 0 0 .419.815L7.233 10.2a.5.5 0 0 1 .094.319v4.733A.5.5 0 0 1 6.826 16H4.174a.5.5 0 0 1-.5-.5v-4.733a.5.5 0 0 1 .094-.319L6.846 7.367a1 1 0 0 0 .419-.815v-.07a1 1 0 0 1 .293-.708L8.5 4.5l-.94-.94a1 1 0 0 1-.293-.708v-.07a1 1 0 0 0-.419-.815L4.767.886A.5.5 0 0 1 4.673.567V.5a.5.5 0 0 1 .5-.5zM14 1 13 0l-2.2 3.081a1 1 0 0 1-.815.419h-.07a1 1 0 0 0-.708.293L8.5 4.5l.94.94a1 1 0 0 0 .293.708v.07a1 1 0 0 1 .419.815L13.233 10.2a.5.5 0 0 0 .094.319v4.733a.5.5 0 0 0 .5.5h2.652a.5.5 0 0 0 .5-.5v-4.733a.5.5 0 0 0 .094-.319L13.154 7.367a1 1 0 0 1 .419-.815v-.07a1 1 0 0 0 .293-.708L14.5 4.5l-.94-.94a1 1 0 0 0-.293-.708v-.07a1 1 0 0 1-.419-.815L11.767.886A.5.5 0 0 0 11.673.567V.5a.5.5 0 0 0-.5-.5z"/>
      </svg>
    )
  },
  {
    id: 'language',
    name: '言語設定',
    description: '表示言語とローカライゼーション',
    category: 'general',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z"/>
        <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z"/>
      </svg>
    )
  },
  {
    id: 'advanced',
    name: '高度な設定',
    description: 'デバッグとパフォーマンス',
    category: 'advanced',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3h9.05zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8h2.05zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1h9.05z"/>
      </svg>
    )
  }
];

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('gemini');
  const menuRef = useRef<HTMLDivElement>(null);

  // 設定ストアから状態と関数を取得
  const currentTheme = useSettingsStore((state) => state.currentTheme);
  const setCurrentTheme = useSettingsStore((state) => state.setCurrentTheme);
  const layoutDirection = useSettingsStore((state) => state.layoutDirection);
  const setLayoutDirection = useSettingsStore((state) => state.setLayoutDirection);
  const colorCodeDisplayMode = useSettingsStore((state) => state.colorCodeDisplayMode);
  const setColorCodeDisplayMode = useSettingsStore((state) => state.setColorCodeDisplayMode);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

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

  // メニュー開閉のトグル
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 外観設定コンポーネント
  const AppearanceSettings = () => (
    <div className="space-y-8">
      {/* テーマ設定 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">テーマ設定</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-base-content/70">
              現在のテーマ: {AVAILABLE_THEMES.find(t => t.value === currentTheme)?.label}
            </label>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {AVAILABLE_THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setCurrentTheme(theme.value)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  currentTheme === theme.value
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
                title={theme.description}
              >
                <div className="font-medium text-sm">{theme.label}</div>
                <div className="text-xs text-base-content/70 mt-1">
                  {theme.description}
                </div>
                {currentTheme === theme.value && (
                  <div className="text-xs text-primary mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    使用中
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* レイアウト設定 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">レイアウト設定</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <div className="space-y-3">
            {LAYOUT_DIRECTION_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  layoutDirection === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
                onClick={() => setLayoutDirection(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-base-content/70">{option.description}</div>
                  </div>
                  <input
                    type="radio"
                    className="radio radio-primary"
                    checked={layoutDirection === option.value}
                    onChange={() => setLayoutDirection(option.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* カラーコード表示設定 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">カラーコード表示設定</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <div className="space-y-3">
            {COLOR_CODE_DISPLAY_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  colorCodeDisplayMode === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
                onClick={() => setColorCodeDisplayMode(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-base-content/70">{option.description}</div>
                  </div>
                  <input
                    type="radio"
                    className="radio radio-primary"
                    checked={colorCodeDisplayMode === option.value}
                    onChange={() => setColorCodeDisplayMode(option.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* カラーコードプレビュー */}
          <div className="mt-4 p-3 bg-base-100 rounded-lg">
            <div className="text-sm font-medium mb-2">プレビュー:</div>
            <div className="font-mono">
              <ColorCodeText
                text="§c赤色テキスト§l太字§r通常テキスト"
                forceDisplayMode={colorCodeDisplayMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 設定リセット */}
      <div>
        <h3 className="text-lg font-semibold mb-4">設定リセット</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">全ての設定をリセット</div>
              <div className="text-sm text-base-content/70">
                すべての設定をデフォルト値に戻します
              </div>
            </div>
            <button
              onClick={resetSettings}
              className="btn btn-outline btn-warning"
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // その他の設定コンポーネント
  const OtherSettings = ({ id }: { id: string }) => {
    const item = settingItems.find(item => item.id === id);
    
    // エディター設定の場合は専用コンポーネントを返す
    if (id === 'editor') {
      return <EditorSettings />;
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold mb-2">{item?.name}</h3>
          <p className="text-base-content/70 mb-4">
            この設定画面は開発中です
          </p>
          <div className="bg-base-200 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">予定されている機能:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              {id === 'language' && (
                <>
                  <li>表示言語切り替え</li>
                  <li>日時フォーマット設定</li>
                  <li>数値フォーマット設定</li>
                  <li>地域設定</li>
                </>
              )}
              {id === 'advanced' && (
                <>
                  <li>デバッグモード</li>
                  <li>パフォーマンス監視</li>
                  <li>ログレベル設定</li>
                  <li>実験的機能</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // 設定内容を表示
  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'gemini':
        return <GeminiSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <OtherSettings id={activeTab} />;
    }
  };

  // カテゴリー別にグループ化
  const groupedItems = {
    ai: settingItems.filter(item => item.category === 'ai'),
    general: settingItems.filter(item => item.category === 'general'),
    advanced: settingItems.filter(item => item.category === 'advanced')
  };

  // フルスクリーン設定画面が開いている場合
  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-base-100 z-50 flex">
        {/* 左側のナビゲーション */}
        <div className="w-80 bg-base-200 border-r border-base-300 flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h1 className="text-xl font-bold">設定</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm"
            >
              ✕
            </button>
          </div>
          
          {/* ナビゲーションリスト */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* AI設定 */}
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-3">
                  AI機能
                </h3>
                <div className="space-y-1">
                  {groupedItems.ai.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-content shadow-md'
                          : 'hover:bg-base-300'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-primary-content' : 'text-primary'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.description && (
                          <div className={`text-xs truncate ${
                            activeTab === item.id ? 'text-primary-content/70' : 'text-base-content/70'
                          }`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 一般設定 */}
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-3">
                  一般
                </h3>
                <div className="space-y-1">
                  {groupedItems.general.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-content shadow-md'
                          : 'hover:bg-base-300'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-primary-content' : 'text-base-content/70'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.description && (
                          <div className={`text-xs truncate ${
                            activeTab === item.id ? 'text-primary-content/70' : 'text-base-content/70'
                          }`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 高度な設定 */}
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-3">
                  高度な設定
                </h3>
                <div className="space-y-1">
                  {groupedItems.advanced.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-content shadow-md'
                          : 'hover:bg-base-300'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-primary-content' : 'text-base-content/70'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.description && (
                          <div className={`text-xs truncate ${
                            activeTab === item.id ? 'text-primary-content/70' : 'text-base-content/70'
                          }`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右側のコンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSettingsContent()}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 通常の設定ボタン
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className="mx-2 p-2 hover:bg-base-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center w-8 h-8"
        aria-expanded={isOpen}
        aria-label="設定を開く"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-gear w-4 h-4"
          viewBox="0 0 16 16"
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
        </motion.svg>
      </button>
    </div>
  );
}
