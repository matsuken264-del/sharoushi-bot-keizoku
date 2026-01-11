const fs = require('fs');

const content = `'use client';
import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.js\`;

export function ChatInterface() {
  const [messages, setMessages] = useState([{ role: "model", content: "【PDF機能追加】\\n左下のクリップ（📎）ボタンからPDFを読み込めます。" }]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const k = localStorage.getItem("gemini_api_key");
    if(k) setApiKey(k);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { alert("PDFのみ対応しています"); return; }
    setFileName(file.name);
    setIsReadingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item) => item.str).join(" ") + "\\n";
      }
      setPdfText(fullText);
      setMessages(p => [...p, { role: "system", content: \`📄 PDF「\${file.name}」を読み込みました。\`}]);
    } catch (error) {
      console.error(error);
      alert("読み込み失敗");
      setFileName("");
    } finally { setIsReadingPdf(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(p => [...p, { role: "user", content: userMsg }]);
    try {
      if (!apiKey) {
        setMessages(p => [...p, { role: "model", content: "APIキーを設定してください。" }]);
        return;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      let prompt = userMsg;
      if (pdfText) {
        prompt = \`以下の資料（PDF内容）に基づいて回答してください。\\n\\n【資料】\\n\${pdfText}\\n\\n【質問】\\n\${userMsg}\`;
      }
      const result = await model.generateContent(prompt);
      setMessages(p => [...p, { role: "model", content: result.response.text() }]);
    } catch (err) {
      setMessages(p => [...p, { role: "model", content: "エラー: " + err.message }]);
    }
  };

  return (
    <div style={{ backgroundColor: "#020617", color: "#f1f5f9", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "1px solid #1e293b", padding: "15px", display: "flex", justifyContent: "space-between", backgroundColor: "#0f172a" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>Gemini PDF Bot</h1>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>⚙️ 設定</button>
      </div>
      {showSettings && (
        <div style={{ padding: "15px", background: "#1e293b" }}>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: "100%", padding: "8px", background: "#020617", color: "#fff", border: "1px solid #475569", marginBottom: "10px" }} placeholder="API Key" />
          <button onClick={() => {localStorage.setItem("gemini_api_key", apiKey); setShowSettings(false);}} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "5px 15px", borderRadius: "4px", cursor: "pointer" }}>保存</button>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "12px 16px", borderRadius: "12px", backgroundColor: m.role === "user" ? "#2563eb" : (m.role === "system" ? "#0f172a" : "#1e293b"), color: "#f1f5f9", fontSize: "0.95rem", lineHeight: "1.6" }}>{m.content}</div>
        ))}
      </div>
      <div style={{ padding: "20px", borderTop: "1px solid #1e293b", backgroundColor: "#0f172a" }}>
        {fileName && <div style={{ marginBottom: "10px", fontSize: "0.9rem", color: "#94a3b8" }}>📄 {fileName} {isReadingPdf && "(読込中...)"} <button onClick={() => {setFileName(""); setPdfText("");}} style={{marginLeft:"10px", color:"#ef4444", border:"none", background:"none", cursor:"pointer"}}>✕</button></div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
          <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: "0 15px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1.2rem" }}>📎</button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="メッセージ..." style={{ flex: 1, padding: "14px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#f1f5f9", outline: "none" }} />
          <button type="button" onClick={handleSubmit} style={{ padding: "0 24px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>送信</button>
        </form>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/components/chat-interface.tsx', content);
console.log("SUCCESS: PDF機能を追加しました！");