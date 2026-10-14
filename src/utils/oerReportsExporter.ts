/**
 * OER Reports Exporter: PDF, Word (.doc), Excel (.csv with UTF-8 BOM), and Share Link
 * تصدير التقارير الرسمية الثلاثة بصيغ: PDF — Word — Excel — رابط مشاركة
 */

import { LessonPlan } from '../types/lessonPlan';
import { StudentCompetencyRecord, SchoolOerMetrics } from '../types/roleDashboards';
import { toArabicDigits, formatDateDMY } from './arabicNumerals';
import { exportToWord } from './exportUtils';

/**
 * Helper to download Blob file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =========================================================================
// 1. تقرير سجل متابعة كفايات الطلبة (Student Competencies Tracking Report)
// =========================================================================

/**
 * تصدير سجل كفايات الطلبة إلى Excel (.csv بترميز UTF-8 مع BOM لدعم العربية)
 */
export function exportStudentCompetenciesToExcel(
  records: StudentCompetencyRecord[],
  contextInfo?: { subject?: string; grade?: string; school?: string }
) {
  const BOM = '\uFEFF';
  const headers = [
    'الرقم',
    'اسم الطالب/ة',
    'الصف',
    'الشعبة',
    'المبحث',
    'رمز الكفاية',
    'عنوان الكفاية المستهدفة',
    'مستوى التمكن',
    'المؤشر السلوكي الملاحظ',
    'تاريخ الرصد',
    'ملاحظات المعلم/ة وخطة الدعم',
  ];

  const levelLabels: Record<string, string> = {
    mastered: 'متمكن 🟢',
    developing: 'في طور التمكن 🟡',
    needs_support: 'بحاجة دعم 🔴',
  };

  const rows = records.map((r, index) => [
    index + 1,
    `"${r.studentName}"`,
    `"${r.grade}"`,
    `"${r.section}"`,
    `"${r.subject}"`,
    `"${r.competencyCode}"`,
    `"${r.competencyTitle}"`,
    `"${levelLabels[r.masteryLevel] || r.masteryLevel}"`,
    `"${r.observedIndicator.replace(/"/g, '""')}"`,
    `"${formatDateDMY(r.assessmentDate)}"`,
    `"${(r.teacherNotes || '') + (r.supportPlanSuggested ? ' | الخطة: ' + r.supportPlanSuggested : '')}"`,
  ]);

  const csvContent =
    BOM +
    [
      `"سجل متابعة وتقييم كفايات الطلبة — وزارة التربية والتعليم العالي الفلسطينية"`,
      `"المدرسة: ${contextInfo?.school || 'مدرسة الرواد النموذجية'} | المبحث: ${contextInfo?.subject || 'كافة المباحث'} | الصف: ${contextInfo?.grade || 'كافة الصفوف'}"`,
      `"تاريخ التصدير: ${formatDateDMY(new Date().toISOString())}"`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\r\n');

  downloadFile(
    csvContent,
    `سجل_كفايات_الطلبة_${contextInfo?.subject || 'عام'}_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * تصدير سجل كفايات الطلبة إلى Word (.doc رسمي منسق)
 */
export function exportStudentCompetenciesToWord(
  records: StudentCompetencyRecord[],
  contextInfo?: { subject?: string; grade?: string; school?: string; teacherName?: string }
) {
  const levelLabels: Record<string, string> = {
    mastered: '<span style="color: #047857; font-weight: bold;">متمكن 🟢</span>',
    developing: '<span style="color: #b45309; font-weight: bold;">في طور التمكن 🟡</span>',
    needs_support: '<span style="color: #b91c1c; font-weight: bold;">بحاجة دعم 🔴</span>',
  };

  const masteredCount = records.filter((r) => r.masteryLevel === 'mastered').length;
  const developingCount = records.filter((r) => r.masteryLevel === 'developing').length;
  const needsSupportCount = records.filter((r) => r.masteryLevel === 'needs_support').length;

  const htmlDoc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>سجل متابعة كفايات الطلبة</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Calibri', 'Arial', sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111;
    margin: 15mm;
  }
  .header-box { text-align: center; border-bottom: 2pt solid #047857; padding-bottom: 8pt; margin-bottom: 12pt; }
  h1 { font-size: 16pt; color: #047857; margin: 2pt 0; }
  h2 { font-size: 13pt; color: #0f172a; margin: 4pt 0; }
  .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
  .summary-table td { border: 1pt solid #cbd5e1; padding: 6pt; background-color: #f8fafc; font-size: 11pt; }
  .data-table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
  .data-table th, .data-table td { border: 1pt solid #475569; padding: 5pt 7pt; font-size: 10.5pt; text-align: right; }
  .data-table th { background-color: #047857; color: #ffffff; font-weight: bold; }
  .data-table tr:nth-child(even) { background-color: #f8fafc; }
  .badge-mastered { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2pt 5pt; border-radius: 4pt; }
  .footer { margin-top: 20pt; text-align: left; font-size: 10pt; color: #64748b; }
</style>
</head>
<body>
  <div class="header-box">
    <div style="font-size: 11pt; font-weight: bold;">دولة فلسطين 🇵🇸 — وزارة التربية والتعليم العالي</div>
    <h1>سجل المتابعة والرصد الدوري لكفايات الطلبة</h1>
    <div style="font-size: 10.5pt; color: #475569;">
      المدرسة: ${contextInfo?.school || 'مدرسة الرواد النموذجية'} | المبحث: ${contextInfo?.subject || 'الرياضيات'} | الصف: ${contextInfo?.grade || 'الصف الثالث الأساسي'}
    </div>
    <div style="font-size: 10pt; color: #64748b; margin-top: 4pt;">
      اسم المعلم/ة: ${contextInfo?.teacherName || 'الأستاذ عبد الرحمن دويكات'} | تاريخ التقرير: ${formatDateDMY(new Date().toISOString())}
    </div>
  </div>

  <table class="summary-table">
    <tr>
      <td width="25%"><strong>إجمالي الطلبة المرصودين:</strong> ${toArabicDigits(records.length)}</td>
      <td width="25%"><strong style="color: #047857;">متمكن:</strong> ${toArabicDigits(masteredCount)} (${Math.round((masteredCount / (records.length || 1)) * 100)}%)</td>
      <td width="25%"><strong style="color: #b45309;">في طور التمكن:</strong> ${toArabicDigits(developingCount)} (${Math.round((developingCount / (records.length || 1)) * 100)}%)</td>
      <td width="25%"><strong style="color: #b91c1c;">بحاجة دعم ومساندة:</strong> ${toArabicDigits(needsSupportCount)} (${Math.round((needsSupportCount / (records.length || 1)) * 100)}%)</td>
    </tr>
  </table>

  <table class="data-table">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="20%">اسم الطالب/ة</th>
        <th width="12%">الصف والشعبة</th>
        <th width="23%">الكفاية ومؤشر الأداء الملاحظ</th>
        <th width="15%">مستوى التمكن</th>
        <th width="25%">ملاحظات المعلم وتوجيهات الدعم</th>
      </tr>
    </thead>
    <tbody>
      ${records
        .map(
          (r, idx) => `
        <tr>
          <td align="center">${toArabicDigits(idx + 1)}</td>
          <td><strong>${r.studentName}</strong></td>
          <td>${r.grade} (${r.section})</td>
          <td>
            <div style="font-weight: bold; color: #047857;">${r.competencyTitle}</div>
            <div style="font-size: 9.5pt; color: #334155;">${r.observedIndicator}</div>
          </td>
          <td>${levelLabels[r.masteryLevel] || r.masteryLevel}</td>
          <td>
            <div>${r.teacherNotes || '—'}</div>
            ${r.supportPlanSuggested ? `<div style="font-size: 9.5pt; color: #b91c1c; margin-top: 2pt;"><strong>خطة الدعم:</strong> ${r.supportPlanSuggested}</div>` : ''}
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    تم تصدير هذا السجل آلياً عبر منظومة عبقور للتخطيط التربوي المعتمدة.
  </div>
</body>
</html>
  `;

  downloadFile(
    htmlDoc,
    `سجل_متابعة_كفايات_الطلبة_${new Date().toISOString().slice(0, 10)}.doc`,
    'application/msword;charset=utf-8;'
  );
}

// =========================================================================
// 2. تقرير إحصائيات استخدام المصادر المفتوحة OER في المدرسة (School Stats)
// =========================================================================

/**
 * تصدير إحصائيات استخدام المصادر المفتوحة إلى Excel (.csv بترميز UTF-8 مع BOM)
 */
export function exportSchoolOerStatsToExcel(metrics: SchoolOerMetrics) {
  const BOM = '\uFEFF';
  const csvRows = [
    `"تقرير إحصائيات تطبيق التعليم المستند إلى مصادر التعليم المفتوحة (OER) بالمدرسة"`,
    `"المدرسة: ${metrics.schoolName} | المديرية: ${metrics.directorate} | العام الدراسي: ${metrics.academicYear}"`,
    `"تاريخ التقرير: ${formatDateDMY(new Date().toISOString())}"`,
    '',
    `"المؤشر العام","القيمة المحققة","التقييم الوزاري"`,
    `"نسبة التزام المدرسة بتطبيق OER","${metrics.schoolCommitmentRate}%","ممتاز ومطابق للمعايير"`,
    `"نسبة تغطية الصفوف 1-4 الأساسية","${metrics.grades1To4CoverageRate}%","أولوية وطنية أولى"`,
    `"إجمالي خطط الدروس المنتجة بالمدرسة","${metrics.totalPlansCount} خطة","مكتملة ومعتمدة"`,
    `"عدد المعلمين المطبقين لمنهجية OER","${metrics.activeOerTeachers} من ${metrics.totalTeachers} معلماً","مشاركة فاعلة"`,
    `"المصادر المفتوحة الفريدة المستثمرة","${metrics.totalUniqueResourcesCount} مصدراً معتمداً","تنوع مصدري ثلاثي"`,
    `"المصادر المضافة ذاتياً من المعلمين","${metrics.selfAddedResourcesCount} مصدراً نوعياً","إثراء للمكتبة المدرسية"`,
    `"استخدام البوابة التعليمية elearn.edu.ps (أولوية 1)","${metrics.primaryOerUsageCount} مرة","المرجع الصفي الأساسي"`,
    `"استخدام منصة روافد التفاعلية (بديل 1)","${metrics.alternative1UsageCount} مرة","بدائل بصرية وتفاعلية"`,
    `"استخدام منصة منهاجي والمحسوسات (بديل 2)","${metrics.alternative2UsageCount} مرة","بدائل ورقية للتعلم دون نت"`,
    '',
    `"توزيع التغطية حسب الصفوف الدراسية"`,
    `"الصف الدراسي","عدد الخطط","نسبة التغطية","تصنيف المرحلة"`,
    ...metrics.gradeCoverageBreakdown.map(
      (g) => `"${g.grade}","${g.plansCount}","${g.coveragePct}%","${g.isPrimaryStage ? 'المرحلة الأساسية الأولى (١-٤)' : 'الصفوف العليا'}"`
    ),
    '',
    `"الاتجاه الزمني للإنتاجية والالتزام الفصلي"`,
    `"الشهر الدراسي","عدد الخطط المنتجة","نسبة الالتزام بالمعايير"`,
    ...metrics.monthlyTrends.map((m) => `"${m.monthName}","${m.plansCreated}","${m.adherenceRate}%"`),
  ];

  downloadFile(
    BOM + csvRows.join('\r\n'),
    `تقرير_احصائيات_التعليم_المفتوح_المدرسي_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * تصدير إحصائيات استخدام المصادر المفتوحة إلى Word (.doc رسمي لمدير المدرسة)
 */
export function exportSchoolOerStatsToWord(metrics: SchoolOerMetrics) {
  const htmlDoc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>تقرير إحصائيات التعليم المفتوح OER في المدرسة</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Calibri', 'Arial', sans-serif;
    font-size: 12.5pt;
    line-height: 1.5;
    color: #111;
    margin: 15mm;
  }
  .header-box { text-align: center; border-bottom: 2pt solid #ea580c; padding-bottom: 8pt; margin-bottom: 12pt; }
  h1 { font-size: 17pt; color: #ea580c; margin: 2pt 0; }
  .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 14pt; }
  .kpi-table td { border: 1.5pt solid #ea580c; padding: 8pt; background-color: #fff7ed; vertical-align: top; }
  .kpi-title { font-size: 11pt; color: #9a3412; font-weight: bold; }
  .kpi-value { font-size: 20pt; font-weight: bold; color: #ea580c; margin: 4pt 0; }
  table.data-table { width: 100%; border-collapse: collapse; margin-top: 8pt; margin-bottom: 14pt; }
  table.data-table th, table.data-table td { border: 1pt solid #475569; padding: 6pt 8pt; font-size: 11pt; text-align: right; }
  table.data-table th { background-color: #c2410c; color: #ffffff; font-weight: bold; }
  table.data-table tr:nth-child(even) { background-color: #f8fafc; }
</style>
</head>
<body>
  <div class="header-box">
    <div style="font-size: 11pt; font-weight: bold;">دولة فلسطين 🇵🇸 — وزارة التربية والتعليم العالي</div>
    <h1>تقرير مؤشرات تطبيق التعليم المستند إلى مصادر التعليم المفتوحة (OER)</h1>
    <div style="font-size: 11pt; color: #475569;">
      المدرسة: ${metrics.schoolName} | المديرية: ${metrics.directorate} | العام الدراسي: ${metrics.academicYear}
    </div>
    <div style="font-size: 10pt; color: #64748b; margin-top: 3pt;">
      تقرير رسمي معتمد للمديرية والإشراف التربوي — صادر بتاريخ: ${formatDateDMY(new Date().toISOString())}
    </div>
  </div>

  <table class="kpi-table">
    <tr>
      <td width="33%">
        <div class="kpi-title">نسبة التزام المدرسة بمنهجية OER</div>
        <div class="kpi-value">${toArabicDigits(metrics.schoolCommitmentRate)}%</div>
        <div style="font-size: 9.5pt; color: #475569;">الربط الصارم بثلاثي المصادر والكفايات</div>
      </td>
      <td width="33%">
        <div class="kpi-title">تغطية الصفوف الأساسية (١–٤)</div>
        <div class="kpi-value">${toArabicDigits(metrics.grades1To4CoverageRate)}%</div>
        <div style="font-size: 9.5pt; color: #475569;">وفق دليل المعلم الصادر عن الوزارة</div>
      </td>
      <td width="33%">
        <div class="kpi-title">المعلمون المطبقون للتعليم المفتوح</div>
        <div class="kpi-value">${toArabicDigits(metrics.activeOerTeachers)} / ${toArabicDigits(metrics.totalTeachers)}</div>
        <div style="font-size: 9.5pt; color: #475569;">مشاركة الهيئة التدريسية المعتمدة</div>
      </td>
    </tr>
  </table>

  <h3 style="color: #9a3412; border-bottom: 1pt solid #fdba74; padding-bottom: 3pt;">١. مصفوفة تغطية الصفوف الدراسية الأساسية</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>الصف الدراسي</th>
        <th>عدد الخطط المنجزة</th>
        <th>نسبة التغطية</th>
        <th>التصنيف البيداغوجي</th>
      </tr>
    </thead>
    <tbody>
      ${metrics.gradeCoverageBreakdown
        .map(
          (g) => `
        <tr>
          <td><strong>${g.grade}</strong></td>
          <td>${toArabicDigits(g.plansCount)} خطة</td>
          <td><strong style="color: #c2410c;">${toArabicDigits(g.coveragePct)}%</strong></td>
          <td>${g.isPrimaryStage ? '⭐ المرحلة المستهدفة بدليل OER (صفوف ١-٤)' : 'الصفوف العليا'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h3 style="color: #9a3412; border-bottom: 1pt solid #fdba74; padding-bottom: 3pt;">٢. توزيع استثمار مصادر التعلم المفتوحة OER بالمدرسة</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>مصدر التعلم المعتمد</th>
        <th>الجهة والمنصة الرسمية</th>
        <th>تكرار التوظيف الصفي</th>
        <th>الأهمية البيداغوجية</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>المصدر الرئيسي (الكتاب المدرسي ودليل المعلم)</strong></td>
        <td>البوابة التعليمية elearn.edu.ps</td>
        <td>${toArabicDigits(metrics.primaryOerUsageCount)} حصة</td>
        <td>المرجع الأساسي للشرح والأنشطة الإلزامية</td>
      </tr>
      <tr>
        <td><strong>المصدر البديل الأول (المحاكاة والأنشطة الرقمية)</strong></td>
        <td>منصة روافد التعليمية rawafed.edu.ps</td>
        <td>${toArabicDigits(metrics.alternative1UsageCount)} حصة</td>
        <td>معالجة تمايز القدرات والتعلم البصري</td>
      </tr>
      <tr>
        <td><strong>المصدر البديل الثاني (أوراق عمل ومحسوسات محلية)</strong></td>
        <td>منصة منهاجي ومكتبة المحتوى</td>
        <td>${toArabicDigits(metrics.alternative2UsageCount)} حصة</td>
        <td>استمرار التعلم ورقياً وملموساً دون إنترنت</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 30pt; display: flex; justify-content: space-between; text-align: center;">
    <div style="float: right; width: 45%;">
      <strong>توقيع واعتماد مدير/ة المدرسة:</strong><br><br>
      ...........................................
    </div>
    <div style="float: left; width: 45%;">
      <strong>خاتم المدرسة الرسمي:</strong><br><br>
      [ ......................................... ]
    </div>
  </div>
</body>
</html>
  `;

  downloadFile(
    htmlDoc,
    `تقرير_احصائيات_التعليم_المفتوح_المدرسي_${new Date().toISOString().slice(0, 10)}.doc`,
    'application/msword;charset=utf-8;'
  );
}

// =========================================================================
// 3. تقرير خطة الدرس بصيغة معتمدة رسمياً (Official Lesson Plan)
// =========================================================================

/**
 * تصدير خطة الدرس الرسمية إلى Excel (.csv بترميز UTF-8 مع BOM)
 */
export function exportOfficialPlanToExcel(plan: LessonPlan) {
  const BOM = '\uFEFF';
  const h = plan.header;

  const csvRows = [
    `"استمارة تحضير درس معتمدة رسمياً — وزارة التربية والتعليم العالي الفلسطينية"`,
    `"عنوان الدرس: ${h.lessonTitle || plan.title}"`,
    `"المبحث: ${h.subject} | الصف: ${h.grade} | الشعبة: ${h.section || 'أ'}"`,
    `"المعلم/ة: ${h.teacherName} | المدرسة: ${h.school} | المديرية: ${h.directorate}"`,
    `"العام الدراسي: 2025/2026م | الفصل: ${h.semester || 'الأول'} | الفترة: ${h.timeframe || h.date || '—'}"`,
    '',
    `"الكفايات التكاملية المستهدفة"`,
    `"المجال / النوع","الكفاية","الوصف ومؤشر الأداء"`,
    ...(plan.section1?.integrativeCompetencies || []).map(
      (c) => `"كفاية عامة / تخصصية","${c.title}","${c.description}"`
    ),
    '',
    `"مصادر التعليم المفتوحة المعتمدة (ثلاثي المصادر OER)"`,
    `"الرتبة","اسم المصدر","المنصة والجهة","الرابط / نوع المصدر"`,
  ];

  if (plan.oerData?.activities) {
    plan.oerData.activities.forEach((act, i) => {
      if (act.primaryResource) {
        csvRows.push(
          `"نشاط ${i + 1} - رئيسي","${act.primaryResource.title}","البوابة التعليمية elearn.edu.ps","${act.primaryResource.directUrl || act.primaryResource.type}"`
        );
      }
      if (act.alternativeResource1) {
        csvRows.push(
          `"نشاط ${i + 1} - بديل 1","${act.alternativeResource1.title}","منصة روافد التعليمية","${act.alternativeResource1.directUrl || act.alternativeResource1.type}"`
        );
      }
      if (act.alternativeResource2) {
        csvRows.push(
          `"نشاط ${i + 1} - بديل 2","${act.alternativeResource2.title}","منصة منهاجي ومحسوسات","${act.alternativeResource2.directUrl || act.alternativeResource2.type}"`
        );
      }
    });
  }

  csvRows.push(
    '',
    `"خطوات الموقف التعليمي وزمن الحصة"`,
    `"المرحلة البيداغوجية","الزمن المقترح","دور المعلم ودور الطالب","المخرجات والمنتجات المتوقعة"`
  );

  if (plan.oerData?.activities) {
    plan.oerData.activities.forEach((act) => {
      csvRows.push(
        `"${act.title || act.stageType}","${act.allocatedTimeMinutes || 10} دقيقة","${(act.description || '').replace(/"/g, '""')}","${(act.formativeAssessment || '').replace(/"/g, '""')}"`
      );
    });
  } else if (Array.isArray(plan.section2Timeline)) {
    plan.section2Timeline.forEach((phase) => {
      csvRows.push(
        `"${phase.phaseName}","${phase.durationMinutes} دقيقة","${(phase.teacherAndStudentActions || []).join(' | ').replace(/"/g, '""')}","${(phase.assessmentAndFeedback || []).join(' | ').replace(/"/g, '""')}"`
      );
    });
  }

  downloadFile(
    BOM + csvRows.join('\r\n'),
    `خطة_درس_معتمدة_${(h.lessonTitle || 'درس').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
}

// =========================================================================
// 4. مشاركة الرابط (Share Link Helper)
// =========================================================================

export async function shareReportLink(
  title: string,
  text: string,
  url = window.location.href
): Promise<{ success: boolean; method: 'web_share' | 'clipboard' }> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { success: true, method: 'web_share' };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share API failed, copying to clipboard', err);
      }
    }
  }

  try {
    await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
    return { success: true, method: 'clipboard' };
  } catch (e) {
    return { success: false, method: 'clipboard' };
  }
}
