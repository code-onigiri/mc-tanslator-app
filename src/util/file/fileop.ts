import { create } from "zustand";

interface JsonData {
  [key: string]: string;
}

interface translateDataType {
  translateSource: JsonData | null;
  translateTarget: JsonData | null;
}

const translateData = create<translateDataType>()((set) => ({
  translateSource: null,
  translateTarget: null,
  gettranslateSource: () =>
    translateData.getState().translateSource
      ? null
      : translateData.getState().translateSource,
  gettranslateTarget: () =>
    translateData.getState().translateTarget
      ? null
      : translateData.getState().translateTarget,
  settranslateSource: (data: JsonData) =>
    set(() => ({ translateSource: data })),
  settranslateTarget: (data: JsonData) =>
    set(() => ({ translateTarget: data })),
}));
