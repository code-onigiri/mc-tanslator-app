import { create } from "zustand";

interface editer {
  key: string;
  sourcevalue: string;
  targetvalue: string;
  setkey: (key: string) => void;
  setSourceValue: (sourcevalue: string) => void;
  setTargetValue: (targetvalue: string) => void;
}

export const editer = create<editer>((set) => ({
  key: "none",
  sourcevalue: "none",
  targetvalue: "none",
  setkey: (key: string) => set(() => ({ key: key })),
  setSourceValue: (sourcevalue: string) =>
    set(() => ({
      sourcevalue,
    })),
  setTargetValue: (targetvalue: string) => set(() => ({ targetvalue })),
}));

export default function Editer() {
  return (
    editer.getState().key !== "none" && (
      <div className="rounded-sm bg-base-100 h-full p-2">
        <div className="text-primary text-lg">
          key:
          <span className="text-primary text-lg rounded-md px-3 py-1 bg-base-200 w-10/12 h-fit">
            {editer((state) => state.key)}
          </span>
        </div>
        <div className="mt-4 text-lg">原文:</div>
        <div className="text-lg rounded-md p-4 bg-base-200 w-10/12 h-fit">
          {editer((state) => state.sourcevalue)}
        </div>
        <div className="mt-4 text-lg">翻訳文:</div>
        <textarea className="text-lg rounded-md p-4 bg-base-200 w-10/12 h-fit">
          {editer((state) => state.targetvalue)}
        </textarea>
      </div>
    )
  );
}
