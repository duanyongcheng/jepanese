"use client";

import Link from "next/link";

export default function GojuonChart() {
  const rows = [
    {
      name: "清音",
      data: [
        { name: "あ段", cells: ["あ (a) ア", "い (i) イ", "う (u) ウ", "え (e) エ", "お (o) オ"] },
        { name: "か行", cells: ["か (ka) カ", "き (ki) キ", "く (ku) ク", "け (ke) ケ", "こ (ko) コ"] },
        { name: "さ行", cells: ["さ (sa) サ", "し (shi) シ", "す (su) ス", "せ (se) セ", "そ (so) ソ"] },
        { name: "た行", cells: ["た (ta) タ", "ち (chi) チ", "つ (tsu) ツ", "て (te) テ", "と (to) ト"] },
        { name: "な行", cells: ["な (na) ナ", "に (ni) ニ", "ぬ (nu) ヌ", "ね (ne) ネ", "の (no) ノ"] },
        { name: "は行", cells: ["は (ha) ハ", "ひ (hi) ヒ", "ふ (fu) フ", "へ (he) ヘ", "ほ (ho) ホ"] },
        { name: "ま行", cells: ["ま (ma) マ", "み (mi) ミ", "む (mu) ム", "め (me) メ", "も (mo) モ"] },
        { name: "や行", cells: ["や (ya) ヤ", "", "ゆ (yu) ユ", "", "よ (yo) ヨ"] },
        { name: "ら行", cells: ["ら (ra) ラ", "り (ri) リ", "る (ru) ル", "れ (re) レ", "ろ (ro) ロ"] },
        { name: "わ行", cells: ["わ (wa) ワ", "", "", "", "を (wo) ヲ"] }
      ]
    },
    {
      name: "拨音",
      data: [
        { name: "ん", cells: ["ん (n) ン", "", "", "", ""] }
      ]
    },
    {
      name: "浊音",
      data: [
        { name: "が行", cells: ["が (ga) ガ", "ぎ (gi) ギ", "ぐ (gu) グ", "げ (ge) ゲ", "ご (go) ゴ"] },
        { name: "ざ行", cells: ["ざ (za) ザ", "じ (ji) ジ", "ず (zu) ズ", "ぜ (ze) ゼ", "ぞ (zo) ゾ"] },
        { name: "だ行", cells: ["だ (da) ダ", "ぢ (ji) ヂ", "づ (zu) ヅ", "で (de) デ", "ど (do) ド"] },
        { name: "ば行", cells: ["ば (ba) バ", "び (bi) ビ", "ぶ (bu) ブ", "べ (be) ベ", "ぼ (bo) ボ"] }
      ]
    },
    {
      name: "半浊音",
      data: [
        { name: "ぱ行", cells: ["ぱ (pa) パ", "ぴ (pi) ピ", "ぷ (pu) プ", "ぺ (pe) ペ", "ぽ (po) ポ"] }
      ]
    }
  ];

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900 dark:text-white">
      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
            ← 返回练习
          </Link>
          <h1 className="text-3xl font-bold mb-6">五十音图</h1>
        </div>

        <div className="overflow-x-auto">
          {rows.map((section) => (
            <div key={section.name} className="mb-8">
              <h2 className="text-xl font-bold mb-4">{section.name}</h2>
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
                  {section.data.map((row) => (
                    <tr key={row.name}>
                      <td className="border p-2 font-bold dark:border-gray-600 text-center">
                        {row.name}
                      </td>
                      {row.cells.map((cell, i) => (
                        <td key={i} className="border p-2 dark:border-gray-600 text-center">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
