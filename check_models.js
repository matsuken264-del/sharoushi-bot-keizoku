// check_models.js
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
  console.log("🔍 利用可能なモデルを問い合わせています...");
  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (data.error) {
      console.error("❌ APIキーエラー:", data.error.message);
    } else if (data.models) {
      console.log("✅ このキーで利用可能なモデル一覧:");
      data.models.forEach(model => {
        // generateContentに対応しているモデルだけ表示
        if (model.supportedGenerationMethods.includes("generateContent")) {
             console.log(` - ${model.name}`);
        }
      });
    } else {
      console.log("⚠️ モデルが見つかりませんでした。");
    }
  } catch (error) {
    console.error("通信エラー:", error);
  }
}

listModels();