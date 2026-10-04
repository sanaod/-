import { SemesterPlanDocument } from '../types/semesterPlan';
import { toArabicDigits } from './arabicNumerals';

function downloadBlob(content: string, filename: string, mimeType: string) {
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

/**
 * Export Semester Plan as Word (.doc) with complete ministerial RTL table
 */
export function exportSemesterPlanToWord(plan: SemesterPlanDocument) {
  const rowsHtml = plan.rows
    .map(
      (r, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center; font-weight: bold; width: 30px;">
        ${toArabicDigits(idx + 1)}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; font-weight: bold; color: #065f46;">
        ${r.unitTitle}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; font-size: 10pt;">
        <ul style="margin: 0; padding-right: 15px;">
          ${r.unitCompetencyGoals.map((g) => `<li>${g}</li>`).join('')}
        </ul>
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; font-weight: bold; color: #1e3a8a;">
        ${r.lessonTitle}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center; font-weight: bold; background-color: #f0fdf4;">
        ${toArabicDigits(r.lessonPeriods)}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center; font-weight: bold; background-color: #ecfdf5;">
        ${toArabicDigits(r.unitTotalPeriods)}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center; font-weight: 600; color: #7c2d12;">
        ${r.timeframe}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; font-size: 9.5pt;">
        ${r.learningResourcesOer.join('، ')}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; font-size: 9.5pt;">
        ${r.teachingStrategies.join('، ')}
      </td>
      <td style="border: 1px solid #94a3b8; padding: 6px; font-size: 9.5pt;">
        ${r.assessmentMethods.join('، ')}
      </td>
    </tr>
  `
    )
    .join('');

  const dateRangeStr = plan.semesterStartDate && plan.semesterEndDate
    ? `من ${plan.semesterStartDate} إلى ${plan.semesterEndDate}`
    : 'طوال الفصل الدراسي';

  const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${plan.title}</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Amiri', 'Calibri', Arial, sans-serif;
    padding: 20px;
    color: #1e293b;
  }
  @page {
    size: landscape;
    margin: 15mm 10mm 15mm 10mm;
  }
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
    border-bottom: 2px solid #047857;
    padding-bottom: 8px;
  }
  .title-h1 {
    text-align: center;
    color: #065f46;
    font-size: 18pt;
    margin: 5px 0;
  }
  .sub-title {
    text-align: center;
    font-size: 11pt;
    color: #475569;
    margin-bottom: 12px;
  }
  .info-bar {
    width: 100%;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 8px 12px;
    margin-bottom: 15px;
    font-size: 11pt;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: right;
    font-size: 10.5pt;
  }
  table.data-table th {
    background-color: #065f46;
    color: #ffffff;
    border: 1px solid #047857;
    padding: 8px 6px;
    text-align: center;
    font-size: 10pt;
  }
  .signatures-table {
    width: 100%;
    margin-top: 25px;
    border-collapse: collapse;
    text-align: center;
    font-size: 11pt;
  }
  .signatures-table td {
    padding: 10px;
  }
</style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 30%; text-align: right;">
        <strong>${plan.country}</strong><br>
        <strong>${plan.ministry}</strong><br>
        <span>${plan.directorate}</span><br>
        <span>${plan.school}</span>
      </td>
      <td style="width: 40%; text-align: center;">
        <h1 class="title-h1">${plan.title}</h1>
        <div class="sub-title">${plan.subject} - ${plan.grade} (${plan.section}) | ${plan.academicYear}</div>
      </td>
      <td style="width: 30%; text-align: left;">
        <span><strong>العام الدراسي:</strong> ${plan.academicYear}</span><br>
        <span><strong>الفصل:</strong> ${plan.semester}</span><br>
        <span><strong>الفترة الزمنية:</strong> ${dateRangeStr}</span><br>
        <span><strong>إجمالي الحصص:</strong> ${toArabicDigits(plan.totalSemesterPeriods)} حصة</span>
      </td>
    </tr>
  </table>

  <div class="info-bar">
    <strong>المعلم/ة:</strong> ${plan.teacherName} &nbsp;|&nbsp;
    <strong>الفترة الزمنية للفصل:</strong> ${dateRangeStr} &nbsp;|&nbsp;
    <strong>الحصص الأسبوعية:</strong> ${toArabicDigits(plan.weeklyPeriodsCount)} حصص &nbsp;|&nbsp;
    <strong>إجمالي الأسابيع:</strong> ${toArabicDigits(plan.totalSemesterWeeks)} أسبوعاً &nbsp;|&nbsp;
    <strong>إجمالي حصص الفصل:</strong> ${toArabicDigits(plan.totalSemesterPeriods)} حصة موزعة
    <br>
    <small style="color: #047857; font-weight: bold;">ملاحظة التقويم: تم اعتماد عطلة نهاية الأسبوع (الجمعة والسبت) والإجازات الرسمية المعتمدة من وزارة التربية والتعليم الفلسطينية في احتساب المدى الزمني للدروس.</small>
  </div>

  <table class="data-table" border="1" cellpadding="5" cellspacing="0">
    <thead>
      <tr>
        <th style="width: 25px;">م</th>
        <th style="width: 130px;">الوحدة التعليمية</th>
        <th style="width: 160px;">أهداف الوحدة الكفائية</th>
        <th style="width: 140px;">اسم الدرس والموضوع</th>
        <th style="width: 45px;">حصص الدرس</th>
        <th style="width: 45px;">إجمالي الوحدة</th>
        <th style="width: 110px;">المدة الزمنية (بالأسابيع / التواريخ)</th>
        <th style="width: 120px;">مصادر التعلم (OER)</th>
        <th style="width: 120px;">استراتيجيات التدريس</th>
        <th style="width: 110px;">أساليب التقويم</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <table class="signatures-table">
    <tr>
      <td style="width: 33%;">
        <strong>معلم/ة المبحث:</strong><br><br>
        <span>${plan.teacherName}</span><br>
        <span>التوقيع: .....................</span>
      </td>
      <td style="width: 33%;">
        <strong>المشرف/ة التربوي/ة:</strong><br><br>
        <span>${plan.supervisorName}</span><br>
        <span>التوقيع: .....................</span>
      </td>
      <td style="width: 33%;">
        <strong>مدير/ة المدرسة:</strong><br><br>
        <span>${plan.principalName}</span><br>
        <span>التوقيع والختم: .....................</span>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const fileName = `الخطة_الفصلية_وتوزيع_الحصص_${plan.subject}_${plan.grade.replace(/[\s/\\:]+/g, '_')}.doc`;
  downloadBlob('\ufeff' + wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Export Semester Plan as Excel Spreadsheet (.xls with proper HTML table / UTF-8)
 */
export function exportSemesterPlanToExcel(plan: SemesterPlanDocument) {
  const rowsXml = plan.rows
    .map(
      (r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${r.unitTitle}</td>
      <td>${r.unitCompetencyGoals.join(' - ')}</td>
      <td>${r.lessonTitle}</td>
      <td>${r.lessonPeriods}</td>
      <td>${r.unitTotalPeriods}</td>
      <td>${r.timeframe}</td>
      <td>${r.learningResourcesOer.join(' - ')}</td>
      <td>${r.teachingStrategies.join(' - ')}</td>
      <td>${r.assessmentMethods.join(' - ')}</td>
    </tr>
  `
    )
    .join('');

  const excelContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>الخطة الفصلية وتوزيع الحصص</x:Name>
        <x:WorksheetOptions>
          <x:DisplayRightToLeft/>
        </x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  th { background-color: #047857; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; }
  td { border: 1px solid #cbd5e1; vertical-align: top; text-align: right; }
</style>
</head>
<body dir="rtl">
  <table>
    <tr><th colspan="10" style="font-size: 16pt; background-color: #065f46; color: white; text-align: center;">${plan.title}</th></tr>
    <tr><th colspan="10" style="background-color: #f1f5f9; color: #334155; text-align: center;">${plan.subject} - ${plan.grade} | المعلم/ة: ${plan.teacherName} | إجمالي الحصص: ${plan.totalSemesterPeriods}</th></tr>
    <tr>
      <th>الرقم</th>
      <th>الوحدة التعليمية</th>
      <th>أهداف الوحدة الكفائية</th>
      <th>اسم الدرس والموضوع</th>
      <th>حصص الدرس</th>
      <th>إجمالي حصص الوحدة</th>
      <th>المدة الزمنية (بالأسابيع / التواريخ)</th>
      <th>مصادر التعلم (OER)</th>
      <th>استراتيجيات التدريس</th>
      <th>التقويم</th>
    </tr>
    ${rowsXml}
  </table>
</body>
</html>
  `;

  const fileName = `جدول_توزيع_الحصص_${plan.subject}_${plan.grade.replace(/[\s/\\:]+/g, '_')}.xls`;
  downloadBlob('\ufeff' + excelContent, fileName, 'application/vnd.ms-excel;charset=utf-8');
}

/**
 * Export Semester Plan as CSV
 */
export function exportSemesterPlanToCsv(plan: SemesterPlanDocument) {
  const headers = [
    'الرقم',
    'الوحدة التعليمية',
    'أهداف الوحدة الكفائية',
    'اسم الدرس والموضوع',
    'عدد حصص الدرس',
    'إجمالي حصص الوحدة',
    'المدة الزمنية (أسابيع/تواريخ)',
    'مصادر التعلم OER',
    'استراتيجيات التدريس',
    'التقويم',
  ];

  const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

  const csvRows = [headers.map(escapeCsv).join(',')];

  plan.rows.forEach((r, idx) => {
    csvRows.push(
      [
        idx + 1,
        r.unitTitle,
        r.unitCompetencyGoals.join(' | '),
        r.lessonTitle,
        r.lessonPeriods,
        r.unitTotalPeriods,
        r.timeframe,
        r.learningResourcesOer.join(' | '),
        r.teachingStrategies.join(' | '),
        r.assessmentMethods.join(' | '),
      ]
        .map(escapeCsv)
        .join(',')
    );
  });

  const csvContent = '\ufeff' + csvRows.join('\r\n');
  const fileName = `خطة_توزيع_الحصص_${plan.subject}.csv`;
  downloadBlob(csvContent, fileName, 'text/csv;charset=utf-8');
}

/**
 * Export Semester Plan as Markdown
 */
export function exportSemesterPlanToMarkdown(plan: SemesterPlanDocument) {
  let md = `# ${plan.title}\n\n`;
  md += `**المبحث:** ${plan.subject} | **الصف:** ${plan.grade} (${plan.section}) | **العام الدراسي:** ${plan.academicYear}\n`;
  md += `**المعلم/ة:** ${plan.teacherName} | **المدرسة:** ${plan.school} | **المديرية:** ${plan.directorate}\n`;
  md += `**الحصص الأسبوعية:** ${toArabicDigits(plan.weeklyPeriodsCount)} | **إجمالي الأسابيع:** ${toArabicDigits(plan.totalSemesterWeeks)} | **إجمالي الحصص:** ${toArabicDigits(plan.totalSemesterPeriods)}\n\n`;

  md += `## دليل توزيع الحصص والوحدات والدروس\n\n`;
  md += `| م | الوحدة التعليمية | أهداف الوحدة الكفائية | اسم الدرس والموضوع | حصص الدرس | إجمالي الوحدة | المدة الزمنية | مصادر التعلم (OER) | استراتيجيات التدريس | التقويم |\n`;
  md += `|---|---|---|---|---|---|---|---|---|---|\n`;

  plan.rows.forEach((r, idx) => {
    const goals = r.unitCompetencyGoals.join('<br>• ');
    const oer = r.learningResourcesOer.join('، ');
    const strat = r.teachingStrategies.join('، ');
    const assess = r.assessmentMethods.join('، ');
    md += `| ${toArabicDigits(idx + 1)} | ${r.unitTitle} | • ${goals} | ${r.lessonTitle} | ${toArabicDigits(r.lessonPeriods)} | ${toArabicDigits(r.unitTotalPeriods)} | ${r.timeframe} | ${oer} | ${strat} | ${assess} |\n`;
  });

  md += `\n---\n`;
  md += `**توقيع المعلم:** ${plan.teacherName} | **توقيع المشرف:** ${plan.supervisorName} | **مدير المدرسة:** ${plan.principalName}\n`;

  const fileName = `الخطة_الفصلية_وتوزيع_الحصص_${plan.subject}.md`;
  downloadBlob(md, fileName, 'text/markdown;charset=utf-8');
}

/**
 * Export Semester Plan as JSON
 */
export function exportSemesterPlanToJson(plan: SemesterPlanDocument) {
  const jsonStr = JSON.stringify(plan, null, 2);
  const fileName = `الخطة_الفصلية_${plan.subject}_${Date.now()}.json`;
  downloadBlob(jsonStr, fileName, 'application/json;charset=utf-8');
}
