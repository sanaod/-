/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Abqour Lesson Plan Integration Tool (TypeScript Engine)
 * أداة إنشاء وربط نماذج خطة الدرس بمنظومة عبقور مع ربط مباشر بمكتبة المصادر المفتوحة
 */

import { LessonPlan, LessonPhase, EducationalResource, OerActivityStage } from '../types/lessonPlan';
import { formatDateDMY, toArabicDigits } from './arabicNumerals';
import { formatDateToIso } from './palestinianCalendar';
import { ensureExecutiveData } from './executivePlanDefaults';

export interface AbqourOpenResource {
  title: string;
  url: string;
  type: string; // 'video' | 'pdf' | 'interactive' | 'image' | string
  description?: string;
}

export interface AbqourLessonPlanJson {
  metadata?: {
    generated_at?: string;
    system?: string;
  };
  header: {
    school?: string;
    teacher?: string;
    semester?: string;
    class?: string;
    date?: string;
    unit?: string;
    topic?: string;
    duration?: string;
  };
  objectives?: string[];
  skills?: Record<string, boolean>;
  procedures?: Record<string, string>;
  evaluation?: Record<string, string>;
  vocabulary?: string[];
  grammar_structures?: string[];
  core_concept?: string;
  resources?: {
    internal?: string[];
    open_access?: AbqourOpenResource[];
  };
  homework?: string;
  differentiation?: Record<string, string>;
  reflection?: string;
}

/**
 * Built-in Exemplar from the Python Tool specification:
 * Animals and Their Habitats (Grade 5 English Lesson Plan)
 */
export const SAMPLE_PYTHON_LESSON_PLAN: AbqourLessonPlanJson = {
  metadata: {
    generated_at: new Date().toISOString(),
    system: "Abqour-Lesson-Plan-Integration",
  },
  header: {
    school: "Model International School",
    teacher: "Ahmed Mohamed",
    semester: "First Semester / 2026-2027",
    class: "Grade 5",
    date: "2026-10-15",
    unit: "Unit 3",
    topic: "Animals and Their Habitats",
    duration: "45 minutes",
  },
  objectives: [
    "Identify and pronounce 5 new habitat-related vocabulary words (desert, forest, ocean, adapt, survive)",
    "Describe at least one animal's habitat using simple affirmative and descriptive sentences",
    "Express personal preference using 'I like / I prefer…' and give a reasoned explanation",
  ],
  skills: {
    Listening: true,
    Speaking: true,
    Reading: true,
    Writing: false,
    Collaboration: true,
    "Critical Thinking": true,
  },
  procedures: {
    "1. Warm-up & Review (5 min)":
      "Show animal flashcards; ask students to name them and where they live. Quick pair sharing and activate prior knowledge.",
    "2. Presentation (10 min)":
      "Introduce vocabulary: habitat, desert, forest, ocean, adapt. Use visuals, realia, and short video. Model sentences: 'The camel lives in the desert.' Drill pronunciation choral & individual.",
    "3. Guided Practice (10 min)":
      "Match animals to habitats on the smart board. Whole-class Q&A. Correct pronunciation and sentence structure together.",
    "4. Pair Work / Independent (15 min)":
      "Students work in pairs — Student A describes an animal; Student B guesses habitat. Fill mini-worksheet collaboratively.",
    "5. Wrap-up & Exit Ticket (5 min)":
      "Ask each student to name one animal and its habitat before leaving (Exit Ticket). Hand out homework sheet.",
  },
  evaluation: {
    "Formative Check": "Active monitoring during pair discussions with corrective prompts",
    "Oral Assessment": "Individual student pronunciation and complete sentence formation",
    "Exit Ticket": "Write 1 animal and 1 habitat on sticky note before leaving class",
  },
  vocabulary: ["habitat", "desert", "forest", "ocean", "adapt", "survive"],
  grammar_structures: [
    "Subject + live(s) in + [Habitat]",
    "Where does the [animal] live? — It lives in the [habitat].",
    "I prefer [animal] because it adapts to [habitat].",
  ],
  core_concept: "Living things have unique physical and behavioral adaptations suited to their environments.",
  resources: {
    internal: [
      "Pupil's Book — Page 34-35",
      "Teacher's Guide — Unit 3 / Lesson 1",
      "Flashcards Set #12 (Animals & Ecosystems)",
    ],
    open_access: [
      {
        title: "National Geographic Kids: Animal Habitats Video",
        url: "https://kids.nationalgeographic.com/nature/habitats",
        type: "video",
        description: "Interactive video clip showing 5 world habitats and animal adaptation (3 min)",
      },
      {
        title: "OER Commons: Habitats Matching Worksheet",
        url: "https://oercommons.org/courses/habitats-worksheet",
        type: "interactive",
        description: "Printable & interactive matching activity licensed under Creative Commons (CC BY-NC 4.0)",
      },
      {
        title: "Khan Academy Kids: Animal Adaptations Guide",
        url: "https://www.khanacademy.org/science/biology",
        type: "pdf",
        description: "Open supplementary reading guide for young learners with visual infographics",
      },
      {
        title: "TED-Ed: Amazing Animal Adaptations",
        url: "https://ed.ted.com/search?q=animal+adaptations",
        type: "video",
        description: "Short animated lesson explaining how desert and polar animals survive harsh conditions",
      },
    ],
  },
  homework:
    "Complete Activity Book p.28 + Draw your favorite animal in its natural habitat with 2 descriptive sentences in English.",
  differentiation: {
    "Struggling Learners":
      "Provide visual word bank with color-coded pictures for the matching task and sentence starters.",
    "Advanced Learners":
      "Write 3 sentences comparing two different animals and explain how they adapt to extreme weather.",
    "Visual Learners":
      "Use color-coded flashcards, interactive video subtitles, and graphic organizers.",
  },
  reflection:
    "High student engagement with the OER video clip. Warm-up took 2 extra minutes; adjust transition timing in the next period.",
};

