import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeminiSettings, PromptTemplate, DEFAULT_GEMINI_SETTINGS } from '../../types/gemini';

interface GeminiStore {
  settings: GeminiSettings;
  promptTemplates: PromptTemplate[];
  selectedTemplateId: string | null;
  
  // 設定管理
  updateSettings: (newSettings: Partial<GeminiSettings>) => void;
  resetSettings: () => void;
  
  // プロンプトテンプレート管理
  addPromptTemplate: (template: Omit<PromptTemplate, 'id'>) => void;
  updatePromptTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  deletePromptTemplate: (id: string) => void;
  selectPromptTemplate: (id: string | null) => void;
  
  // バリデーション
  validateApiKey: () => boolean;
  isConfigured: () => boolean;
}

const defaultPromptTemplates: PromptTemplate[] = [
  {
    id: 'minecraft_general',
    name: 'Minecraft一般翻訳',
    template: 'あなたはMinecraft専門の翻訳者です。以下のMinecraftテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\nMinecraftの用語、アイテム名、ブロック名、エンチャント名、バイオーム名などは公式日本語版に合わせて翻訳してください。ゲームの文脈を理解して自然な翻訳を心がけてください。\n\n原文: {text}',
    description: 'Minecraft用語を考慮した一般的な翻訳',
    category: 'general'
  },
  {
    id: 'minecraft_items',
    name: 'Minecraftアイテム翻訳',
    template: 'あなたはMinecraftのアイテム名専門の翻訳者です。以下のMinecraftアイテムテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n公式の日本語化を最優先し、アイテムの機能や特徴を考慮した翻訳を行ってください。クラフト材料や用途も考慮してください。\n\n原文: {text}',
    description: 'Minecraftアイテム名の専門翻訳',
    category: 'technical'
  },
  {
    id: 'minecraft_commands',
    name: 'Minecraftコマンド翻訳',
    template: 'あなたはMinecraftコマンド専門の翻訳者です。以下のMinecraftコマンドテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\nコマンド構文(/give、/teleportなど)は絶対に変更せず、説明部分のみ翻訳してください。コマンドの機能と使用方法を正確に伝える翻訳を心がけてください。\n\n原文: {text}',
    description: 'Minecraftコマンドの説明文翻訳',
    category: 'technical'
  },
  {
    id: 'minecraft_dialogue',
    name: 'Minecraft会話翻訳',
    template: 'あなたはMinecraftの会話・ストーリー専門の翻訳者です。以下のMinecraft会話テキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\nキャラクター（村人、エンダーマン、プレイヤーなど）の個性や口調を考慮し、Minecraftの冒険的で親しみやすい世界観に合う翻訳を心がけてください。\n\n原文: {text}',
    description: 'Minecraftの会話・ストーリー翻訳',
    category: 'literary'
  }
];

export const useGeminiStore = create<GeminiStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_GEMINI_SETTINGS,
      promptTemplates: defaultPromptTemplates,
      selectedTemplateId: 'minecraft_general',

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      resetSettings: () => {
      set({
        settings: DEFAULT_GEMINI_SETTINGS,
        selectedTemplateId: 'minecraft_general'
      });
    },

      addPromptTemplate: (template) => {
        const id = `custom_${Date.now()}`;
        const newTemplate: PromptTemplate = { ...template, id };
        set((state) => ({
          promptTemplates: [...state.promptTemplates, newTemplate]
        }));
      },

      updatePromptTemplate: (id, template) => {
        set((state) => ({
          promptTemplates: state.promptTemplates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          )
        }));
      },

      deletePromptTemplate: (id) => {
        set((state) => ({
          promptTemplates: state.promptTemplates.filter((t) => t.id !== id),
          selectedTemplateId: state.selectedTemplateId === id ? 'minecraft_general' : state.selectedTemplateId
        }));
      },

      selectPromptTemplate: (id) => {
        set({ selectedTemplateId: id });
      },

      validateApiKey: () => {
        const { apiKey } = get().settings;
        return apiKey.length > 0 && apiKey.startsWith('AIza');
      },

      isConfigured: () => {
        const { validateApiKey } = get();
        return validateApiKey();
      }
    }),
    {
      name: 'gemini-store',
      partialize: (state) => ({
        settings: state.settings,
        promptTemplates: state.promptTemplates,
        selectedTemplateId: state.selectedTemplateId
      })
    }
  )
);