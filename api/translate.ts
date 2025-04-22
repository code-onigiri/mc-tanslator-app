import { translate } from "@vitalets/google-translate-api";
export const config = {
  maxDuration: 30, // 最大30秒の実行時間
};

export default async function handler(request: Request) {
  // POSTメソッド以外は許可しない
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { text, from, to } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await translate(text, {
      from: from || "auto",
      to: to || "en",
    });

    return new Response(
      JSON.stringify({
        translatedText: result.text,
        detectedLanguage: result.raw.src,
        raw: result.raw,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Translation error:", error);

    // レート制限エラーの特別処理
    if (error.name === "TooManyRequestsError") {
      return new Response(
        JSON.stringify({ error: "Too many requests, please try again later" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Failed to translate" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