/**
 * Generate direct search URLs in OER platforms based on topic keyword
 */
export function generateOerSearchLinks(keyword: string): { name: string; url: string; platform: string; badge: string }[] {
  const clean = encodeURIComponent(keyword.trim() || 'English Lesson');
  return [
    {
      name: 'OER Commons',
      platform: 'OER Commons Open Library',
      url: `https://oercommons.org/search?q=${clean}`,
      badge: 'CC Licensed',
    },
    {
      name: 'Khan Academy',
      platform: 'Khan Academy Open Search',
      url: `https://www.khanacademy.org/search?page_search_query=${clean}`,
      badge: 'Free Interactive',
    },
    {
      name: 'TED-Ed Lessons',
      platform: 'TED-Ed Educational Videos',
      url: `https://ed.ted.com/search?q=${clean}`,
      badge: 'Video Animations',
    },
    {
      name: 'مستودع المناهج والمصادر المفتوحة (e-Learning PS)',
      platform: 'بوابة التعليم الفلسطيني المفتوح',
      url: `https://elearn.edu.ps/search?q=${clean}`,
      badge: 'منهاج فلسطيني 🇵🇸',
    },
    {
      name: 'British Council TeachingEnglish',
      platform: 'TeachingEnglish Lesson Bank',
      url: `https://www.teachingenglish.org.uk/search?keyword=${clean}`,
      badge: 'ELT Resources',
    },
  ];
}

/**
 * Convert JSON format from Python AbqourLessonPlan into an Abqour LessonPlan object
 */
