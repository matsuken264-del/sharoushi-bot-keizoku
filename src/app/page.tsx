// src/app/page.js (UI全面刷新: ダークモード修正、音声読み上げ、新デザイン適用版)
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { generateAnswer } from './actions';
import { Send, Bot, User, Volume2, StopCircle, Loader2 } from 'lucide-react';

export default function Home() {
  // チャット履歴を管理するステート
  // 初期値として、AIからの挨拶を入れておく
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'ai',
      content: 'こんにちは！社労士AIアシスタント（Gemini 3 Pro Preview搭載）です。\n\nRAG（固定資料）とWeb検索を駆使して回答します。資料のアップロードも可能です。\n\n何かお手伝いできることはありますか？\n\n※個人情報の入力は行わないでください。'
    }
  ]);
  // 送信中のローディング状態
  const [isPending, startTransition] = useTransition();
  // 音声読み上げの状態管理
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const synthRef = useRef(null); // ブラウザの音声合成機能への参照

  // フォームの参照（送信後にリセットするため）
  const formRef = useRef(null);
  // チャット末尾へのスクロール用
  const messagesEndRef = useRef(null);

  // 初期化: 音声合成機能の取得と、アンマウント時の停止処理
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // --- 音声読み上げ機能 ---
  const handleSpeak = (text, messageId) => {
    if (!synthRef.current) return;

    // 既に話している場合は停止
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      if (speakingMessageId === messageId) {
        setSpeakingMessageId(null);
        return;
      }
    }

    // 新しく読み上げを開始
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; // 日本語に設定
    utterance.rate = 1.0; // 読み上げ速度
    
    utterance.onstart = () => setSpeakingMessageId(messageId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    synthRef.current.speak(utterance);
  };


  // --- 送信ハンドラ ---
  const handleSubmit = async (formData) => {
    const question = formData.get('question');
    const files = formData.getAll('files');
    if (!question?.trim() && files.length === 0) return;

    // 1. ユーザーのメッセージを即座に表示
    const userMessageId = Date.now().toString();
    const newUserMessage = {
      id: userMessageId,
      role: 'user',
      content: question,
      files: files.length > 0 ? Array.from(files).map(f => f.name) : []
    };
    setMessages(prev => [...prev, newUserMessage]);
    formRef.current?.reset(); // フォームをクリア

    // 2. Server Action を呼び出す（トランジションでラップしてローディング状態を管理）
    startTransition(async () => {
      // AIの仮メッセージを表示（ローディング中）
      const aiTempId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiTempId, role: 'ai', content: '考え中...', isLoading: true }]);

      try {
        const result = await generateAnswer(null, formData);
        
        // 仮メッセージを本物の回答に置き換える
        setMessages(prev => prev.map(msg => 
          msg.id === aiTempId 
            ? { id: aiTempId, role: 'ai', content: result.answer, isLoading: false }
            : msg
        ));

      } catch (error) {
        // エラー表示
        setMessages(prev => prev.map(msg => 
          msg.id === aiTempId 
            ? { id: aiTempId, role: 'ai', content: `エラーが発生しました: ${error.message}`, isLoading: false, isError: true }
            : msg
        ));
      }
    });
  };

  return (
    // 全体のコンテナ：ダークモード対応の背景色と文字色を設定
    <main className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      
      {/* ヘッダー */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-md z-10">
        <Bot className="w-8 h-8 text-blue-500 mr-3" />
        <h1 className="text-xl font-bold">社会保険・労働保険AIアシスタント (雇用保険・継続給付編)</h1>
      </header>

      {/* チャットエリア (スクロール可能) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AIのアバター */}
            {msg.role === 'ai' && (
              <div className="flex-shrink-0 mr-3">
                <div className={`p-2 rounded-full ${msg.isError ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'} dark:bg-gray-700`}>
                  <Bot className="w-6 h-6" />
                </div>
              </div>
            )}

            {/* メッセージの吹き出し */}
            <div
              className={`relative max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-tr-none' // ユーザー: 青背景
                  : 'bg-white dark:bg-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700' // AI: 白/グレー背景
              }`}
            >
              {/* ローディング表示 */}
              {msg.isLoading && (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  考え中...
                </div>
              )}

              {/* テキスト本文（改行を反映） */}
              {!msg.isLoading && (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              )}
              
              {/* 添付ファイル名表示（ユーザー側のみ） */}
              {msg.files && msg.files.length > 0 && (
                 <div className="mt-2 text-sm text-blue-200">
                   📎 {msg.files.join(', ')}
                 </div>
              )}

              {/* 音声読み上げボタン（AI側の回答完了時のみ表示） */}
              {msg.role === 'ai' && !msg.isLoading && !msg.isError && (
                <button
                  onClick={() => handleSpeak(msg.content, msg.id)}
                  className="absolute -bottom-8 left-0 p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  title="読み上げ"
                >
                  {speakingMessageId === msg.id ? (
                    <StopCircle className="w-5 h-5 animate-pulse text-blue-500" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* ユーザーのアバター */}
            {msg.role === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="p-2 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  <User className="w-6 h-6" />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* スクロール位置の目印 */}
      </div>

      {/* 入力エリア (固定フッター) */}
      <footer className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <form ref={formRef} action={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-3">
          
          {/* テキスト入力エリア */}
          <div className="relative flex items-center">
            <textarea
              name="question"
              placeholder="質問を入力してください..."
              rows="3"
              className="w-full p-3 pr-12 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 dark:text-gray-200"
              onKeyDown={(e) => {
                // Ctrl+Enter または Cmd+Enter で送信
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    formRef.current.requestSubmit();
                }
              }}
            />
            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isPending}
              className="absolute right-3 bottom-3 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* ファイル添付エリア */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
             <label htmlFor="file-upload" className="cursor-pointer flex items-center hover:text-blue-500">
                 <span className="mr-2">📎 追加資料を添付 (PDF):</span>
                 <input
                    id="file-upload"
                    type="file"
                    name="files"
                    accept="application/pdf"
                    multiple
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                 />
             </label>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
             Gemini 3 Pro Preview は誤った情報を生成する可能性があります。重要な情報は必ず元の資料で確認してください。また、個人情報の入力は行わないでください。(Ctrl + Enter で送信)
          </p>
        </form>
      </footer>
    </main>
  );
}