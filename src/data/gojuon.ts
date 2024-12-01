// 完整的五十音图数据
export const GOJUON_DATA = {
  // あ行
  a: { hiragana: "あ", katakana: "ア", romaji: "a" },
  i: { hiragana: "い", katakana: "イ", romaji: "i" },
  u: { hiragana: "う", katakana: "ウ", romaji: "u" },
  e: { hiragana: "え", katakana: "エ", romaji: "e" },
  o: { hiragana: "お", katakana: "オ", romaji: "o" },

  // か行
  ka: { hiragana: "か", katakana: "カ", romaji: "ka" },
  ki: { hiragana: "き", katakana: "キ", romaji: "ki" },
  ku: { hiragana: "く", katakana: "ク", romaji: "ku" },
  ke: { hiragana: "け", katakana: "ケ", romaji: "ke" },
  ko: { hiragana: "こ", katakana: "コ", romaji: "ko" },

  // さ行
  sa: { hiragana: "さ", katakana: "サ", romaji: "sa" },
  si: { hiragana: "し", katakana: "シ", romaji: "si" },
  su: { hiragana: "す", katakana: "ス", romaji: "su" },
  se: { hiragana: "せ", katakana: "セ", romaji: "se" },
  so: { hiragana: "そ", katakana: "ソ", romaji: "so" },

  // た行
  ta: { hiragana: "た", katakana: "タ", romaji: "ta" },
  ti: { hiragana: "ち", katakana: "チ", romaji: "ti" },
  tu: { hiragana: "つ", katakana: "ツ", romaji: "tu" },
  te: { hiragana: "て", katakana: "テ", romaji: "te" },
  to: { hiragana: "と", katakana: "ト", romaji: "to" },

  // な行
  na: { hiragana: "な", katakana: "ナ", romaji: "na" },
  ni: { hiragana: "に", katakana: "ニ", romaji: "ni" },
  nu: { hiragana: "ぬ", katakana: "ヌ", romaji: "nu" },
  ne: { hiragana: "ね", katakana: "ネ", romaji: "ne" },
  no: { hiragana: "の", katakana: "ノ", romaji: "no" },

  // は行
  ha: { hiragana: "は", katakana: "ハ", romaji: "ha" },
  hi: { hiragana: "ひ", katakana: "ヒ", romaji: "hi" },
  fu: { hiragana: "ふ", katakana: "フ", romaji: "fu" },
  he: { hiragana: "へ", katakana: "ヘ", romaji: "he" },
  ho: { hiragana: "ほ", katakana: "ホ", romaji: "ho" },

  // ま行
  ma: { hiragana: "ま", katakana: "マ", romaji: "ma" },
  mi: { hiragana: "み", katakana: "ミ", romaji: "mi" },
  mu: { hiragana: "む", katakana: "ム", romaji: "mu" },
  me: { hiragana: "め", katakana: "メ", romaji: "me" },
  mo: { hiragana: "も", katakana: "モ", romaji: "mo" },

  // や行
  ya: { hiragana: "や", katakana: "ヤ", romaji: "ya" },
  yu: { hiragana: "ゆ", katakana: "ユ", romaji: "yu" },
  yo: { hiragana: "よ", katakana: "ヨ", romaji: "yo" },

  // ら行
  ra: { hiragana: "ら", katakana: "ラ", romaji: "ra" },
  ri: { hiragana: "り", katakana: "リ", romaji: "ri" },
  ru: { hiragana: "る", katakana: "ル", romaji: "ru" },
  re: { hiragana: "れ", katakana: "レ", romaji: "re" },
  ro: { hiragana: "ろ", katakana: "ロ", romaji: "ro" },

  // わ行
  wa: { hiragana: "わ", katakana: "ワ", romaji: "wa" },
  wo: { hiragana: "を", katakana: "ヲ", romaji: "wo" },
  n: { hiragana: "ん", katakana: "ン", romaji: "n" },
};

// 按行组织的数据
export const GOJUON_ROWS = {
  あ行: ["a", "i", "u", "e", "o"],
  か行: ["ka", "ki", "ku", "ke", "ko"],
  さ行: ["sa", "si", "su", "se", "so"],
  た行: ["ta", "ti", "tu", "te", "to"],
  な行: ["na", "ni", "nu", "ne", "no"],
  は行: ["ha", "hi", "fu", "he", "ho"],
  ま行: ["ma", "mi", "mu", "me", "mo"],
  や行: ["ya", "yu", "yo"],
  ら行: ["ra", "ri", "ru", "re", "ro"],
  わ行: ["wa", "wo", "n"],
};

// 类型定义
export type GojuonData = {
  hiragana: string;
  katakana: string;
  romaji: string;
};

export type GojuonDataMap = {
  [key: string]: GojuonData;
};

export type GojuonRows = {
  [key: string]: string[];
};