export function convertAbqourJsonToLessonPlan(data: AbqourLessonPlanJson): LessonPlan {
  const now = new Date();
  const dateIso = data.header.date && data.header.date.match(/^\d{4}-\d{2}-\d{2}$/)
    ? data.header.date
    : formatDateToIso(now);
  const dateFormatted = formatDateDMY(dateIso);

  const durationStr = data.header.duration || '45 دقيقة';
  const durationMatch = durationStr.match(/\d+/);
  const durationMinutes = durationMatch ? parseInt(durationMatch[0], 10) : 45;

  const planId = `plan-abqour-tool-${Date.now()}`;
  const lessonTitle = data.header.topic || 'درس تكاملي بمنظومة عبقور';
  const unitTitle = data.header.unit || 'الوحدة التعليمية';
  const teacherName = data.header.teacher || 'أحمد محمد';
  const schoolName = data.header.school || 'المدرسة النموذجية';
  const gradeStr = data.header.class || 'الصف الخامس الأساسي';
  const semesterStr = data.header.semester || 'الفصل الدراسي الأول / 2026-2027';

  // Build Integrative Competencies
  const competencies: { title: string; description: string }[] = [];
  if (data.core_concept) {
    competencies.push({
      title: 'المفهوم الجوهري (Core Concept)',
      description: data.core_concept,
    });
  }
  if (data.vocabulary && data.vocabulary.length > 0) {
    competencies.push({
      title: 'المفردات والمصطلحات المستهدفة (Target Vocabulary)',
      description: data.vocabulary.join(' • '),
    });
  }
  if (data.grammar_structures && data.grammar_structures.length > 0) {
    competencies.push({
      title: 'القواعد والتراكيب اللغوية (Grammar & Structures)',
      description: data.grammar_structures.join(' | '),
    });
  }
  if (data.skills) {
    const activeSkills = Object.entries(data.skills)
      .filter(([_, active]) => active)
      .map(([name]) => name);
    if (activeSkills.length > 0) {
      competencies.push({
        title: 'المهارات والكفايات المفعّلة (Competencies & Skills)',
        description: activeSkills.join(' ، '),
      });
    }
  }

  // Student characteristics from differentiation
  const diffEntries = Object.entries(data.differentiation || {});
  const struggling = data.differentiation?.['Struggling Learners'] || data.differentiation?.['الطلبة المتعثرون'] || 'دعم فردي وبنك كلمات مصور';
  const advanced = data.differentiation?.['Advanced Learners'] || data.differentiation?.['الطلبة المتقدمون'] || 'مهام مقارنة وإثراء متقدمة';
  const visual = data.differentiation?.['Visual Learners'] || data.differentiation?.['المتعلمون البصريون'] || 'وسائط بصرية ومقاطع OER تفاعلية';

  // Learning resources
  const internalList = (data.resources?.internal || []).join(' | ');
  const openResList = (data.resources?.open_access || []).map((r) => `[${r.type.toUpperCase()}] ${r.title} (${r.url})`).join(' \n');

  // Build timeline phases from procedures
  const timeline: LessonPhase[] = [];
  const procedures = data.procedures || {};
  const procKeys = Object.keys(procedures);

  if (procKeys.length > 0) {
    procKeys.forEach((stepKey, idx) => {
      const stepContent = procedures[stepKey];
      const matchMin = stepKey.match(/(\d+)\s*min/i) || stepKey.match(/(\d+)\s*دقيقة/);
      const phaseMinutes = matchMin ? parseInt(matchMin[1], 10) : Math.max(5, Math.floor(durationMinutes / procKeys.length));

      timeline.push({
        id: `phase-abqour-${idx + 1}`,
        phaseName: stepKey,
        durationMinutes: phaseMinutes,
        teacherAndStudentActions: [stepContent],
        strategiesAndResources: [
          'التعلم النشط والعمل التعاوني (Pair & Group Work)',
          'استثمار مصادر التعليم المفتوحة OER والبطاقات',
        ],
        assessmentAndFeedback: [
          idx === procKeys.length - 1
            ? (data.evaluation?.['Exit Ticket'] || 'تذكرة الخروج (Exit Ticket) وتقويم النتاجات')
            : 'ملاحظة تشاركية وتغذية راجعة بنائية مستمرة',
        ],
      });
    });
  } else {
    // Default 5-phase standard structure
    timeline.push(
      {
        id: 'phase-1',
        phaseName: '1. التهيئة والمراجعة واستثارة الدافعية (Warm-up)',
        durationMinutes: 5,
        teacherAndStudentActions: ['مراجعة التعلم السابق وعرض بطاقات ومثير بصري OER'],
        strategiesAndResources: ['العصف الذهني والحوار والمناقشة'],
        assessmentAndFeedback: ['تقويم قبلي وتشخيصي واستثارة الاهتمام'],
      },
      {
        id: 'phase-2',
        phaseName: '2. العرض والتدريس المباشر ونمذجة المفهوم (Presentation)',
        durationMinutes: 10,
        teacherAndStudentActions: ['تقديم المفردات الجديدة وتراكيب الجمل ونمذجتها'],
        strategiesAndResources: ['النمذجة والوسائط التفاعلية والمصادر المفتوحة'],
        assessmentAndFeedback: ['تغذية راجعة فورية للفظ السليم وبناء الجملة'],
      },
      {
        id: 'phase-3',
        phaseName: '3. التدريب الموجه والأنشطة الجماعية (Guided Practice)',
        durationMinutes: 10,
        teacherAndStudentActions: ['مطابقة العناصر والربط التفاعلي وأسئلة الصف الكامل'],
        strategiesAndResources: ['التعلم التعاوني والمطابقة على اللوح'],
        assessmentAndFeedback: ['تقويم تكويني ورصد استجابات المجموعات'],
      },
      {
        id: 'phase-4',
        phaseName: '4. العمل الثنائي والتطبيق المستقل (Pair Work / Independent)',
        durationMinutes: 15,
        teacherAndStudentActions: ['حوار ثنائي بين الطلبة وتعبئة ورقة العمل التفاعلية'],
        strategiesAndResources: ['العمل الثنائي وتمثيل الأدوار وبنك الكلمات'],
        assessmentAndFeedback: ['سلم تقدير مصغر وتقويم الأقران'],
      },
      {
        id: 'phase-5',
        phaseName: '5. الغلق وتذكرة الخروج وتكليف الواجب (Wrap-up & Exit Ticket)',
        durationMinutes: 5,
        teacherAndStudentActions: ['تطبيق بطاقة الخروج وتلخيص الفكرة المحورية وتوزيع الواجب'],
        strategiesAndResources: ['بطاقات الخروج والمفكرة التعليمية'],
        assessmentAndFeedback: ['تذكرة خروج نهائية وجمع الملاحظات الختامية'],
      }
    );
  }

  // Convert attached OER resources
  const attachedResources: EducationalResource[] = (data.resources?.open_access || []).map((r, i) => {
    let rType: EducationalResource['type'] = 'link';
    if (r.type === 'video') rType = 'video';
    else if (r.type === 'pdf') rType = 'document';
    else if (r.type === 'interactive') rType = 'worksheet';
    else if (r.type === 'image') rType = 'image';

    return {
      id: `res-oer-abqour-${Date.now()}-${i}`,
      title: r.title,
      type: rType,
      content: `${r.description || ''}\nالرابط المباشر OER: ${r.url}`,
      sourceInfo: r.url,
      createdAt: dateIso,
      tags: ['OER', 'Abqour Integration', r.type],
    };
  });

  const rawPlan: LessonPlan = {
    id: planId,
    title: `${lessonTitle} — (${gradeStr})`,
    templateType: 'executive',
    header: {
      country: 'دولة فلسطين',
      ministry: 'وزارة التربية والتعليم',
      school: schoolName,
      directorate: 'مديرية التربية والتعليم',
      teacherName: teacherName,
      subject: data.grammar_structures?.length ? 'اللغة الإنجليزية (English Language)' : 'المبحث التكاملي',
      grade: gradeStr,
      section: 'أ',
      lessonTitle: lessonTitle,
      unitTitle: unitTitle,
      totalPeriods: 1,
      currentPeriod: 1,
      periodDurationMinutes: durationMinutes,
      date: dateIso,
      startDate: dateIso,
      endDate: dateIso,
      semester: semesterStr,
      timeframe: `حصة رقم (1) - التاريخ: ${dateFormatted}`,
    },
    section1: {
      integrativeCompetencies: competencies,
      studentCharacteristics: {
        individualDifferences: `المتعلمون المتعثرون: ${struggling} | المتقدمون: ${advanced}`,
        specialNeeds: 'توفير بطاقات مصورة ورسوم توضيحية واستجابات متعددة الوسائط',
        environmentalAdaptation: `المتعلمون البصريون: ${visual} وبيئة صفية تفاعلية داعمة للعمل الثنائي`,
      },
      learningResources: {
        textbook: internalList || "Pupil's Book & Teacher's Guide",
        tangibleMedia: 'بطاقات المفردات المصورة، مجسمات، والسبورة التفاعلية',
        digitalReadiness: openResList || 'مقاطع مصادر التعليم المفتوحة OER وشبكة الإنترنت',
      },
      ethicsAndSafety: {
        digitalSafety: 'استخدام روابط OER موثوقة وآمنة تربوياً تحت إشراف المعلم',
        contentAccuracyAndLanguage: 'التأكد من دقة النطق والمصطلحات وسلامة التراكيب اللغوية',
      },
      reflectiveQuestions: [
        `كيف تسهم مصادر OER المفتوحة في ترسيخ مفهوم: ${data.core_concept || lessonTitle}؟`,
        'ما أثر التعلم الثنائي في تعزيز طلاقة التعبير لدى المتعلمين؟',
      ],
    },
    section2Timeline: timeline,
    section3Assessment: {
      graspsTask: {
        title: `مهمة أدائية أصيلة: ${lessonTitle}`,
        role: 'مستكشف بيئي / متحدث باللغة الإنجليزية',
        audience: 'الزملاء في الصف والمعلم',
        situation: 'في مؤتمر طلابي أو نشاط ثنائي لوصف الكائنات الحية وبيئاتها الطبيعية والتكيف معها',
        product: 'حوار ثنائي أو بطاقة وصفية مصورة مع عرض جملتين مكتملتين',
        standards: 'دقة المفردات، سلامة التركيب، حسن الأداء والمشاركة الإيجابية',
        fullDescription: (data.objectives || []).join('\n• '),
      },
      rubric: [
        {
          criterion: 'استخدام المفردات والمصطلحات (Vocabulary)',
          level1: 'يذكر كلمة واحدة بمساعدة مباشرة',
          level2: 'يذكر كلمتين مع بعض الأخطاء في النطق',
          level3: 'يستخدم ٣-٤ مفردات بنطق سليم وفي سياقها',
          level4: 'يتقن توظيف كافة المفردات الـ ٥ بطلاقة ونطق دقيق',
        },
        {
          criterion: 'بناء الجمل والتراكيب (Grammar & Sentence Structure)',
          level1: 'تراكيب غير مكتملة المعنى',
          level2: 'جملة بسيطة مع تردد واضح',
          level3: 'يكوّن جملة وصفية صحيحة نحوياً',
          level4: 'يكوّن جملاً مركبة ومعبرة عن التفضيل والتعليل بدقة',
        },
        {
          criterion: 'المشاركة والعمل التعاوني (Collaboration)',
          level1: 'مشاركة سلبية ومحدودة',
          level2: 'يشارك عند الطلب المباشر من المعلم',
          level3: 'يتعاون بفاعلية مع زميله في الثنائي',
          level4: 'مبادر ويساعد زميله ويدير الحوار بإيجابية لافتة',
        },
      ],
      remedialActivities: [
        {
          title: 'الخطة العلاجية وبنك الكلمات المصور',
          description: struggling,
        },
      ],
      enrichmentActivities: {
        title: 'الأنشطة الإثرائية والتحدي المتقدم',
        puzzleOrChallenge: advanced,
        peerTutoring: 'قيادة الثنائيات ومساعدة الزميل في النطق السليم لأسماء البيئات',
      },
      immediateFeedback: Object.entries(data.evaluation || {}).map(([k, v]) => `${k}: ${v}`),
    },
    section4Environment: {
      classroomRoutines: 'توزيع المقاعد بنظام الثنائيات (Pairs)، الانتقال السلس بين المراحل عبر إشارات صوتية واضحة.',
      safeAndMotivatingClimate: 'بيئة إيجابية مشجعة على المحاولة دون خوف من الخطأ، وتعزيز فوري للاستجابات المتميزة.',
      familyPartnership: {
        cardTitle: `بطاقة الشراكة الأسرية — ${lessonTitle}`,
        instructions: 'عزيزي ولي الأمر، يرجى مشاركة ابنكم/ابنتكم في استكشاف موضوع الدرس المنزلي.',
        studentTask: data.homework || 'حل صفحة كتاب التمارين ورسم الكائن المفضل وبيئته.',
        parentRole: 'الاستماع للطالب وهو ينطق أسماء البيئات بالإنجليزية ومشاركته مشاهدة مقطع OER المرفق.',
      },
    },
    section5Reflection: {
      strengthsAndImpact: [
        data.reflection || 'تفاعل مرتفع واهتمام كبير من الطلبة بالمحتوى المرئي والأنشطة الثنائية.',
      ],
      improvementOpportunities: 'ضبط دقيق لزمن التهيئة واستثمار وقت أطول للتطبيق المستقل.',
      professionalLearningCommunities: 'مشاركة روابط المصادر المفتوحة OER مع معلمي المبحث في المدرسة والمجتمع التربوي.',
    },
    section6Signatures: {
      teacher: {
        name: teacherName,
        date: dateIso,
        notes: 'تم إعداد الخطة وربطها بنجاح مع بنك المصادر المفتوحة OER.',
      },
      schoolPrincipal: {
        name: 'مدير/ة المدرسة',
        date: dateIso,
        directives: 'خطة مستوفية للكفايات والتدرج الزمني وتفعيل مصادر التعليم المفتوحة.',
      },
      educationalSupervisor: {
        name: 'المشرف التربوي',
        date: dateIso,
        directives: 'إعداد نموذجي يعزز التعلم النشط وتمايز التعليم وبناء المهارات اللغوية.',
      },
    },
    attachedResources: attachedResources,
  };

  return ensureExecutiveData(rawPlan);
}

