import { PromptTemplate } from '../../types/gemini';

/**
 * プロンプトテンプレートのバリデーション
 */
export function validatePromptTemplate(template: string): { isValid: boolean; error?: string } {
  if (!template.trim()) {
    return { isValid: false, error: 'プロンプトテンプレートが空です' };
  }

  if (!template.includes('{text}')) {
    return { isValid: false, error: 'プロンプトテンプレートには{text}変数が必要です' };
  }

  if (!template.includes('{sourceLanguage}') || !template.includes('{targetLanguage}')) {
    return { isValid: false, error: 'プロンプトテンプレートには{sourceLanguage}と{targetLanguage}変数が必要です' };
  }

  return { isValid: true };
}

/**
 * プロンプトテンプレートのプレビューを生成
 */
export function generatePromptPreview(
  template: string,
  sourceLanguage: string = '英語',
  targetLanguage: string = '日本語',
  sampleText: string = 'Hello, how are you?'
): string {
  return template
    .replace(/{sourceLanguage}/g, sourceLanguage)
    .replace(/{targetLanguage}/g, targetLanguage)
    .replace(/{text}/g, sampleText);
}

/**
 * Minecraft専用プロンプトテンプレート
 */
export const MINECRAFT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'minecraft_general',
    name: 'Minecraft一般翻訳',
    template: 'minecraftのmodなどの翻訳です\n§*は装飾文字なので位置を考えて残してください\n%*は文字が入るので場所を考えて残してください\n\n以下のMinecraftテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n要求:\n1. 3つの翻訳候補を提供\n2. JSON形式で返答\n3. Minecraftの用語や文脈を考慮\n4. 各候補に信頼度(0.1-1.0)を付与\n5. 簡潔な説明を追加\n\n原文: {text}\n\nJSON形式で回答:\n{\n  "candidates": [\n    {"text": "翻訳候補1", "confidence": 0.9, "context": "説明"},\n    {"text": "翻訳候補2", "confidence": 0.8, "context": "説明"},\n    {"text": "翻訳候補3", "confidence": 0.7, "context": "説明"}\n  ]\n}',
    description: 'Minecraft用語を考慮した一般的な翻訳',
    category: 'general'
  },
  {
    id: 'minecraft_items',
    name: 'Minecraftアイテム翻訳',
    template: 'minecraftのmodなどの翻訳です\n§*は装飾文字なので位置を考えて残してください\n%*は文字が入るので場所を考えて残してください\n\n以下のMinecraftアイテムテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n要求:\n1. 3つの翻訳候補を提供\n2. JSON形式で返答\n3. 公式の日本語化を優先\n4. アイテムの機能や特徴を考慮\n5. 各候補に信頼度を付与\n\n原文: {text}\n\nJSON形式で回答:\n{\n  "candidates": [\n    {"text": "翻訳候補1", "confidence": 0.9, "context": "公式名称/機能説明"},\n    {"text": "翻訳候補2", "confidence": 0.8, "context": "代替名称/説明"},\n    {"text": "翻訳候補3", "confidence": 0.7, "context": "直訳/説明"}\n  ]\n}',
    description: 'Minecraftアイテム名の専門翻訳',
    category: 'technical'
  },
  {
    id: 'minecraft_commands',
    name: 'Minecraftコマンド翻訳',
    template: 'minecraftのmodなどの翻訳です\n§*は装飾文字なので位置を考えて残してください\n%*は文字が入るので場所を考えて残してください\n\n以下のMinecraftコマンドテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n要求:\n1. 3つの翻訳候補を提供\n2. JSON形式で返答\n3. コマンド構文は変更しない\n4. 説明部分のみ翻訳\n5. 各候補に信頼度を付与\n\n原文: {text}\n\nJSON形式で回答:\n{\n  "candidates": [\n    {"text": "翻訳候補1", "confidence": 0.9, "context": "コマンド説明"},\n    {"text": "翻訳候補2", "confidence": 0.8, "context": "代替説明"},\n    {"text": "翻訳候補3", "confidence": 0.7, "context": "詳細説明"}\n  ]\n}',
    description: 'Minecraftコマンドの説明文翻訳',
    category: 'technical'
  },
  {
    id: 'minecraft_dialogue',
    name: 'Minecraft会話翻訳',
    template: 'minecraftのmodなどの翻訳です\n§*は装飾文字なので位置を考えて残してください\n%*は文字が入るので場所を考えて残してください\n\n以下のMinecraft会話テキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n要求:\n1. 3つの翻訳候補を提供\n2. JSON形式で返答\n3. キャラクターの口調を考慮\n4. Minecraftの世界観に合わせる\n5. 各候補に信頼度を付与\n\n原文: {text}\n\nJSON形式で回答:\n{\n  "candidates": [\n    {"text": "翻訳候補1", "confidence": 0.9, "context": "口調・雰囲気の説明"},\n    {"text": "翻訳候補2", "confidence": 0.8, "context": "代替表現"},\n    {"text": "翻訳候補3", "confidence": 0.7, "context": "直訳調"}\n  ]\n}',
    description: 'Minecraftの会話・ストーリー翻訳',
    category: 'literary'
  }
];

