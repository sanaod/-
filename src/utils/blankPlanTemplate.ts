import { LessonPlan } from '../types/lessonPlan';
import { getCurrentAcademicYear } from './academicYear';
import { formatDateDMY } from './arabicNumerals';
import { formatDateToIso } from './palestinianCalendar';

/**
 * Creates a pristine blank lesson plan object with guided placeholder prompts
 * according to ministerial lesson planning standards.
 */
export function createBlankLessonPlan(options?: {
  subject?: string;
  grade?: string;
  lessonTitle?: string;
  teacherName?: string;
  school?: string;
  startDate?: string;
  endDate?: string;
  timeframe?: string;
}): LessonPlan {
  const timestamp = Date.now();
  const dateStr = options?.startDate || formatDateToIso(new Date());

  return {
    id: `plan-blank-${timestamp}`,
    title: options?.lessonTitle?.trim()
      ? `خطة درس: ${options.lessonTitle}`
      : 'خطة درس جديدة (نموذج مفرغ للتحضير)',
    header: {
      country: 'دولة فلسطين',
      ministry: 'وزارة التربية والتعليم',
      school: options?.school || '',
      directorate: '',
      teacherName: options?.teacherName || '',
      subject: options?.subject || '',
      grade: options?.grade || '',
      section: '',
      lessonTitle: options?.lessonTitle || '',
      totalPeriods: 1,
      currentPeriod: 1,
      periodDurationMinutes: 40,
      date: dateStr,
      startDate: options?.startDate || dateStr,
      endDate: options?.endDate || dateStr,
      timeframe: options?.timeframe || `من (${formatDateDMY(dateStr)}) إلى (${formatDateDMY(dateStr)})`,
      semester: 'الفصل الدراسي الأول',
    },
    section1: {
      integrativeCompetencies: [
        {
          title: '',
          description: '',
        },
        {
          title: '',
          description: '',
        },
        {
          title: '',
          description: '',
        },
      ],
      studentCharacteristics: {
        individualDifferences: '',
        specialNeeds: '',
        environmentalAdaptation: '',
      },
      learningResources: {
        textbook: '',
        tangibleMedia: '',
        digitalReadiness: '',
      },
      ethicsAndSafety: {
        digitalSafety: '',
        contentAccuracyAndLanguage: '',
      },
      reflectiveQuestions: ['', ''],
    },
    section2Timeline: [
      {
        id: `p1-${timestamp}`,
        phaseName: '1. التمهيد والتهيئة (إثارة الدافعية والربط الاستكشافي)',
        durationMinutes: 5,
        teacherAndStudentActions: [''],
        strategiesAndResources: [''],
        assessmentAndFeedback: [''],
      },
      {
        id: `p2-${timestamp}`,
        phaseName: '2. العرض والاستكشاف (النمذجة والمحسوسات والمفاهيم)',
        durationMinutes: 15,
        teacherAndStudentActions: [''],
        strategiesAndResources: [''],
        assessmentAndFeedback: [''],
      },
      {
        id: `p3-${timestamp}`,
        phaseName: '3. التطبيق والتعميق (المهام الأصيلة GRASPS والأنشطة المتمايزة)',
        durationMinutes: 12,
        teacherAndStudentActions: [''],
        strategiesAndResources: [''],
        assessmentAndFeedback: [''],
      },
      {
        id: `p4-${timestamp}`,
        phaseName: '4. الخاتمة والتقويم (بطاقة الخروج والتغذية الختامية والربط القيمي)',
        durationMinutes: 8,
        teacherAndStudentActions: [''],
        strategiesAndResources: [''],
        assessmentAndFeedback: [''],
      },
    ],
    section3Assessment: {
      graspsTask: {
        title: '',
        role: '',
        audience: '',
        situation: '',
        product: '',
        standards: '',
        fullDescription: '',
      },
      rubric: [
        {
          criterion: '',
          level1: '',
          level2: '',
          level3: '',
          level4: '',
        },
        {
          criterion: '',
          level1: '',
          level2: '',
          level3: '',
          level4: '',
        },
        {
          criterion: '',
          level1: '',
          level2: '',
          level3: '',
          level4: '',
        },
      ],
      remedialActivities: [
        {
          title: '',
          description: '',
        },
      ],
      enrichmentActivities: {
        title: '',
        puzzleOrChallenge: '',
        peerTutoring: '',
      },
      immediateFeedback: [''],
    },
    section4Environment: {
      classroomRoutines: '',
      safeAndMotivatingClimate: '',
      familyPartnership: {
        cardTitle: '',
        instructions: '',
        studentTask: '',
        parentRole: '',
      },
    },
    section5Reflection: {
      strengthsAndImpact: [''],
      improvementOpportunities: '',
      professionalLearningCommunities: '',
    },
    section6Signatures: {
      teacher: {
        name: options?.teacherName || '',
        date: dateStr,
        notes: '',
      },
      schoolPrincipal: {
        name: '',
        date: '',
        directives: '',
      },
      educationalSupervisor: {
        name: '',
        date: '',
        directives: '',
      },
    },
  };
}

