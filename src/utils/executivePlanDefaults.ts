import {
  ExecutivePlanData,
  ExecutiveStage,
  LessonPlan,
  PlanTemplateType,
} from '../types/lessonPlan';
import { formatDateDMY } from './arabicNumerals';

export function getArabicDayOfWeek(dateStr?: string): string {
  try {
    if (!dateStr) return 'الأحد';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'الأحد';
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  } catch {
    return 'الأحد';
  }
}

export function parseDateParts(dateStr?: string) {
  const now = new Date();
  if (!dateStr) {
    return {
      day: 'الأحد',
      date: formatDateDMY(now.toISOString().split('T')[0]),
      year: `${now.getFullYear()}م`,
    };
  }
  const parts = dateStr.split('-');
  const y = parts[0] || `${now.getFullYear()}`;
  return {
    day: getArabicDayOfWeek(dateStr),
    date: formatDateDMY(dateStr),
    year: `${y}م`,
  };
}

/**
 * Creates default executive plan data matching the ministerial PDF template:
 * "نموذج خطة تحضير درس - خطة التنفيذ التنفيذية للدرس"
 */
export function createDefaultExecutiveData(context?: Partial<LessonPlan>): ExecutivePlanData {
  const header = context?.header;
  const sDate = header?.startDate || header?.date || new Date().toISOString().split('T')[0];
  const eDate = header?.endDate || sDate;
  const startParts = parseDateParts(sDate);
  const endParts = parseDateParts(eDate);

  const subject = header?.subject || 'الرياضيات';
  const lessonTitle = header?.lessonTitle || 'القيمة المنزلية للأعداد ضمن 9999';

  // Extract AI-generated competencies
  const comps = context?.section1?.integrativeCompetencies;
  const competenciesText = Array.isArray(comps) && comps.length > 0
    ? comps.map((c) => `${c.title}: ${c.description}`).join(' | ')
    : `إتقان المفاهيم الأساسية والمهارات التخصصية في ${lessonTitle}، والتطبيق في سياقات ومواقف واقعية.`;

  // Extract AI-generated SMART objectives
  const smartObjectivesList: string[] = [];
  smartObjectivesList.push(
    `أن يستوعب الطالب المفاهيم الأساسية لدرس (${lessonTitle}) ويحدد نتاجاته الرئيسية بدقة.`
  );
  if (comps && comps[0]?.description) {
    smartObjectivesList.push(`أن يطبق الطالب (${comps[0].title}) في حل المسائل والتدريبات المرافقة بنسبة إتقان لا تقل عن 85%.`);
  } else {
    smartObjectivesList.push(`أن يطبق الطالب المهارات المكتسبة في حل التدريبات والمسائل التطبيقية بصورة صحيحة.`);
  }
  const graspsTitle = context?.section3Assessment?.graspsTask?.title;
  smartObjectivesList.push(
    `أن يشارك الطالب في تنفيذ مهمة التقويم الأصيل GRASPS (${graspsTitle || 'تطبيق المهارات في سياق واقعي'}) متعاوناً في فريقه.`
  );

  // Timeline phases
  const timeline = context?.section2Timeline || [];
  const phase1 = timeline[0];
  const phase2 = timeline[1];
  const phase3 = timeline[2];
  const phase4 = timeline[3];

  const p1Actions = phase1?.teacherAndStudentActions?.filter(Boolean).join('\n• ') ||
    'الاستعانة بالمصدر التعليمي المناسب لتهيئة الطلبة وإثارة دافعيتهم للتعلم (أسئلة مفتوحة، لعبة، أنشودة، فيديو...)';
  const p1Resource = context?.section1?.learningResources?.tangibleMedia ||
    phase1?.strategiesAndResources?.join('، ') ||
    'مقطع فيديو تفاعلي ومحسوسات تعليمية واقعية';
  const p1Question = context?.section1?.reflectiveQuestions?.[0] ||
    'ماذا تشاهدون في الوسيط التعليمي؟ وكيف يرتبط ذلك بحياتنا اليومية ومعالم وطننا فلسطين؟';

  const p2Actions = phase2?.teacherAndStudentActions?.filter(Boolean).join('\n• ') ||
    'مشاركة الطلبة في عرض أهداف التعلم وشرح المادة باستخدام طرائق تدريس متمركزة حول التعلم النشط (التعلم باللعب، التعلم التعاوني، حل المشكلات...)\nوعرض مخرجات الطلبة للأنشطة التعليمية التفاعلية (مطوية، مشاهد عرض تقديمي، كتابة قصة، رسومات تعبيرية، مشاريع، تمثيلية...)';

  // GRASPS Assessment
  const graspsTask = context?.section3Assessment?.graspsTask;
  const p3Grasps = {
    goal: graspsTask?.title || graspsTask?.fullDescription || `تطبيق مهارات ${lessonTitle} في سياق واقعي يرتبط بالبيئة الفلسطينية.`,
    role: graspsTask?.role || 'باحث ومخطط تربوي صغير يمثل فريقه الطلابي.',
    audience: graspsTask?.audience || 'الزملاء في الصف والمعلم ولجنة المعرض الصفي.',
    situation: graspsTask?.situation || 'موقف حياتي يستدعي توظيف المهارة لحل تحدٍ مجتمعي أو حسابي مرتبط بالبيئة.',
    performance: graspsTask?.product || 'إنتاج ملصق توضيحي أو كتيب عملي أو نموذج مجسم يعبر عن إتقان المفاهيم.',
    standards: graspsTask?.standards || 'دقة المحتوى العلمي، وضوح التعبير، التعاون الفريقي، وجمال الإخراج والتنظيم.',
    steps: [
      'توزيع المهام بين أعضاء المجموعة والاتفاق على خطة العمل.',
      'جمع البيانات واستخدام المعارف والمهارات المكتسبة في إنجاز المهمة.',
      'مراجعة المنتج وفق معايير سلم التقدير وتقديمه أمام الصف.',
    ],
    rubricScaleNote: 'مقياس متدرج لتقويم أداء الطلبة (سلالم التقدير ومقاييس الأداء التقديرية - Rubric).',
  };

  // Immediate feedback & Remedial
  const immediateFeedbackList = context?.section3Assessment?.immediateFeedback;
  const immediateFeedbackText = Array.isArray(immediateFeedbackList) && immediateFeedbackList.length > 0
    ? immediateFeedbackList.join(' | ')
    : 'تقديم تغذية راجعة فورية شفهية وكتابية وتصويب المفاهيم غير الدقيقة في حينها.';

  const remedialText = context?.section3Assessment?.remedialActivities?.[0]?.description ||
    'توزع الورقة إلكترونياً أو ورقياً، ويبدأ الطلبة بحل التمارين فردياً ثم مقارنة الإجابات ثنائياً.';

  // Closure
  const p4Actions = phase4?.teacherAndStudentActions?.filter(Boolean).join('\n• ') ||
    'غلق الدرس من خلال التلخيص وتسليط الضوء على أبرز ملامح الدرس عبر الخيارات المتعددة.';

  // Reflection
  const ref = context?.section5Reflection;
  const strengthsText = Array.isArray(ref?.strengthsAndImpact) && ref.strengthsAndImpact.length > 0
    ? ref.strengthsAndImpact.join(' | ')
    : 'تفاعل ممتاز من الطلبة مع المحسوسات، ومشاركة فاعلة في مجموعات التعلم التعاوني، وتحقق الأهداف بنسبة عالية.';

  return {
    timeframeDetails: {
      startDay: startParts.day,
      startDate: startParts.date,
      startYear: startParts.year,
      endDay: endParts.day,
      endDate: endParts.date,
      endYear: endParts.year,
    },
    learningCompetencies: competenciesText,
    valuesAndEthics:
      'المواطنة، التعاون، الأمانة، المهارات الحياتية، العمل الجماعي، الانتماء للبيئة الفلسطينية والتكامل المعرفي.',
    studentCharacteristicsAnalysis:
      context?.section1?.studentCharacteristics?.individualDifferences ||
      'تنوع في مستويات الطلبة الاستيعابية مع وجود فروق فردية تراعي المتعلمين بالنمط البصري والحسي، وتوزيع مجموعات تعاونية متجانسة وغير متجانسة.',
    environmentalAnalysis:
      context?.section1?.studentCharacteristics?.environmentalAdaptation ||
      'غرفة صفية منظمة مهيأة بأدوات محسوسة وشاشة عرض تفاعلية، مع توفير بيئة تعليمية آمنة ومحفزة تدعم الاكتشاف والتجريب.',
    smartObjectives: smartObjectivesList,
    executiveStages: [
      {
        id: 1,
        stageName: '١. تقديم الدرس (التهيئة والتحفيز)',
        goals: 'إثارة دافعية الطلبة وربط التعلم السابق بالجديد واستكشاف المفهوم عبر وسيط تعليمي محفز.',
        procedures: {
          mainDescription: p1Actions,
          resourceName: p1Resource,
          reflectiveQuestionsExample: p1Question,
          resourceConditions: {
            competencyAlignment: true,
            contentAccuracy: true,
            languageIntegrity: true,
            ageAppropriate: true,
            palestinianCulture: true,
            integrationValues: true,
          },
        },
        assessment: phase1?.assessmentAndFeedback?.join(' ') || 'ملاحظة استجابات الطلبة والأسئلة التأملية والنقاش الحواري التفاعلي.',
        resourcesAndTools: phase1?.strategiesAndResources?.join(' / ') || 'فيديو / لعبة / أنشودة / أسئلة استكشافية / محسوسات صفية',
        durationMinutes: phase1?.durationMinutes || 5,
      },
      {
        id: 2,
        stageName: '٢. عرض الأهداف وتقديم المادة',
        goals: 'مشاركة أهداف التعلم، شرح المادة النشطة، وبناء المفاهيم تدريجياً من المحسوس إلى المجرد.',
        procedures: {
          mainDescription: p2Actions,
          activeLearningMethods: 'التعلم باللعب، التعلم التعاوني، التعلم القائم على حل المشكلات والاستقصاء الموجه.',
          studentProducts: 'مطويات ملونة، عروض تقديمية مبسطة، رسومات بيانية وتمثيلية تعليمية.',
        },
        assessment: phase2?.assessmentAndFeedback?.join(' ') || 'تقويم تكويني مستمر ومتابعة تفاعلية لأداء الأنشطة والتمارين الفردية والجماعية.',
        resourcesAndTools: phase2?.strategiesAndResources?.join(' / ') || 'المحسوسات، الكتاب المدرسي، ورقة/ملف إلكتروني للعبة الحركية، الشاشة التفاعلية.',
        durationMinutes: phase2?.durationMinutes || 15,
      },
      {
        id: 3,
        stageName: '٣. مهمة التقويم (تطبيق المعارف والمهارات)',
        goals: 'تطبيق مباشر للمفاهيم عبر مهمة تقويم أصيلة واقعية تقيس عمق الفهم وتحفز التفكير التأملي.',
        procedures: {
          mainDescription: 'مهمة تقويم أصيلة مبنية على نموذج GRASPS مع خطوات تنفيذ واضحة ومقياس متدرج.',
          grasps: p3Grasps,
        },
        assessment: phase3?.assessmentAndFeedback?.join(' ') || 'سلالم التقدير اللفظية، مقاييس الأداء المتدرجة، ومراجعة الصور والملصقات والمشاريع المنجزة.',
        resourcesAndTools: phase3?.strategiesAndResources?.join(' / ') || 'نماذج تقويم أصيل، مطويات، ملصقات جدارية، أوراق عمل تمايزية ومحسوسات.',
        durationMinutes: phase3?.durationMinutes || 12,
      },
      {
        id: 4,
        stageName: '٤. ورقة العمل التفاعلية (إن لزمت)',
        goals: 'تثبيت المهارات الفردية وتوفير تدريب علاجي وإثرائي موجه مع تقديم تغذية راجعة فورية.',
        procedures: {
          mainDescription: 'تنفيذ ورقة العمل التفاعلية فردياً أو جماعياً لترسيخ المفاهيم وقياس التمكن الذاتي.',
          howWorksheetUsed: remedialText,
          immediateFeedback: immediateFeedbackText,
        },
        assessment: 'تغذية راجعة بنائية مباشرة، ومراجعة حلول ورقة العمل التفاعلية والتحقق من الاستجابات.',
        resourcesAndTools: 'ورقة عمل تفاعلية (ورقية / إلكترونية) مزودة بأنشطة تمايزية متدرجة الصعوبة.',
        durationMinutes: 5,
      },
      {
        id: 5,
        stageName: '٥. الغلق (التلخيص والختام)',
        goals: 'تلخيص أبرز ملامح الدرس، تثبيت النتاجات، وتقييم ختامي سريع لقياس تحقق الأهداف.',
        procedures: {
          mainDescription: p4Actions,
          closureOptions: {
            worksheet: false,
            videoSummary: true,
            posterOrSummaryBoard: true,
            learnedCards: true,
            keyQuestionsCards: true,
            closingCompetitions: true,
          },
        },
        assessment: phase4?.assessmentAndFeedback?.join(' ') || 'بطاقات خروج ملونة، إجابات الطلبة عن الأسئلة المحورية، والمسابقات التعليمية الختامية.',
        resourcesAndTools: phase4?.strategiesAndResources?.join(' / ') || 'بطاقات خروج، ملصق ختامي، عرض فيديو تلخيصي، مسابقة تفاعلية سريعة.',
        durationMinutes: phase4?.durationMinutes || 3,
      },
    ],
    teacherReflection: {
      strengths: strengthsText,
      improvementsNeeded: ref?.improvementOpportunities || 'إتاحة وقت إضافي للطلبة ذوي وتيرة التعلم المتأنية، وتوفير بطاقات إضافية مبسطة لدعمهم.',
      futureSuggestions: ref?.professionalLearningCommunities || 'توظيف تطبيقات تفاعلية رقمية إضافية، وتنظيم مسابقة بين الفصول في الدروس القادمة.',
    },
  };
}

/**
 * Ensures a LessonPlan has fully synchronized executiveData
 */
export function ensureExecutiveData(plan: LessonPlan): LessonPlan {
  if (plan.executiveData && plan.executiveData.executiveStages?.length === 5) {
    return {
      ...plan,
      templateType: plan.templateType || 'executive',
    };
  }

  const generated = createDefaultExecutiveData(plan);
  return {
    ...plan,
    templateType: plan.templateType || 'executive',
    executiveData: generated,
  };
}
