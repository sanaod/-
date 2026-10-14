import { LessonPlan } from '../types/lessonPlan';
import {
  SmartPedagogicalSuggestionPackage,
  PedagogicalComplianceAuditResult,
  ComplianceWarning,
  MeasurableObjectiveOption,
  CurriculumResourceTriad,
  CompleteLearningSituationSuggestion,
  DifferentiatedActivitiesSuggestion,
} from '../types/smartPedagogicalGuide';
import { PALESTINIAN_OER_DATABASE, getApprovedOerResourcesByContext } from '../data/palestinianOerRegistry';
import { getStoredPalestinianCompetencies } from '../data/palestinianCompetenciesRegistry';
import { toArabicDigits } from './arabicNumerals';

/**
 * توليد فوري للاقتراحات التربوية الذكية الخمسة ملتزمة بالمنهاج الفلسطيني الرسمي ومصادر OER
 */
export function generateInstantPedagogicalSuggestions({
  subject,
  grade,
  lessonTitle,
  topic,
}: {
  subject: string;
  grade: string;
  lessonTitle: string;
  topic?: string;
}): SmartPedagogicalSuggestionPackage {
  const cleanSubject = subject || 'الرياضيات';
  const cleanGrade = grade || 'الصف الرابع';
  const cleanTitle = lessonTitle || topic || 'الدرس النموذجي';
  const cleanTopic = topic || lessonTitle || cleanTitle;

  // 1. الكفايات المستهدفة من إطار الوزارة المعتمد
  const allCompetencies = getStoredPalestinianCompetencies();

  // كفاية عامة مناسبة
  const generalComps = allCompetencies.filter((c) => c.category === 'general');
  const selectedGeneral =
    generalComps.find((c) =>
      cleanTitle.includes('مسألة') || cleanTitle.includes('حل') || cleanTitle.includes('تفكير')
        ? c.domain === 'critical_thinking'
        : cleanTitle.includes('تعبير') || cleanTitle.includes('حوار') || cleanTitle.includes('قصة')
        ? c.domain === 'communication'
        : c.domain === 'creativity'
    ) || generalComps[0];

  // كفاية تخصصية خاصة بالمبحث
  const subjectComps = allCompetencies.filter(
    (c) =>
      c.category === 'subject_specific' &&
      (c.subject.includes(cleanSubject) || cleanSubject.includes(c.subject))
  );
  const selectedSpecific = subjectComps[0] || {
    id: `COMP-SPEC-${Date.now()}`,
    code: 'SPEC-01',
    title: `كفاية التطبيق والاستقصاء في مبحث ${cleanSubject}`,
    statement: `أن يوظف المتعلم مفاهيم ومهارات (${cleanTitle}) في حل مواقف ومشكلات تعليمية وحياتية متصلة بالبيئة الفلسطينية.`,
    subject: cleanSubject,
    domainLabel: `كفايات ${cleanSubject} التخصصية`,
  };

  // 2. 3 خيارات لأهداف ومؤشرات قابلة للملاحظة والقياس
  const objectiveOptions: MeasurableObjectiveOption[] = [
    {
      id: 'obj-opt-1',
      type: 'cognitive',
      typeLabel: 'الهدف المعرفي والاستيعابي الفاحص',
      objectiveStatement: `أن يحلل الطالب المفهوم الجوهري لدرس (${cleanTitle}) مميزاً عناصره الأساسية بدقة لا تقل عن 85%.`,
      performanceIndicator: `يستخرج 3 خصائص رئيسة للمفهوم في مخطط بصري منظّم ويبرهن على فهمه بأمثلة واقعية.`,
      suggestedAssessmentMethod: 'قائمة شطب الملاحظة الصفية وورقة عمل استيعاب بنائية.',
      isSelected: true,
    },
    {
      id: 'obj-opt-2',
      type: 'skill',
      typeLabel: 'الهدف المهاري والتطبيقي الإجرائي',
      objectiveStatement: `أن يطبق الطالب خطوات ومهارات (${cleanTitle}) في حل مهمة أو مسألة تطبيقية تحاكي الحياة اليومية.`,
      performanceIndicator: `ينفذ خطوات الحل الإجرائي بالتسلسل المنطقي السليم موضحاً ناتج تفكيره بدقة متناهية.`,
      suggestedAssessmentMethod: 'مهمة أدائية فردية أو ثنائية مقاسة بسلم تقدير كمي (Rubric).',
      isSelected: true,
    },
    {
      id: 'obj-opt-3',
      type: 'affective',
      typeLabel: 'الهدف القيمي والوجداني والوطني',
      objectiveStatement: `أن يُقدّر الطالب الأهمية الحياتية والوطنية لـ (${cleanTitle}) مبرزاً أثرها في حماية البيئة والتراث الفلسطيني.`,
      performanceIndicator: `يربط بين موضوع الدرس وسلوكيات التعاون وترشيد الموارد والاعتزاز بالهوية الوطنية الفلسطينية.`,
      suggestedAssessmentMethod: 'تقويم الموقف الصفي وملاحظة الحوار والتفاعل والمبادرة الإيجابية.',
      isSelected: true,
    },
  ];

  // 3. ثلاثي المصادر: مصدر رئيسي + مصدرين بديلين من البوابة والمصادر المعتمدة
  const matchedOer = getApprovedOerResourcesByContext({
    subject: cleanSubject,
    grade: cleanGrade,
    topic: cleanTitle,
  });

  const primaryResource = matchedOer[0]
    ? {
        id: matchedOer[0].id,
        title: matchedOer[0].title,
        provider: `${matchedOer[0].publisherNameAr} (الأولوية الأولى المعتمدة)`,
        url: matchedOer[0].directUrl,
        type: matchedOer[0].type,
        pedagogicalNotes: 'المصدر الأساسي المعتمد في المنهاج والشرح الصفي.',
      }
    : {
        id: 'res-pri-default',
        title: `كتاب ودليل المعلم في ${cleanSubject} — البوابة التعليمية الفلسطينية`,
        provider: 'البوابة التعليمية elearn.edu.ps',
        url: 'https://elearn.edu.ps',
        type: 'textbook',
        pedagogicalNotes: 'المرجع الرسمي المعتمد من الإدارة العامة للمناهج.',
      };

  const alternativeResource1 = matchedOer[1]
    ? {
        id: matchedOer[1].id,
        title: matchedOer[1].title,
        provider: matchedOer[1].publisherNameAr,
        url: matchedOer[1].directUrl,
        type: matchedOer[1].type,
        pedagogicalNotes: 'مصدر بديل تفاعلي لتعزيز الفهم عند انقطاع الإنترنت أو للتعلم الذاتي.',
      }
    : {
        id: 'res-alt-1-default',
        title: `أنشطة ومحاكاة تفاعلية لدرس (${cleanTitle}) — منصة روافد`,
        provider: 'منصة روافد التعليمية (rawafed.edu.ps)',
        url: 'https://rawafed.edu.ps',
        type: 'interactive',
        pedagogicalNotes: 'وسيلة بصرية بديلة تدعم المتعلمين البصريين وتراعي تمايز القدرات.',
      };

  const alternativeResource2 = matchedOer[2]
    ? {
        id: matchedOer[2].id,
        title: matchedOer[2].title,
        provider: matchedOer[2].publisherNameAr,
        url: matchedOer[2].directUrl,
        type: matchedOer[2].type,
        pedagogicalNotes: 'مصدر ورقي ومحسوسات محلية لا يتطلب أي اتصال رقمي.',
      }
    : {
        id: 'res-alt-2-default',
        title: `أوراق عمل ومهمات تطبيقية ملموسة — منصة منهاجي ومكتبة المحتوى`,
        provider: 'منصة منهاجي التعليمية (minhaji.net)',
        url: 'https://minhaji.net',
        type: 'worksheet',
        pedagogicalNotes: 'بديل ملموس ومطبوع للعمل داخل الصف والأنشطة العلاجية والبيتية.',
      };

  const resourcesTriad: CurriculumResourceTriad = {
    primaryResource,
    alternativeResource1,
    alternativeResource2,
  };

  // 4. موقف تعليمي كامل: خطوات — أنشطة — منتجات — زمن مقترح (45 دقيقة)
  const learningSituation: CompleteLearningSituationSuggestion = {
    title: `الموقف الصفي الاستقصائي: تحدي مستكشفي فلسطين في (${cleanTitle})`,
    contextDescription: `يُوضع الطلاب في سياق واقعي لحل مشكلة تطبيقية في مدرسة أو قرية فلسطينية تتطلب توظيف مفهوم (${cleanTitle}).`,
    authenticPalestineContext: `ربط المفهوم بالبيئة الفلسطينية وسوق العمل المحلي، والتراث المعماري أو البيئي الأصيل.`,
    totalDurationMinutes: 45,
    steps: [
      {
        stepNumber: 1,
        phaseName: 'التمهيد والتهيئة الحافزة (إثارة الدافعية)',
        durationMinutes: 7,
        teacherAction: `عرض لغز بصري أو تساؤل حياتي من البيئة المحلية الفلسطينية يثير فضول الطلبة، واسترجاع المتطلبات السابقة.`,
        studentAction: `التفكير الفردي دقيقة واحدة، ثم تبادل التوقعات ثنائياً (فكر - زاوج - شارك) وطرح الفرضيات.`,
        expectedProducts: ['قائمة التوقعات الأولية والفرضيات الصفية المدونة على السبورة.'],
      },
      {
        stepNumber: 2,
        phaseName: 'الاستكشاف والبحث الموجه (بناء المفهوم)',
        durationMinutes: 15,
        teacherAction: `تيسير العمل في مجموعات متمايزة، وتزويدهم بروابط المصدر الرئيسي والبديل، وطرح أسئلة سابرة.`,
        studentAction: `تصفح المصادر المعتمدة، استخراج البيانات والمعلومات، وتجريب الحلول في بطاقة الاستقصاء.`,
        expectedProducts: ['بطاقة استقصاء مكتملة تتضمن المعطيات والحلول المدعومة بالأدلة.'],
      },
      {
        stepNumber: 3,
        phaseName: 'التطبيق والإنتاج والتعميق',
        durationMinutes: 15,
        teacherAction: `متابعة تنفيذ المهمة الأدائية وتقديم تغذية راجعة فورية غير موجهة، وضبط مؤقت الإنجاز.`,
        studentAction: `إنتاج النموذج أو حل المسألة المركبة وتجهيز ملخص العرض التقديمي لفريقهم.`,
        expectedProducts: ['منتج تعليمي ملموس (خريطة مفاهيم، حل مسألة مبرهن، لوحة جدارية، أو ورقة تفاعلية).'],
      },
      {
        stepNumber: 4,
        phaseName: 'الختام والتقويم التكويني وبطاقة الخروج',
        durationMinutes: 8,
        teacherAction: `إدارة تقييم الأقران، تعزيز الإجابات المتميزة، وتلخيص الكفايات المستفادة، وتوزيع بطاقات الخروج.`,
        studentAction: `تقديم التغذية الراجعة لزملائهم والإجابة السريعة عن سؤال بطاقة الخروج (Exit Ticket).`,
        expectedProducts: ['بطاقات خروج ملخصة (Exit Tickets) ومقياس التقييم الذاتي.'],
      },
    ],
    expectedProducts: [
      'بطاقة استقصاء المفهوم الجماعية',
      'نموذج الحل المبرهن للمشكلة الواقعية',
      'تذاكر الخروج الفردية (Exit Tickets)',
    ],
  };

  // 5. أنشطة دعم (تمايز علاجي للمتعثرين) وأنشطة إثراء (للمتميزين)
  const differentiatedActivities: DifferentiatedActivitiesSuggestion = {
    supportActivities: [
      {
        id: 'sup-1',
        title: 'محطة النمذجة المحسوسة والمصغرة',
        strategy: 'التعلم بالحواس والمجسمات والمحاكاة التفاعلية',
        description: `تقديم محسوسات بصرية وبطاقات ملونة تُجزئ مفهوم (${cleanTitle}) إلى خطوات صغيرة متسلسلة للطلبة الذين يواجهون صعوبة في التجريد.`,
        materialsNeeded: 'بطاقات ملونة، مجسمات محسوسة، أو محاكي روافد البصري.',
      },
      {
        id: 'sup-2',
        title: 'استراتيجية المعلم الصغير والتعلم بالقرين (Peer Tutoring)',
        strategy: 'الشراكة الطلابية والمراجعة التكافلية',
        description: `دمج الطالب مع زميل متمكن لشرح الخطوة الصعبة بأسلوب مبسط وتبادل الأدوار في حل المسألة مع تشجيع مستمر.`,
        materialsNeeded: 'دليل الإرشاد الثنائي المصغر وقائمة الخطوات الإرشادية.',
      },
    ],
    enrichmentActivities: [
      {
        id: 'enr-1',
        title: 'تحدي المهندس والمبتكر الصغير (مسألة غير روتينية مفتوحة النهاية)',
        challengeType: 'حل مشكلات معقدة وتفكير إبداعي ممتد',
        description: `صياغة مسألة واقعية مفتوحة النهاية تتطلب من الطلبة المتميزين تطبيق (${cleanTitle}) في تصميم حل هندسي أو اقتصادي لمشروع مدرسي متكامل.`,
      },
      {
        id: 'enr-2',
        title: 'مشروع البحث والتسجيل الرقمي: سفراء المعرفة الفلسطينية',
        challengeType: 'إنتاج رقمي وتطبيق عملي',
        description: `تكليف الطلبة المتميزين بإنتاج بطاقة إنفوجرافيك رقمية أو مقطع صوتي تعليمي في دقيقة يشرح الفكرة لزملائهم وينشر في ركن التعلم الذاتي.`,
      },
    ],
  };

  return {
    id: `smart-pkg-${Date.now()}`,
    lessonContext: {
      subject: cleanSubject,
      grade: cleanGrade,
      lessonTitle: cleanTitle,
      topic: cleanTopic,
    },
    targetCompetencies: {
      generalCompetency: {
        code: selectedGeneral.code,
        title: selectedGeneral.title,
        statement: selectedGeneral.statement,
        domainLabel: selectedGeneral.domainLabel,
      },
      specificCompetency: {
        code: selectedSpecific.code,
        title: selectedSpecific.title,
        statement: selectedSpecific.statement,
        subject: selectedSpecific.subject,
      },
    },
    objectiveOptions,
    resourcesTriad,
    learningSituation,
    differentiatedActivities,
    generatedDate: new Date().toISOString(),
  };
}

