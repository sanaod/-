import React, { useState } from 'react';
import {
  GraduationCap,
  X,
  Check,
  Search,
  Sparkles,
  School,
  BookOpen,
  Compass,
} from 'lucide-react';
import { EDUCATIONAL_STAGES, EducationalStageGroup } from '../types/lessonPlan';

interface EducationalStagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
  title?: string;
}

export const EducationalStagePickerModal: React.FC<EducationalStagePickerModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  onSelectGrade,
  title = 'تحديد الصف لجميع المراحل التعليمية',
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredStages = EDUCATIONAL_STAGES.map((stage) => {
    const matchingGrades = stage.grades.filter((g) =>
      g.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    return {
      ...stage,
      grades: matchingGrades,
    };
  }).filter((stage) => {
    if (activeTab !== 'all' && stage.id !== activeTab) return false;
    return stage.grades.length > 0;
  });

  const handlePickGrade = (grade: string) => {
    onSelectGrade(grade);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      dir="rtl"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-l from-emerald-800 via-teal-700 to-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-emerald-100">
                اختر الصف الدراسي المعتمد من بين كافة المراحل (رياض أطفال، أساسي، وثانوي وتوجيهي)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Stage Filter Tabs */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن الصف (مثال: الثالث، السابع، العلمي، التوجيهي، تمهيدي)..."
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>

          {/* Educational Stage Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              جميع المراحل ({EDUCATIONAL_STAGES.reduce((acc, s) => acc + s.grades.length, 0)})
            </button>
            {EDUCATIONAL_STAGES.map((stage) => {
              const isSelected = activeTab === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveTab(stage.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {stage.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: Stage Groups and Grades */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {filteredStages.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <School className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">لم يتم العثور على صفوف تطابق بحثك</p>
              <p className="text-xs text-slate-400 mt-1">جرّب كلمة بحث أخرى أو تصفح المراحل أعلاه</p>
            </div>
          ) : (
            filteredStages.map((stage) => (
              <div
                key={stage.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${stage.badgeColor}`}
                    >
                      {stage.shortName}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {stage.grades.length} صفوف
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {stage.grades.map((gradeName) => {
                    const isCurrent =
                      selectedGrade === gradeName ||
                      selectedGrade.trim().toLowerCase() === gradeName.trim().toLowerCase();
                    return (
                      <button
                        key={gradeName}
                        type="button"
                        onClick={() => handlePickGrade(gradeName)}
                        className={`text-right p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between group ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-300 hover:text-emerald-950'
                        }`}
                      >
                        <span className="truncate">{gradeName}</span>
                        {isCurrent ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            اختيار
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>الصف المحدد حالياً:</span>
            <span className="font-bold text-slate-800 mr-1">
              {selectedGrade || 'لم يتم التحديد بعد'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
