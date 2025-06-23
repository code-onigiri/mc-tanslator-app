import { useMemo, useState, useEffect, useRef } from "react";
import { useediter } from "./stores/EditerStore";
import { useEditorSettingsStore } from "./stores/EditorSettingsStore";
import { translateData } from "../util/file/fileop";
import Glossary from "./Glossary";
import AITranslator from "./AITranslator";
import Translator from "./Translator";
import { useGlossaryStore } from "./stores/GlossaryStore";
import { useListStore } from "./stores/ListStore";
import toast from "react-hot-toast";
import { eventBus, REPLACE_EVENTS } from "../util/eventBus";
import ColorCodeText from "./ColorCodeText";
import ColorCodeToolbar from "./ColorCodeToolbar";
import { markKeyAsDeleted, unmarkKeyAsDeleted, permanentlyDeleteKey } from "../util/file/fileUpdate";

// テキストをハイライトする関数
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-warning text-warning-content">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

export default function Editer() {
  // エディター設定ストアから状態を取得
  const fontSize = useEditorSettingsStore((state) => state.fontSize);
  const sidebarVisible = useEditorSettingsStore((state) => state.sidebarVisible);
  const sidebarWidth = useEditorSettingsStore((state) => state.sidebarWidth);
  const defaultSidebarTab = useEditorSettingsStore((state) => state.defaultSidebarTab);
// const showLineNumbers = useEditorSettingsStore((state) => state.showLineNumbers);
  const colorCodeToolbarDefaultVisible = useEditorSettingsStore((state) => state.colorCodeToolbarDefaultVisible);
  const tagEditAreaVisible = useEditorSettingsStore((state) => state.tagEditAreaVisible);
  const initializeEditorSettings = useEditorSettingsStore((state) => state.initializeEditorSettings);

  // タブの状態管理（デフォルトタブから初期化）
  const [activeTab, setActiveTab] = useState<
    "glossary" | "translator" | "ai-translator"
  >(defaultSidebarTab);

  // カラーコードツールバーの表示状態（設定から初期化）
  const [showColorCodeToolbar, setShowColorCodeToolbar] = useState(colorCodeToolbarDefaultVisible);

  // テキストエリアの参照
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  // 置き換え用の状態
  const searchQuery = useListStore((state) => state.searchQuery);
  const replaceQuery = useListStore((state) => state.replaceQuery);

  // EditerStoreからのステート取得
  const key = useediter((state) => state.key);
  const sourceValue = useediter((state) => state.sourcevalue);
  const targetValue = useediter((state) => state.targetvalue);
  const setTargetValue = useediter((state) => state.setTargetValue);
  const tags = useediter((state) => state.tags);
  const setTags = useediter((state) => state.setTags);
  const isReplaceMode = useediter((state) => state.isReplaceMode);

  // タグ入力用の状態
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  // -1: 未選択, 0以上: 候補インデックス
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // ListStoreの更新
  const list = useListStore((state) => state.translate?.list);
  const setList = useListStore((state) => state.setTranslate);
  const setAllTags = useListStore((state) => state.setAllTags);
  const allTags = useListStore((state) => state.allTags);
  const tagFilter = useListStore((state) => state.tagFilter);
  const setTagFilter = useListStore((state) => state.setTagFilter);

  // fileop ストアからデータと更新関数を取得
  const fileTargetValue = translateData((state) => state.translateTarget);
  const setFileTargetValue = translateData((state) => state.settranslateTarget);

  // 用語集の取得
  const glossary = useGlossaryStore((state) => state.glossary);
  const setGlossary = useGlossaryStore((state) => state.setGlossary);

  // 原文・訳文に含まれる用語をフィルタリング
  const relevantGlossaryEntries = useMemo(() => {
    if ((!sourceValue && !targetValue) || !glossary.length) return [];

    return glossary.filter((entry) => {
      // 用語の前後が空白文字（またはテキストの先頭/末尾）かチェックする関数
      const isWholeWord = (text: string, word: string) => {
        const wordRegex = new RegExp(
          `(^|\\s)${word.toLowerCase()}($|\\s)`,
          "i",
        );
        return wordRegex.test(text.toLowerCase());
      };

      return (
        (sourceValue && isWholeWord(sourceValue, entry.key)) ||
        (targetValue && isWholeWord(targetValue, entry.key))
      );
    });
  }, [sourceValue, targetValue, glossary]);

  // 前回のタグ状態を保持するRef
  const prevTagsRef = useRef<string[]>([]);
  const prevKeyRef = useRef<string>("none");

  // エディター設定の初期化
  useEffect(() => {
    initializeEditorSettings();
  }, [initializeEditorSettings]);

  // デフォルトタブの変更を反映
  useEffect(() => {
    setActiveTab(defaultSidebarTab);
  }, [defaultSidebarTab]);

  // カラーコードツールバーのデフォルト表示設定を反映
  useEffect(() => {
    setShowColorCodeToolbar(colorCodeToolbarDefaultVisible);
  }, [colorCodeToolbarDefaultVisible]);

  // 置換モードを終了する関数
  const cancelReplaceMode = () => {
    // イベントバスを通してキャンセルを通知
    eventBus.emit(REPLACE_EVENTS.CANCEL_REPLACE_MODE);
  };


  // タグが変更されたらListStoreとfileopストアを更新する
  useEffect(() => {
    // タグまたはキーが実際に変更された場合のみ実行
    const tagsChanged = JSON.stringify(prevTagsRef.current) !== JSON.stringify(tags);
    const keyChanged = prevKeyRef.current !== key;
    
    if (key !== "none" && (tagsChanged || keyChanged) && list) {
      const updatedList = list.map(item =>
        item.key === key ? { ...item, tags: tags } : item
      );
      
      // ListStoreのリストを更新
      setList({ list: updatedList });

      // すべてのタグを再計算して更新
      const allTags = new Set<string>();
      updatedList.forEach(item => item.tags.forEach(tag => allTags.add(tag)));
      setAllTags(Array.from(allTags));

      // fileopストアのitemTagsも更新
      const itemTags = translateData.getState().itemTags || {};
      if (tags.length > 0) {
        itemTags[key] = tags;
      } else {
        delete itemTags[key];
      }
      translateData.getState().setItemTags(itemTags);

      // 前回の状態を更新
      prevTagsRef.current = [...tags];
      prevKeyRef.current = key;
    }
  }, [tags, key, setList, setAllTags]);

  // 現在の原文と翻訳文をそのまま用語集に追加する関数
  const addCurrentTextToGlossary = () => {
    if (sourceValue && targetValue) {
      // 既存の項目と重複チェック
      const existingItem = glossary.findIndex(
        (item) => item.key === sourceValue,
      );

      if (existingItem >= 0) {
        // 既存のアイテムがある場合は更新
        const updatedGlossary = [...glossary];
        updatedGlossary[existingItem] = {
          key: sourceValue,
          value: targetValue,
        };
        setGlossary(updatedGlossary);
        toast.success("用語集を更新しました！");
      } else {
        // 新規追加
        setGlossary([...glossary, { key: sourceValue, value: targetValue }]);
        toast.success("用語集に追加しました！");
      }
    } else {
      toast.error("原文と翻訳文の両方が必要です");
    }
  };

  // ユーザーが textarea を編集した時のハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTargetValue = e.target.value;

    // EditerStore 内の値を更新
    setTargetValue(newTargetValue);

    // 翻訳データが存在する場合、翻訳データストアも同時に更新
    if (fileTargetValue && key !== "none" && !isReplaceMode) {
      const updatedTargets = { ...fileTargetValue };
      updatedTargets[key] = newTargetValue;
      setFileTargetValue(updatedTargets);
    }
  };


  // 現在のアイテムを置換する関数
  const replaceCurrentItem = () => {
    // イベントバスを通して置換を通知
    eventBus.emit(REPLACE_EVENTS.REPLACE_CURRENT);
  };

  // 置換をスキップする関数
  const skipCurrentReplace = () => {
    // イベントバスを通してスキップを通知
    eventBus.emit(REPLACE_EVENTS.SKIP_CURRENT);
  };

  // カラーコード挿入機能
  const handleInsertColorCode = (code: string) => {
    if (textareaRef) {
      const start = textareaRef.selectionStart;
      const end = textareaRef.selectionEnd;
      const newValue = targetValue.substring(0, start) + code + targetValue.substring(end);
      
      // 値を更新
      setTargetValue(newValue);
      
      // 翻訳データが存在する場合、翻訳データストアも同時に更新
      if (fileTargetValue && key !== "none" && !isReplaceMode) {
        const updatedTargets = { ...fileTargetValue };
        updatedTargets[key] = newValue;
        setFileTargetValue(updatedTargets);
      }
      
      // カーソル位置を更新
      setTimeout(() => {
        if (textareaRef) {
          textareaRef.selectionStart = textareaRef.selectionEnd = start + code.length;
          textareaRef.focus();
        }
      }, 0);
    }
  };

  // 削除確認ダイアログの状態
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 項目を削除済みとしてマークする関数
  const handleMarkAsDeleted = () => {
    if (key !== "none") {
      markKeyAsDeleted(key);
      toast.success("項目を削除済みとしてマークしました");
      setShowDeleteDialog(false);
    }
  };

  // 削除済みマークを解除する関数
  const handleUnmarkAsDeleted = () => {
    if (key !== "none") {
      unmarkKeyAsDeleted(key);
      toast.success("削除済みマークを解除しました");
    }
  };

  // 項目を完全削除する関数
  const handlePermanentDelete = () => {
    if (key !== "none") {
      permanentlyDeleteKey(key);
      toast.success("項目を完全に削除しました");
      setShowDeleteDialog(false);
    }
  };

  // 削除済み項目かどうかを判定
  const isDeleted = tags.includes('deleted');

  // タブの内容をレンダリングする関数
  const renderTabContent = () => {
    switch (activeTab) {
      case "glossary":
        return <Glossary />;
      case "translator":
        return <Translator />;
      case "ai-translator":
        return <AITranslator />;
      default:
        return <Glossary />;
    }
  };

  // key が "none" の場合は何も表示しない
  if (key === "none") {
    return null;
  }

  return (
    <div className="flex flex-row bg-base-100 h-full">
      <div
        className={`${sidebarVisible ? `w-${100 - sidebarWidth}` : 'w-full'} rounded-sm p-2 flex flex-col overflow-y-auto max-h-full`}
        style={{
          width: sidebarVisible ? `${100 - sidebarWidth}%` : '100%',
          fontSize: `${fontSize}px`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-primary text-lg flex items-center">
            key:
            <span className="text-primary text-lg rounded-md px-3 py-1 bg-base-200 ml-2">
              {key}
            </span>
            {isDeleted && (
              <span className="badge badge-error badge-sm ml-2">削除済み</span>
            )}
          </div>
          
          {/* 削除ボタン */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline btn-error">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              削除
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64">
              {!isDeleted ? (
                <>
                  <li className="menu-title">
                    <span>削除オプション</span>
                  </li>
                  <li>
                    <a onClick={handleMarkAsDeleted} className="text-warning">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      削除済みとしてマーク
                      <div className="text-xs opacity-70">deletedタグを付けて保持</div>
                    </a>
                  </li>
                  <li>
                    <a onClick={() => setShowDeleteDialog(true)} className="text-error">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      完全削除
                      <div className="text-xs opacity-70">データから完全に削除</div>
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li className="menu-title">
                    <span>削除済み項目の操作</span>
                  </li>
                  <li>
                    <a onClick={handleUnmarkAsDeleted} className="text-success">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      削除マークを解除
                      <div className="text-xs opacity-70">deletedタグを削除</div>
                    </a>
                  </li>
                  <li>
                    <a onClick={() => setShowDeleteDialog(true)} className="text-error">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      完全削除
                      <div className="text-xs opacity-70">データから完全に削除</div>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        {/* タグ編集UI - Zennスタイルのインライン入力 */}
        {tagEditAreaVisible && (
        <div className="mt-2">
          <div className="text-sm text-base-content/70 mb-2">タグ:</div>
          <div className="relative">
            <div className="flex flex-wrap border border-base-300 leading-tight pt-3 pb-2 px-4 rounded-lg focus-within:border-primary bg-base-100">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-primary text-primary-content text-sm font-medium rounded mr-1 mb-1"
                >
                  <span className="py-1 px-2">{tag}</span>
                  <span
                    className="inline-flex items-center border-l border-primary-content/20 h-full cursor-pointer py-1 px-2 hover:bg-primary-focus"
                    onClick={() => {
                      const newTags = tags.filter((_, i) => i !== index);
                      setTags(newTags);
                      // タグフィルター解除ロジック
                      if (tagFilter.length > 0 && tagFilter.every(tag => !newTags.includes(tag))) {
                        setTagFilter([]);
                      }
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
              <input
                type="text"
                placeholder="タグを入力してTabで選択、Enterで決定..."
                className="flex-grow border-0 mb-1 outline-none bg-transparent min-w-32"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(e.target.value.length > 0);
                  setSelectedSuggestionIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  
                  const value = e.currentTarget.value.trim();
                  const filteredTags = allTags.filter(tag =>
                    tag.toLowerCase().includes(value.toLowerCase()) &&
                    !tags.includes(tag)
                  );
                  
                  // ArrowDown/ArrowUpで候補選択
                  if (e.key === 'ArrowDown' && showTagSuggestions && filteredTags.length > 0) {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev =>
                      prev < filteredTags.length - 1 ? prev + 1 : 0
                    );
                    return;
                  }
                  
                  if (e.key === 'ArrowUp' && showTagSuggestions && filteredTags.length > 0) {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev =>
                      prev > 0 ? prev - 1 : filteredTags.length - 1
                    );
                    return;
                  }
                  
                  // Tabで候補選択（未選択→0、以降+1、最後は0に戻る）
                  if (e.key === 'Tab' && showTagSuggestions && filteredTags.length > 0) {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev => {
                      if (prev === -1 || prev >= filteredTags.length - 1) return 0;
                      return prev + 1;
                    });
                    return;
                  }
                  
                  // Enterで選択中の候補を追加
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (showTagSuggestions && filteredTags.length > 0 && selectedSuggestionIndex !== -1) {
                      const selectedTag = filteredTags[selectedSuggestionIndex];
                      if (selectedTag && !tags.includes(selectedTag)) {
                        setTags([...tags, selectedTag]);
                        if (!allTags.includes(selectedTag)) {
                          setAllTags([...allTags, selectedTag]);
                        }
                      }
                      setTagInput('');
                      setShowTagSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                      return;
                    }
                    // 通常の新規タグ追加
                    if (value && !tags.includes(value)) {
                      setTags([...tags, value]);
                      if (!allTags.includes(value)) {
                        setAllTags([...allTags, value]);
                      }
                    }
                    setTagInput('');
                    setShowTagSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                    return;
                  }
                  
                  // Backspaceが押され、入力欄が空でタグがある場合、最後のタグを削除
                  if (e.key === 'Backspace' && !value.length && tags.length > 0) {
                    const newTags = [...tags];
                    newTags.splice(tags.length - 1, 1);
                    setTags(newTags);
                    // タグフィルター解除ロジック
                    if (tagFilter.length > 0 && tagFilter.every(tag => !newTags.includes(tag))) {
                      setTagFilter([]);
                    }
                    return;
                  }
                  
                  // Escで未選択状態に戻す
                  if (e.key === 'Escape') {
                    setSelectedSuggestionIndex(-1);
                    setShowTagSuggestions(false);
                  }
                }}
                onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              />
            </div>
            
            {/* オートコンプリート候補 */}
            {showTagSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {allTags
                  .filter(tag =>
                    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !tags.includes(tag)
                  )
                  .map((tag, index) => (
                    <div
                      key={tag}
                      className={`px-3 py-2 cursor-pointer text-sm ${
                        index === selectedSuggestionIndex
                          ? 'bg-primary text-primary-content'
                          : 'hover:bg-base-200'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag]);
                        }
                        setTagInput('');
                        setShowTagSuggestions(false);
                        setSelectedSuggestionIndex(-1);
                      }}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      #{tag}
                    </div>
                  ))
                }
                {tagInput.trim() && !allTags.some(tag => tag.toLowerCase() === tagInput.toLowerCase()) && (
                  <div className="px-3 py-1 text-xs text-base-content/50 border-t border-base-300">
                    Tabで選択、Enterで決定
                  </div>
                )}
              </div>
            )}
          </div>
       </div>
       )}
       <div className="mt-4 text-lg">原文:</div>
        <div className="text-lg rounded-md p-4 bg-base-200 w-full h-fit">
          <ColorCodeText text={sourceValue} />
        </div>
        <div className="mt-4 text-lg">翻訳文:</div>
        
        {isReplaceMode ? (
          // 置換モード時は差分表示
          <div className="flex flex-col gap-2">
        {/* 元のテキスト - エラーカラーでハイライト */}
        <div className="text-lg rounded-md p-4 bg-error/10 border border-error/20 w-full h-fit">
          <div dangerouslySetInnerHTML={{ 
            __html: targetValue.replace(
          new RegExp(searchQuery, 'gi'), 
          (match) => `<span class="bg-error/30 text-base-content font-bold">${match}</span>`
            )
          }} />
        </div>
        
        {/* 置換後のテキスト - 成功カラーでハイライト */}
        <div className="text-lg rounded-md p-4 bg-success/10 border border-success/20 w-full h-fit">
          <div dangerouslySetInnerHTML={{ 
            __html: targetValue.replace(
          new RegExp(searchQuery, 'gi'), 
          () => `<span class="bg-success/30 text-base-content font-bold">${replaceQuery}</span>`
            )
          }} />
        </div>
        
        {/* 置換操作ボタン */}
        <div className="flex justify-end gap-2 my-2">
          <button 
            className="btn btn-error btn-sm" 
            onClick={cancelReplaceMode}
          >
            キャンセル
          </button>
          <button 
            className="btn btn-warning btn-sm"
            onClick={skipCurrentReplace}
          >
            スキップ
          </button>
          <button 
            className="btn btn-success btn-sm"
            onClick={replaceCurrentItem}
          >
            置換
          </button>
        </div>
          </div>
        ) : (
          // 通常モードは編集可能なテキストエリアとプレビュー
          <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-base-content/70">翻訳文:</span>
          <button
            className="btn btn-xs btn-outline"
            onClick={() => setShowColorCodeToolbar(!showColorCodeToolbar)}
          >
            カラーコード{showColorCodeToolbar ? '非表示' : '表示'}
          </button>
        </div>
        
        {/* カラーコードツールバー */}
        {showColorCodeToolbar && (
          <ColorCodeToolbar
            onInsertCode={handleInsertColorCode}
            className="mb-2"
          />
        )}
        
        <textarea
          ref={setTextareaRef}
          className="text-lg rounded-md p-4 bg-base-200 w-full h-32 mb-2"
          value={targetValue}
          onChange={handleChange}
          placeholder="翻訳文を入力してください... (§を使ってカラーコードを追加できます)"
        />
        {/* カラーコードプレビュー */}
        {targetValue && (
          <div className="mt-2">
            <div className="text-sm text-base-content/70 mb-1">プレビュー:</div>
            <div className="text-lg rounded-md p-4 bg-base-100 border border-base-300 w-full min-h-[2rem]">
          <ColorCodeText text={targetValue} />
            </div>
          </div>
        )}
          </div>
        )}
        

        {/* 置換モード以外では用語集追加ボタンを表示 */}
        {!isReplaceMode && (
          <div className="mb-4">
        <button
          className="btn btn-primary w-full"
          onClick={addCurrentTextToGlossary}
          disabled={!sourceValue || !targetValue}
        >
          この原文と翻訳文を用語集に登録
        </button>
          </div>
        )}

        {/* 関連する用語集を表示 */}
        {relevantGlossaryEntries.length > 0 && !isReplaceMode && (
          <div className="mt-2 p-4 bg-base-200 rounded-md">
        <h3 className="text-md font-semibold mb-3">
          テキストに含まれる用語 ({relevantGlossaryEntries.length}件)
        </h3>
        <div className="max-h-60 overflow-y-auto">
          {relevantGlossaryEntries.map((item, index) => (
            <div
          key={index}
          className="mb-3 p-3 bg-base-100 rounded-md shadow-sm"
            >
          <div className="font-medium text-primary">
            {highlightText(item.key, item.key)}
          </div>
          <div className="mt-1 pl-2 text-sm">
            <span className="text-xs text-accent mr-1">訳:</span>
            {item.value}
          </div>
            </div>
          ))}
        </div>
          </div>
        )}
      </div>
      {sidebarVisible && (
      <div
        className="border-l border-base-300 flex flex-col"
        style={{ width: `${sidebarWidth}%` }}
      >
        {/* タブ切り替え部分 */}
        <div className="tabs tabs-boxed bg-base-200 mb-2 mx-2 mt-2">
          <a
            className={`tab ${activeTab === "glossary" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("glossary")}
          >
            用語集
          </a>
          <a
            className={`tab ${activeTab === "translator" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("translator")}
          >
            翻訳機能
          </a>
          <a
            className={`tab ${activeTab === "ai-translator" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("ai-translator")}
          >
            AI翻訳
          </a>
        </div>

        {/* タブに応じたコンポーネントを表示 */}
        <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
      </div>
      )}

      {/* 完全削除確認ダイアログ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-error">完全削除の確認</h3>
            <p className="mb-4">
              この項目を完全に削除しますか？
            </p>
            <div className="bg-warning/10 border border-warning/20 rounded p-3 mb-4">
              <div className="text-sm">
                <div className="font-semibold mb-1">削除される項目:</div>
                <div className="font-mono text-xs break-all">{key}</div>
              </div>
            </div>
            <div className="alert alert-error mb-4">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">この操作は取り消せません。データが完全に失われます。</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteDialog(false)}
              >
                キャンセル
              </button>
              <button
                className="btn btn-error"
                onClick={handlePermanentDelete}
              >
                完全削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
