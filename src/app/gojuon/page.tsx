"use client";

import { GOJUON_DATA, GOJUON_ROWS } from "@/data/gojuon";
import Link from "next/link";

// 添加类型
type GojuonSound = keyof typeof GOJUON_DATA;

export default function GojuonChart() {
  // 获取所有行
  const rows = Object.entries(GOJUON_ROWS);

  const speak = (hiragana: string) => {
    const audio = new Audio(`/audio/${hiragana}.mp3`);
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900 dark:text-white">
      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
          >
            ← 返回练习
          </Link>
          <h1 className="text-3xl font-bold mb-6">五十音图</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 dark:border-gray-600">行</th>
                <th className="border p-2 dark:border-gray-600">あ段</th>
                <th className="border p-2 dark:border-gray-600">い段</th>
                <th className="border p-2 dark:border-gray-600">う段</th>
                <th className="border p-2 dark:border-gray-600">え段</th>
                <th className="border p-2 dark:border-gray-600">お段</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([rowName, sounds]) => (
                <tr key={rowName}>
                  <td className="border p-2 font-bold dark:border-gray-600 text-center">
                    {rowName}
                  </td>
                  {sounds.map((sound) => (
                    <td
                      key={sound}
                      className={`border p-2 dark:border-gray-600 ${
                        GOJUON_DATA[sound as GojuonSound]
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          : ""
                      }`}
                      onClick={() => {
                        if (GOJUON_DATA[sound as GojuonSound]) {
                          speak(GOJUON_DATA[sound as GojuonSound].hiragana);
                        }
                      }}
                    >
                      {GOJUON_DATA[sound as GojuonSound] && (
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {GOJUON_DATA[sound as GojuonSound].hiragana}
                          </div>
                          <div className="text-xl mb-1">
                            {GOJUON_DATA[sound as GojuonSound].katakana}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {GOJUON_DATA[sound as GojuonSound].romaji}
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
