import React, { useState, useMemo } from 'react';
import {
  X,
  Target,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  BookOpen,
  Award,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface MinistryObjectivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonContext: { subject: string; grade: string; lessonTitle: string };
  onApplyObjectives: (objectives: { title: string; description: string }[]) => void;
}

export interface BehavioralObjective {
  id: string;
  category: 'cognitive' | 'skill' | 'affective';
  categoryLabel: string;
  title: string;
  description: string;
}

export const MinistryObjectivesModal: React.FC<MinistryObjectivesModalProps> = ({
  isOpen,
  onClose,
  lessonContext,
  onApplyObjectives,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableObjectives, setEditableObjectives] = useState<BehavioralObjective[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'cognitive' | 'skill' | 'affective'>('cognitive');

  const title = lessonContext.lessonTitle || 'الدرس النموذجي';
  const subject = lessonContext.subject || 'المبحث';
  const grade = lessonContext.grade || 'الصف الدراسي';

  // Generate initial contextual objectives based on subject & lesson title
  useMemo(() => {
    if (!isOpen) return;
    const generated: BehavioralObjective[] = [
      {
        id: 'obj-1',
        category: 'cognitive',
        categoryLabel: 'الأهداف المعرفية (الفهم والاستيعاب)',
        title: 'التعرف والاستيعاب المعرفي',
        description: `أن يتعرف الطالب إلى مفهوم (${title}) ومصطلحاته الأساسية في مبحث (${subject}) بدقة علمية وفق المعايير الوزارية.`,
      },
      {
        id: 'obj-2',
        category: 'cognitive',
        categoryLabel: 'الأهداف المعرفية (التحليل والاستنتاج)',
        title: 'التحليل والاستنتاج المنطقي',
        description: `أن يستنتج الطالب العلاقات والقواعد والخصائص المرتبطة بموضوع (${title}) ويحلل معطياتها بصورة صحيحة.`,
      },
      {
        id: 'obj-3',
        category: 'skill',
        categoryLabel: 'الأهداف المهارية والعملية (الأداء والتطبيق)',
        title: 'التطبيق العملي وحل المسائل',
        description: `أن يطبق الطالب المهارات العملية والتدريبات والأنشطة المرتبطة بدرس (${title}) بكفاءة وإتقان.`,
      },
      {
        id: 'obj-4',
        category: 'skill',
        categoryLabel: 'الأهداف المهارية (التواصل والتمثيل)',
        title: 'التواصل والتمثيل البصري واللفظي',
        description: `أن يمثل الطالب الأفكار والبيانات الخاصة بـ (${title}) لغوياً أو بصرياً ويعرضها بلغة عربية فصيحة.`,
      },
      {
        id: 'obj-5',
        category: 'affective',
        categoryLabel: 'الأهداف الوجدانية (القيم والمواطنة)',
        title: 'التقدير والربط بالبيئة والوطن',
        description: `أن يقدر الطالب أهمية (${title}) ويوظفها في خدمة بيئته المحلية والمجتمع الفلسطيني معتزاً بهويته الوطنية.`,
      },
    ];
    setEditableObjectives(generated);
  }, [isOpen, title, subject, grade]);

  if (!isOpen) return null;

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const catLabel =
      newCategory === 'cognitive'
        ? 'الأهداف المعرفية'
        : newCategory === 'skill'
        ? 'الأهداف المهارية'
        : 'الأهداف الوجدانية';

    const newObj: BehavioralObjective = {
      id: `obj-${Date.now()}`,
      category: newCategory,
      categoryLabel: catLabel,
      title: newTitle.trim() || 'هدف سلوكي معتمد',
      description: newDesc.trim(),
    };
    setEditableObjectives([...editableObjectives, newObj]);
    setNewTitle('');
    setNewDesc('');
  };

  const handleDeleteObjective = (id: string) => {
    setEditableObjectives(editableObjectives.filter((o) => o.id !== id));
  };

  const handleUpdateDescription = (id: string, newDescription: string) => {
    setEditableObjectives(
      editableObjectives.map((o) => (o.id === id ? { ...o, description: newDescription } : o))
    );
  };

  const handleApply = () => {
    const formatted = editableObjectives.map((o) => ({
      title: `${o.title} (${o.category === 'cognitive' ? 'معرفي' : o.category === 'skill' ? 'مهاري' : 'وجدانى'})`,
      description: o.description,
    }));
    onApplyObjectives(formatted);
    onClose();
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 text-right overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Top Header */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md border border-white/20">
              <Target className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-['Tajawal'] tracking-wide">
                  اقتراح وتحليل الأهداف التعليمية السلوكية الوزارية 🎯
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-2xs">
                  وفق المعايير الفلسطينية
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                مبحث: {subject} · الصف: {grade} · الدرس: {title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
            <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black block mb-0.5">موجّه المعلم الذكي للأهداف السلوكية:</strong>
              قامت المنظومة بتحليل موضوع الدرس والصف الدراسي واقترحت أدناه قائمة الأهداف المعرفية والمهارية والوجدانية المعتمدة وزارياً. يمكنك تعديل الصياغة أو إضافة أهداف جديدة قبل اعتمادها في الخطة.
            </div>
          </div>

          {/* Objectives List */}
          <div className="space-y-3">
            {editableObjectives.map((obj, index) => (
              <div
                key={obj.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 hover:border-emerald-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center tabular-nums">
                      {toArabicDigits(index + 1)}
                    </span>
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {obj.categoryLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteObjective(obj.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذا الهدف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={obj.description}
                  onChange={(e) => handleUpdateDescription(obj.id, e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
                  placeholder="اكتب صياغة الهدف السلوكي بدقة..."
                />
              </div>
            ))}
          </div>

          {/* Add Custom Objective Inline Form */}
          <form onSubmit={handleAddObjective} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>إضافة هدف سلوكي مخصص إضافي:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="cognitive">هدف معرفي</option>
                <option value="skill">هدف مهاري</option>
                <option value="affective">هدف وجداني</option>
              </select>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="عنوان الهدف (مثال: الاستنتاج والتطبيق)..."
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-hidden sm:col-span-2"
              />
            </div>

            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="نص الهدف السلوكي (مثال: أن يقارن الطالب بين... بدقة)..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newDesc.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة للقائمة</span>
              </button>
            </div>
          </form>

          {/* Apply Button Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-200" />
              <span>اعتماد وتطبيق الأهداف في الخطة ✨</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
