import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from './arabicNumerals';

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

