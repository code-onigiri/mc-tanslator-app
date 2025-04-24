import { translate } from "google-translate-api-x";
export async function POST(request) {
  const { text, from, to } = await request.json();
  let translatedText;

  try {
    if (from == "auto") {
      translatedText = await translate(text, { to: to });
    } else {
      translatedText = await translate(text, { from: from, to: to });
    }
  } catch (error) {
    console.error(error);
    return new Response("Error occurred", { status: 500 });
  }

  return new Response(translatedText.text);
}
