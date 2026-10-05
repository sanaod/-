import { LessonPlan } from '../types/lessonPlan';

/**
 * Creates a completely blank, pristine ministerial lesson plan ready for teacher input.
 */
export function getBlankLessonPlan(): LessonPlan {
  const timestamp = Date.now();
  const dateStr = new Date().toISOString().split('T')[0];

  return {
    id: `plan-blank-${timestamp}`,
    title: 'استمارة تحضير درس مفرغة (جاهزة للإدخال)',
    header: {
      country: 'دولة فلسطين',
      ministry: 'وزارة التربية والتعليم',
      school: '',
      directorate: '',
      teacherName: '',
      subject: '',
      grade: 'الصف الثالث الأساسي',
      section: 'أ',
      lessonTitle: '',
      totalPeriods: 1,
      currentPeriod: 1,
      periodDurationMinutes: 40,
      date: dateStr,
      startDate: dateStr,
      endDate: dateStr,
      timeframe: `من (${dateStr}) إلى (${dateStr})`,
      semester: 'الفصل الدراسي الأول',
    },
    section1: {
      integrativeCompetencies: [
        {
          title: 'كفاية المعرفة التخصصية والحساب',
          description: '',
        },
        {
          title: 'كفاية التفكير الناقد وحل المشكلات',
          description: '',
        },
        {
          title: 'كفاية القرائية والتعبير السليم',
          description: '',
        },
        {
          title: 'كفاية المواطنة والقيم الوطنية',
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
      reflectiveQuestions: [
        '',
        '',
      ],
    },
    section2Timeline: [
      {
        id: `p1-${timestamp}`,
        phaseName: '1. التمهيد والتهيئة (إثارة الدافعية والاستكشاف)',
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
        phaseName: '3. التطبيق والتعميق (المهام الأصيلة والأنشطة المتمايزة)',
        durationMinutes: 12,
        teacherAndStudentActions: [''],
        strategiesAndResources: [''],
        assessmentAndFeedback: [''],
      },
      {
        id: `p4-${timestamp}`,
        phaseName: '4. الخاتمة والتقويم (بطاقة الخروج والتغذية الختامية)',
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
          criterion: 'معيار الأداء الأول',
          level1: '',
          level2: '',
          level3: '',
          level4: '',
        },
        {
          criterion: 'معيار الأداء الثاني',
          level1: '',
          level2: '',
          level3: '',
          level4: '',
        },
        {
          criterion: 'معيار الأداء الثالث',
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
        name: '',
        date: dateStr,
        notes: '',
      },
      schoolPrincipal: {
        name: '',
        date: dateStr,
        directives: '',
      },
      educationalSupervisor: {
        name: '',
        date: dateStr,
        directives: '',
      },
    },
  };
}

/**
 * Standard primary default blank template instance
 */
export const defaultBlankPlan: LessonPlan = {
  id: 'plan-blank-default',
  title: 'استمارة تحضير درس مفرغة (جاهزة للإدخال والكتابة)',
  header: {
    country: 'دولة فلسطين',
    ministry: 'وزارة التربية والتعليم',
    school: '',
    directorate: '',
    teacherName: '',
    subject: '',
    grade: 'الصف الثالث الأساسي',
    section: 'أ',
    lessonTitle: '',
    totalPeriods: 1,
    currentPeriod: 1,
    periodDurationMinutes: 40,
    date: '2026-10-05',
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    timeframe: 'من (٠٥/١٠/٢٠٢٦م) إلى (٠٥/١٠/٢٠٢٦م)',
    semester: 'الفصل الدراسي الأول',
  },
  section1: {
    integrativeCompetencies: [
      {
        title: 'كفاية المعرفة التخصصية والحساب',
        description: '',
      },
      {
        title: 'كفاية التفكير الناقد وحل المشكلات',
        description: '',
      },
      {
        title: 'كفاية القرائية والتعبير السليم',
        description: '',
      },
      {
        title: 'كفاية المواطنة والقيم الوطنية',
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
    reflectiveQuestions: [
      '',
      '',
    ],
  },
  section2Timeline: [
    {
      id: 'blank-p1',
      phaseName: '1. التمهيد والتهيئة (إثارة الدافعية والاستكشاف)',
      durationMinutes: 5,
      teacherAndStudentActions: [''],
      strategiesAndResources: [''],
      assessmentAndFeedback: [''],
    },
    {
      id: 'blank-p2',
      phaseName: '2. العرض والاستكشاف (النمذجة والمحسوسات والمفاهيم)',
      durationMinutes: 15,
      teacherAndStudentActions: [''],
      strategiesAndResources: [''],
      assessmentAndFeedback: [''],
    },
    {
      id: 'blank-p3',
      phaseName: '3. التطبيق والتعميق (المهام الأصيلة والأنشطة المتمايزة)',
      durationMinutes: 12,
      teacherAndStudentActions: [''],
      strategiesAndResources: [''],
      assessmentAndFeedback: [''],
    },
    {
      id: 'blank-p4',
      phaseName: '4. الخاتمة والتقويم (بطاقة الخروج والتغذية الختامية)',
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
        criterion: 'معيار الأداء الأول',
        level1: '',
        level2: '',
        level3: '',
        level4: '',
      },
      {
        criterion: 'معيار الأداء الثاني',
        level1: '',
        level2: '',
        level3: '',
        level4: '',
      },
      {
        criterion: 'معيار الأداء الثالث',
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
      name: '',
      date: '٢٠٢٦/١٠/٠٥م',
      notes: '',
    },
    schoolPrincipal: {
      name: '',
      date: '٢٠٢٦/١٠/٠٥م',
      directives: '',
    },
    educationalSupervisor: {
      name: '',
      date: '٢٠٢٦/١٠/٠٥م',
      directives: '',
    },
  },
};
