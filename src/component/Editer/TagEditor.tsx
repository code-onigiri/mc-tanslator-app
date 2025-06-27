import React from "react";

type TagEditorProps = {
  tags: string[];
  allTags: string[];
  tagInput: string;
  showTagSuggestions: boolean;
  selectedSuggestionIndex: number;
  tagFilter: string[];
  setTags: (tags: string[]) => void;
  setAllTags: (tags: string[]) => void;
  setTagFilter: (tags: string[]) => void;
  tagInputChange: (value: string) => void;
  setShowTagSuggestions: (show: boolean) => void;
  setSelectedSuggestionIndex: (index: number) => void;
};

export const TagEditor: React.FC<TagEditorProps> = ({
  tags,
  allTags,
  tagInput,
  showTagSuggestions,
  selectedSuggestionIndex,
  tagFilter,
  setTags,
  setAllTags,
  setTagFilter,
  tagInputChange,
  setShowTagSuggestions,
  setSelectedSuggestionIndex,
}) => (
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
            tagInputChange(e.target.value);
            setShowTagSuggestions(e.target.value.length > 0);
            setSelectedSuggestionIndex(-1);
          }}
          onKeyDown={(e) => {
            if ((e.nativeEvent as { isComposing: boolean }).isComposing) return;
            const value = e.currentTarget.value.trim();
            const filteredTags = allTags.filter(tag =>
              tag.toLowerCase().includes(value.toLowerCase()) &&
              !tags.includes(tag)
            );
            if (e.key === 'ArrowDown' && showTagSuggestions && filteredTags.length > 0) {
              e.preventDefault();
              setSelectedSuggestionIndex(
                selectedSuggestionIndex < filteredTags.length - 1 ? selectedSuggestionIndex + 1 : 0
              );
              return;
            }
            if (e.key === 'ArrowUp' && showTagSuggestions && filteredTags.length > 0) {
              e.preventDefault();
              setSelectedSuggestionIndex(
                selectedSuggestionIndex > 0 ? selectedSuggestionIndex - 1 : filteredTags.length - 1
              );
              return;
            }
            if (e.key === 'Tab' && showTagSuggestions && filteredTags.length > 0) {
              e.preventDefault();
              setSelectedSuggestionIndex(
                selectedSuggestionIndex === -1 || selectedSuggestionIndex >= filteredTags.length - 1
                  ? 0
                  : selectedSuggestionIndex + 1
              );
              return;
            }
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
                tagInputChange('');
                setShowTagSuggestions(false);
                setSelectedSuggestionIndex(-1);
                return;
              }
              if (value && !tags.includes(value)) {
                setTags([...tags, value]);
                if (!allTags.includes(value)) {
                  setAllTags([...allTags, value]);
                }
              }
              tagInputChange('');
              setShowTagSuggestions(false);
              setSelectedSuggestionIndex(-1);
              return;
            }
            if (e.key === 'Backspace' && !value.length && tags.length > 0) {
              const newTags = [...tags];
              newTags.splice(tags.length - 1, 1);
              setTags(newTags);
              if (tagFilter.length > 0 && tagFilter.every(tag => !newTags.includes(tag))) {
                setTagFilter([]);
              }
              return;
            }
            if (e.key === 'Escape') {
              setSelectedSuggestionIndex(-1);
              setShowTagSuggestions(false);
            }
          }}
          onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
          onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
        />
      </div>
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
                  tagInputChange('');
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
);