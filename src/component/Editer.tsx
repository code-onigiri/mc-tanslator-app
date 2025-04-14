import { useediter } from "./stores/EditerStore";

export default function Editer() {
  // フックはコンポーネントのトップレベルで呼び出す
  const key = useediter((state) => state.key);
  const sourceValue = useediter((state) => state.sourcevalue);
  const targetValue = useediter((state) => state.targetvalue);

  // レンダリングは条件付きで行う
  if (key === "none") {
    return null; // または何も表示しない場合の代替UI
  }

  return (
    <div className="rounded-sm bg-base-100 h-full p-2">
      <div className="text-primary text-lg">
        key:
        <span className="text-primary text-lg rounded-md px-3 py-1 bg-base-200 w-10/12 h-fit">
          {key}
        </span>
      </div>
      <div className="mt-4 text-lg">原文:</div>
      <div className="text-lg rounded-md p-4 bg-base-200 w-10/12 h-fit">
        {sourceValue}
      </div>
      <div className="mt-4 text-lg">翻訳文:</div>
      <textarea
        className="text-lg rounded-md p-4 bg-base-200 w-10/12 h-fit"
        value={targetValue}
      ></textarea>
    </div>
  );
}
