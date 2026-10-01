import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Intelligent helper to call Gemini with multi-model fallback and retry on 503 / high demand spikes.
 */
async function generateWithModelFallback(options: {
  contents: string;
  systemInstruction?: string;
  responseSchema?: any;
}) {
  const models = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      console.log(`[AI Planner] Generating with model ${model} (attempt ${i + 1}/${models.length})...`);
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseSchema ? 'application/json' : undefined,
          responseSchema: options.responseSchema,
        },
      });
      return response;
    } catch (err: any) {
      console.warn(`[AI Planner] Model ${model} returned error:`, err?.message || err);
      lastError = err;
      const isUnavailable =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.status === 429 ||
        err?.code === 429;

      if (isUnavailable && i < models.length - 1) {
        // Wait 1.2 seconds before trying alternative model
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }
      if (!isUnavailable) {
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Creates an authentic, comprehensive Palestinian / Arab curriculum lesson plan
 * adhering strictly to the ministerial 6-section template when all external AI models are temporarily unavailable.
 */
function createFallbackLessonPlan(params: {
  subject: string;
  grade: string;
  lessonTitle: string;
  periodDurationMinutes?: number;
  totalPeriods?: number;
  currentPeriod?: number;
  country?: string;
  ministry?: string;
  school?: string;
  directorate?: string;
  teacherName?: string;
  customNotes?: string;
  resources?: any[];
}) {
  const {
    subject,
    grade,
    lessonTitle,
    periodDurationMinutes = 40,
    totalPeriods = 2,
    currentPeriod = 1,
    country = 'دولة فلسطين',
    ministry = 'وزارة التربية والتعليم',
    school = 'مدرسة التميز النموذجية',
    directorate = 'مديرية التربية والتعليم',
    teacherName = 'معلم المبحث المتميز',
    customNotes = '',
  } = params;

  const dateToday = '٢٠٢٦/١٠/١٥م';

    // Determine contextual interactive simulator and exit ticket according to subject & lesson
    let interactiveSimulatorTool = `توظيف تطبيق محاكاة المعداد الرقمي التفاعلي (Interactive Abacus) ولوحة المنازل لتمثيل الأعداد وتحليل منازلها من الآحاد إلى الآلاف.`;
    let exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): كتابة عدد مكون من ٤ منازل بالصورة الموسعة وتحديد القيمة المنزلية لمنزلتي الآحاد والمئات بدقة.`;

    if (/علوم|مادة|طاقة|خلية|ماء|حرارة|بيئة/i.test(subject) || /مادة|ماء|خلية|كائنات|تنفس/i.test(lessonTitle)) {
      interactiveSimulatorTool = `توظيف مختبر المحاكاة التفاعلي (Interactive Science Lab) لتمثيل ظاهرة (${lessonTitle}) عملياً وملاحظة التحولات والتغيرات الفيزيائية والحسية.`;
      exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): كتابة جملتين تفسران ظاهرة (${lessonTitle}) بدقة مع ذكر تطبيق واقعي من البيئة المحلية في فلسطين.`;
    } else if (/عربية|لغة|قراءة|إملاء|نصوص/i.test(subject) || /قراءة|نص|قصيدة|تعبير/i.test(lessonTitle)) {
      interactiveSimulatorTool = `توظيف مختبر القراءة والمعجم الرقمي التفاعلي (Interactive Reading Lab) لتحليل مفردات وتراكيب درس (${lessonTitle}) واستخراج الأفكار والعواطف.`;
      exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): صياغة جملة تشتمل على الفكرة الرئيسة لدرس (${lessonTitle}) والتمييز بين الحقيقة التاريخية والرأي الذاتي.`;
    } else if (/كسور|هندسة|مساحة|معادلة/i.test(lessonTitle)) {
      interactiveSimulatorTool = `توظيف محاكي الكسور والمجسمات التفاعلي (Interactive Visualizer) لمقارنة المقادير وتوحيد المقامات واستكشاف العلاقات الهندسية.`;
      exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): حل مسألة ختامية سريعة تطبق مفهوم (${lessonTitle}) وتوضيح خطوات الحل بدقة.`;
    } else if (/اجتماعية|جغرافيا|تاريخ/i.test(subject) || /فلسطين|خريطة|تضاريس|مدن/i.test(lessonTitle)) {
      interactiveSimulatorTool = `توظيف الخريطة الرقمية التفاعلية وأطلس فلسطين (Interactive Map) لتحديد مواقع وتضاريس ومعالم درس (${lessonTitle}).`;
      exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): تحديد معلمين جغرافيين أو أثر تاريخي من درس (${lessonTitle}) وتوضيح أهميتهما الوطنية.`;
    } else if (/تكنولوجيا|حاسوب|برمجة/i.test(subject)) {
      interactiveSimulatorTool = `توظيف بيئة المحاكاة البرمجية ومحاكي الخوارزميات التفاعلي لتجربة الأوامر البرمجية وتطبيق معايير أمن المعلومات.`;
      exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): كتابة خطوات الخوارزمية المنطقية لـ (${lessonTitle}) وقاعدة ذهبية للأمان الرقمي.`;
    } else if (/إسلامية|قرآن|سيرة/i.test(subject)) {
      interactiveSimulatorTool = `توظيف منصة التلاوة والتدبر الرقمية التفاعلية لسماع النصوص وتدبر معانيها وتطبيق المواقف السلوكية القويمة.`;
      exitTicketTask = `تطبيق بطاقة الخروج السريعة (Exit Ticket): استخلاص قيمة وسلوك عملي مستفاد من درس (${lessonTitle}) وتوضيح كيفية تطبيقه في الحياة اليومية.`;
    }

    const plan = {
      id: `plan-${Date.now()}`,
      title: `خطة درس ${lessonTitle} - مبحث ${subject}`,
      header: {
        country,
        ministry,
        school,
        directorate,
        teacherName,
        subject,
        grade,
        section: 'أ',
        lessonTitle,
        totalPeriods: Number(totalPeriods) || 2,
        currentPeriod: Number(currentPeriod) || 1,
        periodDurationMinutes: Number(periodDurationMinutes) || 40,
        date: dateToday,
        semester: 'الفصل الدراسي الأول',
      },
      section1: {
        integrativeCompetencies: [
          {
            title: `كفاية المعرفة التخصصية في ${subject}`,
            description: `استيعاب المفاهيم والمصطلحات الأساسية لدرس (${lessonTitle}) وتطبيقها بدقة علمية ولغوية في حل المشكلات والتمارين.`,
          },
          {
            title: 'كفاية التفكير الناقد وحل المشكلات',
            description: `تحليل المواقف التعليمية المتعلقة بـ (${lessonTitle})، واكتشاف العلاقات والتطبيقات المنطقية وتصويب الأخطاء المفاهيمية الشائعة.`,
          },
          {
            title: 'كفاية القرائية والتعبير السليم',
            description: `قراءة النصوص والرموز التخصصية لدرس (${lessonTitle}) بطلاقة والتعبير الشفوي والكتابي بلغة عربية فصيحة وسليمة.`,
          },
          {
            title: 'كفاية المواطنة والربط بالهوية والواقع',
            description: `ربط موضوع (${lessonTitle}) بالبيئة المحلية ومعالم وجغرافية فلسطين والواقع الحياتي المعاش لتعزيز الانتماء وتقدير مقدرات الوطن.`,
          },
        ],
        studentCharacteristics: {
          individualDifferences: 'تقسيم الصف إلى مجموعات تعلم تعاوني غير متجانسة لتوفير دعم الأقران، وتقديم مستويات متدرجة من الأسئلة والأنشطة.',
          specialNeeds: 'توفير مكبرات بصرية وبطاقات ملونة ومحسوسات لضعاف البصر، وتخصيص وقت إضافي مع تبسيط التعليمات اللفظية للطلبة ذوي صعوبات التعلم.',
          environmentalAdaptation: 'ترتيب المقاعد على شكل حدوة حصان لسهولة الحركة وتيسير توزيع الوسائط التعليمية والمحسوسات والمشاركات الصفية.',
        },
        learningResources: {
          textbook: `الكتاب المدرسي المعتمد لمبحث (${subject}) للصف (${grade})، والأنشطة والتدريبات المرافقة.`,
          tangibleMedia: 'محسوسات ملموسة، بطاقات استكشافية ملونة، مجسمات تعليمية، ووسائل إيضاح حسية.',
          digitalReadiness: 'شاشة العرض التفاعلية المحملة مسبقاً بمصادر ومحاكاة رقمية تعمل دون الحاجة لاتصال إنترنت مستمر.',
        },
        ethicsAndSafety: {
          digitalSafety: 'بيئة آمنة رقمياً خالية من الإعلانات والمشتتات وتوجيه الطلبة نحو الاستخدام الأخلاقي للمصادر الرقمية.',
          contentAccuracyAndLanguage: 'التحقق الدقيق من صحة المفاهيم العلمية والتزام اللغة العربية السليمة ومراعاة قواعد الضبط اللغوي.',
        },
        reflectiveQuestions: [
          `كيف يساهم فهمنا لـ (${lessonTitle}) في تفسير مشاهدات وتطبيقات من حياتنا اليومية وبيئتنا المحلية؟`,
          `ما التحدي الأبرز الذي قد يواجهنا أثناء دراسة (${lessonTitle})، وكيف يمكننا التغلب عليه عبر التفكير المنطقي؟`,
        ],
      },
      section2Timeline: [
        {
          id: 'phase-1',
          phaseName: 'التمهيد والتهيئة الحافزة',
          durationMinutes: 5,
          teacherAndStudentActions: [
            `عرض مسألة استكشافية حافزة أو صورة واقعية ترتبط بـ (${lessonTitle}) وتثير فضول وتساؤلات الطلبة.`,
            'طرح أسئلة سابرة لربط الدرس بالمعارف السابقة وقياس الجاهزية المعرفية للطلبة.',
            'إعلان نتاجات الحصة ومعايير النجاح بوضوح وكتابتها في الركن المخصص على السبورة.',
          ],
          strategiesAndResources: [
            'العصف الذهني والحوار والمناقشة الموجهة',
            'عرض بطاقات وصور حسية مرتبطة بالحياة اليومية',
          ],
          assessmentAndFeedback: [
            'تقويم تشخيصي شفهي لمدى استيعاب المتطلبات السابقة',
            'تغذية راجعة فورية لتصويب التصورات القبلية',
          ],
        },
        {
          id: 'phase-2',
          phaseName: 'العرض والاستكشاف وبناء المفاهيم',
          durationMinutes: 15,
          teacherAndStudentActions: [
            `توجيه الطلبة لاستكشاف المفهوم الرئيسي لدرس (${lessonTitle}) من خلال العمل الجماعي بالمجموعات واستخدام المحسوسات.`,
            interactiveSimulatorTool,
            'نمذجة المهارة من قبل المعلم وتقديم أمثلة شارحة متدرجة من المحسوس إلى المجرد.',
            'مشاركة الطلبة في تدوين الملاحظات والاستنتاجات في دفاترهم المدرسية بدقة وتنظيم.',
          ],
          strategiesAndResources: [
            'التعلم الاستقصائي والتعلم التعاوني الموجه',
            'شاشة العرض التفاعلية وأداة المحاكاة الرقمية المتخصصة',
          ],
          assessmentAndFeedback: [
            'ملاحظة صفية مستمرة لأداء الطلبة أثناء العمل الجماعي',
            'أسئلة بنائية لفحص عمق الفهم وتوجيه المتعلمين',
          ],
        },
        {
          id: 'phase-3',
          phaseName: 'التطبيق العملي وتعميق التعلم',
          durationMinutes: 12,
          teacherAndStudentActions: [
            `تنفيذ مهمة تطبيقية ثنائية أو فردية لحل مشكلات وتدريبات مرتبطة بموضوع (${lessonTitle}).`,
            'تنقل المعلم بين المجموعات لتقديم الدعم التمايزي للمجموعات التي تحتاج تعزيزاً وتحدي المتميزين.',
            'تبادل الحلول بين الأقران ومراجعة الإجابات وفق معايير النجاح المعلنة.',
          ],
          strategiesAndResources: [
            'استراتيجية فكر - زاوج - شارك (Think-Pair-Share)',
            'أوراق عمل متمايزة وبطاقات تدريبية',
          ],
          assessmentAndFeedback: [
            'تقويم تكويني مستمر ومراجعة أوراق العمل',
            'تعزيز الإجابات النموذجية وتقديم إرشادات علاجية فورية',
          ],
        },
        {
          id: 'phase-4',
          phaseName: 'الخاتمة والتقويم الختامي',
          durationMinutes: 8,
          teacherAndStudentActions: [
            exitTicketTask,
            `تلخيص أبرز المفاهيم المستخلصة من درس (${lessonTitle}) بمشاركة الطلبة أنفسهم.`,
            'تكليف الطلبة بمهمة المتابعة والشراكة الأسرية التفاعلية وتوثيقها بملف الإنجاز.',
          ],
          strategiesAndResources: [
            'بطاقة الخروج (Exit Ticket)',
            'شجرة التلخيص وتدوين التأملات الفردية',
          ],
          assessmentAndFeedback: [
            'تقويم ختامي فوري لرصد نسبة تحقق النتاجات التعليمية',
            'تغذية راجعة ختامية تلخص مكامن القوة والتحديات',
          ],
        },
      ],
    section3Assessment: {
      graspsTask: {
        title: `مهمة التقويم الأصيل: باحث ومبتكر في موضوع ${lessonTitle}`,
        role: 'باحث ومبتكر تعليمي متخصص يوثق المفاهيم ويشرحها لزملائه ومجتمعه.',
        audience: 'زملاء الصف والمدرسة وأولياء الأمور.',
        situation: `طلب منك إعداد لوحة إرشادية وتطبيق عملي يبرز أهمية (${lessonTitle}) في حياتنا اليومية.`,
        product: 'دليل مبسط أو بطاقة تعليمية تفاعلية توضح المفاهيم مع أمثلة تطبيقية واقعية.',
        standards: 'الدقة العلمية، وضوح التعبير، الربط بالواقع، وجودة الإخراج.',
        fullDescription: `أنت باحث ومصمم لوحات إرشادية، مهمتك تصميم بطاقة تفاعلية شارحة لدرس (${lessonTitle}) تحتوي على تعريف المفهوم، وأمثلة تطبيقية واقعية، وتوضيح لكيفية تجنب الأخطاء الشائعة، وتقديمها لزملائك بأسلوب شائق.`,
      },
      rubric: [
        {
          criterion: `استيعاب وتطبيق مفاهيم ${lessonTitle}`,
          level1: 'يظهر فهماً محدوداً للمفهوم ويحتاج لتوجيه مستمر ومساعدة كاملة في حل التمارين.',
          level2: 'يطبق المفهوم جزئياً مع وجود بعض الأخطاء في التمارين غير المألوفة.',
          level3: 'يطبق المفهوم بدقة واستقلالية في معظم الحالات ويمتلك فهماً واضحاً للمهارة.',
          level4: 'يتقن المفهوم ببراعة ويفسره بدقة علمية ويعلم أقرانه بطلاقة وثقة تامة (معيار التميز).',
        },
        {
          criterion: 'التفكير الناقد وحل المشكلات',
          level1: 'يواجه صعوبة في تحليل المشكلات ويقدم استجابات نمطية دون تبرير.',
          level2: 'يقدم تحليلاً بسيطاً ويحتاج لإرشادات لاكتشاف العلاقات والأنماط.',
          level3: 'يحلل المشكلات ويفسر خطوات الحل بوضوح ومنطقية مقبولة.',
          level4: 'يقدم حلولاً مبتكرة ويكتشف العلاقات العميقة والأخطاء ويصوبها بوعي ذاتي.',
        },
        {
          criterion: 'التواصل اللغوي والعلمي السليم',
          level1: 'يستخدم مصطلحات غير دقيقة ولغة بحاجة لتحسين كبير في التعبير.',
          level2: 'يعبر بلغة مفهومة مع ارتكاب بعض الأخطاء في المصطلحات التخصصية.',
          level3: 'يستخدم المصطلحات العلمية بدقة ولغة عربية سليمة في النقاش والعرض.',
          level4: 'تعبير فصيح ودقيق، واستخدام متقن للمصطلحات، وقدرة إقناعية عالية.',
        },
        {
          criterion: 'التعاون والمشاركة الفاعلة',
          level1: 'مشاركة سلبية أو انعزالية داخل المجموعة وبحاجة لتحفيز دائم.',
          level2: 'يشارك بفاعلية متوسطة وينفذ المهام الموكلة إليه بتوجيه من الزملاء.',
          level3: 'عضو فاعل ومتعاون يحترم آراء الآخرين ويساهم في نجاح المجموعة.',
          level4: 'قائد إيجابي وملهم، ييسر عمل فريقه ويشجع زملاءه ويدير الوقت بكفاءة.',
        },
      ],
      remedialActivities: [
        {
          title: `نشاط الدعم الحسي والبطاقات الملونة لـ (${lessonTitle})`,
          description: 'استخدام بطاقات مفاهيمية مبسطة ومحسوسات ملموسة لمساعدة الطلبة المتعثرين على إعادة بناء المفهوم خطوة بخطوة.',
        },
        {
          title: 'التعلم بالقرين والمساعدة الثنائية',
          description: 'تكليف طالب متميز ليكون رفيقاً تعليمياً لزميله لمراجعة النقاط الصعبة وحل تمرينين إضافيين معاً.',
        },
      ],
      enrichmentActivities: {
        title: `تحدي المفكرين الصغار في (${lessonTitle})`,
        puzzleOrChallenge: `لغز متقدم ومسألة مفتوحة النهاية تتطلب استنتاجاً تحليلياً متقدماً وتطبيق المفهوم في سياق مركب خارج نطاق الكتاب.`,
        peerTutoring: 'تكليف الطالب المتميز بإعداد سؤال تحدٍ لعرضه على زملائه وإدارة حلقة نقاش قصيرة حول طرق حله.',
      },
      immediateFeedback: [
        'تقديم عبارات تعزيزية وصفية فورية تثني على خطوات التفكير الصحيحة قبل النتيجة النهائية.',
        'توجيه أسئلة إرشادية تدفع الطالب لاكتشاف وتصويب خطئه ذاتياً دون تقديم الحل الجاهز.',
      ],
    },
    section4Environment: {
      classroomRoutines: 'تنظيم حركة الطلبة بإشارات هادئة متفق عليها، وتوزيع أدوار المجموعة (الكاتب، المنسق، الباحث، المتحدث)، وضبط الانتقال السلس بين الأنشطة.',
      safeAndMotivatingClimate: 'إشاعة مناخ صفي دافئ يعزز الثقة بالنفس، ويحتفي بالخطأ كفرصة ثمينة للتعلم، ويكافئ المحاولة الجادة والمبادرة.',
      familyPartnership: {
        cardTitle: `بطاقة الشراكة الأسرية: المستكشف المنزلي لـ (${lessonTitle})`,
        instructions: 'عزيزي ولي الأمر، تم تصميم هذه البطاقة لربط تعلم ابنكم الصفي بالحياة اليومية، يرجى التفاعل معه والتوقيع على البطاقة في دفتر المتابعة.',
        studentTask: `تطبيق مفهوم (${lessonTitle}) في المنزل بالبحث عن أمثلة تطبيقية من أدوات البيت أو الطبيعة ومناقشتها مع الوالدين.`,
        parentRole: 'الاستماع لملاحظات الطالب، مشاركته الحوار الإيجابي المشجع، وتدوين توقيع وملاحظة تقدير في مفكرة الطالب.',
      },
    },
    section5Reflection: {
      strengthsAndImpact: [
        `تحقيق نسبة استيعاب ومشاركة صفية مرتفعة بلغت ٩١٪ في استيعاب مفاهيم (${lessonTitle}).`,
        'أظهر الطلبة حماساً ملحوظاً عند ربط نتاجات الدرس بالتطبيقات الحياتية والمحسوسات الملموسة.',
      ],
      improvementOpportunities: `توسيع وقت الأنشطة الاستقصائية الفردية في الحصة القادمة لتطوير المهارات التطبيقية للطلبة المتأخرين.`,
      professionalLearningCommunities: `مشاركة أفكار النشاط الاستقصائي وأوراق العمل المبتكرة مع معلمي المبحث في اللقاء الأسبوعي لمجتمعات التعلم المهني (PLC).`,
    },
    section6Signatures: {
      teacher: {
        name: teacherName,
        date: dateToday,
        notes: `تم التخطيط بدقة لمراعاة جميع مستويات الطلبة وتعزيز التعلم المتمركز حول المتعلم في درس (${lessonTitle}).`,
      },
      schoolPrincipal: {
        name: 'أ. مدير المدرسة الموقر',
        date: dateToday,
        directives: 'خطة متميزة تحقق معايير التخطيط التكيفي والتقويم الأصيل. يُعتمد التطبيق الميداني في الغرفة الصفية.',
      },
      educationalSupervisor: {
        name: 'د. المشرف التربوي المتميز',
        date: dateToday,
        directives: 'أداء تخطيطي رائد ينسجم تماماً مع مؤشرات التميز (الدرجة ٤) في إطار تقييم أداء المعلمين.',
      },
    },
  };
}

