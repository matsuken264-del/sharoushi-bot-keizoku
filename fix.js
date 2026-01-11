const fs = require('fs');

const content = `'use client';
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function ChatInterface() {
  const [messages, setMessages] = useState([{ role: "model", content: "【復旧完了】システムが正常に起動しました。画面は真っ黒（ダークモード）で見やすくなっているはずです。" }]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem("gemini_api_key");
    if(k) setApiKey(k);
  }, []);

  const saveKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setShowSettings(false);
    alert("APIキーを保存しました");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);

    try {
      if (!apiKey) {
        setMessages(p => [...p, { role: "model", content: "APIキーが設定されていません。右上の「設定」ボタンから入力してください。" }]);
        return;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(msg);
      setMessages(p => [...p, { role: "model", content: result.response.text() }]);
    } catch (err) {
      setMessages(p => [...p, { role: "model", content: "エラー: " + err.message }]);
    }
  };

  return (
    <div style={{ backgroundColor: "#000000", color: "#ffffff", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #333", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Gemini Chatbot (Dark Mode)</h1>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: "#333", color: "#fff", border: "1px solid #555", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}>
          ⚙️ 設定
        </button>
      </div>

      {/* Settings Area */}
      {showSettings && (
        <div style={{ padding: "15px", background: "#222", borderBottom: "1px solid #333" }}>
          <p style={{marginBottom: "5px"}}>Google API Key:</p>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            style={{ width: "100%", padding: "8px", background: "#000", color: "#fff", border: "1px solid #555", marginBottom: "10px" }}
          />
          <button onClick={saveKey} style={{ background: "#0066cc", color: "#fff", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: "4px" }}>保存</button>
        </div>
      )}

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === "user" ? "flex-end" : "flex-start", 
            maxWidth: "80%", 
            padding: "10px 15px", 
            borderRadius: "8px", 
            backgroundColor: m.role === "user" ? "#0066cc" : "#222", 
            color: "#fff",
            lineHeight: "1.5"
          }}>
            {m.content}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ padding: "20px", borderTop: "1px solid #333", backgroundColor: "#111", display: "flex", gap: "10px" }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="メッセージを入力..." 
          style={{ flex: 1, padding: "12px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#000", color: "#fff" }} 
        />
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#0066cc", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>送信</button>
      </form>
    </div>
  );
}`;

fs.writeFileSync('src/components/chat-interface.tsx', content);
console.log("SUCCESS: ファイルを正常に書き換えました！");