/**
 * وحدة «فحص التوافق» التربوي والمعايير الوزارية
 * تُنبّه المعلم تلقائياً عند:
 * 1. الاعتماد على مصدر واحد فقط
 * 2. عدم ربط النشاط بكفاية مستهدفة
 * 3. استخدام مصدر خارج المنهاج المقرر
 * 4. عدم وضوح مؤشرات التقويم
 */
export function auditPlanCompliance(plan: LessonPlan): PedagogicalComplianceAuditResult {
  const warnings: ComplianceWarning[] = [];
  const passedChecks: { id: string; title: string; description: string }[] = [];

  // 1. فحص الاعتماد على مصدر واحد فقط (Single Source Audit)
  const attachedResources = plan.attachedResources || [];
  const oerActivities = plan.oerData?.activities || [];
  const distinctResourceTitles = new Set<string>();

  attachedResources.forEach((r) => distinctResourceTitles.add(r.title.trim()));
  oerActivities.forEach((act) => {
    if (act.primaryResource?.title) distinctResourceTitles.add(act.primaryResource.title.trim());
    if (act.alternativeResource1?.title) distinctResourceTitles.add(act.alternativeResource1.title.trim());
    if (act.alternativeResource2?.title) distinctResourceTitles.add(act.alternativeResource2.title.trim());
  });

  const totalSourcesCount = distinctResourceTitles.size;

  if (totalSourcesCount <= 1) {
    warnings.push({
      id: 'warn-single-source',
      category: 'single_source',
      severity: 'warning',
      title: 'الاعتماد على مصدر تعليمي واحد فقط',
      message: `تتضمن الخطة حالياً ${totalSourcesCount === 0 ? 'لا مصادر مسجلة' : 'مصدراً واحداً فقط'}. معايير التعليم المفتوح OER في فلسطين توجب توفير مصدرين بديلين على الأقل.`,
      pedagogicalRationale:
        'توفير بدائل من البوابة التعليمية ومنصتي روافد ومنهاجي يضمن استمرارية التعلم عند ضعف الاتصال ويراعي تمايز أنماط الطلبة الحسية.',
      suggestedFix:
        'أضف مصدراً بديلاً تفاعلياً (منصة روافد) ومصدراً ملموساً/ورقياً (منهاجي) ليصبح لديك ثلاثي مصدري معتمد.',
      quickFixData: {
        actionType: 'add_alternative_resource',
      },
    });
  } else {
    passedChecks.push({
      id: 'pass-diverse-sources',
      title: 'تعدد وتنوع مصادر التعلم البديلة',
      description: `تم رصد ${toArabicDigits(totalSourcesCount)} مصادر متنوعة تدعم استراتيجية البدائل التعليمية المفتوحة.`,
    });
  }

  // 2. فحص عدم ربط النشاط بكفاية مستهدفة (Unlinked Competency Audit)
  const planCompetencies = plan.section1?.integrativeCompetencies || [];
  const oerTargetCompetencies = plan.oerData?.targetCompetencies;
  const hasCompetenciesDeclared =
    planCompetencies.length > 0 ||
    Boolean(oerTargetCompetencies?.generalCompetency || oerTargetCompetencies?.specificCompetency);

  // Check if activities mention competencies or if plan has none
  let activitiesLackingCompetencies = false;
  if (oerActivities.length > 0) {
    activitiesLackingCompetencies = oerActivities.some((act) => {
      const text = `${act.description} ${act.title} ${act.formativeAssessment}`.toLowerCase();
      return (
        !text.includes('كفاية') &&
        !text.includes('مهارة') &&
        !text.includes('مؤشر') &&
        !text.includes('تواصل') &&
        !text.includes('تفكير') &&
        !text.includes('إبداع') &&
        !text.includes('مسؤولية') &&
        !text.includes('استقصاء')
      );
    });
  }

  if (!hasCompetenciesDeclared || activitiesLackingCompetencies) {
    warnings.push({
      id: 'warn-unlinked-competency',
      category: 'unlinked_competency',
      severity: 'danger',
      title: 'عدم ربط الأنشطة الصفية بكفايات المنهاج المعتمدة',
      message: !hasCompetenciesDeclared
        ? 'خطة الدرس لا تحتوي على كفايات مصرحة من الإطار الوطني الفلسطيني للكفايات (تواصل، تفكير ناقد، إبداع، مواطنة).'
        : 'بعض الأنشطة التعليمية المقررة لا تظهر ارتباطاً صريحاً بالكفاية المستهدفة ومؤشر الأداء.',
      pedagogicalRationale:
        'وفق وثيقة الكفايات الصادرة عن وزارة التربية، يجب أن يخدم كل نشاط صفي كفاية عامة أو تخصصية قابلة للقياس.',
      suggestedFix:
        'اربط أنشطة الدرس بكفاية من الإطار الوطني (مثل: تفكير ناقد، تواصل نشط، أو كفايات المبحث التخصصية) مع تحديد مؤشرها الإجرائي.',
      quickFixData: {
        actionType: 'link_competency',
      },
    });
  } else {
    passedChecks.push({
      id: 'pass-competencies-linked',
      title: 'مواءمة الأنشطة مع الكفايات الوطنية',
      description: 'الأنشطة التعليمية ترتبط بوضوح بالكفايات والمجالات المعتمدة من الوزارة.',
    });
  }

  // 3. فحص استخدام مصدر خارج المنهاج المقرر (External / Non-Accredited Source Audit)
  const allUrls = [
    ...attachedResources.map((r) => r.content || r.sourceInfo || ''),
    ...oerActivities.flatMap((a) => [
      a.primaryResource?.directUrl || a.primaryResource?.title || '',
      a.alternativeResource1?.directUrl || '',
      a.alternativeResource2?.directUrl || '',
    ]),
  ].filter(Boolean);

  const approvedKeywords = [
    'elearn.edu.ps',
    'rawafed.edu.ps',
    'rawafed',
    'minhaji.net',
    'minhaji',
    'moe',
    'palestine',
    'فلسطين',
    'الوزارة',
    'المحتوى الفلسطيني',
    'كتاب المنهاج',
    'دليل المعلم',
    'رسمي',
    'معتمد',
  ];

  const hasSuspiciousOrExternalSources = allUrls.some((u) => {
    const lower = u.toLowerCase();
    if (lower.startsWith('http') && !approvedKeywords.some((k) => lower.includes(k))) {
      return true;
    }
    return false;
  });

  if (hasSuspiciousOrExternalSources) {
    warnings.push({
      id: 'warn-external-source',
      category: 'external_source',
      severity: 'warning',
      title: 'استخدام مصدر غير مصنف ضمن المنصات الفلسطينية المعتمدة',
      message:
        'يوجد رابط أو مرجع خارجي قد لا يكون معتمداً رسمياً من وزارة التربية والتعليم العالي أو بوابات OER الفلسطينية.',
      pedagogicalRationale:
        'المصادر المعتمدة تخضع لتدقيق تربوي ولغوي ووطني يضمن سلامة المحتوى وملاءمته لقيم وثقافة المنهاج الفلسطيني.',
      suggestedFix:
        'استبدل المصدر الخارجي بمصدر مناظر من البوابة التعليمية الفلسطينية elearn.edu.ps أو منصة روافد أو منصة منهاجي.',
      quickFixData: {
        actionType: 'replace_with_curriculum_source',
      },
    });
  } else {
    passedChecks.push({
      id: 'pass-accredited-sources',
      title: 'الاعتماد على مصادر ومراجع وطنية معتمدة',
      description: 'جميع المراجع والمصادر متوافقة مع المنصات التعليمية الفلسطينية الرسمية.',
    });
  }

  // 4. فحص عدم وضوح مؤشرات التقويم (Unclear Assessment Indicators Audit)
  const assessment = plan.section3Assessment;
  const oerIndicators = plan.oerData?.targetCompetencies?.observableIndicators || [];
  const rubricCriteria = assessment?.rubric || [];

  const vagueTerms = ['أن يفهم', 'أن يعرف الطالب', 'استيعاب الطالب بشكل عام', 'معرفة الدرس'];
  const fullText = JSON.stringify(plan).toLowerCase();
  const hasVaguePhrasing = vagueTerms.some((term) => fullText.includes(term.toLowerCase()));

  const hasClearIndicators =
    oerIndicators.length > 0 ||
    rubricCriteria.length > 0 ||
    Boolean(plan.section3Assessment?.immediateFeedback?.length) ||
    Boolean(plan.section3Assessment?.graspsTask?.standards);

  if (!hasClearIndicators || hasVaguePhrasing) {
    warnings.push({
      id: 'warn-unclear-assessment',
      category: 'unclear_assessment',
      severity: 'warning',
      title: 'عدم وضوح أو غياب مؤشرات التقويم القابلة للملاحظة والقياس',
      message: !hasClearIndicators
        ? 'أدوات التقويم في الخطة تفتقر إلى مؤشرات سلوكية دقيقة توضح كيف يُقاس تمكن الطالب في الموقف الصفي.'
        : 'تم رصد صياغات عامة غير قابلة للملاحظة المباشرة (مثل: "أن يفهم الطالب") بدلاً من أفعال إجرائية محددة.',
      pedagogicalRationale:
        'التقويم التكويني الفلسطيني يشترط صياغة مؤشرات أداء سلوكية قابلة للملاحظة (يميز، يبرهن، يحلل، يصمم، يستنتج) مع سلم تقدير واضح.',
      suggestedFix:
        'استبدل الصياغات العامة بمؤشرات إجرائية (مثل: يحلل 3 عناصر، يرسم شكلاً بدقة، يحل مسألة بخطوات مبرهنة) واربطها بسلم تقدير (Rubric).',
      quickFixData: {
        actionType: 'clarify_indicators',
      },
    });
  } else {
    passedChecks.push({
      id: 'pass-clear-assessment',
      title: 'وضوح مؤشرات الأداء وأدوات القياس',
      description: 'معايير التقويم وسلالم التقدير مصوغة إجرائياً وقابلة للملاحظة والقياس الصفي.',
    });
  }

  // Calculate Overall Compliance Score
  // 100 max, -15 for warning, -25 for danger
  let penalty = 0;
  warnings.forEach((w) => {
    if (w.severity === 'danger') penalty += 25;
    else if (w.severity === 'warning') penalty += 15;
    else penalty += 5;
  });

  const overallScore = Math.max(20, Math.min(100, 100 - penalty));

  let status: 'compliant' | 'needs_attention' | 'critical_gaps' = 'compliant';
  let statusLabel = 'متوافق تماماً مع المنهاج ومعايير OER الفلسطينية';

  if (overallScore < 60) {
    status = 'critical_gaps';
    statusLabel = 'تنبيهات جوهرية تتطلب مواءمة مع المنهاج الفلسطيني';
  } else if (overallScore < 85) {
    status = 'needs_attention';
    statusLabel = 'متوافق جزئياً — يوصى بمراعاة بعض التنبيهات التربوية';
  }

  return {
    overallScore,
    status,
    statusLabel,
    warnings,
    passedChecks,
    lastAuditDate: new Date().toISOString(),
  };
}