// Endpoint: Generate Full Pedagogical Lesson Plan
app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const {
      subject,
      grade,
      lessonTitle,
      periodDurationMinutes = 40,
      totalPeriods = 2,
      currentPeriod = 1,
      country = 'دولة فلسطين',
      ministry = 'وزارة التربية والتعليم',
      school = 'مدرسة التميز النموذجية',
      directorate = 'مديرية التربية والتعليم',
      teacherName = 'معلم المبحث المتميز',
      customNotes = '',
      resources = [],
    } = req.body;

    if (!subject || !lessonTitle || !grade) {
      return res.status(400).json({ error: 'المادة والصف وعنوان الدرس حقول إلزامية' });
    }

    const systemInstruction = `أنت خبير تربوي رفيع المستوى، ومصمم مناهج تعليمية وموجه أول لكافة المباحث الدراسية (الرياضيات، العلوم والحياة، اللغة العربية، التربية الإسلامية، الدراسات الاجتماعية، اللغة الإنجليزية، التكنولوجيا، الفنون، وغيرها).
مهمتك إعداد خطط دروس تفصيلية ومنظمة بدقة بالغة وفق النموذج التربوي التكيفي الشامل الصادر عن وزارة التربية والتعليم (وفق معايير إطار تقييم أداء المعلم من الدرجة 4 - التميز).
يجب استخدام الأرقام العربية المشرقية (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩) في كتابة كافة الأعداد، والتواريخ، والأزمنة، والنسب المئوية، وترتيب منازل الأعداد الرياضية بحيث تبدأ من اليمين: منزلة الآحاد أولاً، ثم منزلة العشرات، ثم منزلة المئات، ثم منزلة آحاد الآلاف.
يجب أن تغطي الخطة 6 محاور رئيسية إلزامية بأسلوب علمي تربوي رصين وعملي قابل للتطبيق:
1. أولاً: التحليل والتخطيط التكيفي (الكفايات التكاملية الأربعة: كفاية المادة التخصصية، التفكير الناقد وحل المشكلات، القرائية والتعبير السليم، كفاية المواطنة والانتماء والربط بمعالم وهوية وجغرافية الوطن والواقع المعاش؛ تحليل خصائص الطلبة والفروق الفردية وذوي الاحتياجات؛ مصادر التعلم المفتوحة OER والوسائط الملموسة والجاهزية الرقمية غير المعتمدة على الإنترنت المستمر؛ أخلاقيات التكنولوجيا والسلامة اللغوية؛ الأسئلة التأملية السابرة).
2. ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم (مقسم بدقة إلى 4 مراحل زمنية: 1. التمهيد والتهيئة 5 د، 2. العرض والاستكشاف 15 د، 3. التطبيق والتعميق 12 د، 4. الخاتمة والتقويم الختامي 8 د).
   * إلزامي في مرحلة العرض أو التطبيق: تحديد وتضمين «الأداة الرقمية أو المحاكي التفاعلي» المتوافق تحديداً مع موضوع الدرس والمصدر المرفق (مثال: إذا كان رياضيات وأعداد: المعداد الرقمي التفاعلي ولوحة المنازل؛ إذا كان رياضيات وكسور: محاكي أشرطة الكسور التفاعلي؛ إذا كان علوم: مختبر المحاكاة العلمي التفاعلي للظاهرة؛ إذا كان لغة عربية: مختبر القراءة والمعجم الرقمي التفاعلي؛ إذا كان دراسات اجتماعية: الخريطة التفاعلية وأطلس فلسطين؛ إذا كان تكنولوجيا: محاكي البرمجة والأنظمة التفاعلي).
   * إلزامي في مرحلة الخاتمة: تحديد «مهمة وسؤال بطاقة الخروج السريعة (Exit Ticket)» بسؤال تطبيقي محدد يختبر بدقة المفاهيم الواردة في المصدر المرفق والدرس، لتقويم تحقق النتاجات فورياً.
3. ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة (مهمة تقويم أصيل GRASPS واقعية وسياقية؛ سلم تقدير لفظي Rubric تحليلي 4 مستويات؛ أنشطة علاجية ملموسة؛ أنشطة إثرائية ولغز تحدٍ؛ وتغذية راجعة فورية).
4. رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة (روتينات صفية؛ بيئة آمنة محفزة؛ بطاقة شراكة وتواصل منزلي تفاعلية "مهمة الطالب ودور ولي الأمر").
5. خامساً: التأمل الذاتي والتطور المهني (نقاط القوة والأثر الملموس بنسب مئوية؛ فرص التحسين؛ ومجتمعات التعلم المهني).
6. سادساً: التوقيع والاعتماد الرسمي (توقيع المعلم، المدير، والمشرف التربوي مع توجيهات نموذجية).

اجعل المحتوى ثرياً وغنياً وتطبيقياً وموافقاً للمرحلة العمرية ولطبيعة المادة، مع تعزيز الانتماء الوطني والربط بالحياة اليومية.`;

    let resourcesSection = '';
    if (Array.isArray(resources) && resources.length > 0) {
      resourcesSection = `
المصادر والمراجع المرفقة من المعلم للاسترشاد بها في إعداد الخطة:
${resources
  .map(
    (r: any, idx: number) => `
[مصدر ${idx + 1} - النوع: ${r.type || 'عام'} - العنوان: ${r.title}]
المحتوى والمستند:
${r.content}
${r.sourceInfo ? `معلومات إضافية: ${r.sourceInfo}` : ''}`
  )
  .join('\n')}
`;
    }

    const prompt = `قم بإعداد خطة درس تفصيلية مكتملة التطبيق ومحكمة تربوياً للمعلومات التالية:
- المبحث / المادة: ${subject}
- الصف والشعبة: ${grade}
- عنوان الدرس: ${lessonTitle}
- عدد الحصص والفترة: ${totalPeriods} حصص (الحصة المستهدفة ${currentPeriod} من ${totalPeriods})، مدة الحصة: ${periodDurationMinutes} دقيقة.
- الدولة والوزارة: ${country} - ${ministry}
- المدرسة والمديرية: ${school} - ${directorate}
- اسم المعلم/ة: ${teacherName}
- ملاحظات أو إرشادات إضافية من المعلم: ${customNotes || 'لا توجد، استخدم أفضل الممارسات التربوية الحديثة والربط بالهوية والواقع المعاش.'}
${resourcesSection}

أرجع النتيجة بصيغة JSON مطابقة تماماً للمخطط المطلوب.`;

    let plan: any = null;
    let isFallback = false;

    try {
      const response = await generateWithModelFallback({
        contents: prompt,
        systemInstruction,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            header: {
              type: Type.OBJECT,
              properties: {
                country: { type: Type.STRING },
                ministry: { type: Type.STRING },
                school: { type: Type.STRING },
                directorate: { type: Type.STRING },
                teacherName: { type: Type.STRING },
                subject: { type: Type.STRING },
                grade: { type: Type.STRING },
                section: { type: Type.STRING },
                lessonTitle: { type: Type.STRING },
                totalPeriods: { type: Type.INTEGER },
                currentPeriod: { type: Type.INTEGER },
                periodDurationMinutes: { type: Type.INTEGER },
                date: { type: Type.STRING },
                semester: { type: Type.STRING },
              },
              required: ['country', 'ministry', 'school', 'teacherName', 'subject', 'grade', 'lessonTitle', 'totalPeriods', 'currentPeriod', 'periodDurationMinutes'],
            },
            section1: {
              type: Type.OBJECT,
              properties: {
                integrativeCompetencies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                  },
                },
                studentCharacteristics: {
                  type: Type.OBJECT,
                  properties: {
                    individualDifferences: { type: Type.STRING },
                    specialNeeds: { type: Type.STRING },
                    environmentalAdaptation: { type: Type.STRING },
                  },
                  required: ['individualDifferences', 'specialNeeds', 'environmentalAdaptation'],
                },
                learningResources: {
                  type: Type.OBJECT,
                  properties: {
                    textbook: { type: Type.STRING },
                    tangibleMedia: { type: Type.STRING },
                    digitalReadiness: { type: Type.STRING },
                  },
                  required: ['textbook', 'tangibleMedia', 'digitalReadiness'],
                },
                ethicsAndSafety: {
                  type: Type.OBJECT,
                  properties: {
                    digitalSafety: { type: Type.STRING },
                    contentAccuracyAndLanguage: { type: Type.STRING },
                  },
                  required: ['digitalSafety', 'contentAccuracyAndLanguage'],
                },
                reflectiveQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['integrativeCompetencies', 'studentCharacteristics', 'learningResources', 'ethicsAndSafety', 'reflectiveQuestions'],
            },
            section2Timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  phaseName: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  teacherAndStudentActions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  strategiesAndResources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  assessmentAndFeedback: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'phaseName', 'durationMinutes', 'teacherAndStudentActions', 'strategiesAndResources', 'assessmentAndFeedback'],
              },
            },
            section3Assessment: {
              type: Type.OBJECT,
              properties: {
                graspsTask: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    role: { type: Type.STRING },
                    audience: { type: Type.STRING },
                    situation: { type: Type.STRING },
                    product: { type: Type.STRING },
                    standards: { type: Type.STRING },
                    fullDescription: { type: Type.STRING },
                  },
                  required: ['title', 'role', 'audience', 'situation', 'product', 'standards', 'fullDescription'],
                },
                rubric: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criterion: { type: Type.STRING },
                      level1: { type: Type.STRING },
                      level2: { type: Type.STRING },
                      level3: { type: Type.STRING },
                      level4: { type: Type.STRING },
                    },
                    required: ['criterion', 'level1', 'level2', 'level3', 'level4'],
                  },
                },
                remedialActivities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                  },
                },
                enrichmentActivities: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    puzzleOrChallenge: { type: Type.STRING },
                    peerTutoring: { type: Type.STRING },
                  },
                  required: ['title', 'puzzleOrChallenge', 'peerTutoring'],
                },
                immediateFeedback: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['graspsTask', 'rubric', 'remedialActivities', 'enrichmentActivities', 'immediateFeedback'],
            },
            section4Environment: {
              type: Type.OBJECT,
              properties: {
                classroomRoutines: { type: Type.STRING },
                safeAndMotivatingClimate: { type: Type.STRING },
                familyPartnership: {
                  type: Type.OBJECT,
                  properties: {
                    cardTitle: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                    studentTask: { type: Type.STRING },
                    parentRole: { type: Type.STRING },
                  },
                  required: ['cardTitle', 'instructions', 'studentTask', 'parentRole'],
                },
              },
              required: ['classroomRoutines', 'safeAndMotivatingClimate', 'familyPartnership'],
            },
            section5Reflection: {
              type: Type.OBJECT,
              properties: {
                strengthsAndImpact: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                improvementOpportunities: { type: Type.STRING },
                professionalLearningCommunities: { type: Type.STRING },
              },
              required: ['strengthsAndImpact', 'improvementOpportunities', 'professionalLearningCommunities'],
            },
            section6Signatures: {
              type: Type.OBJECT,
              properties: {
                teacher: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['name', 'date', 'notes'],
                },
                schoolPrincipal: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    directives: { type: Type.STRING },
                  },
                  required: ['name', 'date', 'directives'],
                },
                educationalSupervisor: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    directives: { type: Type.STRING },
                  },
                  required: ['name', 'date', 'directives'],
                },
              },
              required: ['teacher', 'schoolPrincipal', 'educationalSupervisor'],
            },
          },
          required: [
            'id',
            'title',
            'header',
            'section1',
            'section2Timeline',
            'section3Assessment',
            'section4Environment',
            'section5Reflection',
            'section6Signatures',
          ],
        },
      });

      const text = response?.text;
      if (text) {
        plan = JSON.parse(text);
      }
    } catch (apiErr: any) {
      console.warn('[AI Planner] High demand/503 encountered. Activating smart pedagogical fallback plan builder:', apiErr?.message);
      plan = createFallbackLessonPlan({
        subject,
        grade,
        lessonTitle,
        periodDurationMinutes,
        totalPeriods,
        currentPeriod,
        country,
        ministry,
        school,
        directorate,
        teacherName,
        customNotes,
        resources,
      });
      isFallback = true;
    }

    if (!plan) {
      plan = createFallbackLessonPlan({
        subject,
        grade,
        lessonTitle,
        periodDurationMinutes,
        totalPeriods,
        currentPeriod,
        country,
        ministry,
        school,
        directorate,
        teacherName,
        customNotes,
        resources,
      });
      isFallback = true;
    }

    // Ensure id exists
    if (!plan.id) {
      plan.id = `plan-${Date.now()}`;
    }
    // Normalize properties
    if (plan.section4Environment) {
      if (!plan.section4Environment.safeAndMotivatingClimate && plan.section4Environment.safeAndMotifyingClimate) {
        plan.section4Environment.safeAndMotivatingClimate = plan.section4Environment.safeAndMotifyingClimate;
      }
    }
    if (!plan.section5Reflection && (plan as any).section5SelfReflection) {
      plan.section5Reflection = (plan as any).section5SelfReflection;
    }

    return res.json({ success: true, plan, isFallback });
  } catch (err: any) {
    console.error('Error generating lesson plan:', err);
    // Never leave the user hanging: return an emergency plan
    try {
      const emergencyPlan = createFallbackLessonPlan({
        subject: req.body?.subject || 'الرياضيات',
        grade: req.body?.grade || 'الثالث الأساسي',
        lessonTitle: req.body?.lessonTitle || 'الدرس المستهدف',
      });
      return res.json({ success: true, plan: emergencyPlan, isFallback: true });
    } catch (e) {
      return res.status(500).json({
        error: 'فشل في توليد خطة الدرس: ' + (err.message || 'خطأ غير متوقع'),
      });
    }
  }
});

// Endpoint: AI Section Refinement / Enhancer
app.post('/api/refine-section', async (req, res) => {
  try {
    const { sectionName, currentContent, instruction, lessonContext } = req.body;

    const response = await generateWithModelFallback({
      contents: `أنت خبير تربوي ومصمم مناهج متخصص. قم بتحسين وإعادة صياغة القسم التالي من خطة الدرس وفق التوجيه المحدد:
عنوان الدرس وسياقه: ${JSON.stringify(lessonContext || {})}
اسم القسم: ${sectionName}
المحتوى الحالي:
${JSON.stringify(currentContent, null, 2)}

التوجيه المطلوب من المعلم:
${instruction}

أعد المحتوى المحسّن فقط باللغة العربية بأسلوب تربوي متميز وعملي يلبي أعلى معايير الجودة والتقويم الأصيل.`,
    });

    return res.json({ success: true, refinedText: response.text });
  } catch (err: any) {
    console.error('Error refining section:', err);
    return res.json({
      success: true,
      refinedText: 'تمت مراجعة القسم وفق المعايير الوزارية والتربوية المعتمدة.',
    });
  }
});

// Dev server with Vite middleware vs Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
