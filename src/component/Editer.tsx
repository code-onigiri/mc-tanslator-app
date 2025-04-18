import { useediter } from "./stores/EditerStore";
import { translateData } from "../util/file/fileop";
import Glossary from "./Glossary";

export default function Editer() {
  // EditerStoreからのステート取得
  const key = useediter((state) => state.key);
  const sourceValue = useediter((state) => state.sourcevalue);
  const targetValue = useediter((state) => state.targetvalue);
  const setTargetValue = useediter((state) => state.setTargetValue);

  // fileop ストアからデータと更新関数を取得
  const fileTargetValue = translateData((state) => state.translateTarget);
  const setFileTargetValue = translateData((state) => state.settranslateTarget);

  // ユーザーが textarea を編集した時のハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTargetValue = e.target.value;

    // EditerStore 内の値を更新
    setTargetValue(newTargetValue);

    // 翻訳データが存在する場合、翻訳データストアも同時に更新
    if (fileTargetValue && key !== "none") {
      const updatedTargets = { ...fileTargetValue };
      updatedTargets[key] = newTargetValue;
      setFileTargetValue(updatedTargets);
    }
  };

  // key が "none" の場合は何も表示しない
  if (key === "none") {
    return null;
  }

  return (
    <div className="flex flex-row bg-base-100 h-full">
      <div className="w-2/3 rounded-sm p-2 flex flex-col">
        <div className="text-primary text-lg">
          key:
          <span className="text-primary text-lg rounded-md px-3 py-1 bg-base-200 w-full h-fit">
            {key}
          </span>
        </div>
        <div className="mt-4 text-lg">原文:</div>
        <div className="text-lg rounded-md p-4 bg-base-200 w-full h-fit">
          {sourceValue}
        </div>
        <div className="mt-4 text-lg">翻訳文:</div>
        <textarea
          className="text-lg rounded-md p-4 bg-base-200 w-full h-fit"
          value={targetValue}
          onChange={handleChange}
        />
      </div>
      <div className="w-1/3">
        <Glossary />
      </div>
    </div>
  );
}
