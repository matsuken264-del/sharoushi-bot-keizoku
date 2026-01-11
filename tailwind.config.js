// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSSを適用するファイルの場所を指定します
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        // 必要に応じてテーマを拡張できます（今回は特に設定しません）
    },
  },
  plugins: [
    // ▼▼▼▼ Markdownを綺麗に表示するためのプラグイン ▼▼▼▼
    require('@tailwindcss/typography'),
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  ],
};