/**
 * Format an Abqour LessonPlan into the exact text format defined in Python's `format_for_abqour()`
 */
export function formatPlanForAbqourText(plan: LessonPlan): string {
  const h = plan.header;
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('DAILY ENGLISH LESSON PLAN — FORMATTED FOR ABQOUR SYSTEM');
  lines.push('='.repeat(60));
  lines.push(`School:         ${h.school || 'Model School'}`);
  lines.push(`Teacher:        ${h.teacherName || 'Teacher Name'}`);
  lines.push(`Semester:       ${h.semester || 'First Semester'}`);
  lines.push(`Class/Grade:    ${h.grade || 'Grade 5'}`);
  lines.push(`Date:           ${h.date || h.startDate || '2026-10-15'}`);
  lines.push(`Unit No.:       ${h.unitTitle || 'Unit 1'}`);
  lines.push(`Topic:          ${h.lessonTitle || 'Lesson Topic'}`);
  lines.push(`Duration:       ${h.periodDurationMinutes || 45} minutes`);
  lines.push('-'.repeat(60));

  // 1. Objectives
  lines.push('\n【LEARNING OBJECTIVES】');
  lines.push('• By the end of the lesson, pupils will be able to:');
  const objectives = plan.executiveData?.smartObjectives?.length
    ? plan.executiveData.smartObjectives
    : plan.section1.integrativeCompetencies.map((c) => `${c.title}: ${c.description}`);
  if (objectives.length === 0) {
    lines.push(`  ✓ Master the core concepts of ${h.lessonTitle}`);
  } else {
    objectives.forEach((obj) => lines.push(`  ✓ ${obj}`));
  }

  // 2. Skills
  lines.push('\n【SKILLS & COMPETENCIES】');
  const skillsList = [
    'Listening (Active Comprehension)',
    'Speaking (Oral Fluency & Pronunciation)',
    'Reading (Vocabulary & Context Clues)',
    'Collaboration (Pair & Group Work)',
    'Critical Thinking (Habitats & Adaptations)',
  ];
  lines.push(' • ' + skillsList.join('\n • '));

  // 3. Procedures
  lines.push('\n【PROCEDURES & TIMING】');
  if (plan.section2Timeline && plan.section2Timeline.length > 0) {
    plan.section2Timeline.forEach((p) => {
      lines.push(`▸ ${p.phaseName} (${p.durationMinutes} min)`);
      lines.push(`  ${p.teacherAndStudentActions.join(' ')}`);
    });
  } else {
    lines.push('▸ Warm-up & Review (5 min)\n  Interactive introduction and prior knowledge activation.');
  }

  // 4. Evaluation
  lines.push('\n【EVALUATION】');
  lines.push(`• Formative Check: ${plan.section3Assessment?.immediateFeedback?.[0] || 'Ongoing teacher observation and feedback'}`);
  lines.push(`• Authentic Task: ${plan.section3Assessment?.graspsTask?.product || 'Student oral presentation & worksheet completion'}`);
  lines.push(`• Exit Ticket: ${plan.section4Environment?.familyPartnership?.studentTask || 'Quick response card before dismissal'}`);

  // 5. Language & Concepts
  lines.push('\n【LANGUAGE & CONCEPTS】');
  const vocabComp = plan.section1.integrativeCompetencies.find((c) => c.title.toLowerCase().includes('vocab') || c.title.includes('مفردات'));
  lines.push(`Vocabulary:\n  • ${vocabComp ? vocabComp.description : 'habitat, desert, forest, ocean, adapt, survive'}`);

  const grammarComp = plan.section1.integrativeCompetencies.find((c) => c.title.toLowerCase().includes('gramm') || c.title.includes('تراكيب') || c.title.includes('قواعد'));
  lines.push(`\nGrammar / Structures:\n  • ${grammarComp ? grammarComp.description : 'Subject + live(s) in + [Habitat]'}`);

  const conceptComp = plan.section1.integrativeCompetencies.find((c) => c.title.toLowerCase().includes('concept') || c.title.includes('مفهوم'));
  lines.push(`\nCore Concept:\n  ${conceptComp ? conceptComp.description : 'Living organisms have adaptations suited to their environments.'}`);

  // 6. Resources & OER
  lines.push('\n【RESOURCES & MATERIALS】');
  lines.push('Internal / School Resources:');
  lines.push(`  • Textbook: ${plan.section1.learningResources.textbook || "Pupil's Book"}`);
  lines.push(`  • Media: ${plan.section1.learningResources.tangibleMedia || 'Flashcards, Smart Board'}`);

  lines.push('\nOpen Educational Resources (Linked):');
  if (plan.attachedResources && plan.attachedResources.length > 0) {
    plan.attachedResources.forEach((res) => {
      lines.push(`  • [${(res.type || 'LINK').toUpperCase()}] ${res.title}`);
      if (res.sourceInfo) lines.push(`    Link: ${res.sourceInfo}`);
    });
  } else {
    lines.push('  • [VIDEO] National Geographic Kids: Animal Habitats (https://kids.nationalgeographic.com/nature/habitats)');
    lines.push('  • [WORKSHEET] OER Commons: Habitats Matching (https://oercommons.org/courses/habitats-worksheet)');
  }

  lines.push('\nQuick Search Links in OER Libraries:');
  const searchLinks = generateOerSearchLinks(h.lessonTitle || 'Animals and Their Habitats');
  searchLinks.forEach((link) => {
    lines.push(`• ${link.name}: ${link.url}`);
  });

  // 7. Assignment & Reflection
  lines.push('\n【ASSIGNMENT & REFLECTION】');
  lines.push(`Homework:\n  ${plan.section4Environment?.familyPartnership?.studentTask || 'Complete worksheet and review vocabulary'}`);
  lines.push('\nDifferentiation & Support:');
  lines.push(`  • Struggling Learners: ${plan.section1.studentCharacteristics.individualDifferences || 'Provide word bank with pictures'}`);
  lines.push(`  • Advanced Learners: ${plan.section3Assessment.enrichmentActivities?.puzzleOrChallenge || 'Compare different animals and write extended sentences'}`);
  lines.push(`\nTeacher\'s Post-Lesson Notes:\n  ${plan.section5Reflection?.strengthsAndImpact?.[0] || 'Active student participation; smooth pacing.'}`);
  lines.push('\n' + '='.repeat(60));
  lines.push(`Generated: ${new Date().toLocaleString()}`);

  return lines.join('\n');
}

