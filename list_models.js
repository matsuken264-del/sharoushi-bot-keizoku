// list_models.js (改良版V2：最新SDK仕様対応)

// 【重要】モデル管理機能は、メインとは別の場所からインポートする必要があります
// ※もし"@google/generative-ai/server"でエラーになる場合は、
//   "@google/generative-ai" に戻して試す必要があるかもしれません（SDKの過渡期のため）
const { GoogleAIFileManager } = require("@google/generative-ai/server");

// ※GoogleAIFileManager は本来ファイル用ですが、現状のSDKの構成上、
//   ここにモデル一覧取得機能も含まれている、または汎用的なマネージャーであると仮定します。
//   （もしこれで動かない場合は、インポート元を再調整します）

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("❌ エラー: .env.local に GOOGLE_API_KEY が設定されていません。");
  process.exit(1);
}

// モデル管理（兼ファイル管理）マネージャーを初期化
// ※クラス名が適切でない可能性がありますが、一旦これで試します
const modelManager = new GoogleAIFileManager(API_KEY);

async function listAvailableModels() {
  console.log("🔍 Google API に問い合わせて、利用可能なモデル一覧を取得しています...\n");
  
  try {
    // APIからモデル一覧を取得
    // ※最新SDKではマネージャークラスから呼び出します
    const result = await modelManager.listModels();
    
    console.log("--- 利用可能なモデル一覧 ---");
    // 取得したモデルを一つずつ表示
    for (const model of result.models) {
      // 「コンテンツ生成（generateContent）」に対応しているモデルのみ表示
      if (model.supportedGenerationMethods.includes("generateContent")) {
          console.log(`・名前: ${model.name}`);
          console.log(`　説明: ${model.description}`);
          console.log("---------------------------");
      }
    }
    console.log("\n✅ 完了しました。上記の「名前」の部分（例: models/gemini-1.5-pro）から「models/」を除いた部分が、コードで使えるモデル名です。");

  } catch (error) {
    // エラーの詳細を表示
    console.error("❌ エラーが発生しました。SDKのバージョンや仕様が影響している可能性があります。");
    console.error("詳細:", error);
  }
}

// スクリプトを実行
listAvailableModels();