/**
 * Exports a blank ministerial lesson planning template formatted for Word (.doc),
 * featuring tables, writing lines, and guidelines.
 */
export function exportBlankTemplateToWord() {
  const htmlDoc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>استمارة تحضير درس مفرغة - النموذج الوزاري المعتمد</title>
<style>
  body {
    direction: rtl;
    text-align: right;
    font-family: 'Traditional Arabic', 'Calibri', 'Arial', sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111;
    margin: 20mm 15mm;
  }
  h1 { font-size: 16pt; text-align: center; color: #064e3b; margin-bottom: 2pt; font-weight: bold; }
  h2 { font-size: 13pt; color: #065f46; border-bottom: 1.5pt solid #059669; padding-bottom: 3pt; margin-top: 14pt; font-weight: bold; }
  h3 { font-size: 11pt; color: #1e3a8a; margin: 4pt 0; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 10.5pt; }
  th, td { border: 1pt solid #64748b; padding: 6pt 8pt; text-align: right; vertical-align: top; }
  th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
  .line { border-bottom: 1pt dotted #94a3b8; height: 18pt; margin: 4pt 0; }
  .box { border: 1pt solid #cbd5e1; background-color: #fafafa; padding: 8pt; min-height: 40pt; margin: 4pt 0; }
  .header-table td { border: none; padding: 3pt 6pt; }
</style>
</head>
<body>

<table class="header-table" style="margin-bottom: 10pt;">
  <tr>
    <td style="width: 33%; text-align: right;">
      <b>دولة فلسطين</b><br/>
      <b>وزارة التربية والتعليم</b><br/>
      مديرية التربية والتعليم: .............................
    </td>
    <td style="width: 34%; text-align: center;">
      <h1>استمارة تحضير درس نموذجية (مفرغة)</h1>
      <p style="font-size: 10pt; color: #475569; margin: 0;">وفق إطار تقييم أداء المعلم ومعايير التميز (الدرجة 4)</p>
    </td>
    <td style="width: 33%; text-align: left;">
      المدرسة: .......................................<br/>
      العام الدراسي: ${getCurrentAcademicYear()}<br/>
      الفصل الدراسي: .............................
    </td>
  </tr>
</table>

<h2>بطاقة بيانات الدرس</h2>
<table>
  <tr>
    <th style="width: 20%;">المبحث الدراسي</th>
    <td style="width: 30%;">...................................................</td>
    <th style="width: 20%;">الصف والشعبة</th>
    <td style="width: 30%;">...................................................</td>
  </tr>
  <tr>
    <th>عنوان الدرس</th>
    <td>...................................................</td>
    <th>اسم المعلم/ة</th>
    <td>...................................................</td>
  </tr>
  <tr>
    <th>عدد الحصص والزمن</th>
    <td>(     ) حصص · زمن الحصة: ( 40 ) دقيقة</td>
    <th>تاريخ التنفيذ</th>
    <td>..... / ..... / ٢٠٢٦م</td>
  </tr>
  <tr>
    <th>الفترة الزمنية للدرس:</th>
    <td colspan="3">
      من ..... / ..... / ٢٠٢٦م &nbsp; إلى &nbsp; ..... / ..... / ٢٠٢٦م &nbsp;
      <span style="font-size: 9.5pt; color: #047857; font-weight: bold;">(مع استثناء عطلة يومي الجمعة والسبت والإجازات الرسمية المعتمدة لوزارة التربية والتعليم الفلسطينية)</span>
    </td>
  </tr>
</table>

<h2>القسم الأول: التخطيط التكيفي ومراعاة الفروق الفردية</h2>

<h3>١. الكفايات التكاملية المستهدفة:</h3>
<table>
  <tr>
    <th style="width: 30%;">مجال الكفاية</th>
    <th style="width: 70%;">المؤشر السلوكي الإجرائي المرجو تحقيقه</th>
  </tr>
  <tr>
    <td>كفاية التفكير الناقد وحل المشكلات</td>
    <td><div class="line"></div><div class="line"></div></td>
  </tr>
  <tr>
    <td>كفاية المواطنة والهوية الوطنية</td>
    <td><div class="line"></div><div class="line"></div></td>
  </tr>
  <tr>
    <td>كفاية الحساب / القرائية والتعبير</td>
    <td><div class="line"></div><div class="line"></div></td>
  </tr>
</table>

<h3>٢. مراعاة خصائص واحتياجات الطلبة:</h3>
<table>
  <tr>
    <th style="width: 33%;">الفروق الفردية ومجموعات التعلم</th>
    <th style="width: 33%;">ذوو الاحتياجات وصعوبات التعلم</th>
    <th style="width: 34%;">التكيف البيئي واستخدام المحسوسات</th>
  </tr>
  <tr style="height: 60pt;">
    <td><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div></td>
  </tr>
</table>

<h3>٣. مصادر التعلم والجاهزية الرقمية:</h3>
<table>
  <tr>
    <th style="width: 33%;">الكتاب المدرسي والمراجع</th>
    <th style="width: 33%;">المحسوسات والأدوات الملموسة</th>
    <th style="width: 34%;">الجاهزية الرقمية (دون إنترنت)</th>
  </tr>
  <tr style="height: 50pt;">
    <td><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div></td>
  </tr>
</table>

<h3>٤. الأسئلة التأملية السابرة والمحفزة للتفكير:</h3>
<div class="box">
  <p>• السؤال التأملي الأول: ............................................................................................................................................................</p>
  <p>• السؤال التأملي الثاني: ............................................................................................................................................................</p>
</div>

<h2>القسم الثاني: سير الحصة الرباعي المعتمد وزارياً (٤٠ دقيقة)</h2>
<table>
  <thead>
    <tr>
      <th style="width: 20%;">المرحلة والزمن</th>
      <th style="width: 40%;">إجراءات ونشاط المعلم والمتعلم</th>
      <th style="width: 20%;">الاستراتيجيات والمصادر</th>
      <th style="width: 20%;">التقويم والتغذية الراجعة</th>
    </tr>
  </thead>
  <tbody>
    <tr style="height: 70pt;">
      <td>
        <b>١. التمهيد والتهيئة</b><br/>
        (٥ دقائق)<br/>
        <span style="font-size: 9pt; color: #475569;">إثارة الدافعية والربط الاستكشافي</span>
      </td>
      <td><div class="line"></div><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
    </tr>
    <tr style="height: 90pt;">
      <td>
        <b>٢. العرض والاستكشاف</b><br/>
        (١٥ دقيقة)<br/>
        <span style="font-size: 9pt; color: #475569;">النمذجة والمحسوسات والمفاهيم</span>
      </td>
      <td><div class="line"></div><div class="line"></div><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
    </tr>
    <tr style="height: 85pt;">
      <td>
        <b>٣. التطبيق والتعميق</b><br/>
        (١٢ دقيقة)<br/>
        <span style="font-size: 9pt; color: #475569;">المهام الأصيلة GRASPS والأنشطة المتمايزة</span>
      </td>
      <td><div class="line"></div><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
    </tr>
    <tr style="height: 70pt;">
      <td>
        <b>٤. الخاتمة والتقويم</b><br/>
        (٨ دقائق)<br/>
        <span style="font-size: 9pt; color: #475569;">بطاقة الخروج والتغذية الختامية</span>
      </td>
      <td><div class="line"></div><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
      <td><div class="line"></div><div class="line"></div></td>
    </tr>
  </tbody>
</table>

<h2>القسم الثالث: التقويم الأصيل (GRASPS) وسلم التقدير اللفظي (Rubric)</h2>

<h3>مهمة التقويم الأصيل (GRASPS):</h3>
<table>
  <tr><th style="width: 20%;">عنوان المهمة</th><td colspan="3"><div class="line"></div></td></tr>
  <tr>
    <th style="width: 20%;">الهدف (Goal)</th><td style="width: 30%;"><div class="line"></div></td>
    <th style="width: 20%;">الدور (Role)</th><td style="width: 30%;"><div class="line"></div></td>
  </tr>
  <tr>
    <th>الجمهور (Audience)</th><td><div class="line"></div></td>
    <th>الموقف (Situation)</th><td><div class="line"></div></td>
  </tr>
  <tr>
    <th>المنتج (Product)</th><td><div class="line"></div></td>
    <th>المعايير (Standards)</th><td><div class="line"></div></td>
  </tr>
</table>

<h3>سلم التقدير اللفظي الرباعي (Rubric):</h3>
<table>
  <thead>
    <tr>
      <th style="width: 24%;">معيار التقييم</th>
      <th style="width: 19%;">مبتدئ (١)</th>
      <th style="width: 19%;">نامٍ (٢)</th>
      <th style="width: 19%;">كفء (٣)</th>
      <th style="width: 19%;">متميز (٤)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="height: 45pt;">
      <td><b>المعيار ١:</b><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
    </tr>
    <tr style="height: 45pt;">
      <td><b>المعيار ٢:</b><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
    </tr>
    <tr style="height: 45pt;">
      <td><b>المعيار ٣:</b><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
      <td><div class="line"></div></td>
    </tr>
  </tbody>
</table>

<h2>القسم الرابع: بيئة التعلم والشراكة الأسرية</h2>
<table>
  <tr>
    <th style="width: 50%;">الروتين الصفي والمناخ الآمن المشجع</th>
    <th style="width: 50%;">الشراكة مع أولياء الأمور (مهمة تفاعلية)</th>
  </tr>
  <tr style="height: 60pt;">
    <td><div class="line"></div><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div><div class="line"></div></td>
  </tr>
</table>

<h2>القسم الخامس: التأمل الذاتي والـ PLC</h2>
<table>
  <tr>
    <th style="width: 33%;">نقاط القوة وشواهد التميز</th>
    <th style="width: 33%;">فرص التحسين المستقبلي</th>
    <th style="width: 34%;">مجتمعات التعلم المهني (PLC)</th>
  </tr>
  <tr style="height: 50pt;">
    <td><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div></td>
    <td><div class="line"></div><div class="line"></div></td>
  </tr>
</table>

<h2>القسم السادس: الاعتماد والملاحظات الرسمية</h2>
<table>
  <tr>
    <th style="width: 33%;">توقيع وملاحظات المعلم/ة</th>
    <th style="width: 33%;">توجيهات واعتماد مدير/ة المدرسة</th>
    <th style="width: 34%;">توجيهات المشرف/ة التربوي/ة</th>
  </tr>
  <tr style="height: 70pt;">
    <td>
      الاسم: .......................................<br/>
      التاريخ: ..... / ..... / ٢٠٢٦م<br/>
      الملاحظة: ...................................
    </td>
    <td>
      الاسم: .......................................<br/>
      التاريخ: ..... / ..... / ٢٠٢٦م<br/>
      التوجيه: ...................................
    </td>
    <td>
      الاسم: .......................................<br/>
      التاريخ: ..... / ..... / ٢٠٢٦م<br/>
      التوجيه: ...................................
    </td>
  </tr>
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

  const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'استمارة_تحضير_درس_مفرغة_النموذج_الوزاري.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