/**
 * Convert an Abqour LessonPlan into the exact JSON schema required by `AbqourLessonPlan.to_json()`
 */
export function exportPlanToAbqourJson(plan: LessonPlan): AbqourLessonPlanJson {
  const h = plan.header;
  
  // Extract procedures
  const proceduresMap: Record<string, string> = {};
  if (plan.section2Timeline && plan.section2Timeline.length > 0) {
    plan.section2Timeline.forEach((phase) => {
      proceduresMap[`${phase.phaseName} (${phase.durationMinutes} min)`] = phase.teacherAndStudentActions.join(' ');
    });
  }

  // Extract open resources
  const openResources: AbqourOpenResource[] = (plan.attachedResources || []).map((r) => ({
    title: r.title,
    url: r.sourceInfo || '',
    type: r.type,
    description: r.content,
  }));

  // Extract vocabulary & grammar
  const vocabComp = plan.section1.integrativeCompetencies.find((c) => c.title.toLowerCase().includes('vocab') || c.title.includes('مفردات'));
  const grammarComp = plan.section1.integrativeCompetencies.find((c) => c.title.toLowerCase().includes('gramm') || c.title.includes('تراكيب') || c.title.includes('قواعد'));
  const conceptComp = plan.section1.integrativeCompetencies.find((c) => c.title.toLowerCase().includes('concept') || c.title.includes('مفهوم'));

  return {
    metadata: {
      generated_at: new Date().toISOString(),
      system: 'Abqour-Lesson-Plan-Integration',
    },
    header: {
      school: h.school,
      teacher: h.teacherName,
      semester: h.semester,
      class: h.grade,
      date: h.date || h.startDate,
      unit: h.unitTitle,
      topic: h.lessonTitle,
      duration: `${h.periodDurationMinutes || 45} minutes`,
    },
    objectives: plan.executiveData?.smartObjectives?.length
      ? plan.executiveData.smartObjectives
      : plan.section1.integrativeCompetencies.map((c) => `${c.title}: ${c.description}`),
    skills: {
      Listening: true,
      Speaking: true,
      Reading: true,
      Writing: true,
      Collaboration: true,
      "Critical Thinking": true,
    },
    procedures: proceduresMap,
    evaluation: {
      "Formative Evaluation": plan.section3Assessment.immediateFeedback?.[0] || 'Ongoing observational feedback',
      "Authentic Task": plan.section3Assessment.graspsTask?.product || 'Student dialogue & matching activity',
      "Exit Ticket": plan.section4Environment?.familyPartnership?.studentTask || 'Summary sticky note',
    },
    vocabulary: vocabComp ? vocabComp.description.split(/[•,|]/).map((s) => s.trim()).filter(Boolean) : ['vocabulary_1', 'vocabulary_2'],
    grammar_structures: grammarComp ? grammarComp.description.split(/[•,|]/).map((s) => s.trim()).filter(Boolean) : ['Subject + verb + object'],
    core_concept: conceptComp ? conceptComp.description : plan.title,
    resources: {
      internal: [
        plan.section1.learningResources.textbook || "Pupil's Book",
        plan.section1.learningResources.tangibleMedia || 'Flashcards & Visuals',
      ].filter(Boolean),
      open_access: openResources,
    },
    homework: plan.section4Environment?.familyPartnership?.studentTask || 'Review lesson notes and complete activity book',
    differentiation: {
      "Struggling Learners": plan.section1.studentCharacteristics.individualDifferences || 'Provide visual word bank',
      "Advanced Learners": plan.section3Assessment.enrichmentActivities?.puzzleOrChallenge || 'Extended writing task',
      "Visual Learners": plan.section1.studentCharacteristics.environmentalAdaptation || 'Use interactive visual media',
    },
    reflection: plan.section5Reflection?.strengthsAndImpact?.[0] || 'Successful lesson delivery and active student engagement.',
  };
}

