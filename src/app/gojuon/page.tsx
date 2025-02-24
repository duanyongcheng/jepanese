"use client";

import Link from "next/link";

export default function GojuonChart() {
  const rows = [
    {
      name: "清音",
      data: [
        { cells: ["あ (a) ア", "い (i) イ", "う (u) ウ", "え (e) エ", "お (o) オ", ""] },
        { cells: ["か (ka) カ", "き (ki) キ", "く (ku) ク", "け (ke) ケ", "こ (ko) コ", "きゃ (kya) キャ、きゅ (kyu) キュ、きょ (kyo) キョ"] },
        { cells: ["さ (sa) サ", "し (shi) シ", "す (su) ス", "せ (se) セ", "そ (so) ソ", "しゃ (sha) シャ、しゅ (shu) シュ、しょ (sho) ショ"] },
        { cells: ["た (ta) タ", "ち (chi) チ", "つ (tsu) ツ", "て (te) テ", "と (to) ト", "ちゃ (cha) チャ、ちゅ (chu) チュ、ちょ (cho) チョ"] },
        { cells: ["な (na) ナ", "に (ni) ニ", "ぬ (nu) ヌ", "ね (ne) ネ", "の (no) ノ", "にゃ (nya) ニャ、にゅ (nyu) ニュ、にょ (nyo) ニョ"] },
        { cells: ["は (ha) ハ", "ひ (hi) ヒ", "ふ (fu) フ", "へ (he) ヘ", "ほ (ho) ホ", "ひゃ (hya) ヒャ、ひゅ (hyu) ヒュ、ひょ (hyo) ヒョ"] },
        { cells: ["ま (ma) マ", "み (mi) ミ", "む (mu) ム", "め (me) メ", "も (mo) モ", "みゃ (mya) ミャ、みゅ (myu) ミュ、みょ (myo) ミョ"] },
        { cells: ["や (ya) ヤ", "", "ゆ (yu) ユ", "", "よ (yo) ヨ", ""] },
        { cells: ["ら (ra) ラ", "り (ri) リ", "る (ru) ル", "れ (re) レ", "ろ (ro) ロ", "りゃ (rya) リャ、りゅ (ryu) リュ、りょ (ryo) リョ"] },
        { cells: ["わ (wa) ワ", "", "", "", "を (wo) ヲ", ""] }
      ]
    },
    {
      name: "拨音",
      data: [
        { cells: ["ん (n) ン", "", "", "", "", ""] }
      ]
    },
    {
      name: "浊音",
      data: [
        { cells: ["が (ga) ガ", "ぎ (gi) ギ", "ぐ (gu) グ", "げ (ge) ゲ", "ご (go) ゴ", "ぎゃ (gya) ギャ、ぎゅ (gyu) ギュ、ぎょ (gyo) ギョ"] },
        { cells: ["ざ (za) ザ", "じ (ji) ジ", "ず (zu) ズ", "ぜ (ze) ゼ", "ぞ (zo) ゾ", "じゃ (ja) ジャ、じゅ (ju) ジュ、じょ (jo) ジョ"] },
        { cells: ["だ (da) ダ", "ぢ (ji) ヂ", "づ (zu) ヅ", "で (de) デ", "ど (do) ド", "ぢゃ (dya) ヂャ、ぢゅ (dyu) ヂュ、ぢょ (dyo) ヂョ"] },
        { cells: ["ば (ba) バ", "び (bi) ビ", "ぶ (bu) ブ", "べ (be) ベ", "ぼ (bo) ボ", "びゃ (bya) ビャ、びゅ (byu) ビュ、びょ (byo) ビョ"] }
      ]
    },
    {
      name: "半浊音",
      data: [
        { cells: ["ぱ (pa) パ", "ぴ (pi) ピ", "ぷ (pu) プ", "ぺ (pe) ペ", "ぽ (po) ポ", "ぴゃ (pya) ピャ、ぴゅ (pyu) ピュ、ぴょ (pyo) ピョ"] }
      ]
    }
  ];

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900 dark:text-white">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
            ← 返回练习
          </Link>
          <h1 className="text-3xl font-bold mb-6">五十音图</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 dark:border-gray-600"></th>
                <th className="border p-2 dark:border-gray-600">あ段</th>
                <th className="border p-2 dark:border-gray-600">い段</th>
                <th className="border p-2 dark:border-gray-600">う段</th>
                <th className="border p-2 dark:border-gray-600">え段</th>
                <th className="border p-2 dark:border-gray-600">お段</th>
                <th className="border p-2 dark:border-gray-600">拗音</th>
              </tr>
            </thead>
            {rows.map((section) => (
              <tbody key={section.name} className="border-t-2 border-gray-400 dark:border-gray-500">
                <tr>
                  <td colSpan={7} className="border p-2 font-bold dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                    {section.name}
                  </td>
                </tr>
                {section.data.map((row, index) => (
                  <tr key={index}>
                    <td className="border p-2 font-bold dark:border-gray-600 w-20 text-center">
                      {section.name === "拨音" ? "ん" : ""}
                    </td>
                    {row.cells.map((cell, i) => (
                      <td key={i} className="border p-2 dark:border-gray-600 text-center">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </main>
    </div>
  );
}