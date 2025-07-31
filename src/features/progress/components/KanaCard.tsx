import React from 'react';
import { KanaItem } from '../types/progress';
import { GOJUON_DATA } from '@/data/gojuon';

interface KanaCardProps {
  kana: string;
  progress: KanaItem | undefined;
  onClick: () => void;
  revealed: boolean;
  showProgressIndicator: boolean;
}

// These would be more fleshed out components in a real app
const ConfidenceIndicator = ({ value }: { value: number }) => (
  <div className="w-4 h-4 rounded-full bg-blue-500" style={{ opacity: value }} />
);
const DueIndicator = ({ date }: { date: string }) => (
  <div className="w-4 h-4 rounded-full bg-red-500" />
);

const RevealedContent = ({ kana }: { kana: string }) => {
  const kanaData = GOJUON_DATA[kana as keyof typeof GOJUON_DATA];
  if (!kanaData) return <div>{kana}</div>;
  
  return (
    <div className="text-center">
      <div className="text-lg">{kanaData.hiragana}</div>
      <div className="text-lg">{kanaData.katakana}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {kanaData.romaji}
      </div>
    </div>
  );
};

const HiddenContent = ({ kana }: { kana: string }) => {
  const kanaData = GOJUON_DATA[kana as keyof typeof GOJUON_DATA];
  return (
    <div className="text-base">
      {kanaData?.romaji || kana}
    </div>
  );
};

export const KanaCard: React.FC<KanaCardProps> = ({ 
  kana, 
  progress, 
  onClick, 
  revealed,
  showProgressIndicator 
}) => {
  const { status, confidence } = progress || { status: 'new', confidence: 0 };
  
  const getCardStyle = () => {
    const baseStyle = "aspect-square border-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center text-4xl font-bold relative";
    
    if (!showProgressIndicator) return baseStyle + " border-gray-300 hover:border-gray-400";
    
    const statusStyles = {
      new: "border-gray-300 hover:border-gray-400",
      learning: "border-amber-400 bg-amber-50 hover:border-amber-500",
      reviewing: "border-blue-400 bg-blue-50 hover:border-blue-500",
      mastered: "border-green-400 bg-green-50 hover:border-green-500",
      suspended: "border-gray-200 bg-gray-100 opacity-50"
    };
    
    return `${baseStyle} ${statusStyles[status]}`;
  };
  
  const renderProgressBadge = () => {
    if (!showProgressIndicator || !progress) return null;
    
    return (
      <div className="absolute top-1 right-1 flex space-x-1">
        {progress.confidence > 0 && <ConfidenceIndicator value={progress.confidence} />}
        {progress.nextReview && new Date(progress.nextReview) < new Date() && <DueIndicator date={progress.nextReview} />}
      </div>
    );
  };
  
  return (
    <div 
      className={getCardStyle()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Kana card for ${kana}`}
    >
      {renderProgressBadge()}
      <div className="flex items-center justify-center h-full">
        {revealed ? (
          <RevealedContent kana={kana} />
        ) : (
          <HiddenContent kana={kana} />
        )}
      </div>
    </div>
  );
};
