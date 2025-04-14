import { create } from "zustand";

interface editer {
  key: string;
  sourcevalue: string;
  targetvalue: string;
  setkey: (key: string) => void;
  setSourceValue: (sourcevalue: string) => void;
  setTargetValue: (targetvalue: string) => void;
}

export const useediter = create<editer>((set) => ({
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
