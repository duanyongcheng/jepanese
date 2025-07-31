"use client";

import { useState } from "react";
import { GOJUON_DATA, GOJUON_ROWS } from "@/data/gojuon";
import { useProgress } from "@/features/progress/hooks/useProgress";
import { KanaCard } from "@/features/progress/components/KanaCard";
import { ProgressDashboard } from "@/features/progress/components/Dashboard";
import Link from "next/link";

// Add this type near the top of the file
type GojuonRow = keyof typeof GOJUON_ROWS;
type GojuonSound = keyof typeof GOJUON_DATA;


export default function Home() {
  const [selectedRows, setSelectedRows] = useState<GojuonRow[]>([]);
  const [practiceQueue, setPracticeQueue] = useState<GojuonSound[]>([]);
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [hiraganaInput, setHiraganaInput] = useState('');
  const [katakanaInput, setKatakanaInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [showProgressIndicators, setShowProgressIndicators] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [practiceMode, setPracticeMode] = useState('browse'); // 'browse' | 'practice'
  const [practiceType, setPracticeType] = useState<'kana-to-romaji' | 'romaji-to-kana'>('kana-to-romaji');

  // 使用进度追踪系统
  const { progress, updateKanaProgress, getKanaStatus, getRecommendations, isLoading } = useProgress();

  // 获取选中行的所有音（按正常顺序）
  const getSelectedSounds = () => {
    const rowOrder = ["あ行", "か行", "さ行", "た行", "な行", "は行", "ま行", "や行", "ら行", "わ行", "ん"];
    return rowOrder
      .filter(row => selectedRows.includes(row as GojuonRow))
      .flatMap(row => GOJUON_ROWS[row as GojuonRow].filter(sound => sound !== "")) as GojuonSound[];
  };

  // 获取当前练习的假名
  const getCurrentKana = () => {
    if (practiceQueue.length === 0 || currentKanaIndex >= practiceQueue.length) return null;
    return practiceQueue[currentKanaIndex];
  };

  // 选择行的处理函数
  const handleRowSelect = (row: GojuonRow) => {
    setSelectedRows((prev) =>
      prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row]
    );
    // 重置练习状态
    resetPractice();
  };

  // 开始练习
  const startPractice = (type: 'kana-to-romaji' | 'romaji-to-kana') => {
    if (selectedRows.length === 0) return;
    
    setPracticeType(type);
    
    // 使用智能推荐或选中的音
    const sounds = selectedRows.length > 0 ? 
      getRecommendations(selectedRows).length > 0 ? 
        getRecommendations(selectedRows) : 
        getSelectedSounds() 
      : [];
    
    setPracticeQueue(shuffleArray(sounds));
    setCurrentKanaIndex(0);
    setUserInput('');
    setHiraganaInput('');
    setKatakanaInput('');
    setShowAnswer(false);
    setIsPracticeStarted(true);
    setPracticeMode('practice');
  };

  // 检查答案
  const checkAnswer = () => {
    const currentKana = getCurrentKana();
    if (!currentKana) return;

    const kanaData = GOJUON_DATA[currentKana];
    const userAnswer = userInput.trim().toLowerCase();
    let isCorrect = false;

    if (practiceType === 'kana-to-romaji') {
      // 假名→罗马音：检查罗马音是否正确
      isCorrect = userAnswer === kanaData.romaji.toLowerCase();
    } else {
      // 罗马音→假名：检查假名是否正确 (支持两个输入框)
      const hiraganaCorrect = hiraganaInput.trim() === kanaData.hiragana;
      const katakanaCorrect = katakanaInput.trim() === kanaData.katakana;
      
      // 只要有一个输入框正确就算对
      isCorrect = hiraganaCorrect || katakanaCorrect;
      
      // 如果两个都输入了，要求都正确
      if (hiraganaInput.trim() !== '' && katakanaInput.trim() !== '') {
        isCorrect = hiraganaCorrect && katakanaCorrect;
      }
    }
    
    // 根据答案质量评分 (0-5)
    const quality = isCorrect ? 4 : 1;
    
    // 更新进度
    updateKanaProgress(currentKana, { type: 'interact', quality });
    
    setShowAnswer(true);
    
    return isCorrect;
  };

  // 下一题
  const nextQuestion = () => {
    if (currentKanaIndex < practiceQueue.length - 1) {
      setCurrentKanaIndex(prev => prev + 1);
      setUserInput('');
      setHiraganaInput('');
      setKatakanaInput('');
      setShowAnswer(false);
    } else {
      // 练习完成
      completePractice();
    }
  };

  // 完成练习
  const completePractice = () => {
    setIsPracticeStarted(false);
    setPracticeMode('browse');
    setPracticeQueue([]);
    setCurrentKanaIndex(0);
    setUserInput('');
    setHiraganaInput('');
    setKatakanaInput('');
    setShowAnswer(false);
  };

  // 重置练习
  const resetPractice = () => {
    setIsPracticeStarted(false);
    setPracticeMode('browse');
    setPracticeQueue([]);
    setCurrentKanaIndex(0);
    setUserInput('');
    setHiraganaInput('');
    setKatakanaInput('');
    setShowAnswer(false);
  };

  // 浏览模式下的卡片点击
  const handleBrowseCardClick = (sound: GojuonSound) => {
    // 在浏览模式下，点击卡片记录曝光
    updateKanaProgress(sound, { type: 'expose' });
  };

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900 dark:text-white">
      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">假名练习</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {showDashboard ? '隐藏统计' : '显示统计'}
            </button>
            <button
              onClick={() => setShowProgressIndicators(!showProgressIndicators)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              {showProgressIndicators ? '隐藏进度' : '显示进度'}
            </button>
            <Link href="/gojuon" className="text-blue-500 hover:text-blue-600">
              查看五十音图
            </Link>
          </div>
        </div>

        {/* 进度仪表板 */}
        {showDashboard && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <ProgressDashboard />
          </div>
        )}

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

        {/* 练习控制按钮 */}
        <div className="flex gap-2 mb-8">
          {practiceMode === 'browse' ? (
            <>
              <button
                onClick={() => startPractice('kana-to-romaji')}
                className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={selectedRows.length === 0}
              >
                假名→罗马音
              </button>
              <button
                onClick={() => startPractice('romaji-to-kana')}
                className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={selectedRows.length === 0}
              >
                罗马音→假名
              </button>
            </>
          ) : (
            <button
              onClick={resetPractice}
              className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              退出练习
            </button>
          )}
        </div>

        {/* 练习区域 */}
        {practiceMode === 'practice' && isPracticeStarted ? (
          // 练习模式
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {practiceType === 'kana-to-romaji' ? '假名→罗马音' : '罗马音→假名'} | 
                题目 {currentKanaIndex + 1} / {practiceQueue.length}
              </div>
              
              {/* 显示问题 */}
              <div className="text-8xl mb-8 font-bold">
                {practiceType === 'kana-to-romaji' ? (
                  // 显示假名，让用户输入罗马音
                  <>
                    {getCurrentKana() && GOJUON_DATA[getCurrentKana()!].hiragana}
                    <div className="text-6xl mt-2">
                      {getCurrentKana() && GOJUON_DATA[getCurrentKana()!].katakana}
                    </div>
                  </>
                ) : (
                  // 显示罗马音，让用户输入假名
                  <div className="text-6xl">
                    {getCurrentKana() && GOJUON_DATA[getCurrentKana()!].romaji}
                  </div>
                )}
              </div>

              {/* 输入框 */}
              <div className="mb-6">
                {practiceType === 'kana-to-romaji' ? (
                  // 假名→罗马音：单个输入框
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !showAnswer) {
                        checkAnswer();
                      } else if (e.key === 'Enter' && showAnswer) {
                        nextQuestion();
                      }
                    }}
                    placeholder="输入对应的罗马音（如：ka）"
                    className="w-full p-4 text-xl text-center border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                    disabled={showAnswer}
                  />
                ) : (
                  // 罗马音→假名：双输入框
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                        平假名 (ひらがな)
                      </label>
                      <input
                        type="text"
                        value={hiraganaInput}
                        onChange={(e) => setHiraganaInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !showAnswer) {
                            checkAnswer();
                          } else if (e.key === 'Enter' && showAnswer) {
                            nextQuestion();
                          }
                        }}
                        placeholder="输入平假名（如：か）"
                        className="w-full p-4 text-xl text-center border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                        disabled={showAnswer}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                        片假名 (カタカナ)
                      </label>
                      <input
                        type="text"
                        value={katakanaInput}
                        onChange={(e) => setKatakanaInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !showAnswer) {
                            checkAnswer();
                          } else if (e.key === 'Enter' && showAnswer) {
                            nextQuestion();
                          }
                        }}
                        placeholder="输入片假名（如：カ）"
                        className="w-full p-4 text-xl text-center border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                        disabled={showAnswer}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 答案显示 */}
              {showAnswer && (
                <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div className="text-lg mb-2">
                    {getCurrentKana() && (() => {
                      const kanaData = GOJUON_DATA[getCurrentKana()!];
                      let isCorrect = false;
                      
                      if (practiceType === 'kana-to-romaji') {
                        isCorrect = userInput.trim().toLowerCase() === kanaData.romaji.toLowerCase();
                      } else {
                        // 罗马音→假名模式的评估
                        const hiraganaCorrect = hiraganaInput.trim() === kanaData.hiragana;
                        const katakanaCorrect = katakanaInput.trim() === kanaData.katakana;
                        
                        // 只要有一个输入框正确就算对
                        isCorrect = hiraganaCorrect || katakanaCorrect;
                        
                        // 如果两个都输入了，要求都正确
                        if (hiraganaInput.trim() !== '' && katakanaInput.trim() !== '') {
                          isCorrect = hiraganaCorrect && katakanaCorrect;
                        }
                      }
                      
                      return isCorrect ? (
                        <span className="text-green-500 font-bold">✓ 正确！</span>
                      ) : (
                        <span className="text-red-500 font-bold">✗ 错误</span>
                      );
                    })()}
                  </div>
                  <div className="text-xl">
                    {practiceType === 'kana-to-romaji' ? (
                      <>正确答案：{getCurrentKana() && GOJUON_DATA[getCurrentKana()!].romaji}</>
                    ) : (
                      <div className="space-y-2">
                        <div>正确答案：</div>
                        <div className="flex justify-center gap-8">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">平假名</div>
                            <div className="text-3xl font-bold">
                              {getCurrentKana() && GOJUON_DATA[getCurrentKana()!].hiragana}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">片假名</div>
                            <div className="text-3xl font-bold">
                              {getCurrentKana() && GOJUON_DATA[getCurrentKana()!].katakana}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 控制按钮 */}
              <div className="flex gap-4 justify-center">
                {!showAnswer ? (
                  <button
                    onClick={checkAnswer}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    disabled={
                      practiceType === 'kana-to-romaji' 
                        ? userInput.trim() === ''
                        : hiraganaInput.trim() === '' && katakanaInput.trim() === ''
                    }
                  >
                    检查答案
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    {currentKanaIndex < practiceQueue.length - 1 ? '下一题' : '完成练习'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // 浏览模式 - 显示假名卡片
          <div className="space-y-2">
            {["あ行", "か行", "さ行", "た行", "な行", "は行", "ま行", "や行", "ら行", "わ行", "ん"]
              .filter(row => selectedRows.includes(row as GojuonRow))
              .map((row) => (
                <div key={row} className="grid grid-cols-5 gap-2">
                  {GOJUON_ROWS[row as GojuonRow].map((sound, index) => (
                    sound ? (
                      <KanaCard
                        key={`${row}-${index}`}
                        kana={sound}
                        progress={progress?.kanaProgress[sound]}
                        onClick={() => handleBrowseCardClick(sound as GojuonSound)}
                        revealed={true} // 在浏览模式下总是显示
                        showProgressIndicator={showProgressIndicators}
                      />
                    ) : (
                      <div key={`${row}-${index}`} className="aspect-square"></div>
                    )
                  ))}
                </div>
              ))}
          </div>
        )}
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
