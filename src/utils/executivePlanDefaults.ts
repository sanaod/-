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

  return {
    timeframeDetails: {
      startDay: startParts.day,
      startDate: startParts.date,
      startYear: startParts.year,
      endDay: endParts.day,
      endDate: endParts.date,
      endYear: endParts.year,
    },
    learningCompetencies:
      context?.section1?.integrativeCompetencies?.[0]?.description ||
      `إتقان المفاهيم الرياضية الأساسية في ${lessonTitle}، والقدرة على الربط والتطبيق في سياقات ومواقف واقعية ذات صلة بالمبحث.`,
    valuesAndEthics:
      'المواطنة، التعاون، الأمانة، المهارات الحياتية، العمل الجماعي، الانتماء للبيئة الفلسطينية والتكامل المعرفي.',
    studentCharacteristicsAnalysis:
      context?.section1?.studentCharacteristics?.individualDifferences ||
      'تنوع في مستويات الطلبة الاستيعابية مع وجود فروق فردية تراعي المتعلمين بالنمط البصري والحسي، وتوزيع مجموعات تعاونية متجانسة وغير متجانسة.',
    environmentalAnalysis:
      context?.section1?.studentCharacteristics?.environmentalAdaptation ||
      'غرفة صفية منظمة مهيأة بأدوات محسوسة وشاشة عرض تفاعلية، مع توفير بيئة تعليمية آمنة ومحفزة تدعم الاكتشاف والتجريب.',
    smartObjectives: [
      `أن يتعرف الطالب على المفاهيم الأساسية لدرس (${lessonTitle}) بدقة بعد استكشاف المحسوسات.`,
      `أن يطبق الطالب المهارات المكتسبة في حل تدريبات متنوعة بصورة صحيحة بنسبة إتقان لا تقل عن 85%.`,
      `أن يشارك الطالب في تنفيذ مهمة التقويم الأصيل GRASPS متعاوناً مع زملائه في الفريق.`,
    ],
    executiveStages: [
      {
        id: 1,
        stageName: '١. تقديم الدرس (التهيئة والتحفيز)',
        goals: 'إثارة دافعية الطلبة وربط التعلم السابق بالجديد واستكشاف المفهوم عبر وسيط تعليمي محفز.',
        procedures: {
          mainDescription:
            'الاستعانة بالمصدر التعليمي المناسب لتهيئة الطلبة وإثارة دافعيتهم للتعلم (أسئلة مفتوحة، لعبة، أنشودة، فيديو...)',
          resourceName: 'مقطع فيديو تفاعلي ومحسوسات تعليمية واقعية',
          reflectiveQuestionsExample:
            'ماذا تشاهدون في الوسيط التعليمي؟ وكيف يرتبط ذلك بحياتنا اليومية ومعالم وطننا فلسطين؟',
          resourceConditions: {
            competencyAlignment: true,
            contentAccuracy: true,
            languageIntegrity: true,
            ageAppropriate: true,
            palestinianCulture: true,
            integrationValues: true,
          },
        },
        assessment: 'ملاحظة استجابات الطلبة والأسئلة التأملية والنقاش الحواري التفاعلي.',
        resourcesAndTools: 'فيديو / لعبة / أنشودة / أسئلة استكشافية / محسوسات صفية',
        durationMinutes: 5,
      },
      {
        id: 2,
        stageName: '٢. عرض الأهداف وتقديم المادة',
        goals: 'مشاركة أهداف التعلم، شرح المادة النشطة، وبناء المفاهيم تدريجياً من المحسوس إلى المجرد.',
        procedures: {
          mainDescription:
            'مشاركة الطلبة في عرض أهداف التعلم وشرح المادة باستخدام طرائق تدريس متمركزة حول التعلم النشط (التعلم باللعب، التعلم التعاوني، حل المشكلات...)\nوعرض مخرجات الطلبة للأنشطة التعليمية التفاعلية (مطوية، مشاهد عرض تقديمي، كتابة قصة، رسومات تعبيرية، مشاريع، تمثيلية...)',
          activeLearningMethods: 'التعلم باللعب، التعلم التعاوني، التعلم القائم على حل المشكلات والاستقصاء الموجه.',
          studentProducts: 'مطويات ملونة، عروض تقديمية مبسطة، رسومات بيانية وتمثيلية تعليمية.',
        },
        assessment: 'تقويم تكويني مستمر ومتابعة تفاعلية لأداء الأنشطة والتمارين الفردية والجماعية.',
        resourcesAndTools: 'المحسوسات، الكتاب المدرسي، ورقة/ملف إلكتروني للعبة الحركية، الشاشة التفاعلية.',
        durationMinutes: 15,
      },
      {
        id: 3,
        stageName: '٣. مهمة التقويم (تطبيق المعارف والمهارات)',
        goals: 'تطبيق مباشر للمفاهيم عبر مهمة تقويم أصيلة واقعية تقيس عمق الفهم وتحفز التفكير التأملي.',
        procedures: {
          mainDescription: 'مهمة تقويم أصيلة مبنية على نموذج GRASPS مع خطوات تنفيذ واضحة ومقياس متدرج.',
          grasps: {
            goal:
              context?.section3Assessment?.graspsTask?.title ||
              `تطبيق مهارات ${lessonTitle} في سياق واقعي يرتبط بحياة المجتمع الفلسطيني.`,
            role: context?.section3Assessment?.graspsTask?.role || 'باحث ومخطط تربوي صغير يمثل فريقه الطلابي.',
            audience: context?.section3Assessment?.graspsTask?.audience || 'الزملاء في الصف والمعلم ولجنة المعرض الصفي.',
            situation:
              context?.section3Assessment?.graspsTask?.situation ||
              'موقف حياتي يستدعي توظيف المهارة لحل تحدٍ مجتمعي أو حسابي مرتبط بالبيئة.',
            performance:
              context?.section3Assessment?.graspsTask?.product ||
              'إنتاج ملصق توضيحي أو كتيب عملي أو نموذج مجسم يعبر عن إتقان المفاهيم.',
            standards:
              context?.section3Assessment?.graspsTask?.standards ||
              'دقة المحتوى العلمي، وضوح التعبير، التعاون الفريقي، وجمال الإخراج والتنظيم.',
            steps: [
              'توزيع المهام بين أعضاء المجموعة والاتفاق على خطة العمل.',
              'جمع البيانات واستخدام المعارف والمهارات المكتسبة في إنجاز المهمة.',
              'مراجعة المنتج وفق معايير سلم التقدير وتقديمه أمام الصف.',
            ],
            rubricScaleNote: 'مقياس متدرج لتقويم أداء الطلبة (سلالم التقدير ومقاييس الأداء التقديرية - Rubric).',
          },
        },
        assessment: 'سلالم التقدير اللفظية، مقاييس الأداء المتدرجة، ومراجعة الصور والملصقات والمشاريع المنجزة.',
        resourcesAndTools: 'نماذج تقويم أصيل، مطويات، ملصقات جدارية، أوراق عمل تمايزية ومحسوسات.',
        durationMinutes: 12,
      },
      {
        id: 4,
        stageName: '٤. ورقة العمل التفاعلية (إن لزمت)',
        goals: 'تثبيت المهارات الفردية وتوفير تدريب علاجي وإثرائي موجه مع تقديم تغذية راجعة فورية.',
        procedures: {
          mainDescription:
            'تنفيذ ورقة العمل التفاعلية فردياً أو جماعياً لترسيخ المفاهيم وقياس التمكن الذاتي.',
          howWorksheetUsed:
            'توزع الورقة إلكترونياً أو ورقياً، ويبدأ الطلبة بحل التمارين فردياً ثم مقارنة الإجابات ثنائياً.',
          immediateFeedback: 'تقديم تغذية راجعة فورية شفهية وكتابية وتصويب المفاهيم غير الدقيقة في حينها.',
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
          mainDescription:
            'غلق الدرس من خلال التلخيص وتسليط الضوء على أبرز ملامح الدرس عبر الخيارات المتعددة.',
          closureOptions: {
            worksheet: false,
            videoSummary: true,
            posterOrSummaryBoard: true,
            learnedCards: true,
            keyQuestionsCards: true,
            closingCompetitions: true,
          },
        },
        assessment: 'بطاقات خروج ملونة، إجابات الطلبة عن الأسئلة المحورية، والمسابقات التعليمية الختامية.',
        resourcesAndTools: 'بطاقات خروج، ملصق ختامي، عرض فيديو تلخيصي، مسابقة تفاعلية سريعة.',
        durationMinutes: 3,
      },
    ],
    teacherReflection: {
      strengths:
        context?.section5Reflection?.strengthsAndImpact?.[0] ||
        'تفاعل ممتاز من الطلبة مع المحسوسات، ومشاركة فاعلة في مجموعات التعلم التعاوني، وتحقق الأهداف بنسبة عالية.',
      improvementsNeeded:
        context?.section5Reflection?.improvementOpportunities ||
        'إتاحة وقت إضافي للطلبة ذوي وتيرة التعلم المتأنية، وتوفير بطاقات إضافية مبسطة لدعمهم.',
      futureSuggestions:
        context?.section5Reflection?.professionalLearningCommunities ||
        'توظيف تطبيقات تفاعلية رقمية إضافية، وتنظيم مسابقة بين الفصول في الدروس القادمة.',
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