/**
 * 専門分野別のプロンプトテンプレート例
 */
export const PROMPT_TEMPLATE_EXAMPLES: Record<string, PromptTemplate[]> = {
  minecraft: MINECRAFT_PROMPT_TEMPLATES,
  technical: [
    {
      id: 'programming',
      name: 'プログラミング文書',
      template: 'あなたはプログラミング専門の翻訳者です。以下のプログラミング関連文書を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n技術用語は正確に翻訳し、コードやAPIの名前はそのまま保持してください。\n\n原文: {text}\n\n翻訳:',
      description: 'プログラミング文書やAPI仕様書の翻訳',
      category: 'technical'
    },
    {
      id: 'scientific',
      name: '科学論文',
      template: 'あなたは科学論文専門の翻訳者です。以下の科学論文を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n専門用語は正確に翻訳し、学術的な表現を維持してください。\n\n原文: {text}\n\n翻訳:',
      description: '科学論文や研究文書の翻訳',
      category: 'technical'
    }
  ],
  business: [
    {
      id: 'formal_email',
      name: 'フォーマルメール',
      template: 'あなたはビジネスメール専門の翻訳者です。以下のビジネスメールを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n適切な敬語と丁寧な表現を使用し、ビジネスマナーを遵守してください。\n\n原文: {text}\n\n翻訳:',
      description: 'フォーマルなビジネスメールの翻訳',
      category: 'business'
    },
    {
      id: 'contract',
      name: '契約書',
      template: 'あなたは法務文書専門の翻訳者です。以下の契約書を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n法的用語は正確に翻訳し、契約の意味を変えないよう注意してください。\n\n原文: {text}\n\n翻訳:',
      description: '契約書や法務文書の翻訳',
      category: 'business'
    }
  ],
  literary: [
    {
      id: 'novel',
      name: '小説',
      template: 'あなたは文学作品専門の翻訳者です。以下の小説を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n原文の文体、雰囲気、キャラクターの個性を大切に翻訳してください。\n\n原文: {text}\n\n翻訳:',
      description: '小説や物語の翻訳',
      category: 'literary'
    },
    {
      id: 'poetry',
      name: '詩',
      template: 'あなたは詩専門の翻訳者です。以下の詩を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\nリズム、韻律、詩的表現を可能な限り保持しながら翻訳してください。\n\n原文: {text}\n\n翻訳:',
      description: '詩や韻文の翻訳',
      category: 'literary'
    }
  ],
  casual: [
    {
      id: 'chat',
      name: 'カジュアル会話',
      template: '以下のカジュアルな会話を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\n自然な会話調で、親しみやすい表現を使用してください。\n\n原文: {text}\n\n翻訳:',
      description: 'カジュアルな会話や日常的な文章の翻訳',
      category: 'general'
    },
    {
      id: 'social_media',
      name: 'SNS投稿',
      template: '以下のSNS投稿を{sourceLanguage}から{targetLanguage}に翻訳してください。\n\nSNSらしい簡潔で親しみやすい表現を使用してください。絵文字やハッシュタグがある場合は適切に処理してください。\n\n原文: {text}\n\n翻訳:',
      description: 'SNSの投稿やカジュアルなメッセージの翻訳',
      category: 'general'
    }
  ]
};

/**
 * カテゴリ別のプロンプトテンプレートを取得
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATE_EXAMPLES[category] || [];
}

/**
 * すべてのプロンプトテンプレート例を取得
 */
export function getAllTemplateExamples(): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATE_EXAMPLES).flat();
}

/**
 * プロンプトテンプレートをJSON形式でエクスポート
 */
export function exportPromptTemplates(templates: PromptTemplate[]): string {
  return JSON.stringify(templates, null, 2);
}

/**
 * JSON形式からプロンプトテンプレートをインポート
 */
export function importPromptTemplates(jsonString: string): { success: boolean; templates?: PromptTemplate[]; error?: string } {
  try {
    const templates = JSON.parse(jsonString);
    
    if (!Array.isArray(templates)) {
      return { success: false, error: '配列形式のJSONが必要です' };
    }

    // バリデーション
    for (const template of templates) {
      if (!template.id || !template.name || !template.template || !template.category) {
        return { success: false, error: 'テンプレートの形式が正しくありません' };
      }

      const validation = validatePromptTemplate(template.template);
      if (!validation.isValid) {
        return { success: false, error: `テンプレート "${template.name}": ${validation.error}` };
      }
    }

    return { success: true, templates };
  } catch {
    return { success: false, error: 'JSONの解析に失敗しました' };
  }
}