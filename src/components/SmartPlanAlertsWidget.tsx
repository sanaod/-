import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  BookOpen,
  Filter,
  Check,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { generateSmartPlanAlerts, SmartPlanAlert } from '../utils/smartPlanAlerts';
import { toArabicDigits } from '../utils/arabicNumerals';

interface SmartPlanAlertsWidgetProps {
  plans: LessonPlan[];
  onSelectPlan: (id: string) => void;
  onOpenEditor: () => void;
}

export const SmartPlanAlertsWidget: React.FC<SmartPlanAlertsWidgetProps> = ({
  plans,
  onSelectPlan,
  onOpenEditor,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'overdue' | 'urgent_today' | 'upcoming_soon'>('all');

  const alerts = useMemo(() => generateSmartPlanAlerts(plans), [plans]);

  const filteredAlerts = useMemo(() => {
    if (filterUrgency === 'all') return alerts;
    return alerts.filter((a) => a.urgency === filterUrgency);
  }, [alerts, filterUrgency]);

  const counts = useMemo(() => {
    return {
      total: alerts.length,
      overdue: alerts.filter((a) => a.urgency === 'overdue').length,
      urgentToday: alerts.filter((a) => a.urgency === 'urgent_today').length,
      upcoming: alerts.filter((a) => a.urgency === 'upcoming_soon').length,
    };
  }, [alerts]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 no-print">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-slate-900">
                نظام التنبيهات الذكي للمواعيد والخطط الأكاديمية
              </h3>
              {counts.total > 0 && (
                <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-xs font-black tabular-nums">
                  {toArabicDigits(counts.total)} تنبيه
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة آلية وتنبيهات ذكية بناءً على تواريخ تسليم وتنفيذ خطط الدروس والمهام الوزارية
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setFilterUrgency('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterUrgency === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({toArabicDigits(counts.total)})
          </button>
          <button
            onClick={() => setFilterUrgency('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterUrgency === 'overdue'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            متأخرة ({toArabicDigits(counts.overdue)})
          </button>
          <button
            onClick={() => setFilterUrgency('urgent_today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterUrgency === 'urgent_today'
                ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            مستحقة اليوم ({toArabicDigits(counts.urgentToday)})
          </button>
          <button
            onClick={() => setFilterUrgency('upcoming_soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterUrgency === 'upcoming_soon'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            قريبة القادم ({toArabicDigits(counts.upcoming)})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">لا توجد تنبيهات نشطة في هذا التصنيف</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            جميع خططك الدراسية مسجلة ضمن المواعيد النظامية المعتمدة. ممتاز! استمر في التميز.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredAlerts.map((alert) => {
            let badgeBg = 'bg-slate-100 text-slate-800 border-slate-300';
            let iconColor = 'text-slate-600';
            let IconComp = Clock;
            let cardBorder = 'border-slate-200 hover:border-slate-300';

            if (alert.urgency === 'overdue') {
              badgeBg = 'bg-rose-100 text-rose-900 border-rose-300';
              iconColor = 'text-rose-600';
              IconComp = ShieldAlert;
              cardBorder = 'border-rose-300 bg-rose-50/30 hover:border-rose-400';
            } else if (alert.urgency === 'urgent_today') {
              badgeBg = 'bg-amber-100 text-amber-950 border-amber-300';
              iconColor = 'text-amber-700';
              IconComp = AlertTriangle;
              cardBorder = 'border-amber-300 bg-amber-50/40 hover:border-amber-400';
            } else if (alert.urgency === 'upcoming_soon') {
              badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
              iconColor = 'text-emerald-700';
              IconComp = Calendar;
              cardBorder = 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300';
            }

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs ${cardBorder}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl bg-white shadow-2xs shrink-0 ${iconColor}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeBg}`}>
                          {alert.urgency === 'overdue' && '⚠️ متأخرة التنفيذ'}
                          {alert.urgency === 'urgent_today' && '🚨 مستحقة اليوم'}
                          {alert.urgency === 'upcoming_soon' && '⏳ قريباً جداً'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {alert.subject}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {alert.grade}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 font-['Tajawal']">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>تاريخ التنفيذ: {toArabicDigits(alert.dueDate)}</span>
                  </span>

                  <button
                    onClick={() => {
                      onSelectPlan(alert.planId);
                      onOpenEditor();
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  >
                    <span>فتح وتعديل الخطة</span>
                    <ArrowLeft className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
