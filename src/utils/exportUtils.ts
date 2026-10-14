import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits, formatDateDMY } from './arabicNumerals';
import { getCurrentAcademicYear } from './academicYear';
import { exportLessonPlanToPdf } from './pdfExport';
import { formatStageNameWithOrdinal } from './executivePlanDefaults';

/**
 * Downloads a file to the user's browser.
 */
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
 * Exports the complete Lesson Plan as an editable Microsoft Word document (.doc/.docx compatible).
 * Uses Word-compatible HTML/XML with proper RTL, ministerial borders, fonts, and tables.
 */
export function exportToWord(plan: LessonPlan) {
  const p = plan;
  const h = p.header;

  if ((plan.templateType || 'oer') === 'oer' && plan.oerData) {
    const o = plan.oerData;
    const l = o.lessonInfo;

    const oerWordDoc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${l.lessonTitle || 'خطة درس OER'} - ${l.subject || 'المبحث'}</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Calibri', 'Arial', sans-serif;
    font-size: 13pt;
    line-height: 1.5;
    color: #111;
    margin: 20mm 15mm 20mm 15mm;
  }
  h1 { font-size: 18pt; text-align: center; color: #064e3b; margin-bottom: 4pt; }
  .subtitle { text-align: center; font-size: 11pt; color: #475569; margin-bottom: 12pt; }
  h2 { font-size: 14pt; border-bottom: 2pt solid #059669; padding-bottom: 3pt; color: #064e3b; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14pt; }
  th, td { border: 1pt solid #000; padding: 6pt 8pt; vertical-align: top; text-align: right; font-size: 11.5pt; }
  th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
  .table-header-cell { background-color: #e2e8f0; font-weight: bold; }
  .badge-elearn { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2pt 4pt; border: 1pt solid #10b981; }
</style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 12pt;">
    <p style="margin: 0; font-size: 12pt; font-weight: bold;">دولة فلسطين • وزارة التربية والتعليم العالي</p>
    <p style="margin: 2pt 0; font-size: 10pt; color: #475569;">مديرية التربية والتعليم: ${l.directorate || '...............'} | مدرسة: ${l.school || '...............'}</p>
    <h1>استمارة خطة درس مستندة إلى مصادر التعليم المفتوحة (OER)</h1>
    <p class="subtitle">دليل المعلم الفلسطيني (الصفوف ١–٤ الأساسية) • البوابة التعليمية الرسمية elearn.edu.ps</p>
  </div>

  <h2>أولاً: بيانات الدرس الأساسية</h2>
  <table>
    <tr>
      <td class="table-header-cell" style="width: 15%;">المبحث / المادة:</td>
      <td style="width: 35%;">${l.subject || '—'}</td>
      <td class="table-header-cell" style="width: 15%;">الصف والشعبة:</td>
      <td style="width: 35%;">${l.grade || '—'} (شعبة: ${l.section || 'أ'})</td>
    </tr>
    <tr>
      <td class="table-header-cell">عنوان الدرس:</td>
      <td><strong>${l.lessonTitle || '—'}</strong></td>
      <td class="table-header-cell">مدة الحصة:</td>
      <td>${toArabicDigits(l.durationMinutes || 40)} دقيقة</td>
    </tr>
    <tr>
      <td class="table-header-cell">اسم المعلم/ة:</td>
      <td>${l.teacherName || '—'}</td>
      <td class="table-header-cell">التاريخ:</td>
      <td>${l.date || '—'} (الفصل: ${l.semester || 'الأول'})</td>
    </tr>
  </table>

  <h2>ثانياً: الكفايات المستهدفة</h2>
  <table>
    <tr>
      <td class="table-header-cell" style="width: 25%;">الكفاية العامة:</td>
      <td style="width: 75%;">${o.targetCompetencies.generalCompetency || '—'}</td>
    </tr>
    <tr>
      <td class="table-header-cell">الكفاية الخاصة:</td>
      <td>${o.targetCompetencies.specificCompetency || '—'}</td>
    </tr>
    <tr>
      <td class="table-header-cell">مؤشرات أداء قابلة للملاحظة:</td>
      <td>
        <ol style="margin: 0; padding-right: 18pt;">
          ${o.targetCompetencies.observableIndicators.map((ind) => `<li>${ind}</li>`).join('')}
        </ol>
      </td>
    </tr>
  </table>

  <h2>ثالثاً: الموقف التعليمي ومصادر التعليم المفتوحة OER (رئيسي + بديلان لكل نشاط)</h2>
  <table>
    <tr style="background-color: #f1f5f9;">
      <th style="width: 15%;">المرحلة والزمن</th>
      <th style="width: 30%;">الخطوات الإجرائية وأدوار الطلبة</th>
      <th style="width: 35%;">مصادر التعليم المفتوحة (رئيسي + بديلان)</th>
      <th style="width: 20%;">التقويم (تكويني / منتج)</th>
    </tr>
    ${o.activities
      .map(
        (act) => `
    <tr>
      <td>
        <strong>${act.title}</strong><br>
        <span style="font-size: 10pt; color: #475569;">${toArabicDigits(act.allocatedTimeMinutes)} دقيقة</span>
      </td>
      <td>
        <p style="margin: 0 0 4pt 0;">${act.description}</p>
        <p style="margin: 0; font-size: 10pt; color: #047857;"><strong>دور الطلبة:</strong> ${act.studentRoles} ${act.studentRolesDetails ? `(${act.studentRolesDetails})` : ''}</p>
        ${act.expectedProducts ? `<p style="margin: 2pt 0 0 0; font-size: 10pt; color: #6b21a8;"><strong>المنتج المتوقع:</strong> ${act.expectedProducts}</p>` : ''}
      </td>
      <td>
        <div style="background-color: #ecfdf5; padding: 4pt; border: 1pt solid #10b981; margin-bottom: 4pt;">
          <strong>🌟 رئيسي:</strong> ${act.primaryResource.title}<br>
          <span style="font-size: 9.5pt; color: #047857;">النوع: ${act.primaryResource.type} | الرخصة: ${act.primaryResource.licenseType === 'ministry_elearn' ? 'معتمد elearn.edu.ps' : 'مشاع إبداعي'}</span>
          ${act.primaryResource.directUrl ? `<br><a href="${act.primaryResource.directUrl}" style="font-size: 9pt; color: #0284c7;">${act.primaryResource.directUrl}</a>` : ''}
        </div>
        <div style="background-color: #f0f9ff; padding: 3pt; border: 1pt solid #bae6fd; margin-bottom: 3pt;">
          <strong>🔄 بديل ١:</strong> ${act.alternativeResource1.title}
        </div>
        <div style="background-color: #fffbeb; padding: 3pt; border: 1pt solid #fde68a;">
          <strong>🔄 بديل ٢ (أوفلاين):</strong> ${act.alternativeResource2.title}
        </div>
      </td>
      <td>
        <p style="margin: 0 0 4pt 0; font-size: 10.5pt;"><strong>تكويني:</strong> ${act.formativeAssessment || 'ملاحظة وتغذية راجعة'}</p>
        <p style="margin: 0; font-size: 10.5pt;"><strong>تقويم المنتج:</strong> ${act.productAssessment || 'سلم تقدير'}</p>
      </td>
    </tr>
    `
      )
      .join('')}
  </table>

  <h2>رابعاً: التقويم الختامي الشامل</h2>
  <table>
    <tr>
      <td class="table-header-cell" style="width: 25%;">مهمة التقويم الختامي:</td>
      <td style="width: 75%;">${o.summativeAssessment.description || '—'}</td>
    </tr>
    <tr>
      <td class="table-header-cell">أداة التقويم:</td>
      <td>${o.summativeAssessment.assessmentTool || 'سلم تقدير لفظي (Rubric)'}</td>
    </tr>
    <tr>
      <td class="table-header-cell">الربط بمؤشرات الكفاية:</td>
      <td>${o.summativeAssessment.alignmentWithIndicators || '—'}</td>
    </tr>
  </table>

  <h2>خامساً: بدائل وملاحظات ما بعد الدرس</h2>
  <table>
    <tr>
      <td class="table-header-cell" style="width: 25%;">حلول عند تعذر مصدر:</td>
      <td style="width: 75%;">${o.contingenciesAndNotes.sourceContingencies || 'الاعتماد على البدائل الأوفلاين والخامات البيئية والمحسوسات.'}</td>
    </tr>
    <tr>
      <td class="table-header-cell">ما بعد الدرس (التأمل الذاتي):</td>
      <td>${o.contingenciesAndNotes.postLessonReflection || 'استيفاء النتاجات بنجاح.'}</td>
    </tr>
    <tr>
      <td class="table-header-cell">متابعة الطلبة والدعم:</td>
      <td>${o.contingenciesAndNotes.followUpActions || 'تقديم الدعم الإضافي للطلبة المحتاجين وأنشطة التحدي للمتميزين.'}</td>
    </tr>
  </table>

  <div style="margin-top: 20pt; border-top: 1pt solid #000; padding-top: 8pt; display: flex; justify-content: space-between; text-align: center;">
    <div style="float: right; width: 32%;">
      <strong>توقيع المعلم:</strong> ....................<br>
      <strong>التاريخ:</strong> ${l.date || '..../..../2026'}
    </div>
    <div style="float: right; width: 33%;">
      <strong>توقيع وختم مدير المدرسة:</strong> ....................<br>
      <strong>التاريخ:</strong> ..../..../2026
    </div>
    <div style="float: left; width: 32%;">
      <strong>توقيع المشرف التربوي:</strong> ....................<br>
      <strong>التاريخ:</strong> ..../..../2026
    </div>
    <div style="clear: both;"></div>
  </div>

  <div style="margin-top: 25pt; text-align: center; font-size: 9.5pt; color: #475569;">
    إعداد وتصميم: الأستاذ عبد الرحمن دويكات | منظومة عبقور للتخطيط التربوي • بوابة elearn.edu.ps
  </div>
</body>
</html>
    `.trim();

    const fileName = `خطة_درس_OER_${(l.subject || 'مبحث').replace(/[\s/\\:]+/g, '_')}_${(l.lessonTitle || 'درس').replace(/[\s/\\:]+/g, '_')}.doc`;
    downloadBlob(oerWordDoc, fileName, 'application/msword;charset=utf-8');
    return;
  }

  if ((plan.templateType || 'executive') === 'executive' && plan.executiveData) {
    const d = plan.executiveData;
    const stage1 = d.executiveStages.find((s) => s.id === 1) || d.executiveStages[0];
    const stage2 = d.executiveStages.find((s) => s.id === 2) || d.executiveStages[1];
    const stage3 = d.executiveStages.find((s) => s.id === 3) || d.executiveStages[2];
    const stage4 = d.executiveStages.find((s) => s.id === 4) || d.executiveStages[3];
    const stage5 = d.executiveStages.find((s) => s.id === 5) || d.executiveStages[4];

    const execDoc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${h.lessonTitle || 'خطة درس'} - ${h.subject || 'المبحث'}</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Calibri', 'Arial', sans-serif;
    font-size: 13pt;
    line-height: 1.5;
    color: #111;
    margin: 20mm 15mm 20mm 15mm;
  }
  h1 { font-size: 18pt; text-align: center; color: #064e3b; margin-bottom: 4pt; }
  .subtitle { text-align: center; font-size: 11pt; color: #475569; margin-bottom: 12pt; }
  h2 { font-size: 14pt; border-bottom: 2pt solid #059669; padding-bottom: 3pt; color: #064e3b; margin-top: 14pt; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt 0;
    font-size: 11pt;
  }
  th, td {
    border: 1pt solid #475569;
    padding: 6pt 8pt;
    text-align: right;
    vertical-align: top;
  }
  th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
  .box { border: 1pt solid #475569; padding: 8pt; margin-bottom: 10pt; background-color: #f8fafc; }
</style>
</head>
<body>
  <h1>أولاً: نموذج خطة تحضير درس (البيانات العامة وكفايات التعلّم والأهداف)</h1>
  <div class="subtitle">النموذج التنفيذي المعتمد • وزارة التربية والتعليم</div>

  <table>
    <tr>
      <td style="width: 20%; font-weight: bold; background-color: #f1f5f9;">المبحث:</td>
      <td style="width: 30%;">${h.subject || '....................'}</td>
      <td style="width: 20%; font-weight: bold; background-color: #f1f5f9;">الصف:</td>
      <td style="width: 30%;">${h.grade || '....................'}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">عنوان الدرس / الوحدة:</td>
      <td>${h.lessonTitle || h.unitTitle || '....................'}</td>
      <td style="font-weight: bold; background-color: #f1f5f9;">عدد الحصص:</td>
      <td>${toArabicDigits(h.totalPeriods)} حصص</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">الفترة الزمنية:</td>
      <td colspan="3">
        <strong>من:</strong> اليوم (${d.timeframeDetails.startDay}) التاريخ (${d.timeframeDetails.startDate}) الفصل الدراسي (${d.timeframeDetails.startSemester || d.timeframeDetails.startYear || plan.header.semester || 'الفصل الدراسي الأول'}) &nbsp;|&nbsp;
        <strong>إلى:</strong> اليوم (${d.timeframeDetails.endDay}) التاريخ (${d.timeframeDetails.endDate}) الفصل الدراسي (${d.timeframeDetails.endSemester || d.timeframeDetails.endYear || plan.header.semester || 'الفصل الدراسي الأول'})
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">كفايات التعلّم:</td>
      <td colspan="3">المهارات والمعارف الأساسية الخاصة بالمبحث: ${d.learningCompetencies}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">القيم والأخلاق المراد تعزيزها:</td>
      <td colspan="3">${d.valuesAndEthics}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">خصائص الطلبة والبيئة المحيطة:</td>
      <td colspan="3">
        • <strong>تحليل خصائص الطلبة:</strong> ${d.studentCharacteristicsAnalysis}<br>
        • <strong>تحليل البيئة المحيطة:</strong> ${d.environmentalAnalysis}
      </td>
    </tr>
  </table>

  <div class="box">
    <strong>أهداف ذكية (SMART Objectives):</strong> (محددة · قابلة للقياس · قابلة للتحقيق · ذات صلة بالكفاية · محددة بزمن)<br>
    ${d.smartObjectives.map((o, idx) => `${toArabicDigits(idx + 1)}. ${o}`).join('<br>')}
  </div>

  <h2>ثانياً: تفاصيل خطة التنفيذ التنفيذية للدرس</h2>
  <table>
    <tr style="background-color: #064e3b; color: white;">
      <th style="width: 15%; color: white;">الأهداف</th>
      <th style="width: 45%; color: white;">الإجراءات والأنشطة</th>
      <th style="width: 15%; color: white;">التقويم</th>
      <th style="width: 15%; color: white;">المصادر والأدوات</th>
      <th style="width: 10%; color: white;">الزمن</th>
    </tr>
    ${d.executiveStages.map((st) => `
      <tr>
        <td><strong>${formatStageNameWithOrdinal(st.stageName, st.id)}</strong><br><small>${st.goals}</small></td>
        <td>
          ${st.procedures.mainDescription}
          ${st.id === 1 && st.procedures.resourceName ? `<br><strong>المصدر:</strong> ${st.procedures.resourceName}` : ''}
          ${st.id === 1 && st.procedures.reflectiveQuestionsExample ? `<br><strong>أسئلة تأملية:</strong> ${st.procedures.reflectiveQuestionsExample}` : ''}
          ${st.id === 3 && st.procedures.grasps ? `<br><strong>مهمة تقويم GRASPS:</strong> ${st.procedures.grasps.goal} (${st.procedures.grasps.performance})` : ''}
          ${st.id === 4 && st.procedures.howWorksheetUsed ? `<br><strong>استخدام ورقة العمل:</strong> ${st.procedures.howWorksheetUsed}` : ''}
        </td>
        <td>${st.assessment}</td>
        <td>${st.resourcesAndTools}</td>
        <td style="text-align: center; font-weight: bold;">${toArabicDigits(st.durationMinutes)} د</td>
      </tr>
    `).join('')}
  </table>

  <h2>ثالثاً: ملاحظات وتأملات المعلم حول الدرس</h2>
  <table>
    <tr>
      <td style="width: 25%; font-weight: bold; background-color: #f1f5f9;">أولاً: نقاط القوة في تنفيذ الدرس:</td>
      <td>${d.teacherReflection.strengths}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">ثانياً: جوانب تحتاج إلى تحسين وتطوير:</td>
      <td>${d.teacherReflection.improvementsNeeded}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f1f5f9;">ثالثاً: مقترحات للدروس القادمة:</td>
      <td>${d.teacherReflection.futureSuggestions}</td>
    </tr>
  </table>

  <h2>رابعاً: التوقيع والاعتماد الرسمي</h2>
  <table style="margin-top: 15pt; border: none;">
    <tr style="border: none;">
      <td style="border: none; text-align: center;"><strong>توقيع المعلم/ة:</strong><br><br>${h.teacherName || '....................'}</td>
      <td style="border: none; text-align: center;"><strong>مدير/ة المدرسة:</strong><br><br>....................</td>
      <td style="border: none; text-align: center;"><strong>المشرف/ة التربوي/ة:</strong><br><br>....................</td>
    </tr>
  </table>
</body>
</html>
    `;

    const sanitizedTitle = (h.lessonTitle || 'خطة_درس').replace(/[/\\?%*:|"<>]/g, '-').trim();
    const filename = `${sanitizedTitle}_النموذج_الرئيسي.doc`;
    downloadBlob('\ufeff' + execDoc, filename, 'application/msword');
    return;
  }

  const htmlDoc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${h.lessonTitle} - ${h.subject}</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Calibri', 'Arial', sans-serif;
    font-size: 13pt;
    line-height: 1.5;
    color: #111;
    margin: 20mm 15mm 20mm 15mm;
  }
  h1, h2, h3, h4 {
    margin: 6pt 0;
    color: #064e3b;
    font-weight: bold;
  }
  h1 { font-size: 18pt; text-align: center; }
  h2 { font-size: 15pt; border-bottom: 2pt solid #059669; padding-bottom: 3pt; margin-top: 15pt; }
  h3 { font-size: 13pt; color: #1e3a8a; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt 0;
    font-size: 11pt;
  }
  th, td {
    border: 1pt solid #475569;
    padding: 5pt 7pt;
    text-align: right;
    vertical-align: top;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
  }
  .header-table td {
    border: 1pt solid #cbd5e1;
    background-color: #f8fafc;
  }
  .section-header {
    background-color: #064e3b;
    color: white;
    font-size: 13pt;
    padding: 6pt 10pt;
    font-weight: bold;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }
  .badge {
    background-color: #ecfdf5;
    border: 1pt solid #10b981;
    padding: 2pt 5pt;
    font-size: 10pt;
    font-weight: bold;
  }
  .footer-signatures {
    margin-top: 20pt;
    border: 1pt solid #94a3b8;
  }
  ul {
    margin: 4pt 0;
    padding-right: 18pt;
  }
  li {
    margin-bottom: 3pt;
  }
</style>
</head>
<body>

  <!-- Official Top Banner -->
  <table style="width: 100%; border: none; margin-bottom: 10pt;">
    <tr style="border: none;">
      <td style="width: 33%; text-align: right; border: none; font-size: 11pt;">
        <strong>${h.country}</strong><br>
        ${h.ministry}<br>
        ${h.directorate}<br>
        ${h.school}
      </td>
      <td style="width: 34%; text-align: center; border: none;">
        <h1 style="margin: 0; color: #064e3b;">خطة درس نموذجية متكاملة</h1>
        <p style="margin: 2pt 0; font-size: 11pt; color: #475569;">(وفق إطار تقييم أداء المعلم - الدرجة ٤ التميز)</p>
      </td>
      <td style="width: 33%; text-align: left; border: none; font-size: 11pt;">
        <strong>العام الدراسي:</strong> ${getCurrentAcademicYear(h.startDate || h.date)}<br>
        <strong>التاريخ:</strong> ${toArabicDigits(h.date)}<br>
        <strong>الفصل:</strong> ${h.semester}<br>
        <strong>المعلم/ة:</strong> ${h.teacherName}
      </td>
    </tr>
  </table>

  <!-- Header Metadata Table -->
  <table class="header-table">
    <tr>
      <th style="width: 18%;">المبحث / المادة:</th>
      <td style="width: 32%;"><strong>${h.subject}</strong></td>
      <th style="width: 18%;">الصف والشعبة:</th>
      <td style="width: 32%;"><strong>${h.grade} - الشعبة (${h.section})</strong></td>
    </tr>
    <tr>
      <th>عنوان الدرس:</th>
      <td><strong>${toArabicDigits(h.lessonTitle)}</strong></td>
      <th>التوقيت والحصص:</th>
      <td>الحصة (${toArabicDigits(h.currentPeriod)}) من أصل (${toArabicDigits(h.totalPeriods)}) حصص • مدة الحصة: (${toArabicDigits(h.periodDurationMinutes)}) دقيقة</td>
    </tr>
    <tr>
      <th>الفترة الزمنية للدرس:</th>
      <td colspan="3">
        <strong>من ${toArabicDigits(h.startDate || h.date)} إلى ${toArabicDigits(h.endDate || h.date)}</strong>
        <span style="font-size: 9.5pt; color: #047857; margin-right: 10px; font-weight: bold;">(مراعاة عطلة الجمعة والسبت والإجازات الرسمية المعتمدة لوزارة التربية والتعليم الفلسطينية)</span>
      </td>
    </tr>
  </table>

  <!-- SECTION 1 -->
  <div class="section-header">أولاً: التحليل والتخطيط التكيفي ومصادر التعلم</div>
  <table>
    <tr>
      <th style="width: 25%;">الكفايات التكاملية الأربعة</th>
      <td>
        <ul>
          ${p.section1.integrativeCompetencies
            .map((c) => `<li><strong>${c.title}:</strong> ${c.description}</li>`)
            .join('')}
        </ul>
      </td>
    </tr>
    <tr>
      <th>تحليل خصائص الطلبة والتكييف</th>
      <td>
        <p><strong>الفروق الفردية:</strong> ${p.section1.studentCharacteristics.individualDifferences}</p>
        <p><strong>ذوو الاحتياجات الخاصة:</strong> ${p.section1.studentCharacteristics.specialNeeds}</p>
        <p><strong>التكييف البيئي الصفي:</strong> ${p.section1.studentCharacteristics.environmentalAdaptation}</p>
      </td>
    </tr>
    <tr>
      <th>مصادر التعلم والجاهزية الرقمية</th>
      <td>
        <p><strong>الكتاب المدرسي:</strong> ${p.section1.learningResources.textbook}</p>
        <p><strong>الوسائط والمحسوسات:</strong> ${p.section1.learningResources.tangibleMedia}</p>
        <p><strong>الجاهزية الرقمية (OER):</strong> ${p.section1.learningResources.digitalReadiness}</p>
      </td>
    </tr>
    <tr>
      <th>أخلاقيات التكنولوجيا والسلامة</th>
      <td>
        <p><strong>السلامة الرقمية:</strong> ${p.section1.ethicsAndSafety.digitalSafety}</p>
        <p><strong>دقة المحتوى والسلامة اللغوية:</strong> ${p.section1.ethicsAndSafety.contentAccuracyAndLanguage}</p>
      </td>
    </tr>
    <tr>
      <th>الأسئلة التأملية السابرة</th>
      <td>
        <ul>
          ${p.section1.reflectiveQuestions.map((q) => `<li>${q}</li>`).join('')}
        </ul>
      </td>
    </tr>
  </table>

  <!-- SECTION 2 -->
  <div class="section-header">ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم (الجدول الرباعي)</div>
  <table>
    <thead>
      <tr style="background-color: #064e3b; color: white;">
        <th style="width: 20%; color: white;">المرحلة والزمن</th>
        <th style="width: 40%; color: white;">إجراءات المعلم وأنشطة المتعلم</th>
        <th style="width: 20%; color: white;">استراتيجيات ومصادر التعلم</th>
        <th style="width: 20%; color: white;">التقويم والتغذية الراجعة</th>
      </tr>
    </thead>
    <tbody>
      ${p.section2Timeline
        .map(
          (phase) => `
        <tr>
          <td style="font-weight: bold; background-color: #f8fafc;">
            ${phase.phaseName}<br>
            <span style="color: #059669;">(${toArabicDigits(phase.durationMinutes)} دقائق)</span>
          </td>
          <td>
            <ul>
              ${phase.teacherAndStudentActions.map((a) => `<li>${toArabicDigits(a)}</li>`).join('')}
            </ul>
          </td>
          <td>
            <ul>
              ${phase.strategiesAndResources.map((s) => `<li>${toArabicDigits(s)}</li>`).join('')}
            </ul>
          </td>
          <td>
            <ul>
              ${phase.assessmentAndFeedback.map((e) => `<li>${toArabicDigits(e)}</li>`).join('')}
            </ul>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <!-- SECTION 3 -->
  <div class="section-header">ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة</div>
  
  <h3>1. مهمة التقويم الأصيل وفق نموذج (GRASPS):</h3>
  <table>
    <tr><th style="width: 20%;">عنوان المهمة:</th><td><strong>${toArabicDigits(p.section3Assessment.graspsTask.title)}</strong></td></tr>
    <tr><th>الدور (Role):</th><td>${p.section3Assessment.graspsTask.role}</td></tr>
    <tr><th>الجمهور (Audience):</th><td>${p.section3Assessment.graspsTask.audience}</td></tr>
    <tr><th>الموقف والسياق (Situation):</th><td>${p.section3Assessment.graspsTask.situation}</td></tr>
    <tr><th>المنتج والأداء (Product):</th><td>${p.section3Assessment.graspsTask.product}</td></tr>
    <tr><th>المعايير (Standards):</th><td>${p.section3Assessment.graspsTask.standards}</td></tr>
    <tr><th>الوصف الشامل للمهمة:</th><td>${toArabicDigits(p.section3Assessment.graspsTask.fullDescription)}</td></tr>
  </table>

  <h3>2. سلم التقدير اللفظي التحليلي (Rubric) لتقييم الأداء:</h3>
  <table>
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th>المعيار</th>
        <th>مبتدئ (١)</th>
        <th>نامٍ (٢)</th>
        <th>كفء (٣)</th>
        <th>متميز (٤)</th>
      </tr>
    </thead>
    <tbody>
      ${p.section3Assessment.rubric
        .map(
          (r) => `
        <tr>
          <td><strong>${r.criterion}</strong></td>
          <td>${r.level1}</td>
          <td>${r.level2}</td>
          <td>${r.level3}</td>
          <td style="background-color: #ecfdf5; font-weight: bold;">${r.level4}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h3>3. الأنشطة العلاجية والإثرائية والتغذية الراجعة:</h3>
  <table>
    <tr>
      <th style="width: 25%;">الأنشطة العلاجية:</th>
      <td>
        <ul>
          ${p.section3Assessment.remedialActivities
            .map((ra) => `<li><strong>${ra.title}:</strong> ${ra.description}</li>`)
            .join('')}
        </ul>
      </td>
    </tr>
    <tr>
      <th>الأنشطة الإثرائية ولغز التحدي:</th>
      <td>
        <p><strong>العنوان:</strong> ${p.section3Assessment.enrichmentActivities.title}</p>
        <p><strong>لغز التحدي:</strong> ${toArabicDigits(p.section3Assessment.enrichmentActivities.puzzleOrChallenge)}</p>
        <p><strong>تعليم الأقران:</strong> ${p.section3Assessment.enrichmentActivities.peerTutoring}</p>
      </td>
    </tr>
    <tr>
      <th>التغذية الراجعة الفورية:</th>
      <td>
        <ul>
          ${p.section3Assessment.immediateFeedback.map((f) => `<li>${f}</li>`).join('')}
        </ul>
      </td>
    </tr>
  </table>

  <!-- SECTION 4 -->
  <div class="section-header">رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة</div>
  <table>
    <tr>
      <th style="width: 25%;">الروتينات الصفية:</th>
      <td>${p.section4Environment.classroomRoutines}</td>
    </tr>
    <tr>
      <th>المناخ الآمن والمحفز:</th>
      <td>${p.section4Environment.safeAndMotivatingClimate}</td>
    </tr>
    <tr>
      <th>بطاقة الشراكة الأسرية التفاعلية:</th>
      <td>
        <p><strong>عنوان البطاقة:</strong> ${toArabicDigits(p.section4Environment.familyPartnership.cardTitle)}</p>
        <p><strong>تعليمات ولي الأمر:</strong> ${p.section4Environment.familyPartnership.instructions}</p>
        <p><strong>مهمة الطالب بالمنزل:</strong> ${toArabicDigits(p.section4Environment.familyPartnership.studentTask)}</p>
        <p><strong>دور ومتابعة الأسرة:</strong> ${p.section4Environment.familyPartnership.parentRole}</p>
      </td>
    </tr>
  </table>

  <!-- SECTION 5 -->
  <div class="section-header">خامساً: التأمل الذاتي والتطور المهني المستمر</div>
  <table>
    <tr>
      <th style="width: 25%;">مواطن القوة والأثر الملموس:</th>
      <td>
        <ul>
          ${p.section5Reflection.strengthsAndImpact.map((s) => `<li>${toArabicDigits(s)}</li>`).join('')}
        </ul>
      </td>
    </tr>
    <tr>
      <th>فرص التحسين والتطوير:</th>
      <td>${p.section5Reflection.improvementOpportunities}</td>
    </tr>
    <tr>
      <th>مجتمعات التعلم المهني (PLC):</th>
      <td>${p.section5Reflection.professionalLearningCommunities}</td>
    </tr>
  </table>

  <!-- SECTION 6 -->
  <div class="section-header">سادساً: التوقيع والاعتماد الرسمي وتوجيهات الإشراف</div>
  <table class="footer-signatures">
    <thead>
      <tr style="background-color: #f8fafc;">
        <th style="width: 33%; text-align: center;">المعلم / معد الخطة</th>
        <th style="width: 34%; text-align: center;">مدير / مديرة المدرسة</th>
        <th style="width: 33%; text-align: center;">المشرف / المشرفة التربوية</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <p><strong>الاسم:</strong> ${p.section6Signatures.teacher.name}</p>
          <p><strong>التاريخ:</strong> ${toArabicDigits(p.section6Signatures.teacher.date)}</p>
          <p><strong>ملاحظات:</strong> ${p.section6Signatures.teacher.notes}</p>
          <p style="margin-top: 15pt;">التوقيع: _______________</p>
        </td>
        <td>
          <p><strong>الاسم:</strong> ${p.section6Signatures.schoolPrincipal.name}</p>
          <p><strong>التاريخ:</strong> ${toArabicDigits(p.section6Signatures.schoolPrincipal.date)}</p>
          <p><strong>توجيهات الإدارة:</strong> ${p.section6Signatures.schoolPrincipal.directives}</p>
          <p style="margin-top: 15pt;">التوقيع والختم: _______________</p>
        </td>
        <td>
          <p><strong>الاسم:</strong> ${p.section6Signatures.educationalSupervisor.name}</p>
          <p><strong>التاريخ:</strong> ${toArabicDigits(p.section6Signatures.educationalSupervisor.date)}</p>
          <p><strong>توجيهات الإشراف:</strong> ${p.section6Signatures.educationalSupervisor.directives}</p>
          <p style="margin-top: 15pt;">التوقيع والاعتماد: _______________</p>
        </td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 25pt; padding-top: 10pt; border-top: 1pt solid #cbd5e1; text-align: center; font-size: 9.5pt; color: #475569;">
    <p style="margin: 2pt 0; font-weight: bold; color: #064e3b;">
      إعداد وتصميم: الأستاذ عبد الرحمن دويكات | منظومة عبقور للتخطيط التربوي وتحضير الدروس
    </p>
    <p style="margin: 2pt 0;">
      جميع الحقوق محفوظة لصالح الأستاذ عبد الرحمن دويكات © مرخص بموجب رخصة المشاع الإبداعي (CC BY-NC-SA 4.0) نَسب المُصنَّف - غير تجاري - الترخيص بالمثل.
    </p>
  </div>

</body>
</html>
  `.trim();

  const fileName = `خطة_درس_${h.subject}_${h.lessonTitle.replace(/[\s/\\:]+/g, '_')}.doc`;
  downloadBlob(htmlDoc, fileName, 'application/msword;charset=utf-8');
}

/**
 * Exports the Lesson Plan as a standalone, responsive, offline-ready HTML page.
 */
export function exportToHtml(plan: LessonPlan) {
  const p = plan;
  const h = p.header;

  if ((plan.templateType || 'oer') === 'oer' && plan.oerData) {
    const o = plan.oerData;
    const l = o.lessonInfo;

    const oerHtmlDoc = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خطة درس OER: ${l.lessonTitle || 'درس'} - ${l.subject || 'المبحث'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      direction: rtl;
      text-align: right;
      font-family: 'Tajawal', 'Cairo', sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1050px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      padding: 32px;
    }
    .header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
      color: white;
      padding: 24px;
      border-radius: 20px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      margin-left: 6px;
      margin-bottom: 6px;
    }
    .badge-amber { background: #fef3c7; color: #78350f; }
    .badge-emerald { background: #d1fae5; color: #065f46; }
    .section-title {
      background: #047857;
      color: white;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 800;
      margin: 24px 0 14px 0;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border-radius: 12px; overflow: hidden; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: right; font-size: 13px; }
    th { background: #f8fafc; font-weight: 800; color: #0f172a; }
    .table-label { background: #f1f5f9; font-weight: bold; width: 22%; }
    .activity-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 16px;
    }
    .res-box { padding: 8px 12px; border-radius: 10px; margin-top: 6px; font-size: 12px; }
    .res-primary { background: #ecfdf5; border: 1px solid #10b981; color: #064e3b; }
    .res-alt1 { background: #f0f9ff; border: 1px solid #38bdf8; color: #0369a1; }
    .res-alt2 { background: #fffbeb; border: 1px solid #f59e0b; color: #78350f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-banner">
      <div style="margin-bottom: 8px;">
        <span class="badge badge-amber">دليل المعلم الفلسطيني OER</span>
        <span class="badge badge-emerald">البوابة التعليمية elearn.edu.ps</span>
        <span class="badge badge-emerald">المرحلة الأساسية (الصفوف ١-٤)</span>
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 900;">استمارة خطة درس مستندة لمصادر التعليم المفتوحة OER</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.9;">${l.subject} • ${l.grade} • ${l.lessonTitle}</p>
    </div>

    <div class="section-title">١. بيانات الدرس الأساسية</div>
    <table>
      <tr>
        <td class="table-label">المبحث / المادة:</td>
        <td><strong>${l.subject}</strong></td>
        <td class="table-label">الصف والشعبة:</td>
        <td>${l.grade} (شعبة: ${l.section || 'أ'})</td>
      </tr>
      <tr>
        <td class="table-label">عنوان الدرس:</td>
        <td>${l.lessonTitle}</td>
        <td class="table-label">مدة الحصة:</td>
        <td>${toArabicDigits(l.durationMinutes || 40)} دقيقة</td>
      </tr>
      <tr>
        <td class="table-label">اسم المعلم/ة:</td>
        <td>${l.teacherName}</td>
        <td class="table-label">المدرسة والمديرية:</td>
        <td>${l.school} • ${l.directorate}</td>
      </tr>
      <tr>
        <td class="table-label">التاريخ والفصل:</td>
        <td>${l.date} • ${l.semester}</td>
        <td class="table-label">الوحدة الدراسية:</td>
        <td>${l.unitTitle || '—'}</td>
      </tr>
    </table>

    <div class="section-title">٢. الكفايات المستهدفة</div>
    <table>
      <tr>
        <td class="table-label">الكفاية العامة:</td>
        <td>${o.targetCompetencies.generalCompetency || '—'}</td>
      </tr>
      <tr>
        <td class="table-label">الكفاية الخاصة:</td>
        <td>${o.targetCompetencies.specificCompetency || '—'}</td>
      </tr>
      <tr>
        <td class="table-label">مؤشرات أداء قابلة للملاحظة:</td>
        <td>
          <ol style="margin: 0; padding-right: 20px;">
            ${o.targetCompetencies.observableIndicators.map((ind) => `<li>${ind}</li>`).join('')}
          </ol>
        </td>
      </tr>
    </table>

    <div class="section-title">٣. الموقف التعليمي ومصادر OER (رئيسي + بديلان لكل نشاط)</div>
    ${o.activities
      .map(
        (act) => `
    <div class="activity-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong style="font-size: 15px; color: #047857;">${act.title}</strong>
        <span style="background: #e2e8f0; padding: 3px 10px; border-radius: 8px; font-weight: bold; font-size: 12px;">${toArabicDigits(act.allocatedTimeMinutes)} دقيقة</span>
      </div>
      <p style="margin: 0 0 10px 0; font-size: 13.5px; line-height: 1.7;">${act.description}</p>
      <div style="font-size: 12px; color: #334155; margin-bottom: 12px;">
        <strong>دور الطلبة:</strong> ${act.studentRoles} ${act.studentRolesDetails ? `(${act.studentRolesDetails})` : ''} | 
        <strong>المنتج المتوقع:</strong> ${act.expectedProducts || 'إنجاز المطلوب'}
      </div>

      <div style="margin-top: 10px;">
        <strong style="font-size: 12.5px; color: #0f172a;">مصادر التعليم المفتوحة OER:</strong>
        <div class="res-box res-primary">
          <strong>🌟 مصدر رئيسي:</strong> ${act.primaryResource.title} 
          <span style="font-size: 11px; opacity: 0.85;">(${act.primaryResource.type} • ${act.primaryResource.licenseType === 'ministry_elearn' ? 'معتمد elearn.edu.ps' : 'مشاع إبداعي'})</span>
          ${act.primaryResource.directUrl ? `<br><a href="${act.primaryResource.directUrl}" target="_blank" style="color: #0284c7;">${act.primaryResource.directUrl}</a>` : ''}
        </div>
        <div class="res-box res-alt1">
          <strong>🔄 بديل ١:</strong> ${act.alternativeResource1.title}
        </div>
        <div class="res-box res-alt2">
          <strong>🔄 بديل ٢ (أوفلاين):</strong> ${act.alternativeResource2.title}
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 12px; font-size: 12px; background: #ffffff; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="flex: 1;"><strong>التقويم التكويني:</strong> ${act.formativeAssessment || 'ملاحظة وتغذية راجعة'}</div>
        <div style="flex: 1;"><strong>تقويم المنتج:</strong> ${act.productAssessment || 'سلم تقدير'}</div>
      </div>
    </div>
    `
      )
      .join('')}

    <div class="section-title">٤. التقويم الختامي الشامل</div>
    <table>
      <tr>
        <td class="table-label">المهمة الختامية:</td>
        <td>${o.summativeAssessment.description || '—'}</td>
      </tr>
      <tr>
        <td class="table-label">أداة التقويم:</td>
        <td>${o.summativeAssessment.assessmentTool || 'سلم تقدير لفظي (Rubric)'}</td>
      </tr>
      <tr>
        <td class="table-label">الربط بمؤشرات الكفاية:</td>
        <td>${o.summativeAssessment.alignmentWithIndicators || '—'}</td>
      </tr>
    </table>

    <div class="section-title">٥. بدائل وملاحظات ما بعد الدرس</div>
    <table>
      <tr>
        <td class="table-label">حلول عند تعذر مصدر:</td>
        <td>${o.contingenciesAndNotes.sourceContingencies || 'الاعتماد على البدائل الأوفلاين والخامات البيئية.'}</td>
      </tr>
      <tr>
        <td class="table-label">ما بعد الدرس (التأمل الذاتي):</td>
        <td>${o.contingenciesAndNotes.postLessonReflection || 'استيفاء النتاجات بنجاح.'}</td>
      </tr>
      <tr>
        <td class="table-label">متابعة الطلبة والدعم:</td>
        <td>${o.contingenciesAndNotes.followUpActions || 'دعم تشخيصي وإثرائي.'}</td>
      </tr>
    </table>

    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
      منظومة عبقور للتخطيط التربوي وتحضير الدروس • إعداد وتصميم: أ. عبد الرحمن دويكات • متوافق كلياً مع بوابة elearn.edu.ps
    </div>
  </div>
</body>
</html>
    `.trim();

    const fileName = `خطة_درس_OER_${(l.subject || 'مبحث').replace(/[\s/\\:]+/g, '_')}_${(l.lessonTitle || 'درس').replace(/[\s/\\:]+/g, '_')}.html`;
    downloadBlob(oerHtmlDoc, fileName, 'text/html;charset=utf-8');
    return;
  }

  const htmlDoc = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خطة درس: ${h.lessonTitle} - ${h.subject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      direction: rtl;
      text-align: right;
      font-family: 'Cairo', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      line-height: 1.6;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      overflow: hidden;
      padding: 32px;
    }
    .header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .section-title {
      background: #047857;
      color: white;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 15px;
      margin: 24px 0 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .rubric-excellence {
      background: #ecfdf5;
      font-weight: 700;
      color: #065f46;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print" style="text-align: left; margin-bottom: 15px;">
      <button onclick="window.print()" style="background: #047857; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">
        🖨️ طباعة الصفحة أو حفظ كـ PDF
      </button>
    </div>

    <div class="header-banner">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 12px;">
        <div>
          <strong>${h.country}</strong> • ${h.ministry} • ${h.school}
        </div>
        <div>
          المعلم/ة: ${h.teacherName} • التاريخ: ${toArabicDigits(h.date)}
        </div>
      </div>
      <h1 style="margin: 0; font-family: 'Tajawal'; font-size: 24px;">خطة درس: ${toArabicDigits(h.lessonTitle)}</h1>
      <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">
        المبحث: ${h.subject} | الصف: ${h.grade} (${h.section}) | الحصة (${toArabicDigits(h.currentPeriod)} من ${toArabicDigits(h.totalPeriods)}) • ${toArabicDigits(h.periodDurationMinutes)} دقيقة
      </p>
    </div>

    <div class="section-title">أولاً: التحليل والتخطيط التكيفي</div>
    <table>
      <tr>
        <th style="width: 25%;">الكفايات التكاملية</th>
        <td>
          <ul>
            ${p.section1.integrativeCompetencies.map((c) => `<li><strong>${c.title}:</strong> ${c.description}</li>`).join('')}
          </ul>
        </td>
      </tr>
      <tr>
        <th>تحليل خصائص الطلبة</th>
        <td>
          <p><strong>الفروق الفردية:</strong> ${p.section1.studentCharacteristics.individualDifferences}</p>
          <p><strong>الاحتياجات الخاصة:</strong> ${p.section1.studentCharacteristics.specialNeeds}</p>
          <p><strong>التكييف البيئي:</strong> ${p.section1.studentCharacteristics.environmentalAdaptation}</p>
        </td>
      </tr>
    </table>

    <div class="section-title">ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم</div>
    <table>
      <thead>
        <tr>
          <th>المرحلة والزمن</th>
          <th>إجراءات المعلم وأنشطة المتعلم</th>
          <th>الاستراتيجيات ومصادر التعلم</th>
          <th>التقويم والتغذية الراجعة</th>
        </tr>
      </thead>
      <tbody>
        ${p.section2Timeline
          .map(
            (ph) => `
          <tr>
            <td><strong>${ph.phaseName}</strong><br><span style="color:#047857;">(${toArabicDigits(ph.durationMinutes)} د)</span></td>
            <td><ul>${ph.teacherAndStudentActions.map((a) => `<li>${toArabicDigits(a)}</li>`).join('')}</ul></td>
            <td><ul>${ph.strategiesAndResources.map((s) => `<li>${toArabicDigits(s)}</li>`).join('')}</ul></td>
            <td><ul>${ph.assessmentAndFeedback.map((e) => `<li>${toArabicDigits(e)}</li>`).join('')}</ul></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="section-title">ثالثاً: التقويم الأصيل (GRASPS) وسلالم التقدير والأنشطة</div>
    <table>
      <tr>
        <th style="width: 25%;">مهمة التقويم الأصيل (GRASPS)</th>
        <td>
          <p><strong>العنوان:</strong> ${toArabicDigits(p.section3Assessment.graspsTask.title)}</p>
          <p><strong>الوصف:</strong> ${toArabicDigits(p.section3Assessment.graspsTask.fullDescription)}</p>
        </td>
      </tr>
    </table>

    <table>
      <thead>
        <tr>
          <th>المعيار</th>
          <th>مبتدئ</th>
          <th>نامٍ</th>
          <th>كفء</th>
          <th>متميز (الدرجة ٤)</th>
        </tr>
      </thead>
      <tbody>
        ${p.section3Assessment.rubric
          .map(
            (r) => `
          <tr>
            <td><strong>${r.criterion}</strong></td>
            <td>${r.level1}</td>
            <td>${r.level2}</td>
            <td>${r.level3}</td>
            <td class="rubric-excellence">${r.level4}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="section-title">رابعاً: بيئة التعلم والشراكة الأسرية</div>
    <table>
      <tr>
        <th style="width: 25%;">بطاقة الشراكة الأسرية</th>
        <td>
          <p><strong>المهمة المنزلية:</strong> ${toArabicDigits(p.section4Environment.familyPartnership.studentTask)}</p>
          <p><strong>دور ولي الأمر:</strong> ${p.section4Environment.familyPartnership.parentRole}</p>
        </td>
      </tr>
    </table>

    <div class="section-title">خامساً: التأمل الذاتي والتطور المهني</div>
    <table>
      <tr>
        <th style="width: 25%;">مواطن القوة والأثر</th>
        <td>
          <ul>
            ${p.section5Reflection.strengthsAndImpact.map((s) => `<li>${toArabicDigits(s)}</li>`).join('')}
          </ul>
        </td>
      </tr>
    </table>

    <div class="section-title">سادساً: التوقيع والاعتماد الرسمي</div>
    <table>
      <tr>
        <td style="width: 33%; text-align: center;">
          <strong>المعلم:</strong> ${p.section6Signatures.teacher.name}<br>التوقيع: _____________
        </td>
        <td style="width: 34%; text-align: center;">
          <strong>مدير المدرسة:</strong> ${p.section6Signatures.schoolPrincipal.name}<br>الختم والتوقيع: _____________
        </td>
        <td style="width: 33%; text-align: center;">
          <strong>المشرف التربوي:</strong> ${p.section6Signatures.educationalSupervisor.name}<br>الاعتماد: _____________
        </td>
      </tr>
    </table>
    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #64748b;">
      <p style="margin: 4px 0; font-weight: bold; color: #064e3b;">
        إعداد وتصميم: الأستاذ عبد الرحمن دويكات | منظومة عبقور للتخطيط التربوي وتحضير الدروس
      </p>
      <p style="margin: 4px 0;">
        جميع الحقوق محفوظة لصالح الأستاذ عبد الرحمن دويكات © ومحمية بموجب رخصة المشاع الإبداعي (CC BY-NC-SA 4.0) نَسْب المُصنَّف - غير تجاري - الترخيص بالمثل.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const fileName = `خطة_درس_${h.subject}_${h.lessonTitle.replace(/[\s/\\:]+/g, '_')}.html`;
  downloadBlob(htmlDoc, fileName, 'text/html;charset=utf-8');
}

/**
 * Exports the complete Lesson Plan as a Markdown document (.md).
 */
export function exportToMarkdown(plan: LessonPlan) {
  const p = plan;
  const h = p.header;

  const markdownContent = `
# خطة درس نموذجية متكاملة
**الدولة:** ${h.country} | **الوزارة:** ${h.ministry} | **المديرية:** ${h.directorate} | **المدرسة:** ${h.school}
**المبحث:** ${h.subject} | **الصف والشعبة:** ${h.grade} - الشعبة (${h.section})
**عنوان الدرس:** ${toArabicDigits(h.lessonTitle)}
**المعلم/ة:** ${h.teacherName} | **التاريخ:** ${toArabicDigits(h.date)} | **الفصل:** ${h.semester}
**الحصة:** ${toArabicDigits(h.currentPeriod)} من أصل ${toArabicDigits(h.totalPeriods)} حصص • مدة الحصة: ${toArabicDigits(h.periodDurationMinutes)} دقيقة

---

## أولاً: التحليل والتخطيط التكيفي ومصادر التعلم

### 1. الكفايات التكاملية الأربعة:
${p.section1.integrativeCompetencies.map((c: any) => `- **${c.title}:** ${c.description}`).join('\n')}

### 2. تحليل خصائص الطلبة والتكييف:
- **الفروق الفردية:** ${p.section1.studentCharacteristics.individualDifferences}
- **ذوو الاحتياجات الخاصة:** ${p.section1.studentCharacteristics.specialNeeds}
- **التكييف البيئي الصفي:** ${p.section1.studentCharacteristics.environmentalAdaptation}

### 3. مصادر التعلم والمراجع:
- **الكتاب المدرسي:** ${p.section1.learningResources.textbook}
- **الوسائط والمحسوسات:** ${p.section1.learningResources.tangibleMedia}
- **الجاهزية الرقمية:** ${p.section1.learningResources.digitalReadiness}

---

## ثانياً: الأنشطة التعليمية وتسلل سير الدرس (التدريس المتمركز حول المتعلم)

${p.section2Timeline.map((phase: any, idx: number) => `
### الخطوة ${toArabicDigits(idx + 1)}: ${phase.phaseName} (${toArabicDigits(phase.durationMinutes)} دقيقة)
- **إجراءات المعلم وأنشطة المتعلم:**
  ${phase.teacherAndStudentActions.map((a: string) => `  - ${toArabicDigits(a)}`).join('\n')}
- **استراتيجيات ومصادر التعلم:**
  ${phase.strategiesAndResources.map((s: string) => `  - ${toArabicDigits(s)}`).join('\n')}
- **التقويم والتغذية الراجعة:**
  ${phase.assessmentAndFeedback.map((e: string) => `  - ${toArabicDigits(e)}`).join('\n')}
`).join('\n')}

---

## ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة

### 1. مهمة التقويم الأصيل (GRASPS):
- **عنوان المهمة:** ${p.section3Assessment.graspsTask.title}
- **الدور (Role):** ${p.section3Assessment.graspsTask.role}
- **الجمهور (Audience):** ${p.section3Assessment.graspsTask.audience}
- **الموقف (Situation):** ${p.section3Assessment.graspsTask.situation}
- **المنتج (Product):** ${p.section3Assessment.graspsTask.product}
- **المعايير:** ${p.section3Assessment.graspsTask.standards}
- **الوصف التفصيلي:** ${p.section3Assessment.graspsTask.fullDescription}

### 2. سلم التقدير اللفظي (Rubric):
${p.section3Assessment.rubric.map((r: any, idx: number) => `
- **المعيار ${toArabicDigits(idx + 1)}: ${r.criterion}**
  - *مبتدئ (1):* ${r.level1}
  - *نامٍ (2):* ${r.level2}
  - *كفء (3):* ${r.level3}
  - *متميز (4):* ${r.level4}
`).join('\n')}

### 3. الأنشطة العلاجية والإثراء:
- **الأنشطة العلاجية:**
  ${p.section3Assessment.remedialActivities.map((a: any) => `  - **${a.title}:** ${a.description}`).join('\n')}
- **أنشطة الإثراء:**
  - **العنوان:** ${p.section3Assessment.enrichmentActivities.title}
  - **التحدي / اللغز:** ${p.section3Assessment.enrichmentActivities.puzzleOrChallenge}
  - **التعلم بالقرناء:** ${p.section3Assessment.enrichmentActivities.peerTutoring}

---

## رابعاً: بيئة التعلم والشراكة الأسرية

- **الروتين الصفى:** ${p.section4Environment.classroomRoutines}
- **المناخ الآمن والمحفز:** ${p.section4Environment.safeAndMotivatingClimate}
- **بطاقة الشراكة الأسرية:**
  - **عنوان البطاقة:** ${p.section4Environment.familyPartnership.cardTitle}
  - **التعليمات:** ${p.section4Environment.familyPartnership.instructions}
  - **مهمة الطالب المنزلية:** ${p.section4Environment.familyPartnership.studentTask}
  - **دور ولي الأمر:** ${p.section4Environment.familyPartnership.parentRole}

---

## خامساً: التأمل الذاتي والتطور المهني

- **مواطن القوة وأثر التعلم:**
  ${p.section5Reflection.strengthsAndImpact.map((s: string) => `  - ${s}`).join('\n')}
- **فرص التحسين والتطوير:** ${p.section5Reflection.improvementOpportunities}
- **مجتمعات التعلم المهنية (PLCs):** ${p.section5Reflection.professionalLearningCommunities}

---

## سادساً: التوقيع والاعتماد الرسمي

- **المعلم/ة:** ${p.section6Signatures.teacher.name} (التاريخ: ${toArabicDigits(p.section6Signatures.teacher.date)})
- **مدير/ة المدرسة:** ${p.section6Signatures.schoolPrincipal.name} (التاريخ: ${toArabicDigits(p.section6Signatures.schoolPrincipal.date)})
- **المشرف/ة التربوي/ة:** ${p.section6Signatures.educationalSupervisor.name} (التاريخ: ${toArabicDigits(p.section6Signatures.educationalSupervisor.date)})

---
*إعداد وتصميم: الأستاذ عبد الرحمن دويكات | منظومة عبقور للتخطيط التربوي*
*جميع الحقوق محفوظة © برخصة المشاع الإبداعي (CC BY-NC-SA 4.0)*
  `.trim();

  const fileName = `خطة_درس_${h.subject}_${h.lessonTitle.replace(/[\s/\\:]+/g, '_')}.md`;
  downloadBlob(markdownContent, fileName, 'text/markdown;charset=utf-8');
}

/**
 * Direct PDF Export from LessonPlan data object.
 * Creates an offscreen ministerial document container and downloads high-res PDF.
 */
export async function exportToPdfDirect(plan: LessonPlan, onProgress?: (msg: string) => void): Promise<void> {
  const p = plan;
  const h = p.header;

  const container = document.createElement('div');
  container.className = 'official-document-wrapper official-print-page';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0px';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '28px';
  container.style.direction = 'rtl';
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.color = '#000000';

  container.innerHTML = `
    <div style="direction: rtl; text-align: right; color: #000; font-family: 'Cairo', sans-serif; font-size: 12px; line-height: 1.5;">
      <!-- Top Banner -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-weight: bold; font-size: 11px;">
          <p style="margin: 0;">${h.country || 'دولة فلسطين'}</p>
          <p style="margin: 0;">${h.ministry || 'وزارة التربية والتعليم'}</p>
          <p style="margin: 0;">${h.school || 'المدرسة'}</p>
        </div>
        <div style="text-align: center;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900;">منظومة عبقور للتخطيط التربوي وتحضير الدروس</h2>
          <h3 style="margin: 4px 0 0 0; font-size: 14px; text-decoration: underline;">نموذج تحضير درس رسمي معتمد (${h.subject})</h3>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #333;">المعلم/ة: ${h.teacherName} | العام الدراسي: ${getCurrentAcademicYear(h.startDate || h.date)}</p>
        </div>
        <div style="text-align: left; font-size: 11px; font-weight: bold;">
          <p style="margin: 0;"><strong>الصف:</strong> ${h.grade} (${h.section})</p>
          <p style="margin: 0;"><strong>الحصص:</strong> ${toArabicDigits(h.currentPeriod)} من ${toArabicDigits(h.totalPeriods)}</p>
          <p style="margin: 0;"><strong>التاريخ:</strong> ${toArabicDigits(h.startDate || h.date)}</p>
        </div>
      </div>

      <!-- General Info Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; border: 1px solid #000;">
        <tr>
          <th style="border: 1px solid #000; background: #f0f0f0; padding: 5px; text-align: right; width: 18%;">المبحث / المادة:</th>
          <td style="border: 1px solid #000; padding: 5px; width: 32%; font-weight: bold;">${h.subject}</td>
          <th style="border: 1px solid #000; background: #f0f0f0; padding: 5px; text-align: right; width: 18%;">عنوان الدرس:</th>
          <td style="border: 1px solid #000; padding: 5px; width: 32%; font-weight: bold;">${toArabicDigits(h.lessonTitle)}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #000; background: #f0f0f0; padding: 5px; text-align: right;">الصف والشعبة:</th>
          <td style="border: 1px solid #000; padding: 5px;">${h.grade} / الشعبة (${h.section})</td>
          <th style="border: 1px solid #000; background: #f0f0f0; padding: 5px; text-align: right;">المديرية والوزارة:</th>
          <td style="border: 1px solid #000; padding: 5px;">${h.directorate} (${h.ministry})</td>
        </tr>
        <tr>
          <th style="border: 1px solid #000; background: #f0f0f0; padding: 5px; text-align: right;">الفترة الزمنية للدرس:</th>
          <td colspan="3" style="border: 1px solid #000; padding: 5px;">
            من (${formatDateDMY(h.startDate || h.date)}) إلى (${formatDateDMY(h.endDate || h.date)})
            <span style="font-size: 9.5px; color: #047857; margin-right: 8px;">(مراعاة الجمعة والسبت والإجازات الرسمية الوزارية)</span>
          </td>
        </tr>
      </table>

      <!-- Section 1 -->
      <div style="background: #064e3b; color: #fff; padding: 4px 8px; font-weight: bold; margin-top: 10px; margin-bottom: 6px;">
        أولاً: التحليل والتخطيط التكيفي ومصادر التعلم
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px; border: 1px solid #000;">
        <tr>
          <th style="border: 1px solid #000; background: #f8fafc; padding: 5px; width: 22%; text-align: right;">الكفايات التكاملية:</th>
          <td style="border: 1px solid #000; padding: 5px;">
            ${p.section1.integrativeCompetencies.map(c => `• <strong>${c.title}:</strong> ${c.description}`).join('<br>')}
          </td>
        </tr>
        <tr>
          <th style="border: 1px solid #000; background: #f8fafc; padding: 5px; text-align: right;">مصادر التعلم والجاهزية:</th>
          <td style="border: 1px solid #000; padding: 5px;">
            <strong>الكتاب:</strong> ${p.section1.learningResources.textbook} | <strong>المحسوسات:</strong> ${p.section1.learningResources.tangibleMedia}
          </td>
        </tr>
      </table>

      <!-- Section 2 Timeline -->
      <div style="background: #064e3b; color: #fff; padding: 4px 8px; font-weight: bold; margin-top: 10px; margin-bottom: 6px;">
        ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم (الجدول الرباعي)
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px; border: 1px solid #000;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 5px; width: 20%; text-align: right;">المرحلة والزمن</th>
            <th style="border: 1px solid #000; padding: 5px; width: 40%; text-align: right;">إجراءات المعلم وأنشطة المتعلم</th>
            <th style="border: 1px solid #000; padding: 5px; width: 20%; text-align: right;">الاستراتيجيات</th>
            <th style="border: 1px solid #000; padding: 5px; width: 20%; text-align: right;">التقويم والتغذية</th>
          </tr>
        </thead>
        <tbody>
          ${p.section2Timeline.map(phase => `
            <tr>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold;">
                ${phase.phaseName}<br>
                <span style="color: #047857;">(${toArabicDigits(phase.durationMinutes)} دقائق)</span>
              </td>
              <td style="border: 1px solid #000; padding: 5px;">${phase.teacherAndStudentActions.map(a => `• ${toArabicDigits(a)}`).join('<br>')}</td>
              <td style="border: 1px solid #000; padding: 5px;">${phase.strategiesAndResources.map(s => `• ${toArabicDigits(s)}`).join('<br>')}</td>
              <td style="border: 1px solid #000; padding: 5px;">${phase.assessmentAndFeedback.map(e => `• ${toArabicDigits(e)}`).join('<br>')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Section 3 GRASPS & Rubric -->
      <div style="background: #064e3b; color: #fff; padding: 4px 8px; font-weight: bold; margin-top: 10px; margin-bottom: 6px;">
        ثالثاً: التقويم المستمر ومهمة التقويم الأصيل (GRASPS)
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px; border: 1px solid #000;">
        <tr>
          <th style="border: 1px solid #000; background: #f8fafc; padding: 5px; width: 22%; text-align: right;">مهمة GRASPS:</th>
          <td style="border: 1px solid #000; padding: 5px;">
            <strong>${toArabicDigits(p.section3Assessment.graspsTask.title)}</strong>: ${toArabicDigits(p.section3Assessment.graspsTask.fullDescription)}
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <div style="margin-top: 15px; border-top: 1px solid #000; padding-top: 6px; text-align: center; font-size: 9.5px; color: #333;">
        إعداد وتصميم: الأستاذ عبد الرحمن دويكات | منظومة عبقور للتخطيط التربوي وتحضير الدروس © (CC BY-NC-SA 4.0)
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const sanitizedTitle = (h.lessonTitle || 'خطة_درس').replace(/[/\\?%*:|"<>]/g, '-').trim();
    await exportLessonPlanToPdf(container, {
      fileName: `${sanitizedTitle}_نموذج_وزاري_عبقور.pdf`,
      onProgress,
    });
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

