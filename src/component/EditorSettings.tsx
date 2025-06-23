import {
  useEditorSettingsStore,
  FONT_SIZE_OPTIONS,
  SIDEBAR_WIDTH_OPTIONS,
  SIDEBAR_TAB_OPTIONS
} from "./stores/EditorSettingsStore";

export default function EditorSettings() {
  // エディター設定ストアから状態と関数を取得
  const fontSize = useEditorSettingsStore((state) => state.fontSize);
  const setFontSize = useEditorSettingsStore((state) => state.setFontSize);
  
  const sidebarVisible = useEditorSettingsStore((state) => state.sidebarVisible);
  const setSidebarVisible = useEditorSettingsStore((state) => state.setSidebarVisible);
  const sidebarWidth = useEditorSettingsStore((state) => state.sidebarWidth);
  const setSidebarWidth = useEditorSettingsStore((state) => state.setSidebarWidth);
  const defaultSidebarTab = useEditorSettingsStore((state) => state.defaultSidebarTab);
  const setDefaultSidebarTab = useEditorSettingsStore((state) => state.setDefaultSidebarTab);
  
  const showLineNumbers = useEditorSettingsStore((state) => state.showLineNumbers);
  const setShowLineNumbers = useEditorSettingsStore((state) => state.setShowLineNumbers);
  const colorCodeToolbarDefaultVisible = useEditorSettingsStore((state) => state.colorCodeToolbarDefaultVisible);
  const setColorCodeToolbarDefaultVisible = useEditorSettingsStore((state) => state.setColorCodeToolbarDefaultVisible);
  const tagEditAreaVisible = useEditorSettingsStore((state) => state.tagEditAreaVisible);
  const setTagEditAreaVisible = useEditorSettingsStore((state) => state.setTagEditAreaVisible);
  
  const resetEditorSettings = useEditorSettingsStore((state) => state.resetEditorSettings);

  return (
    <div className="space-y-8">
      {/* フォント設定 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">フォント設定</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              フォントサイズ: {fontSize}px
            </label>
            <input
              type="range"
              min={FONT_SIZE_OPTIONS.min}
              max={FONT_SIZE_OPTIONS.max}
              step={FONT_SIZE_OPTIONS.step}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="range range-primary w-full"
            />
            <div className="flex justify-between text-xs text-base-content/70 mt-1">
              <span>{FONT_SIZE_OPTIONS.min}px</span>
              <span>{FONT_SIZE_OPTIONS.max}px</span>
            </div>
          </div>
          
          {/* フォントプレビュー */}
          <div className="mt-4 p-3 bg-base-100 rounded-lg">
            <div className="text-sm font-medium mb-2">プレビュー:</div>
            <div style={{ fontSize: `${fontSize}px` }} className="font-mono">
              This is a sample text. これはサンプルテキストです。
            </div>
          </div>
        </div>
      </div>

      {/* サイドバー設定 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">サイドバー設定</h3>
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
          {/* サイドバー表示切り替え */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">サイドバー表示</div>
              <div className="text-sm text-base-content/70">
                エディター右側のサイドバーの表示/非表示を切り替え
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={sidebarVisible}
              onChange={(e) => setSidebarVisible(e.target.checked)}
            />
          </div>

          {/* サイドバー幅設定 */}
          {sidebarVisible && (
            <div>
              <label className="block text-sm font-medium mb-2">
                サイドバー幅: {sidebarWidth}%
              </label>
              <input
                type="range"
                min={SIDEBAR_WIDTH_OPTIONS.min}
                max={SIDEBAR_WIDTH_OPTIONS.max}
                step={SIDEBAR_WIDTH_OPTIONS.step}
                value={sidebarWidth}
                onChange={(e) => setSidebarWidth(Number(e.target.value))}
                className="range range-primary w-full"
              />
              <div className="flex justify-between text-xs text-base-content/70 mt-1">
                <span>{SIDEBAR_WIDTH_OPTIONS.min}%</span>
                <span>{SIDEBAR_WIDTH_OPTIONS.max}%</span>
              </div>
            </div>
          )}

          {/* デフォルトタブ設定 */}
          {sidebarVisible && (
            <div>
              <label className="block text-sm font-medium mb-2">
                デフォルトタブ
              </label>
              <select
                value={defaultSidebarTab}
                onChange={(e) => setDefaultSidebarTab(e.target.value as 'glossary' | 'translator' | 'ai-translator')}
                className="select select-bordered w-full"
              >
                {SIDEBAR_TAB_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* エディター表示設定 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">エディター表示設定</h3>
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
          {/* 行番号表示 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">行番号表示</div>
              <div className="text-sm text-base-content/70">
                テキストエリアに行番号を表示
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
            />
          </div>

          {/* カラーコードツールバーデフォルト表示 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">カラーコードツールバー初期表示</div>
              <div className="text-sm text-base-content/70">
                エディター起動時にカラーコードツールバーを表示
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={colorCodeToolbarDefaultVisible}
              onChange={(e) => setColorCodeToolbarDefaultVisible(e.target.checked)}
            />
          </div>

          {/* タグ編集エリア表示 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">タグ編集エリア表示</div>
              <div className="text-sm text-base-content/70">
                タグ編集エリアの表示/非表示を切り替え
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={tagEditAreaVisible}
              onChange={(e) => setTagEditAreaVisible(e.target.checked)}
            />
          </div>
        </div>
      </div>


      {/* 設定リセット */}
      <div>
        <h3 className="text-lg font-semibold mb-4">設定リセット</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">エディター設定をリセット</div>
              <div className="text-sm text-base-content/70">
                すべてのエディター設定をデフォルト値に戻します
              </div>
            </div>
            <button
              onClick={resetEditorSettings}
              className="btn btn-outline btn-warning"
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}