/**
 * Generate full executable Python script file ready to run on any machine:
 * `abqour_lesson_plan.py` pre-filled with the current plan data!
 */
export function generatePythonScriptForPlan(plan: LessonPlan): string {
  const jsonData = exportPlanToAbqourJson(plan);
  const h = jsonData.header;
  const jsonString = JSON.stringify(jsonData, null, 4);

  return `# -*- coding: utf-8 -*-
"""
======================================================================
Abqour Lesson Plan Integration Tool
أداة إنشاء وربط نماذج خطة الدرس بمنظومة عبقور
مع ربط مباشر بمكتبة المصادر المفتوحة
======================================================================
Generated for: ${h.topic || 'Lesson Plan'} (${h.class || 'Grade'})
Teacher: ${h.teacher || 'Teacher'} | School: ${h.school || 'School'}
"""

import json
from datetime import datetime
from typing import List, Dict, Optional


class OpenResource:
    """يمثل مصدرًا تعليميًا مفتوحًا مرتبطًا بالخطة"""
    def __init__(self, title: str, url: str, resource_type: str, description: str = ""):
        self.title = title
        self.url = url
        self.type = resource_type  # video, pdf, interactive, image, etc.
        self.description = description


class AbqourLessonPlan:
    """نموذج خطة درس متوافق مع هيكل منظومة عبقور"""
    
    def __init__(self, school: str, teacher: str, semester: str,
                 grade_class: str, lesson_date: str,
                 unit_no: str, lesson_topic: str, duration: str = "45 minutes"):
        # البيانات الأساسية
        self.school = school
        self.teacher = teacher
        self.semester = semester
        self.grade_class = grade_class
        self.lesson_date = lesson_date
        self.unit_no = unit_no
        self.lesson_topic = lesson_topic
        self.duration = duration
        
        # أقسام النموذج
        self.objectives: List[str] = []
        self.skills: Dict[str, bool] = {
            "Listening": False,
            "Speaking": False,
            "Reading": False,
            "Writing": False,
            "Collaboration": False,
            "Critical Thinking": False
        }
        self.procedures: Dict[str, str] = {}
        self.evaluation: Dict[str, str] = {}
        self.vocabulary: List[str] = []
        self.grammar_structures: List[str] = []
        self.core_concept: str = ""
        self.internal_resources: List[str] = []
        self.open_resources: List[OpenResource] = []
        self.homework: str = ""
        self.differentiation: Dict[str, str] = {}
        self.reflection: str = ""

    # --- إضافة المحتوى ---
    def add_objective(self, objective: str):
        self.objectives.append(objective)

    def enable_skill(self, skill_name: str):
        if skill_name in self.skills:
            self.skills[skill_name] = True

    def add_procedure_step(self, step_name: str, content: str):
        self.procedures[step_name] = content

    def add_vocabulary(self, *words):
        self.vocabulary.extend(words)

    def add_grammar_structure(self, structure: str):
        self.grammar_structures.append(structure)

    def add_open_resource(self, title: str, url: str, resource_type: str, desc: str = ""):
        """إضافة مصدر من مكتبة المصادر المفتوحة مع ربطه المباشر"""
        self.open_resources.append(
            OpenResource(title, url, resource_type, desc)
        )

    def search_and_link_oer(self, keyword: str) -> str:
        """إنشاء روابط بحث مباشرة في منصات المصادر المفتوحة"""
        oer_platforms = {
            "OER Commons": f"https://oercommons.org/search?q={keyword.replace(' ', '+')}",
            "Khan Academy": f"https://www.khanacademy.org/search?page_search_query={keyword.replace(' ', '+')}",
            "TED-Ed": f"https://ed.ted.com/search?q={keyword.replace(' ', '+')}",
            "Palestinian e-Learn": f"https://elearn.edu.ps/search?q={keyword.replace(' ', '+')}"
        }
        return "\\n".join([f"• {name}: {url}" for name, url in oer_platforms.items()])

    # --- تنسيق الإخراج ---
    def format_for_abqour(self) -> str:
        """تنسيق النموذج ليُنسخ مباشرة إلى حقول منظومة عبقور"""
        lines = []
        lines.append("=" * 60)
        lines.append("DAILY ENGLISH LESSON PLAN — FORMATTED FOR ABQOUR SYSTEM")
        lines.append("=" * 60)
        lines.append(f"School:         {self.school}")
        lines.append(f"Teacher:        {self.teacher}")
        lines.append(f"Semester:       {self.semester}")
        lines.append(f"Class/Grade:    {self.grade_class}")
        lines.append(f"Date:           {self.lesson_date}")
        lines.append(f"Unit No.:       {self.unit_no}")
        lines.append(f"Topic:          {self.lesson_topic}")
        lines.append(f"Duration:       {self.duration}")
        lines.append("-" * 60)

        # 1. الأهداف
        lines.append("\\n【LEARNING OBJECTIVES】")
        lines.append("• By the end of the lesson, pupils will be able to:")
        for obj in self.objectives:
            lines.append(f"  ✓ {obj}")

        # 2. المهارات
        lines.append("\\n【SKILLS & COMPETENCIES】")
        enabled_skills = [k for k, v in self.skills.items() if v]
        lines.append(" • " + "\\n • ".join(enabled_skills))

        # 3. الإجراءات
        lines.append("\\n【PROCEDURES & TIMING】")
        for step, content in self.procedures.items():
            lines.append(f"▸ {step}")
            lines.append(f"  {content}")

        # 4. التقييم
        lines.append("\\n【EVALUATION】")
        for k, v in self.evaluation.items():
            lines.append(f"• {k}: {v}")

        # 5. المفاهيم والمحتوى اللغوي
        lines.append("\\n【LANGUAGE & CONCEPTS】")
        lines.append("Vocabulary:")
        lines.append("  • " + "\\n  • ".join(self.vocabulary))
        lines.append("\\nGrammar / Structures:")
        lines.append("  • " + "\\n  • ".join(self.grammar_structures))
        lines.append(f"\\nCore Concept:\\n  {self.core_concept}")

        # 6. المصادر — مع ربط المصادر المفتوحة
        lines.append("\\n【RESOURCES & MATERIALS】")
        lines.append("Internal / School Resources:")
        for res in self.internal_resources:
            lines.append(f"  • {res}")
        
        lines.append("\\nOpen Educational Resources (Linked):")
        if self.open_resources:
            for res in self.open_resources:
                lines.append(f"  • [{res.type.upper()}] {res.title}")
                if res.description:
                    lines.append(f"    {res.description}")
                lines.append(f"    Link: {res.url}")
        lines.append("\\nQuick Search Links in OER Libraries:")
        lines.append(self.search_and_link_oer(self.lesson_topic))

        # 7. الواجب والملاحظات
        lines.append("\\n【ASSIGNMENT & REFLECTION】")
        lines.append(f"Homework:\\n  {self.homework}")
        lines.append("\\nDifferentiation & Support:")
        for level, desc in self.differentiation.items():
            lines.append(f"  • {level}: {desc}")
        lines.append(f"\\nTeacher's Post-Lesson Notes:\\n  {self.reflection}")
        lines.append("\\n" + "=" * 60)
        lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        return "\\n".join(lines)

    def to_json(self) -> str:
        """تصدير بصيغة JSON للمعالجة البرمجية المستقبلية"""
        data = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "system": "Abqour-Lesson-Plan-Integration"
            },
            "header": {
                "school": self.school,
                "teacher": self.teacher,
                "semester": self.semester,
                "class": self.grade_class,
                "date": self.lesson_date,
                "unit": self.unit_no,
                "topic": self.lesson_topic,
                "duration": self.duration
            },
            "objectives": self.objectives,
            "skills": {k: v for k, v in self.skills.items() if v},
            "procedures": self.procedures,
            "vocabulary": self.vocabulary,
            "grammar_structures": self.grammar_structures,
            "core_concept": self.core_concept,
            "resources": {
                "internal": self.internal_resources,
                "open_access": [
                    {"title": r.title, "url": r.url, "type": r.type, "description": r.description}
                    for r in self.open_resources
                ]
            },
            "homework": self.homework,
            "differentiation": self.differentiation,
            "reflection": self.reflection
        }
        return json.dumps(data, ensure_ascii=False, indent=2)


# ==================================================
# 📌 تنفيذ الخطة الحالية وتوليد الملفات
# ==================================================
if __name__ == "__main__":
    
    lesson = AbqourLessonPlan(
        school=${JSON.stringify(h.school || 'Model School')},
        teacher=${JSON.stringify(h.teacher || 'Teacher Name')},
        semester=${JSON.stringify(h.semester || 'First Semester / 2026-2027')},
        grade_class=${JSON.stringify(h.class || 'Grade 5')},
        lesson_date=${JSON.stringify(h.date || '2026-10-15')},
        unit_no=${JSON.stringify(h.unit || 'Unit 1')},
        lesson_topic=${JSON.stringify(h.topic || 'Lesson Topic')},
        duration=${JSON.stringify(h.duration || '45 minutes')}
    )

    # أهداف التعلم
${(jsonData.objectives || []).map((o) => `    lesson.add_objective(${JSON.stringify(o)})`).join('\n')}

    # تفعيل المهارات
${Object.entries(jsonData.skills || {})
  .filter(([_, v]) => v)
  .map(([k]) => `    lesson.enable_skill(${JSON.stringify(k)})`)
  .join('\n')}

    # خطوات الإجراءات والتوقيت
${Object.entries(jsonData.procedures || {})
  .map(([step, content]) => `    lesson.add_procedure_step(${JSON.stringify(step)}, ${JSON.stringify(content)})`)
  .join('\n')}

    # المفردات والقواعد والمفهوم الجوهري
${(jsonData.vocabulary || []).length > 0 ? `    lesson.add_vocabulary(*${JSON.stringify(jsonData.vocabulary)})` : ''}
${(jsonData.grammar_structures || []).map((g) => `    lesson.add_grammar_structure(${JSON.stringify(g)})`).join('\n')}
    lesson.core_concept = ${JSON.stringify(jsonData.core_concept || '')}

    # المصادر الداخلية ومصادر OER المفتوحة
    lesson.internal_resources = ${JSON.stringify(jsonData.resources?.internal || [])}

${(jsonData.resources?.open_access || [])
  .map(
    (res) =>
      `    lesson.add_open_resource(\n        title=${JSON.stringify(res.title)},\n        url=${JSON.stringify(res.url)},\n        resource_type=${JSON.stringify(res.type)},\n        desc=${JSON.stringify(res.description || '')}\n    )`
  )
  .join('\n')}

    # الواجب والمراعاة والتأمل
    lesson.homework = ${JSON.stringify(jsonData.homework || '')}
    lesson.differentiation = ${JSON.stringify(jsonData.differentiation || {})}
    lesson.reflection = ${JSON.stringify(jsonData.reflection || '')}

    # --- حفظ ومخرجات الملفات ---
    output_txt = lesson.format_for_abqour()
    output_json = lesson.to_json()

    with open("ABQOUR_LESSON_PLAN.txt", "w", encoding="utf-8") as f:
        f.write(output_txt)

    with open("ABQOUR_LESSON_PLAN_DATA.json", "w", encoding="utf-8") as f:
        f.write(output_json)

    print(output_txt)
    print("\\n✅ Files saved successfully: ABQOUR_LESSON_PLAN.txt | ABQOUR_LESSON_PLAN_DATA.json")
`;
}

/**
 * Downloads a text or code file
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Creates the official exemplar plan for the Abqour Python & OER Model
 * Based on the Python script specifications: Animals and Their Habitats (Grade 5)
 */
export function getAbqourEnglishHabitatsExemplarPlan(): LessonPlan {
  const plan = convertAbqourJsonToLessonPlan(SAMPLE_PYTHON_LESSON_PLAN);
  return {
    ...plan,
    id: 'abqour-english-grade5-habitats-oer',
    title: 'نموذج منظومة عبقور: Animals and Their Habitats (اللغة الإنجليزية ومكتبة المصادر المفتوحة OER)',
    templateType: 'executive',
  };
}

export const abqourEnglishHabitatsPlan: LessonPlan = getAbqourEnglishHabitatsExemplarPlan();

