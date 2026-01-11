// ▼▼▼ このファイルの「一番上」に設定を追加します ▼▼▼
// アプリ全体でタイムアウトを300秒（5分）に延長します。
export const maxDuration = 300;
// ▲▲▲ 追加ここまで ▲▲▲
import { Inter } from "next/font/google"; import "./globals.css"; const i=Inter({subsets:["latin"]}); export const metadata={title:"Gemini Chatbot",description:"AI Simulator"}; export default function RootLayout({children}){return(<html lang="en"><body className={i.className} style={{backgroundColor:"#020617",color:"#f1f5f9",minHeight:"100vh"}}>{children}</body></html>)}