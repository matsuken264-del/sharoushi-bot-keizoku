// upload_files.js (改良版V2：最新SDK仕様対応＆フォルダ自動スキャン)

// 【重要】ファイル管理機能は、メインとは別の場所からインポートする必要があります
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_API_KEY;
const STORAGE_DIR_NAME = 'pdf_storage'; // PDFを入れるフォルダ名

if (!API_KEY) {
  console.error("❌ エラー: .env.local に GOOGLE_API_KEY が設定されていません。");
  process.exit(1);
}

// 【重要】最新のSDKでは、このようにしてファイルマネージャーを初期化します
const fileManager = new GoogleAIFileManager(API_KEY);

// PDFフォルダの絶対パスを取得
const storageDirPath = path.join(__dirname, STORAGE_DIR_NAME);

/**
 * 指定されたフォルダからPDFファイルを探し、アップロードして、URIリストを生成するメイン関数
 */
async function uploadAllPdfsAndGenerateList() {
  console.log(`\n🚀 '${STORAGE_DIR_NAME}' フォルダ内のPDFを自動検出し、Google APIへアップロードします...`);

  // 1. フォルダの存在確認
  if (!fs.existsSync(storageDirPath)) {
    console.error(`\n❌ エラー: '${STORAGE_DIR_NAME}' フォルダが見つかりません。`);
    console.error(`👉 このスクリプトと同じ場所に '${STORAGE_DIR_NAME}' というフォルダを作成し、その中にPDFファイルを入れてください。`);
    return;
  }

  // 2. フォルダ内のファイル一覧を取得し、PDFのみに絞り込む
  const allFiles = fs.readdirSync(storageDirPath);
  const pdfFiles = allFiles.filter(file => file.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log(`\n⚠️ '${STORAGE_DIR_NAME}' フォルダ内に、拡張子が .pdf のファイルが見つかりませんでした。`);
    console.log("👉 PDFファイルをフォルダに入れてから、もう一度実行してください。");
    return;
  }

  console.log(`ℹ️ ${pdfFiles.length} 件のPDFファイルが見つかりました。アップロードを開始します。\n`);

  let successCount = 0;
  // 最終的に表示するURIリストの文字列
  let outputListString = "";

  // 3. 各PDFファイルを順番にアップロード
  for (const fileName of pdfFiles) {
    const filePath = path.join(storageDirPath, fileName);
    console.log(`--- Uploading: ${fileName} ---`);
    
    try {
      // ファイルをアップロード
      const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: "application/pdf",
        displayName: fileName, // ファイル名をそのまま表示名に使用
      });

      const fileUri = uploadResult.file.uri;
      console.log(`✅ 成功: ${fileName} -> ${fileUri}`);

      // コピペ用の文字列を作成
      outputListString += `  { uri: "${fileUri}", mimeType: "application/pdf" }, // ${fileName}\n`;
      successCount++;

    } catch (error) {
      console.error(`❌ 失敗: ${fileName} のアップロード中にエラーが発生しました。`);
      console.error(`   詳細: ${error.message}`);
      // 一つ失敗しても、他のファイルのアップロードを続行します
    }
    console.log("-------------------------------\n");
  }

  // 4. 最終結果の表示
  if (successCount > 0) {
    console.log(`\n🎉 --- 全ての処理が完了しました (${successCount}/${pdfFiles.length} 件成功) --- 🎉\n`);
    console.log("▼▼▼ 下のリストを src/app/actions.js の knowledgeBaseFiles の中にコピペしてください ▼▼▼\n");
    console.log(outputListString);
    console.log("▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲\n");
  } else {
    console.error("\n❌ 残念ながら、ファイルが一つもアップロードできませんでした。エラー内容を確認してください。");
  }
}

// メイン関数を実行
uploadAllPdfsAndGenerateList();