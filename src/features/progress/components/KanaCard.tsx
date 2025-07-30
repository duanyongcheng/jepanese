import React from 'react';
import { KanaItem } from '../types/progress';

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
const RevealedContent = ({ kana }: { kana: string }) => <div>{kana}</div>;
const HiddenContent = ({ kana }: { kana: string }) => <div>?</div>;

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
