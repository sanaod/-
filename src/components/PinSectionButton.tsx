import React from 'react';
import { Pin, PinOff } from 'lucide-react';

interface PinSectionButtonProps {
  sectionId: string;
  sectionTitle?: string;
  isPinned: boolean;
  onToggle: (sectionId: string) => void;
  className?: string;
  variant?: 'light' | 'dark' | 'emerald' | 'amber';
  size?: 'sm' | 'md';
}

export const PinSectionButton: React.FC<PinSectionButtonProps> = ({
  sectionId,
  sectionTitle,
  isPinned,
  onToggle,
  className = '',
  variant = 'light',
  size = 'sm',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(sectionId);
  };

  const baseStyle =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs rounded-lg'
      : 'px-3 py-1.5 text-xs sm:text-sm rounded-xl';

  let colorStyle = '';
  if (isPinned) {
    colorStyle =
      'bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-sm hover:bg-amber-300 ring-2 ring-amber-400/40';
  } else {
    switch (variant) {
      case 'dark':
        colorStyle =
          'bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20';
        break;
      case 'emerald':
        colorStyle =
          'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 font-bold border border-emerald-500/40';
        break;
      case 'amber':
        colorStyle =
          'bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-300';
        break;
      case 'light':
      default:
        colorStyle =
          'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300';
        break;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 ${baseStyle} ${colorStyle} ${className}`}
      title={
        isPinned
          ? `إلغاء تثبيت هذا القسم (${sectionTitle || ''})`
          : `تثبيت هذا القسم (${sectionTitle || ''}) ليظل ظاهراً أمامك أثناء التمرير لأسفل`
      }
      aria-label={isPinned ? 'إلغاء تثبيت القسم' : 'تثبيت القسم'}
    >
      {isPinned ? (
        <>
          <Pin className="w-3.5 h-3.5 rotate-45 fill-slate-950 text-slate-950 shrink-0" />
          <span>قسم مُثبّت 📌</span>
        </>
      ) : (
        <>
          <Pin className="w-3.5 h-3.5 text-current shrink-0" />
          <span>تثبيت القسم 📌</span>
        </>
      )}
    </button>
  );
};
