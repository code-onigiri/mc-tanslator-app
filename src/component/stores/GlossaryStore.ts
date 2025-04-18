import { create } from "zustand";

interface Glossary {
  key: string;
  value: string;
}

interface GlossaryStore {
  glossary: Glossary[];
  setGlossary: (glossary: Glossary[]) => void;
}

export const useGlossaryStore = create<GlossaryStore>((set) => ({
  glossary: [],
  setGlossary: (glossary: Glossary[]) => set({ glossary }),
}));
