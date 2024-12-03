"use client";

import { useState } from "react";
import { GOJUON_DATA, GOJUON_ROWS } from "@/data/gojuon";
import Link from "next/link";

// Add this type near the top of the file
type GojuonRow = keyof typeof GOJUON_ROWS;
type GojuonSound = keyof typeof GOJUON_DATA;

// 修改发音函数
const speak = (sound: GojuonSound) => {
  const hiragana = GOJUON_DATA[sound].hiragana;
  const audio = new Audio(`/audio/${hiragana}.mp3`);
  audio.play().catch((err) => console.error("Error playing audio:", err));
};

export default function Home() {
  const [selectedRows, setSelectedRows] = useState<GojuonRow[]>([]);
  const [shuffledSounds, setShuffledSounds] = useState<GojuonSound[]>([]);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  // 选择行的处理函数
  const handleRowSelect = (row: GojuonRow) => {
    setSelectedRows((prev) =>
      prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row]
    );
  };

  // 开始练习
  const startPractice = () => {
    const sounds = selectedRows.flatMap(
      (row) => GOJUON_ROWS[row]
    ) as GojuonSound[];
    setShuffledSounds(shuffleArray(sounds));
    setRevealedCards(new Set());
  };

  // 修改卡片点击处理函数
  const revealCard = (sound: GojuonSound) => {
    if (revealedCards.has(sound)) {
      // 如果卡片已经翻开，则播放发音
      speak(sound);
    } else {
      // 否则翻开卡片
      setRevealedCards((prev) => new Set(prev).add(sound));
    }
  };

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900 dark:text-white">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">假名练习</h1>
          <Link href="/gojuon" className="text-blue-500 hover:text-blue-600">
            查看五十音图
          </Link>
        </div>
        {/* 行选择 */}
        <div className="mb-8">
          <h2 className="text-xl mb-4">选择要练习的行：</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GOJUON_ROWS).map((row) => (
              <button
                key={row}
                onClick={() => handleRowSelect(row as GojuonRow)}
                className={`px-4 py-2 rounded ${
                  selectedRows.includes(row as GojuonRow)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {row}
              </button>
            ))}
          </div>
        </div>

        {/* 开始练习按钮 */}
        <button
          onClick={startPractice}
          className="mb-8 px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={selectedRows.length === 0}
        >
          开始练习
        </button>

        {/* 练习区域 */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {shuffledSounds.map((sound) => (
            <div
              key={sound}
              onClick={() => revealCard(sound)}
              className="aspect-square border rounded flex items-center justify-center cursor-pointer dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {revealedCards.has(sound) ? (
                <div className="text-center">
                  <div className="text-2xl">{GOJUON_DATA[sound].hiragana}</div>
                  <div className="text-xl">{GOJUON_DATA[sound].katakana}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {GOJUON_DATA[sound].romaji}
                  </div>
                </div>
              ) : (
                <div className="text-xl">{GOJUON_DATA[sound].romaji}</div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// 数组随机排序函数
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
